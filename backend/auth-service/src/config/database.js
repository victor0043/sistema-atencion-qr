const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',

        logging: false,

        define: {
            timestamps: false,
            freezeTableName: true
        },

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Probar conexión
const conectarDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL conectado correctamente');
    } catch (error) {
        console.error('❌ Error al conectar PostgreSQL');
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    conectarDB
};