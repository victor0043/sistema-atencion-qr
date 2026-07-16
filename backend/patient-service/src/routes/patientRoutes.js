const express = require('express');

const router = express.Router();

// Diagnostic endpoint (temporal) - no requiere auth; devuelve headers relevantes
router.get('/diagnostic', (req, res) => {
    return res.status(200).json({
        ok: true,
        headers: {
            authorization: req.headers.authorization || null,
            cookie: req.headers.cookie || null,
            host: req.headers.host || null
        },
        message: 'Diagnostic endpoint - remove after debugging'
    });
});

const patientController = require('../controllers/patientController');
const verificarToken = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/roleMiddleware');
const verificarServiceKey = require('../middleware/serviceKeyMiddleware');

router.get(
    '/',
    verificarToken,
    verificarRol(1, 2, 3),
    patientController.listarPacientes
);

router.get(
    '/me',
    verificarToken,
    verificarRol(1, 2, 3, 4),
    patientController.obtenerPacienteActual
);

router.get(
    '/:id',
    verificarToken,
    verificarRol(1, 2, 3, 4),
    patientController.obtenerPaciente
);

router.get(
    '/rut/:rut',
    verificarToken,
    verificarRol(1, 3),
    patientController.buscarPorRut
);

router.put(
    '/:id',
    verificarToken,
    verificarRol(1, 3, 4),
    patientController.actualizarPaciente
);

router.delete(
    '/:id',
    verificarToken,
    verificarRol(1),
    patientController.eliminarPaciente
);

// Endpoint interno para crear pacientes desde otros servicios
router.post(
    '/',
    verificarServiceKey,
    patientController.crearPaciente
);

module.exports = router;