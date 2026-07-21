const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Rol = require('./Rol');

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

},
{
    tableName: 'usuarios',
    timestamps: false,
    hooks: {
        beforeValidate: (usuario) => {
            if (usuario.rut) {
                usuario.rut = String(usuario.rut).toUpperCase().replace(/[\.\-\s]/g, '');
            }
            if (usuario.correo) {
                usuario.correo = String(usuario.correo).trim().toLowerCase();
            }
        }
    }
});

Rol.hasMany(Usuario,{
    foreignKey:'rol_id'
});

Usuario.belongsTo(Rol,{
    foreignKey:'rol_id'
});

module.exports = Usuario;