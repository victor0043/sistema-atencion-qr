require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { conectarDB } = require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');
const seedInicial = require('./src/utils/seed');

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
        servicio: 'Auth Service',
        version: '1.0.0',
        estado: 'Activo'
    });

});

// Rutas
app.use('/api/auth', authRoutes);

// Maneja el error de origen no permitido por CORS sin filtrar el stack trace
app.use((err, req, res, next) => {
    if (err && err.message && err.message.startsWith('Origen no permitido por CORS')) {
        return res.status(403).json({ ok: false, mensaje: 'Origen no permitido por CORS' });
    }
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

// Iniciar servidor
const iniciarServidor = async () => {

    try {

        await conectarDB();
        await seedInicial();

        app.listen(app.get('port'), () => {

            console.log('=================================');
            console.log('AUTH SERVICE INICIADO');
            console.log('Puerto:', app.get('port'));
            console.log('=================================');

        });

    } catch (error) {

        console.error(error);

    }

};

iniciarServidor();