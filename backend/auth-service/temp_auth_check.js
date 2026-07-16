const { Client } = require('pg');
const http = require('http');
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
    const users = await client.query('SELECT id, rut, nombre, correo, activo, rol_id FROM usuarios ORDER BY id LIMIT 100');
    console.log('USERS_COUNT', users.rows.length);
    console.log(JSON.stringify(users.rows, null, 2));
    const roles = await client.query('SELECT id, nombre FROM roles ORDER BY id');
    console.log('ROLES_COUNT', roles.rows.length);
    console.log(JSON.stringify(roles.rows, null, 2));
    await client.end();
  } catch (err) {
    console.error('DB_ERR', err.message);
    process.exit(1);
  }

  const data = JSON.stringify({ rut: '14083399-1', password: 'admin123' });
  const options = {
    host: '127.0.0.1',
    port: 3003,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('HTTP_STATUS', res.statusCode);
      console.log(body);
    });
  });
  req.on('error', e => console.error('HTTP_ERR', e.message));
  req.write(data);
  req.end();
})();
