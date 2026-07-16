const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generar Token JWT
 */
const generarToken = (usuario) => {

    return jwt.sign(
        {
            id: usuario.id,
            rut: usuario.rut,
            nombre: usuario.nombre,
            rol: usuario.rol_id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES
        }
    );

};

/**
 * Verificar Token JWT
 */
const verificarToken = (token) => {

    try {

        return jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {

        return null;

    }

};

module.exports = {

    generarToken,
    verificarToken

};