const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = require('./Usuario');

const Paciente = sequelize.define('pacientes',{

    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },

    usuario_id:{
        type:DataTypes.INTEGER
    },

    direccion:{
        type:DataTypes.TEXT
    },
    telefono: {
        type: DataTypes.STRING(20)
    },

    fecha_nacimiento: {
        type: DataTypes.DATEONLY
    },

    prevision: {
        type: DataTypes.STRING(100)
    }

},{
    tableName:'pacientes',
    timestamps:false
});

Usuario.hasOne(Paciente,{
    foreignKey:'usuario_id'
});

Paciente.belongsTo(Usuario,{
    foreignKey:'usuario_id'
});

module.exports=Paciente;