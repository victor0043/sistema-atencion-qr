const authService = require('../services/authService');

class AuthController {

    // Login
    async login(req, res) {

        try {

            const { rut, password } = req.body;

            // Validar datos
            if (!rut || !password) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe ingresar RUT y contraseña'
                });
            }

            // Llamar al servicio
            const respuesta = await authService.login(rut, password);

            if (!respuesta.ok) {
                return res.status(401).json(respuesta);
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

module.exports = new AuthController();