const bcrypt = require('bcrypt');

const Usuario = require('../models/Usuario');
const Medico = require('../models/medicos');
const Administrativo = require('../models/Administrativo');
const Rol = require('../models/Rol');

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL || 'http://localhost:3005';
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3002';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'secret-internal-key';

async function crearPacienteInterno(usuarioId) {
    const payload = {
        usuario_id: usuarioId
    };

    const response = await fetch(`${PATIENT_SERVICE_URL}/api/patients`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-service-key': INTERNAL_API_KEY
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.mensaje || 'Error creando paciente interno');
    }
    return data;
}

class AdminService {

    //=========================================
    // LISTAR USUARIOS
    //=========================================

    async listarUsuarios() {

        try {


            const usuarios = await Usuario.findAll({
                include: [
                    {
                        model: Rol,
                        attributes: ['id', 'nombre']
                    }
                ],
                order: [['id', 'ASC']]
            });

            // Normalizar salida: devolver objetos plain con propiedad `rol` para facilitar el consumo
            const usuariosPlain = usuarios.map(u => {
                const objeto = typeof u.toJSON === 'function' ? u.toJSON() : u;
                if (!objeto.rol && objeto.Rol) {
                    objeto.rol = objeto.Rol;
                }
                return objeto;
            });

            return {
                ok: true,
                usuarios: usuariosPlain
            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    //=========================================
    // OBTENER USUARIO
    //=========================================

    async obtenerUsuario(id) {

        try {

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {

                return {

                    ok: false,
                    mensaje: 'Usuario no encontrado'

                };

            }

            return {

                ok: true,
                usuario

            };

        } catch (error) {

            return {

                ok: false,
                mensaje: error.message

            };

        }

    }

    //=========================================
    // CREAR USUARIO
    //=========================================

    async crearUsuario(datos) {

        try {

            // Normalizar RUT y correo para validaciones
            const rawRut = datos.rut || '';
            const cleanRut = String(rawRut).replace(/[.\-\s]/g, '');
            const email = datos.correo ? String(datos.correo).trim().toLowerCase() : null;

            const existeRut = await Usuario.findOne({
                where: { rut: cleanRut }
            });

            if (existeRut) {
                return {
                    ok: false,
                    mensaje: 'El RUT ya está registrado.'
                };
            }

            if (email) {
                const existeCorreo = await Usuario.findOne({
                    where: { correo: email }
                });

                if (existeCorreo) {
                    return {
                        ok: false,
                        mensaje: 'El correo ya está registrado.'
                    };
                }
            }

            const password = await bcrypt.hash(datos.password, 10);

            // Validación adicional: verificar longitud del RUT ya normalizado
            if (cleanRut.length > 12) {
                return {
                    ok: false,
                    mensaje: 'RUT demasiado largo; elimine separadores o verifique el RUT.'
                };
            }

            const usuario = await Usuario.create({
                rut: cleanRut,
                nombre: datos.nombre,
                correo: email,
                password,
                rol_id: datos.rol_id,
                activo: true
            });

            // Crear perfil asociado según rol: 2=MEDICO, 3=ADMINISTRATIVO, 4=PACIENTE
            let medico = null;
            let administrativo = null;
            let paciente = null;

            try {
                // Si rol es MEDICO (2), crear registro en medicos
                if (Number(datos.rol_id) === 2) {
                    const respMedico = await this.crearMedico({
                        usuario_id: usuario.id,
                        especialidad: datos.especialidad || null,
                        box: datos.box || null
                    });

                    if (respMedico.ok) medico = respMedico.medico;
                }

                // Si rol es ADMINISTRATIVO (3), crear registro en administrativos
                if (Number(datos.rol_id) === 3) {
                    const respAdmin = await this.crearAdministrativo({
                        usuario_id: usuario.id,
                        cargo: datos.cargo || null
                    });

                    if (respAdmin.ok) administrativo = respAdmin.administrativo;
                }

                // Si rol es PACIENTE (4), crear registro en patient-service
                if (Number(datos.rol_id) === 4) {
                    const respPaciente = await crearPacienteInterno(usuario.id);
                    if (respPaciente.ok) {
                        paciente = respPaciente.paciente;
                    }
                }
            } catch (err) {
                // no bloquear la creación del usuario si falla la creación del perfil asociado
                console.warn('No se pudo crear perfil asociado (medico/administrativo/paciente):', err.message || err);
            }

            return {
                ok: true,
                mensaje: 'Usuario creado correctamente.',
                usuario,
                medico,
                administrativo,
                paciente
            };

        } catch (error) {

            // Manejar errores de unicidad (Postgres 23505 / SequelizeUniqueConstraintError)
            if (error && (error.name === 'SequelizeUniqueConstraintError' || (error.parent && error.parent.code === '23505'))) {
                const detail = (error.parent && error.parent.detail) || (error.errors && error.errors[0] && error.errors[0].message) || 'Registro duplicado';
                return { ok: false, mensaje: detail };
            }

            return {
                ok: false,
                mensaje: error.message
            };

        }

    }

    //=========================================
    // ACTUALIZAR USUARIO
    //=========================================

    async actualizarUsuario(id, datos) {

        try {

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {

                return {

                    ok: false,

                    mensaje: 'Usuario no encontrado.'

                };

            }

            await usuario.update({

                nombre: datos.nombre,

                correo: datos.correo,

                rol_id: datos.rol_id

            });

            return {

                ok: true,

                mensaje: 'Usuario actualizado.',

                usuario

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // ELIMINAR USUARIO
    //=========================================

    async eliminarUsuario(id) {

        try {

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {

                return {

                    ok: false,

                    mensaje: 'Usuario no encontrado.'

                };

            }

            // Si el usuario es MÉDICO (rol_id=3) eliminar su perfil de medicos
            if (Number(usuario.rol_id) === 3) {
                await Medico.destroy({
                    where: { usuario_id: usuario.id }
                });
            }

            // Si el usuario es ADMINISTRATIVO (rol_id=2) eliminar su perfil de administrativos
            if (Number(usuario.rol_id) === 2) {
                await Administrativo.destroy({
                    where: { usuario_id: usuario.id }
                });
            }

            await usuario.destroy();

            return {

                ok: true,

                mensaje: 'Usuario eliminado.'

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // CAMBIAR ESTADO
    //=========================================

    async cambiarEstado(id) {

        try {

            const usuario = await Usuario.findByPk(id);

            if (!usuario) {

                return {

                    ok: false,

                    mensaje: 'Usuario no encontrado.'

                };

            }

            await usuario.update({

                activo: !usuario.activo

            });

            return {

                ok: true,

                mensaje: 'Estado actualizado.',

                usuario

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // CREAR MEDICO
    //=========================================

    async crearMedico(datos) {

        try {

            const medico = await Medico.create({

                usuario_id: datos.usuario_id,

                especialidad: datos.especialidad,

                box: datos.box

            });

            return {

                ok: true,

                mensaje: 'Médico creado.',

                medico

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // CREAR ADMINISTRATIVO
    //=========================================

    async crearAdministrativo(datos) {

        try {

            const administrativo = await Administrativo.create({

                usuario_id: datos.usuario_id,

                cargo: datos.cargo

            });

            return {

                ok: true,

                mensaje: 'Administrativo creado.',

                administrativo

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // LISTAR MÉDICOS
    //=========================================

    async listarMedicos() {

        try {

            const medicos = await Medico.findAll({

                include: [
                    {
                        model: Usuario,
                        attributes: ['id', 'rut', 'nombre', 'correo']
                    }
                ],

                order: [['id', 'ASC']]

            });

            // Intentar obtener las citas desde appointment-service para derivar el estado de cada médico
            let citas = [];
            try {
                const resp = await fetch(`${APPOINTMENT_SERVICE_URL}/api/appointments/internal/citas`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-service-key': INTERNAL_API_KEY
                    }
                });

                if (resp.ok) {
                    const data = await resp.json();
                    citas = Array.isArray(data.citas) ? data.citas : [];
                } else {
                    console.warn('No fue posible obtener citas desde appointment-service:', resp.status);
                }
            } catch (err) {
                console.warn('Error consultando appointment-service para estados de médicos:', err.message || err);
            }

            // Mapear estado por médico según sus citas (priorizar ATENDIENDO > EN_ESPERA/AGENDADA > libre)
            const medicosPlain = medicos.map(m => {
                const objeto = typeof m.toJSON === 'function' ? m.toJSON() : m;

                const citasDelMedico = citas.filter(c => c.medico_id === objeto.id || (c.medico && c.medico.id === objeto.id));

                let estado = 'DISPONIBLE';

                if (citasDelMedico.some(c => c.estado === 'ATENDIENDO')) {
                    estado = 'ATENDIENDO';
                } else if (citasDelMedico.some(c => c.estado === 'EN_ESPERA' || c.estado === 'AGENDADA')) {
                    estado = 'EN_ESPERA';
                }

                objeto.estado = estado;

                return objeto;
            });

            return {

                ok: true,

                medicos: medicosPlain

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

    //=========================================
    // ACTUALIZAR ESTADO DE MEDICO
    //=========================================

    async actualizarEstadoMedico(medicoId, estado) {

        try {

            const medico = await Medico.findByPk(medicoId);

            if (!medico) {

                return {

                    ok: false,

                    mensaje: 'Médico no encontrado'

                };

            }

            await medico.update({ estado });

            return {

                ok: true,

                mensaje: 'Estado de médico actualizado',

                medico

            };

        } catch (error) {

            return {

                ok: false,

                mensaje: error.message

            };

        }

    }

}

module.exports = new AdminService();