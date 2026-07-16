const patientService = require('../services/patientService');

class PatientController {

    // Listar todos los pacientes
    async listarPacientes(req, res) {

        try {

            const respuesta = await patientService.listarPacientes();

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });

        }

    }

    // Obtener paciente por ID
    async obtenerPaciente(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await patientService.obtenerPaciente(id);

            if (!respuesta.ok) {
                return res.status(404).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });

        }

    }

    // Obtener paciente actual por token
    async obtenerPacienteActual(req, res) {

        try {

            const usuarioToken = req.usuario;
            const respuesta = await patientService.obtenerPacientePorUsuarioToken(usuarioToken);

            if (!respuesta.ok) {
                return res.status(404).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });

        }

    }

    // Buscar paciente por RUT
    async buscarPorRut(req, res) {

        try {

            const { rut } = req.params;

            const respuesta = await patientService.buscarPorRut(rut);

            if (!respuesta.ok) {
                return res.status(404).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });

        }

    }

    // Actualizar datos del paciente
    async actualizarPaciente(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await patientService.actualizarPaciente(id, req.body);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });

        }

    }

    // Eliminar paciente
    async eliminarPaciente(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await patientService.eliminarPaciente(id);

            if (!respuesta.ok) {
                return res.status(404).json(respuesta);
            }

            return res.status(200).json(respuesta);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });

        }

    }

    async crearPaciente(req, res) {

        try {
            const respuesta = await patientService.crearPaciente(req.body);

            if (!respuesta.ok) {
                return res.status(400).json(respuesta);
            }

            return res.status(201).json(respuesta);

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });
        }

    }

}

module.exports = new PatientController();