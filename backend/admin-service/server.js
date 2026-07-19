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
// DATABASE CONNECTION
//=========================================

sequelize.authenticate()

.then(()=>{

    console.log("PostgreSQL conectado");

})

.catch(error=>{

    console.log("Error BD:",error);

});



//=========================================
// SERVER
//=========================================

const PORT = process.env.PORT || 4004;


app.listen(PORT,()=>{

    console.log(
        `Admin Service ejecutándose en puerto ${PORT}`
    );

});