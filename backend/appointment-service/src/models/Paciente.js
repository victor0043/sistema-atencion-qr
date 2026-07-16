const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Paciente = sequelize.define('pacientes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER
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