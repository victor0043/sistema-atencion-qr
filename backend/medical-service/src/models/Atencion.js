const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Atencion = sequelize.define('atenciones', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    cita_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    hora_inicio: {
        type: DataTypes.DATE
    },

    hora_fin: {
        type: DataTypes.DATE
    },

    estado: {
        type: DataTypes.STRING
    },

    observaciones: {
        type: DataTypes.TEXT
    }

}, {

    tableName: 'atenciones',
    timestamps: false

});

// Relación bidireccional con Cita
const Cita = require('./Cita');

Atencion.belongsTo(Cita, {
    foreignKey: 'cita_id'
});

Cita.hasMany(Atencion, {
    foreignKey: 'cita_id'
});

module.exports = Atencion;