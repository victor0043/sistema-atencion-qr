const Paciente = require('../models/Paciente');
const Usuario = require('../models/Usuario');
const { sequelize } = require('../config/database');

// Caché simple para evitar llamadas frecuentes a describeTable
const _columnCache = { cols: null, ts: 0, ttl: 60 * 1000 };

// Helper para comprobar si una columna existe en la tabla 'pacientes'
async function columnaExiste(nombre) {
    try {
        const now = Date.now();
        if (!_columnCache.cols || (now - _columnCache.ts) > _columnCache.ttl) {
            const qi = sequelize.getQueryInterface();
            const desc = await qi.describeTable('pacientes');
            _columnCache.cols = Object.keys(desc);
            _columnCache.ts = now;
        }
        return _columnCache.cols.includes(nombre);
    } catch (err) {
        // Si la tabla no existe o hay problema, asumimos que la columna no existe
        return false;
    }
}

class PatientService {

    // Listar todos los pacientes
    async listarPacientes() {

        try {

            const pacientes = await Paciente.findAll({

                include: [
                    {
                        model: Usuario,
                        where: { rol_id: 4 }, // devolver sólo usuarios con rol PACIENTE
                        attributes: [
                            'id',
                            'rut',
                            'nombre',
                            'correo',
                            'rol_id',
                            'activo'
                        ]
                    }
                ],

                order: [['id', 'ASC']]

            });

            return {
                ok: true,
                pacientes
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    // Buscar paciente por ID
    async obtenerPaciente(id) {

        try {

            let paciente = await Paciente.findByPk(id, {

                include: [
                    {
                        model: Usuario,
                        attributes: [
                            'id',
                            'rut',
                            'nombre',
                            'correo',
                            'rol_id'
                        ]
                    }
                ]

            });

            if (!paciente) {
                paciente = await Paciente.findOne({
                    where: { usuario_id: id },
                    include: [
                        {
                            model: Usuario,
                            attributes: [
                                'id',
                                'rut',
                                'nombre',
                                'correo',
                                'rol_id'
                            ]
                        }
                    ]
                });
            }

            if (!paciente) {

                return {
                    ok: false,
                    mensaje: 'Paciente no encontrado'
                };

            }

            return {
                ok: true,
                paciente
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    async obtenerPacientePorUsuarioToken(usuarioToken) {

        try {

            if (!usuarioToken || !usuarioToken.id) {
                return {
                    ok: false,
                    mensaje: 'Usuario no definido'
                };
            }

            let paciente = await Paciente.findOne({
                where: { usuario_id: usuarioToken.id },
                include: [
                    {
                        model: Usuario,
                        attributes: [
                            'id',
                            'rut',
                            'nombre',
                            'correo',
                            'rol_id'
                        ]
                    }
                ]
            });

            if (!paciente && usuarioToken.rut) {
                const usuario = await Usuario.findOne({
                    where: { rut: usuarioToken.rut }
                });

                if (usuario) {
                    paciente = await Paciente.findOne({
                        where: { usuario_id: usuario.id },
                        include: [
                            {
                                model: Usuario,
                                attributes: [
                                    'id',
                                    'rut',
                                    'nombre',
                                    'correo',
                                    'rol_id'
                                ]
                            }
                        ]
                    });
                }
            }

            if (!paciente) {
                try {
                    const payload = { usuario_id: usuarioToken.id };
                    if (await columnaExiste('direccion')) payload.direccion = null;
                    if (await columnaExiste('telefono')) payload.telefono = null;
                    if (await columnaExiste('fecha_nacimiento')) payload.fecha_nacimiento = null;
                    if (await columnaExiste('prevision')) payload.prevision = null;

                    const pacienteCreado = await Paciente.create(payload);

                    paciente = await Paciente.findByPk(pacienteCreado.id, {
                        include: [
                            {
                                model: Usuario,
                                attributes: [
                                    'id',
                                    'rut',
                                    'nombre',
                                    'correo',
                                    'rol_id'
                                ]
                            }
                        ]
                    });
                } catch (createError) {
                    return {
                        ok: false,
                        mensaje: createError.message
                    };
                }
            }

            return {
                ok: true,
                paciente
            };

        } catch (error) {
            return {
                ok: false,
                mensaje: error.message
            };
        }

    }

    // Buscar paciente por RUT
    async buscarPorRut(rut) {

        try {

            const paciente = await Paciente.findOne({

                include: [
                    {
                        model: Usuario,
                        where: {
                            rut: rut
                        }
                    }
                ]

            });

            if (!paciente) {

                return {
                    ok: false,
                    mensaje: 'Paciente no encontrado'
                };

            }

            return {
                ok: true,
                paciente
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    // Actualizar ficha del paciente
    async actualizarPaciente(id, datos) {

        try {

            let paciente = await Paciente.findByPk(id);

            if (!paciente) {
                paciente = await Paciente.findOne({
                    where: { usuario_id: id }
                });
            }

            if (!paciente) {

                return {
                    ok: false,
                    mensaje: 'Paciente no encontrado'
                };

            }

            const updatePayload = {};
            if (await columnaExiste('direccion')) updatePayload.direccion = datos.direccion;
            if (await columnaExiste('telefono')) updatePayload.telefono = datos.telefono;
            if (await columnaExiste('fecha_nacimiento')) updatePayload.fecha_nacimiento = datos.fecha_nacimiento;
            if (await columnaExiste('prevision')) updatePayload.prevision = datos.prevision || null;

            await paciente.update(updatePayload);

            return {
                ok: true,
                mensaje: 'Paciente actualizado correctamente',
                paciente
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    // Eliminar paciente
    async eliminarPaciente(id) {

        try {

            const paciente = await Paciente.findByPk(id);

            if (!paciente) {

                return {
                    ok: false,
                    mensaje: 'Paciente no encontrado'
                };

            }

            await paciente.destroy();

            return {
                ok: true,
                mensaje: 'Paciente eliminado correctamente'
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    // Crear paciente vinculado a un usuario
    async crearPaciente(datos) {

        try {

            const payload = { usuario_id: datos.usuario_id };
            if (await columnaExiste('direccion')) payload.direccion = datos.direccion || null;
            if (await columnaExiste('telefono')) payload.telefono = datos.telefono || null;
            if (await columnaExiste('fecha_nacimiento')) payload.fecha_nacimiento = datos.fecha_nacimiento || null;
            if (await columnaExiste('prevision')) payload.prevision = datos.prevision || null;

            const paciente = await Paciente.create(payload);

            return {
                ok: true,
                mensaje: 'Paciente creado correctamente',
                paciente
            };

        } catch (error) {

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

}

module.exports = new PatientService();