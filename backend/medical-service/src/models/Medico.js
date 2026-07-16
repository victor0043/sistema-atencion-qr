const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medico = sequelize.define('medicos', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    usuario_id: {
        type: DataTypes.INTEGER
    },

    especialidad: {
        type: DataTypes.STRING
    },

    box: {
        type: DataTypes.STRING
    }

}, {

    tableName: 'medicos',
    timestamps: false

});

module.exports = Medico;