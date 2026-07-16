const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { conectarDB, sequelize } = require('../src/config/database');

async function run() {
  try {
    await conectarDB();
    const [rows] = await sequelize.query('SELECT id, usuario_id FROM pacientes ORDER BY id ASC LIMIT 20');
    console.log('Pacientes:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error listando pacientes:', err.message || err);
    process.exit(1);
  }
}

run();
