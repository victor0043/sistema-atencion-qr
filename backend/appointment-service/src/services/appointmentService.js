const QRCode = require('qrcode');

const Cita = require('../models/Cita');
const Paciente = require('../models/Paciente');
const Medico = require('../models/Medico');
const Usuario = require('../models/Usuario');
const { uploadQRImage } = require('./blobStorageService');

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
if (!INTERNAL_API_KEY) {
    throw new Error('INTERNAL_API_KEY no está definida en el entorno. Configúrala en el .env antes de arrancar el servicio.');
}

class AppointmentService {

    // Listar todas las citas
    async listarCitas() {

        try {

            const citas = await Cita.findAll({

                include: [
                    {
                        model: Paciente,
                        include: [
                            {
                                model: Usuario,
                                attributes: ['id', 'rut', 'nombre', 'correo']
                            }
                        ]
                    },
                    {
                        model: Medico,
                        include: [
                            {
                                model: Usuario,
                                attributes: ['id', 'rut', 'nombre', 'correo']
                            }
                        ]
                    }
                ],

                order: [
                    ['fecha', 'ASC'],
                    ['hora', 'ASC']
                ]

            });

            return {
                ok: true,
                citas
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    // Buscar cita por ID
    async obtenerCita(id) {

        try {

            const cita = await Cita.findByPk(id, {

                include: [
                    {
                        model: Paciente,
                        include: [
                            {
                                model: Usuario,
                                attributes: ['id', 'rut', 'nombre', 'correo']
                            }
                        ]
                    },
                    {
                        model: Medico,
                        include: [
                            {
                                model: Usuario,
                                attributes: ['id', 'rut', 'nombre', 'correo']
                            }
                        ]
                    }
                ]

            });

            if (!cita) {

                return {
                    ok: false,
                    mensaje: 'Cita no encontrada'
                };

            }

            return {
                ok: true,
                cita
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    // Crear nueva cita
    async crearCita(datos) {

        try {

            const codigoQR = `CITA-${Date.now()}`;

            // Genera la imagen real del QR (antes solo se renderizaba en el
            // frontend con qrcode.react) y la sube a Blob Storage.
            const qrBuffer = await QRCode.toBuffer(codigoQR, { type: 'png' });
            const qrBlobUrl = await uploadQRImage(qrBuffer, `${codigoQR}.png`);

            const cita = await Cita.create({

                paciente_id: datos.paciente_id,
                medico_id: datos.medico_id,
                fecha: datos.fecha,
                hora: datos.hora,
                estado: 'AGENDADA',
                codigo_qr: codigoQR,
                qr_blob_url: qrBlobUrl

            });

            return {

                ok: true,
                mensaje: 'Cita creada correctamente',
                cita

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    // Actualizar estado de la cita
    async actualizarEstado(id, estado) {

        try {

            const cita = await Cita.findByPk(id);

            if (!cita) {

                return {

                    ok: false,
                    mensaje: 'Cita no encontrada'

                };

            }

            await cita.update({

                estado: estado

            });

            // Notificar a admin-service para actualizar estado del médico asociado
            try {
                const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3001';

                const estadoMedico = (estado === 'ATENDIENDO') ? 'ATENDIENDO' : (estado === 'FINALIZADA' ? 'DISPONIBLE' : (estado === 'EN_ESPERA' ? 'EN_ESPERA' : 'DISPONIBLE'));

                if (cita.medico_id) {
                    await fetch(`${ADMIN_SERVICE_URL}/api/admin/medicos/${cita.medico_id}/estado`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-service-key': INTERNAL_API_KEY
                        },
                        body: JSON.stringify({ estado: estadoMedico })
                    });
                }
            } catch (err) {
                console.warn('No se pudo notificar a admin-service sobre el estado del médico:', err.message || err);
            }

            return {

                ok: true,
                mensaje: 'Estado actualizado',
                cita

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    async obtenerCitasPorPaciente(id) {

        try {

            const citas = await Cita.findAll({

                where: {
                    paciente_id: id
                },
                include: [
                    {
                        model: Paciente,
                        include: [
                            {
                                model: Usuario,
                                attributes: ['id', 'rut', 'nombre', 'correo']
                            }
                        ]
                    },
                    {
                        model: Medico,
                        include: [
                            {
                                model: Usuario,
                                attributes: ['id', 'rut', 'nombre', 'correo']
                            }
                        ]
                    }
                ],
                order: [
                    ['fecha', 'ASC'],
                    ['hora', 'ASC']
                ]

            });

            return {

                ok: true,
                citas

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    async confirmarPorCodigoQR(codigoQR, citaId = null) {
        try {
            let cita = null;

            if (citaId) {
                cita = await Cita.findByPk(citaId);
            }

            if (!cita && codigoQR) {
                cita = await Cita.findOne({
                    where: {
                        codigo_qr: codigoQR
                    }
                });
            }

            if (!cita && codigoQR && /^CITA-(\d+)$/.test(codigoQR)) {
                const id = Number(codigoQR.split('-')[1]);
                cita = await Cita.findByPk(id);
            }

            if (!cita) {
                return {
                    ok: false,
                    mensaje: 'No se encontró una cita con ese código QR'
                };
            }

            if (!cita.codigo_qr) {
                await cita.update({ codigo_qr: codigoQR || `CITA-${cita.id}` });
            }

            if (cita.estado === 'EN_ESPERA') {
                return {
                    ok: true,
                    mensaje: 'La llegada ya estaba confirmada',
                    cita
                };
            }

            await cita.update({ estado: 'EN_ESPERA' });

            return {
                ok: true,
                mensaje: 'Llegada confirmada correctamente',
                cita
            };
        } catch (error) {
            return {
                ok: false,
                mensaje: error.message
            };
        }
    }

    // Actualizar fecha y hora
    async actualizarCita(id, datos) {

        try {

            const cita = await Cita.findByPk(id);

            if (!cita) {

                return {

                    ok: false,
                    mensaje: 'Cita no encontrada'

                };

            }

            await cita.update({

                paciente_id: datos.paciente_id,
                medico_id: datos.medico_id,
                fecha: datos.fecha,
                hora: datos.hora

            });

            return {

                ok: true,
                mensaje: 'Cita actualizada correctamente',
                cita

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    // Eliminar cita
    async eliminarCita(id) {

        try {

            const cita = await Cita.findByPk(id);

            if (!cita) {

                return {

                    ok: false,
                    mensaje: 'Cita no encontrada'

                };

            }

            await cita.destroy();

            return {

                ok: true,
                mensaje: 'Cita eliminada correctamente'

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

}

module.exports = new AppointmentService();