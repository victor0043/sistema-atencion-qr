const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        // DEBUG LOGS - temporal
        console.log('[authMiddleware] headers:', {
            authorization: authHeader,
            cookie: req.headers.cookie
        });

        if (!authHeader) {

            console.warn('[authMiddleware] missing Authorization header');
            return res.status(401).json({

                ok: false,
                mensaje: 'Debe enviar el token de autenticación'

            });

        }

        // soportar formatos "Bearer <token>" o solo el token
        const parts = authHeader.split(' ');
        const token = parts.length > 1 ? parts[1] : parts[0];

        console.log('[authMiddleware] extracted token present:', !!token);

        if (!token) {

            console.warn('[authMiddleware] token missing after split');
            return res.status(401).json({

                ok: false,
                mensaje: 'Token inválido'

            });

        }

        const usuario = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = usuario;

        next();

    } catch (error) {

        console.error('[authMiddleware] jwt verification error:', error && error.message);

        return res.status(401).json({

            ok: false,
            mensaje: 'Token expirado o inválido'

        });

    }

};

module.exports = verificarToken;