const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const express = require('express');
const cors = require('cors');

const { conectarDB } = require('./src/config/database');

const appointmentRoutes = require('./src/routes/appointmentRoutes');

const Cita = require('./src/models/Cita');
const Paciente = require('./src/models/Paciente');
const Medico = require('./src/models/Medico');
const Usuario = require('./src/models/Usuario');

const { inicializarBlobStorage } = require('./src/services/blobStorageService');

const app = express();

// Configuración
app.set('port', process.env.PORT || 3003);

// Middlewares
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Sin origin = llamada server-to-server o curl/Postman, no un navegador; se permite.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {

    res.json({

        ok: true,
        servicio: 'Appointment Service',
        version: '1.0.0',
        estado: 'Activo'

    });

});

// Rutas
app.use('/api/appointments', appointmentRoutes);

// Maneja el error de origen no permitido por CORS sin filtrar el stack trace
app.use((err, req, res, next) => {
    if (err && err.message && err.message.startsWith('Origen no permitido por CORS')) {
        return res.status(403).json({ ok: false, mensaje: 'Origen no permitido por CORS' });
    }
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// Varios servicios intentan crear las mismas tablas compartidas (usuarios,
// medicos, pacientes) al arrancar en paralelo. Postgres no garantiza que
// "CREATE TABLE IF NOT EXISTS" sea atómico entre transacciones concurrentes:
// dos contenedores arrancando al mismo tiempo pueden chocar con un error de
// clave duplicada en el catálogo. Se reintenta con backoff corto para que
// el arranque sea determinista sin depender del orden real de arranque.
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

// Inicializar servidor
const iniciarServidor = async () => {

    try {

        await conectarDB();

        // appointment-service es dueño de 'citas': puede alterar su esquema.
        // 'pacientes', 'medicos' y 'usuarios' pertenecen a otros servicios
        // (patient-service, admin-service, auth-service); aquí solo se
        // garantiza su existencia (create-if-missing, nunca alter), y en el
        // orden correcto de dependencias FK: usuarios -> {pacientes, medicos} -> citas.
        await syncConReintento(Usuario);
        await Promise.all([
            syncConReintento(Paciente),
            syncConReintento(Medico)
        ]);
        await syncConReintento(Cita, { alter: true });

        await inicializarBlobStorage();

        app.listen(app.get('port'), () => {

            console.log('=====================================');
            console.log('APPOINTMENT SERVICE INICIADO');
            console.log('Puerto:', app.get('port'));
            console.log('=====================================');

        });

    } catch (error) {

        console.error(error);

    }

};

iniciarServidor();