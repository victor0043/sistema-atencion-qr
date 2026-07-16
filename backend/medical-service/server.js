require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { conectarDB } = require('./src/config/database');

const medicalRoutes = require('./src/routes/medicalRoutes');

const app = express();

// Configuración
app.set('port', process.env.PORT || 3004);

// Middlewares
app.use(cors());
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

// Iniciar servidor
const iniciarServidor = async () => {

    try {

        await conectarDB();

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