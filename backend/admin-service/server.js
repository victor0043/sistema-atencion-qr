const express = require('express');

const cors = require('cors');

require('dotenv').config();


const app = express();


//=========================================
// MIDDLEWARES
//=========================================

app.use(cors());

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