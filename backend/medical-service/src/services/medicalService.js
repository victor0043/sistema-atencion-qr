const Atencion = require('../models/Atencion');
const Cita = require('../models/Cita');

class MedicalService {

    //=========================================
    // LISTAR TODAS LAS ATENCIONES
    //=========================================

    async listarAtenciones() {

        try {

            const atenciones = await Atencion.findAll({

                order: [
                    ['id', 'DESC']
                ]

            });

            return {

                ok: true,
                atenciones

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    //=========================================
    // OBTENER UNA ATENCION
    //=========================================

    async obtenerAtencion(id) {

        try {

            const atencion = await Atencion.findByPk(id);

            if (!atencion) {

                return {

                    ok: false,
                    mensaje: "Atención no encontrada"

                };

            }

            return {

                ok: true,
                atencion

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    //=========================================
    // INICIAR ATENCION
    //=========================================

    async iniciarAtencion(cita_id) {

        try {

            const cita = await Cita.findByPk(cita_id);

            if (!cita) {

                return {

                    ok: false,
                    mensaje: "La cita no existe"

                };

            }

            await cita.update({

                estado: "ATENDIENDO"

            });

            const atencion = await Atencion.create({

                cita_id: cita_id,

                hora_inicio: new Date(),

                estado: "ATENDIENDO"

            });

            return {

                ok: true,

                mensaje: "Atención iniciada",

                atencion

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // FINALIZAR ATENCION
    //=========================================

    async finalizarAtencion(id, observaciones) {

        try {

            const atencion = await Atencion.findByPk(id);

            if (!atencion) {

                return {

                    ok: false,

                    mensaje: "Atención no encontrada"

                };

            }

            await atencion.update({

                hora_fin: new Date(),

                estado: "FINALIZADA",

                observaciones

            });

            const cita = await Cita.findByPk(atencion.cita_id);

            if (cita) {

                await cita.update({

                    estado: "FINALIZADA"

                });

            }

            return {

                ok: true,

                mensaje: "Atención finalizada",

                atencion

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // ACTUALIZAR OBSERVACIONES
    //=========================================

    async actualizarObservaciones(id, observaciones) {

        try {

            const atencion = await Atencion.findByPk(id);

            if (!atencion) {

                return {

                    ok: false,

                    mensaje: "Atención no encontrada"

                };

            }

            await atencion.update({

                observaciones

            });

            return {

                ok: true,

                mensaje: "Observaciones actualizadas",

                atencion

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // ELIMINAR ATENCION
    //=========================================

    async eliminarAtencion(id) {

        try {

            const atencion = await Atencion.findByPk(id);

            if (!atencion) {

                return {

                    ok: false,

                    mensaje: "Atención no encontrada"

                };

            }

            await atencion.destroy();

            return {

                ok: true,

                mensaje: "Atención eliminada"

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

}

module.exports = new MedicalService();