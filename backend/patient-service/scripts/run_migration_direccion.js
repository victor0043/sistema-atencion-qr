const path = require('path');
const { sequelize, conectarDB } = require('../src/config/database');

async function run() {
  try {
    await conectarDB();
    const sql = `ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS direccion TEXT;`;
    await sequelize.query(sql);
    console.log('✅ Columna "direccion" asegurada en la tabla pacientes.');
    process.exit(0);
  } catch (err) {
    console.error('Error al aplicar migración:', err.message || err);
    process.exit(1);
  }
}

run();
