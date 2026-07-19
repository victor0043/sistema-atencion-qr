require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { conectarDB, sequelize } = require('./src/config/database');

const medicalRoutes = require('./src/routes/medicalRoutes');

const app = express();

// Configuración
app.set('port', process.env.PORT || 3004);

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
        servicio: 'Medical Service',
        version: '1.0.0',
        estado: 'Activo'

    });

});

// Rutas
app.use('/api/medical', medicalRoutes);

// Maneja el error de origen no permitido por CORS sin filtrar el stack trace
app.use((err, req, res, next) => {
    if (err && err.message && err.message.startsWith('Origen no permitido por CORS')) {
        return res.status(403).json({ ok: false, mensaje: 'Origen no permitido por CORS' });
    }
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// Otros servicios (appointment-service, patient-service, auth-service) también
// crean tablas compartidas (usuarios, medicos, citas) al arrancar en paralelo;
// "CREATE TABLE IF NOT EXISTS" no es atómico entre transacciones concurrentes
// en Postgres, así que se reintenta con backoff en vez de fallar el arranque.
const syncConReintento = async (options = {}, intentos = 5) => {
    for (let intento = 1; intento <= intentos; intento++) {
        try {
            return await sequelize.sync(options);
        } catch (error) {
            if (intento === intentos) throw error;
            await new Promise((resolve) => setTimeout(resolve, 500 * intento));
        }
    }
};

// Iniciar servidor
const iniciarServidor = async () => {

    try {

        await conectarDB();
        await syncConReintento({ alter: true });

        app.listen(app.get('port'), () => {

            console.log('====================================');
            console.log('MEDICAL SERVICE INICIADO');
            console.log('Puerto:', app.get('port'));
            console.log('====================================');

        });

    } catch (error) {

        console.error('Error al iniciar el servidor:', error);

    }

};

iniciarServidor();