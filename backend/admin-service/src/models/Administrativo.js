const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Administrativo = sequelize.define('administrativos', {

    id: {

        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true

    },

    usuario_id: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    cargo: {

        type: DataTypes.STRING(100)

    }

}, {

    tableName: 'administrativos',
    timestamps: false

});

module.exports = Administrativo;