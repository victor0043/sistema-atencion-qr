const appointmentService = require('../services/appointmentService');

class AppointmentController {

    async listarCitas(req, res) {
        try {
            const respuesta = await appointmentService.listarCitas();

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

    async obtenerCita(req, res) {
        try {
            const { id } = req.params;
            const respuesta = await appointmentService.obtenerCita(id);

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

    async obtenerCitasPorPaciente(req, res) {
        try {
            const { id } = req.params;
            const respuesta = await appointmentService.obtenerCitasPorPaciente(id);

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

    async crearCita(req, res) {
        try {
            const datos = req.body;
            const respuesta = await appointmentService.crearCita(datos);

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

    async actualizarCita(req, res) {
        try {
            const { id } = req.params;
            const datos = req.body;
            const respuesta = await appointmentService.actualizarCita(id, datos);

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

    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const respuesta = await appointmentService.actualizarEstado(id, estado);

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

    async confirmarPorCodigoQR(req, res) {
        try {
            const { codigo_qr, cita_id } = req.body;
            const respuesta = await appointmentService.confirmarPorCodigoQR(codigo_qr, cita_id);

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

    async eliminarCita(req, res) {
        try {
            const { id } = req.params;
            const respuesta = await appointmentService.eliminarCita(id);

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

}

module.exports = new AppointmentController();