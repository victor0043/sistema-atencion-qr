const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo alineado con el de patient-service, que es el dueño del esquema
// de 'pacientes' (único servicio que corre sync con alter:true sobre esta tabla).
const Paciente = sequelize.define('pacientes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER
    },
    direccion: {
        type: DataTypes.TEXT
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
}, {
    tableName: 'pacientes',
    timestamps: false
});

const Usuario = require('./Usuario');

Paciente.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

Usuario.hasOne(Paciente, {
    foreignKey: 'usuario_id'
});

module.exports = Paciente;