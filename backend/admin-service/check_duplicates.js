require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const [rows1] = await sequelize.query("SELECT rut, ids, cnt FROM dedup_candidates ORDER BY cnt DESC LIMIT 100;");
        console.log('dedup_candidates (sample):', rows1.length);
        console.table(rows1.slice(0, 50));

        const [rows2] = await sequelize.query("SELECT rut, COUNT(*) AS cnt FROM usuarios GROUP BY rut HAVING COUNT(*) > 1 ORDER BY cnt DESC LIMIT 100;");
        console.log('usuarios duplicates (sample):', rows2.length);
        console.table(rows2.slice(0, 50));

        process.exit(0);
    } catch (err) {
        console.error('Error checking duplicates:', err.message || err);
        process.exit(1);
    }
}

run();
