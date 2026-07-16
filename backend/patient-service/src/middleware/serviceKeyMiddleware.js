const verificarServiceKey = (req, res, next) => {
    const serviceKey = req.headers['x-service-key'];
    if (!serviceKey || serviceKey !== process.env.INTERNAL_API_KEY) {
        return res.status(401).json({
            ok: false,
            mensaje: 'Service key inválida o no proporcionada.'
        });
    }

    next();
};

module.exports = verificarServiceKey;
