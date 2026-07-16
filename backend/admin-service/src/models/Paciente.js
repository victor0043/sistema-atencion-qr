const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medico = sequelize.define('medicos', {

    id: {

        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true

    },

    usuario_id: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    especialidad: {

        type: DataTypes.STRING(100)

    },

    box: {

        type: DataTypes.STRING(20)

    }

}, {

    tableName: 'medicos',
    timestamps: false

});

module.exports = Medico;