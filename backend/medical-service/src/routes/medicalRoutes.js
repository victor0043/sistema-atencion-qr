const express = require('express');

const router = express.Router();

const medicalController = require('../controllers/medicalController');

const verificarToken = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/roleMiddleware');

/*
====================================================
LISTAR TODAS LAS ATENCIONES
ADMIN - MEDICO
GET /api/medical
====================================================
*/

router.get(
    '/',
    verificarToken,
    verificarRol(1, 2),
    medicalController.listarAtenciones
);

/*
====================================================
OBTENER UNA ATENCION
ADMIN - MEDICO
GET /api/medical/:id
====================================================
*/

router.get(
    '/:id',
    verificarToken,
    verificarRol(1, 2),
    medicalController.obtenerAtencion
);

/*
====================================================
INICIAR ATENCION
ADMIN - MEDICO
POST /api/medical/iniciar
====================================================
*/

router.post(
    '/iniciar',
    verificarToken,
    verificarRol(1, 2),
    medicalController.iniciarAtencion
);

/*
====================================================
FINALIZAR ATENCION
ADMIN - MEDICO
PUT /api/medical/finalizar/:id
====================================================
*/

router.put(
    '/finalizar/:id',
    verificarToken,
    verificarRol(1, 2),
    medicalController.finalizarAtencion
);

/*
====================================================
ACTUALIZAR OBSERVACIONES
ADMIN - MEDICO
PATCH /api/medical/observaciones/:id
====================================================
*/

router.patch(
    '/observaciones/:id',
    verificarToken,
    verificarRol(1, 2),
    medicalController.actualizarObservaciones
);

/*
====================================================
ELIMINAR ATENCION
SOLO ADMIN
DELETE /api/medical/:id
====================================================
*/

router.delete(
    '/:id',
    verificarToken,
    verificarRol(1),
    medicalController.eliminarAtencion
);

module.exports = router;