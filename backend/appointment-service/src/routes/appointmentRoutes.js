const express = require('express');

const router = express.Router();

const appointmentController = require('../controllers/appointmentController');

const verificarToken = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/roleMiddleware');
const verificarServiceKey = require('../middleware/serviceKeyMiddleware');

/*
==================================================
LISTAR TODAS LAS CITAS
ADMIN - MEDICO - ADMINISTRATIVO
GET /api/appointments
==================================================
*/

router.get(
    '/internal/citas',
    verificarServiceKey,
    appointmentController.listarCitas
);

/*
==================================================
LISTAR TODAS LAS CITAS
ADMIN - MEDICO - ADMINISTRATIVO
GET /api/appointments
==================================================
*/

router.get(
    '/',
    verificarToken,
    verificarRol(1,2,3),
    appointmentController.listarCitas
);

/*
==================================================
CONFIRMAR LLEGADA POR CÓDIGO QR
PUBLICO PARA EL ESCANEO DEL PACIENTE
POST /api/appointments/confirmar-qr
==================================================
*/

router.post(
    '/confirmar-qr',
    appointmentController.confirmarPorCodigoQR
);

/*
==================================================
BUSCAR CITA POR ID
ADMIN - MEDICO - ADMINISTRATIVO
GET /api/appointments/:id
==================================================
*/

router.get(
    '/:id',
    verificarToken,
    verificarRol(1,2,3),
    appointmentController.obtenerCita
);

router.get(
    '/paciente/:id',
    verificarToken,
    verificarRol(1,2,3,4),
    appointmentController.obtenerCitasPorPaciente
);

/*
==================================================
CREAR CITA
ADMIN - ADMINISTRATIVO
POST /api/appointments
==================================================
*/

router.post(
    '/',
    verificarToken,
    verificarRol(1,3),
    appointmentController.crearCita
);

/*
==================================================
ACTUALIZAR FECHA Y HORA
ADMIN - ADMINISTRATIVO
PUT /api/appointments/:id
==================================================
*/

router.put(
    '/:id',
    verificarToken,
    verificarRol(1,3),
    appointmentController.actualizarCita
);

/*
==================================================
ACTUALIZAR ESTADO
ADMIN - MEDICO
PATCH /api/appointments/:id/estado
==================================================
*/

router.patch(
    '/:id/estado',
    verificarToken,
    verificarRol(1,2,3,4),
    appointmentController.actualizarEstado
);

/*
==================================================
ELIMINAR CITA
SOLO ADMIN
DELETE /api/appointments/:id
==================================================
*/

router.delete(
    '/:id',
    verificarToken,
    verificarRol(1),
    appointmentController.eliminarCita
);

module.exports = router;