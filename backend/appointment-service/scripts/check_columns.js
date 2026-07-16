const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize } = require('../src/config/database');

async function run() {
  try {
    await sequelize.authenticate();
    const [res] = await sequelize.query('SELECT current_database() as db, current_schema() as schema');
    console.log('Conectado a DB/schema (appointment-service):', res[0]);
    const qi = sequelize.getQueryInterface();
    const desc = await qi.describeTable('pacientes');
    console.log('Columnas en pacientes (appointment-service):', Object.keys(desc));
    process.exit(0);
  } catch (err) {
    console.error('Error describiendo tabla pacientes:', err.message || err);
    process.exit(1);
  }
}

run();
