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
    },
    fecha_creacion: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'citas',
    timestamps: false
});

const Paciente = require('./Paciente');
const Medico = require('./Medico');

Paciente.hasMany(Cita, {
    foreignKey: 'paciente_id'
});

Cita.belongsTo(Paciente, {
    foreignKey: 'paciente_id'
});

Medico.hasMany(Cita, {
    foreignKey: 'medico_id'
});

Cita.belongsTo(Medico, {
    foreignKey: 'medico_id'
});

module.exports = Cita;