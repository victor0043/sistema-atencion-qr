const jwt = require('jsonwebtoken');
require('dotenv').config();

const verificarToken = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                ok: false,
                mensaje: 'Debe enviar un token.'

            });

        }

        const token = authHeader.split(' ')[1];

        if (!token) {

            return res.status(401).json({

                ok: false,
                mensaje: 'Token inválido.'

            });

        }

        const usuario = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = usuario;

        next();

    } catch (error) {

        return res.status(401).json({

            ok: false,
            mensaje: 'Token expirado o inválido.'

        });

    }

};

module.exports = verificarToken;