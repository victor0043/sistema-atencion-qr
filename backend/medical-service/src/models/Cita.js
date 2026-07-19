const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo alineado con el de appointment-service, que es el dueño del esquema
// de 'citas' (único servicio que corre sync con alter:true sobre esta tabla).
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
    },

    qr_blob_url: {
        type: DataTypes.STRING
    }

}, {

    tableName: 'citas',
    timestamps: false

});

module.exports = Cita;