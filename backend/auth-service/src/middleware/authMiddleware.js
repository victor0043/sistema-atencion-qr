const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verifica que el usuario tenga un token válido
 */
const verificarToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    // Verificar si existe el token
    if (!authHeader) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no proporcionado'
        });
    }

    // Formato esperado: Bearer TOKEN
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token inválido'
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardar información del usuario en la petición
        req.usuario = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            ok: false,
            mensaje: 'Token expirado o inválido'
        });

    }

};

module.exports = verificarToken;