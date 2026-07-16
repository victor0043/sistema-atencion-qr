require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // 1) Normalize RUT
        console.log('Normalizing RUTs...');
        await sequelize.query("UPDATE usuarios SET rut = regexp_replace(rut, '[.\\-\\s]', '', 'g') WHERE rut IS NOT NULL;");

        // 2) Create dedup_candidates
        console.log('Creating dedup_candidates...');
        await sequelize.query('DROP TABLE IF EXISTS dedup_candidates;');
        await sequelize.query(`CREATE TABLE dedup_candidates AS
            SELECT rut, array_agg(id ORDER BY id) AS ids, count(*) AS cnt
            FROM usuarios
            GROUP BY rut
            HAVING count(*) > 1;`);

        // 3) Delete safe duplicates (no medicos or administrativos)
        console.log('Deleting safe duplicate usuarios...');
        const [delResult] = await sequelize.query(`DELETE FROM usuarios u
            USING dedup_candidates d
            WHERE u.rut = d.rut
              AND u.id <> d.ids[1]
              AND NOT EXISTS (SELECT 1 FROM medicos m WHERE m.usuario_id = u.id)
              AND NOT EXISTS (SELECT 1 FROM administrativos a WHERE a.usuario_id = u.id)
            RETURNING u.id;`);

        console.log('Deleted rows count:', delResult && delResult.length);

        // Report remaining duplicates
        const [remaining] = await sequelize.query("SELECT rut, COUNT(*) AS cnt FROM usuarios GROUP BY rut HAVING COUNT(*) > 1 ORDER BY cnt DESC LIMIT 100;");
        console.log('Remaining duplicate ruts count:', remaining.length);
        console.table(remaining.slice(0,50));

        process.exit(0);
    } catch (err) {
        console.error('Error running dedup-only:', err);
        process.exit(1);
    }
}

run();
