const bcrypt = require('bcrypt');
const { Client } = require('pg');
require('dotenv').config();
(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    const plain = 'admin123';
    const hash = await bcrypt.hash(plain, 10);
    const update = await client.query(
      'UPDATE usuarios SET password = $1 WHERE rut = $2 RETURNING id, rut, nombre, correo, activo, rol_id',
      [hash, '14083399-1']
    );
    console.log('UPDATED', update.rowCount);
    console.log(JSON.stringify(update.rows, null, 2));
    await client.end();
  } catch (err) {
    console.error('ERR', err.message);
    process.exit(1);
  }
})();
