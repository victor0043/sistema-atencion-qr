require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { conectarDB } = require('./src/config/database');

const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Configuración
app.set('port', process.env.PORT || 3003);

// Middlewares
app.use(cors());
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

// Iniciar servidor
const iniciarServidor = async () => {

    try {

        await conectarDB();

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