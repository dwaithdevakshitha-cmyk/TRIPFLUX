const { Pool } = require('pg');
const logger = require('../services/logger.cjs');

const devConfig = {
    host: '192.168.29.143',
    database: 'tripfluxdev',
    user: 'postgres',
    password: 'admin123',
    port: 5432,
};

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
};

async function migrateTable(devPool, prodPool, tableName, primaryKey) {
    logger.info(`--- Migrating table: ${tableName} ---`);
    try {
        // Get target column types
        const { rows: prodColsRes } = await prodPool.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [tableName]);

        const prodColMeta = {};
        prodColsRes.forEach(r => {
            prodColMeta[r.column_name] = { type: r.data_type, udt: r.udt_name };
        });

        const { rows } = await devPool.query(`SELECT * FROM ${tableName}`);
        logger.info(`Fetched ${rows.length} rows from development.`);

        if (rows.length === 0) {
            logger.info(`No rows to migrate for ${tableName}.`);
            return 0;
        }

        const sourceColumns = Object.keys(rows[0]);
        // Only use columns that exist in BOTH dev and prod
        const columnsToInsert = sourceColumns.filter(col => prodColMeta[col]);

        if (columnsToInsert.length === 0) {
            logger.info(`No matching columns for ${tableName}.`);
            return 0;
        }

        const columnList = columnsToInsert.join(', ');
        const placeholders = columnsToInsert.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO ${tableName} (${columnList})
            VALUES (${placeholders})
            ON CONFLICT (${primaryKey}) DO NOTHING
        `;

        let migratedCount = 0;
        for (const row of rows) {
            try {
                const values = columnsToInsert.map(col => {
                    const val = row[col];
                    const meta = prodColMeta[col];

                    if (val === null) return null;

                    // If target is an ARRAY of text (_text) but source is JSON/Array
                    if (meta.udt === '_text' && Array.isArray(val)) {
                        // Postgres array literal: {"val1", "val2"}
                        // Escape quotes and wrap in {}
                        const escaped = val.map(v => `"${v.toString().replace(/"/g, '\\"')}"`).join(',');
                        return `{${escaped}}`;
                    }

                    // Otherwise if it's an object/array and target is json/jsonb
                    if (typeof val === 'object') {
                        return JSON.stringify(val);
                    }
                    return val;
                });
                const res = await prodPool.query(query, values);
                if (res.rowCount > 0) {
                    migratedCount++;
                }
            } catch (rowErr) {
                logger.error(`Skipping row in ${tableName} due to error: ${rowErr.message}`);
            }
        }

        logger.info(`Successfully migrated ${migratedCount} new rows to production.`);
        return migratedCount;
    } catch (err) {
        logger.error(`Error migrating table ${tableName}:`, err);
        throw err;
    }
}

async function runMigration() {
    const devPool = new Pool(devConfig);
    const prodPool = new Pool(prodConfig);

    try {
        // Table names and their primary keys for ON CONFLICT
        const tables = [
            { name: 'commission_levels', pk: 'level' },
            { name: 'rank_levels', pk: 'rank_id' },
            { name: 'packages', pk: 'package_id' },
            { name: 'package_itinerary', pk: 'itinerary_id' }
        ];

        for (const table of tables) {
            await migrateTable(devPool, prodPool, table.name, table.pk);
        }

        logger.info('--- Verification ---');
        for (const table of tables) {
            const { rows } = await prodPool.query(`SELECT COUNT(*) FROM ${table.name}`);
            logger.info(`Total rows in production ${table.name}: ${rows[0].count}`);
        }

        logger.info('Migration completed successfully.');
    } catch (err) {
        logger.error('Migration failed:', err);
    } finally {
        await devPool.end();
        await prodPool.end();
    }
}

runMigration();
