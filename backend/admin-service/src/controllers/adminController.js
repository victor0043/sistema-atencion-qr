const adminService = require('../services/adminService');

class AdminController {

    //=========================================
    // LISTAR USUARIOS
    //=========================================

    async listarUsuarios(req, res) {

        try {

            const respuesta = await adminService.listarUsuarios();

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // OBTENER USUARIO
    //=========================================

    async obtenerUsuario(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await adminService.obtenerUsuario(id);

            if (!respuesta.ok) {
                return res.status(404).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // CREAR USUARIO
    //=========================================

    async crearUsuario(req, res) {

        try {

            console.log('POST /api/admin/usuarios body:', req.body);

            const respuesta = await adminService.crearUsuario(req.body);

            console.log('AdminService.crearUsuario response:', respuesta);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(201).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // ACTUALIZAR USUARIO
    //=========================================

    async actualizarUsuario(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await adminService.actualizarUsuario(id, req.body);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // ELIMINAR USUARIO
    //=========================================

    async eliminarUsuario(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await adminService.eliminarUsuario(id);

            if (!respuesta.ok) {
                return res.status(404).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // CAMBIAR ESTADO
    //=========================================

    async cambiarEstado(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await adminService.cambiarEstado(id);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // CREAR MÉDICO
    //=========================================

    async crearMedico(req, res) {

        try {

            const respuesta = await adminService.crearMedico(req.body);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(201).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // CREAR ADMINISTRATIVO
    //=========================================

    async crearAdministrativo(req, res) {

        try {

            const respuesta = await adminService.crearAdministrativo(req.body);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(201).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // LISTAR MÉDICOS
    //=========================================

    async listarMedicos(req, res) {

        try {

            const respuesta = await adminService.listarMedicos();

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,
                mensaje: "Error interno del servidor"

            });

        }

    }

    //=========================================
    // ACTUALIZAR ESTADO DE MEDICO (LLAMADAS INTERNAS)
    //=========================================

    async actualizarEstadoMedico(req, res) {

        try {

            // Permitir llamadas internas mediante la cabecera x-service-key
            const serviceKey = req.headers['x-service-key'];
            const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'secret-internal-key';

            if (serviceKey !== INTERNAL_API_KEY) {
                return res.status(401).json({ ok: false, mensaje: 'No autorizado' });
            }

            const { id } = req.params;
            const { estado } = req.body;

            const respuesta = await adminService.actualizarEstadoMedico(id, estado);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });

        }

    }

}

module.exports = new AdminController();