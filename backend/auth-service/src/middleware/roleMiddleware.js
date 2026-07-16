const verificarRol = (...rolesPermitidos) => {

    return (req, res, next) => {

        if (!req.usuario) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        const rol = req.usuario.rol;

        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({
                ok: false,
                mensaje: 'No tiene permisos para acceder'
            });
        }

        next();

    };

};

module.exports = verificarRol;