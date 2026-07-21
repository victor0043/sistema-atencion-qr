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

// Relación bidireccional con Usuario
const Usuario = require('./Usuario');

Administrativo.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

Usuario.hasOne(Administrativo, {
    foreignKey: 'usuario_id'
});

module.exports = Administrativo;