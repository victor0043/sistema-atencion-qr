const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const express = require('express');
const cors = require('cors');

const { conectarDB, sequelize } = require('./src/config/database');

const appointmentRoutes = require('./src/routes/appointmentRoutes');

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
        servicio: 'Appointment Service',
        version: '1.0.0',
        estado: 'Activo'

    });

});

// Rutas
app.use('/api/appointments', appointmentRoutes);

// Inicializar servidor
const iniciarServidor = async () => {

    try {

        await conectarDB();
        await sequelize.sync({ alter: true });

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