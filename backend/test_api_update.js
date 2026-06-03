import { pool } from './src/config/db.js';
async function test() {
    const escRes = await pool.query('SELECT * FROM configuraciones_escritorio LIMIT 1');
    if (escRes.rows.length === 0) { console.log('no rows'); return; }
    const row = escRes.rows[0];
    console.log('API test before:', row.es_mantenimiento);
    
    // Simulate req.body
    const reqBody = {
        es_mantenimiento: !row.es_mantenimiento
    };
    
    const updateRes = await pool.query(`
        UPDATE configuraciones_escritorio SET
            sincronizacion_automatica = COALESCE($1, sincronizacion_automatica),
            frecuencia_sincronizacion_min = COALESCE($2, frecuencia_sincronizacion_min),
            modo_offline_permitido = COALESCE($3, modo_offline_permitido),
            iniciar_con_windows = COALESCE($4, iniciar_con_windows),
            metodos_autenticacion = COALESCE($5, metodos_autenticacion),
            es_activo = COALESCE($6, es_activo),
            prioridad_biometrico = COALESCE($8, prioridad_biometrico),
            es_mantenimiento = COALESCE($9, es_mantenimiento),
            actualizado_en = CURRENT_TIMESTAMP
        WHERE escritorio_id = $7
        RETURNING *
    `, [
        reqBody.sincronizacion_automatica, reqBody.frecuencia_sincronizacion_min, reqBody.modo_offline_permitido,
        reqBody.iniciar_con_windows, null, reqBody.es_activo, row.escritorio_id, null, reqBody.es_mantenimiento
    ]);
    
    console.log('API test after:', updateRes.rows[0].es_mantenimiento);
    process.exit(0);
}
test();
