const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('usuarios',{

    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },

    rut:{
        type:DataTypes.STRING(12)
    },

    nombre:{
        type:DataTypes.STRING(120)
    },

    correo:{
        type:DataTypes.STRING(120)
    },

    password:{
        type:DataTypes.STRING
    },

    rol_id:{
        type:DataTypes.INTEGER
    },

    activo:{
        type:DataTypes.BOOLEAN
    }

},{
    tableName:'usuarios',
    timestamps:false
});

module.exports=Usuario;