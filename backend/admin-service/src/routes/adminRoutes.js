const express = require('express');

const router = express.Router();

const adminController = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');

const verificarRol = require('../middleware/roleMiddleware');


//=========================================
// USUARIOS
//=========================================


// LISTAR USUARIOS
router.get(
    '/usuarios',
    authMiddleware,
    verificarRol(1),
    adminController.listarUsuarios
);


// OBTENER USUARIO

router.get(
    '/usuarios/:id',
    authMiddleware,
    verificarRol(1),
    adminController.obtenerUsuario
);


// CREAR USUARIO

router.post(
    '/usuarios',
    authMiddleware,
    verificarRol(1),
    adminController.crearUsuario
);


// ACTUALIZAR USUARIO

router.put(
    '/usuarios/:id',
    authMiddleware,
    verificarRol(1),
    adminController.actualizarUsuario
);


// ELIMINAR USUARIO

router.delete(
    '/usuarios/:id',
    authMiddleware,
    verificarRol(1),
    adminController.eliminarUsuario
);


// CAMBIAR ESTADO

router.patch(
    '/usuarios/:id/estado',
    authMiddleware,
    verificarRol(1),
    adminController.cambiarEstado
);



//=========================================
// MEDICOS
//=========================================


router.get(
    '/medicos',
    authMiddleware,
    verificarRol(1, 3),
    adminController.listarMedicos
);

router.post(
    '/medicos',
    authMiddleware,
    verificarRol(1),
    adminController.crearMedico
);

// Endpoint interno para actualizar estado de médico (usado por otros microservicios)
router.patch(
    '/medicos/:id/estado',
    adminController.actualizarEstadoMedico
);



//=========================================
// ADMINISTRATIVOS
//=========================================


router.post(
    '/administrativos',
    authMiddleware,
    verificarRol(1),
    adminController.crearAdministrativo
);



module.exports = router;