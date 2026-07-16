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
    const res = await client.query("SELECT id, rut, password, activo, rol_id FROM usuarios WHERE rut = '14083399-1'");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (err) {
    console.error('DB_ERR', err.message);
    process.exit(1);
  }
})();
