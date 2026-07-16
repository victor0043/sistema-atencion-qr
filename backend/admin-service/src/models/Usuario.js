const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('usuarios', {

    id: {

        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true

    },

    rut: {

        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true

    },

    nombre: {

        type: DataTypes.STRING(120),
        allowNull: false

    },

    correo: {

        type: DataTypes.STRING(120)

    },

    password: {

        type: DataTypes.STRING(255),
        allowNull: false

    },

    rol_id: {

        type: DataTypes.INTEGER,
        allowNull: false

    },

    activo: {

        type: DataTypes.BOOLEAN,
        defaultValue: true

    }

}, {

    tableName: 'usuarios',
    timestamps: false

});

const Rol = require('./Rol');

Rol.hasMany(Usuario, {
    foreignKey: 'rol_id'
});

Usuario.belongsTo(Rol, {
    foreignKey: 'rol_id'
});

module.exports = Usuario;