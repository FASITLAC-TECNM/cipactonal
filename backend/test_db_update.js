import { pool } from './src/config/db.js';
async function test() {
    const escRes = await pool.query('SELECT * FROM configuraciones_escritorio LIMIT 1');
    if (escRes.rows.length === 0) { console.log('no rows'); return; }
    const row = escRes.rows[0];
    console.log('before:', row.es_mantenimiento);
    
    // Update to opposite
    const newVal = !row.es_mantenimiento;
    const updateRes = await pool.query(`
        UPDATE configuraciones_escritorio SET
            es_mantenimiento = COALESCE($1, es_mantenimiento)
        WHERE id = $2
        RETURNING es_mantenimiento
    `, [newVal, row.id]);
    
    console.log('after:', updateRes.rows[0].es_mantenimiento);
    process.exit(0);
}
test();
