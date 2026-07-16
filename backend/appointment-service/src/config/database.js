const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sequelize = new Sequelize(
    String(process.env.DB_NAME || ''),
    String(process.env.DB_USER || ''),
    String(process.env.DB_PASSWORD || ''),
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
        dialect: 'postgres',
        logging: false,
        define:{
            timestamps:false,
            freezeTableName:true
        }
    }
);

const conectarDB = async()=>{

    try{

        await sequelize.authenticate();

        console.log("✅ PostgreSQL conectado");

    }catch(error){

        console.error(error);

        process.exit(1);

    }

};

module.exports={sequelize,conectarDB};