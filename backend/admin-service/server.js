const express = require('express');

const cors = require('cors');

require('dotenv').config();


const app = express();


//=========================================
// MIDDLEWARES
//=========================================

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


//=========================================
// DATABASE
//=========================================

const { sequelize } = require('./src/config/database');//  Ruta correcta

// Importar modelos para sincronización
const Rol = require('./src/models/Rol');
const Usuario = require('./src/models/Usuario');
const Medico = require('./src/models/medicos');
const Administrativo = require('./src/models/Administrativo');
const Paciente = require('./src/models/Paciente');

// Helper: sincronizar tablas con reintentos (race conditions)
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

//=========================================
// ROUTES
//=========================================

const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/admin', adminRoutes);

// Maneja el error de origen no permitido por CORS sin filtrar el stack trace
app.use((err, req, res, next) => {
    if (err && err.message && err.message.startsWith('Origen no permitido por CORS')) {
        return res.status(403).json({ ok: false, mensaje: 'Origen no permitido por CORS' });
    }
    console.error(err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});



//=========================================
// TEST
//=========================================

app.get('/', (req,res)=>{

    res.json({

        servicio:"Admin Service",
        estado:"Activo"

    });

});



//=========================================
// DATABASE CONNECTION Y SINCRONIZACIÓN
//=========================================

const iniciarServidor = async () => {
    try {
        // Autenticar
        await sequelize.authenticate();
        console.log("✅ PostgreSQL conectado");

        // Sincronizar tablas en orden correcto (respetando FKs)
        // Primero: tablas sin dependencias
        await syncConReintento(Rol);
        await syncConReintento(Usuario);
        
        // Luego: tablas que dependen de Usuario
        await Promise.all([
            syncConReintento(Medico),
            syncConReintento(Administrativo),
            syncConReintento(Paciente)
        ]);

        console.log("✅ Tablas sincronizadas correctamente");

        // Ahora sí, iniciar el servidor
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`Admin Service ejecutándose en puerto ${PORT}`);
            console.log('=================================');
        });

    } catch (error) {
        console.error('❌ Error durante inicialización:', error.message || error);
        process.exit(1);
    }
};

//=========================================
// INICIAR SERVIDOR
//=========================================

const PORT = process.env.PORT || 3001;
iniciarServidor();