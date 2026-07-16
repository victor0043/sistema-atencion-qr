const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const verificarToken = require('../middleware/authMiddleware');

// Login
router.post('/login', authController.login);

// Ruta protegida de prueba
router.get('/perfil', verificarToken, (req, res) => {

    res.json({

        ok: true,

        usuario: req.usuario

    });

});

module.exports = router;