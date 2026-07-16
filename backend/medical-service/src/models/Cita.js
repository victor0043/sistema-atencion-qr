const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cita = sequelize.define('citas', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    paciente_id: {
        type: DataTypes.INTEGER
    },

    medico_id: {
        type: DataTypes.INTEGER
    },

    fecha: {
        type: DataTypes.DATEONLY
    },

    hora: {
        type: DataTypes.TIME
    },

    estado: {
        type: DataTypes.STRING
    },

    codigo_qr: {
        type: DataTypes.STRING
    }

}, {

    tableName: 'citas',
    timestamps: false

});

module.exports = Cita;