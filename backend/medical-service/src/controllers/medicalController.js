const medicalService = require('../services/medicalService');

class MedicalController {

    //=========================================
    // LISTAR TODAS LAS ATENCIONES
    //=========================================

    async listarAtenciones(req, res) {

        try {

            const respuesta = await medicalService.listarAtenciones();

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
    // OBTENER UNA ATENCION
    //=========================================

    async obtenerAtencion(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await medicalService.obtenerAtencion(id);

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
    // INICIAR ATENCION
    //=========================================

    async iniciarAtencion(req, res) {

        try {

            const { cita_id } = req.body;

            const respuesta = await medicalService.iniciarAtencion(cita_id);

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
    // FINALIZAR ATENCION
    //=========================================

    async finalizarAtencion(req, res) {

        try {

            const { id } = req.params;

            const { observaciones } = req.body;

            const respuesta = await medicalService.finalizarAtencion(

                id,
                observaciones

            );

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
    // ACTUALIZAR OBSERVACIONES
    //=========================================

    async actualizarObservaciones(req, res) {

        try {

            const { id } = req.params;

            const { observaciones } = req.body;

            const respuesta = await medicalService.actualizarObservaciones(

                id,
                observaciones

            );

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
    // ELIMINAR ATENCION
    //=========================================

    async eliminarAtencion(req, res) {

        try {

            const { id } = req.params;

            const respuesta = await medicalService.eliminarAtencion(id);

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

}

module.exports = new MedicalController();