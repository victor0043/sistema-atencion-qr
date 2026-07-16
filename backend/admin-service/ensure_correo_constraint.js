require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const [rows] = await sequelize.query("SELECT conname FROM pg_constraint WHERE conname = 'usuarios_correo_key';");

        if (rows.length > 0) {
            console.log('Constraint usuarios_correo_key already exists');
        } else {
            console.log('Creating constraint usuarios_correo_key...');
            await sequelize.query("ALTER TABLE usuarios ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);");
            console.log('Constraint created');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error ensuring correo constraint:', err.message || err);
        process.exit(1);
    }
}

run();
