const bcrypt = require('bcrypt');

const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');

// ids fijos: deben coincidir con los números usados en verificarRol(...)
// en las rutas de todos los microservicios (1=ADMIN, 2=MEDICO, 3=ADMINISTRATIVO, 4=PACIENTE)
const ROLES = [
    { id: 1, nombre: 'ADMIN' },
    { id: 2, nombre: 'MEDICO' },
    { id: 3, nombre: 'ADMINISTRATIVO' },
    { id: 4, nombre: 'PACIENTE' }
];

// Credenciales del usuario semilla (documentadas también en README.md).
// Cambiar en un entorno real; para este proyecto de curso el valor simple es intencional.
// El rut se guarda sin puntos ni guion, igual que hace adminService.crearUsuario
// (authService.login también limpia el rut recibido antes de buscarlo).
const SEED_ADMIN = {
    rut: '111111111',
    nombre: 'Administrador Sistema',
    correo: 'admin@hospitalqr.local',
    password: 'Admin123!'
};

// patient-service/appointment-service también intentan crear 'usuarios' al
// arrancar en paralelo; "CREATE TABLE IF NOT EXISTS" no es atómico entre
// transacciones concurrentes en Postgres, así que se reintenta con backoff.
const syncConReintento = async (model, options = {}, intentos = 5) => {
    for (let intento = 1; intento <= intentos; intento++) {
        try {
            return await model.sync(options);
        } catch (error) {
            if (intento === intentos) throw error;
            await new Promise((resolve) => setTimeout(resolve, 500 * intento));
        }
    }
};

/**
 * Inicialización determinista de datos base. Idempotente: puede correr en
 * cada arranque del contenedor sin duplicar filas ni sobrescribir datos existentes.
 */
const seedInicial = async () => {

    // Nadie más crea la tabla 'roles' hoy (ni admin-service ni auth-service
    // corrían sync antes de este fix), así que se garantiza su existencia aquí.
    await syncConReintento(Rol);
    await syncConReintento(Usuario);

    for (const rol of ROLES) {
        await Rol.findOrCreate({
            where: { id: rol.id },
            defaults: rol
        });
    }

    const existente = await Usuario.findOne({ where: { rut: SEED_ADMIN.rut } });

    if (!existente) {

        const passwordHash = await bcrypt.hash(SEED_ADMIN.password, 10);

        await Usuario.create({
            rut: SEED_ADMIN.rut,
            nombre: SEED_ADMIN.nombre,
            correo: SEED_ADMIN.correo,
            password: passwordHash,
            rol_id: 1,
            activo: true
        });

        console.log(`Usuario administrador semilla creado (rut: ${SEED_ADMIN.rut})`);

    }

};

module.exports = seedInicial;
