const { Client } = require('pg');

async function scanAllDBs() {
    const mainClient = new Client({
        user: 'postgres',
        password: 'admin123',
        host: '192.168.29.143',
        port: 5432
    });

    try {
        await mainClient.connect();
        const dbsRes = await mainClient.query("SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres'");

        for (const dbRow of dbsRes.rows) {
            const dbName = dbRow.datname;
            console.log(`Scanning DB: ${dbName}`);

            const dbClient = new Client({
                user: 'postgres',
                password: 'admin123',
                host: '192.168.29.143',
                database: dbName,
                port: 5432
            });

            try {
                await dbClient.connect();
                const tablesRes = await dbClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");

                for (const tableRow of tablesRes.rows) {
                    const tableName = tableRow.table_name;
                    // Check for any column that might contain descriptions
                    const colsRes = await dbClient.query(`
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = '${tableName}' 
                        AND (column_name LIKE '%description%' OR column_name LIKE '%desc%')
                    `);

                    if (colsRes.rows.length > 0) {
                        for (const col of colsRes.rows) {
                            const colName = col.column_name;
                            try {
                                const dataRes = await dbClient.query(`SELECT COUNT(*) FROM ${tableName} WHERE ${colName} IS NOT NULL AND ${colName}::text != ''`);
                                if (parseInt(dataRes.rows[0].count) > 0) {
                                    console.log(`  [MATCH] Table: ${tableName}, Column: ${colName}, Count: ${dataRes.rows[0].count}`);
                                    if (tableName === 'packages' || tableName === 'signature_tours') {
                                        const samples = await dbClient.query(`SELECT name, ${colName}::text as val FROM ${tableName} WHERE ${colName} IS NOT NULL AND ${colName}::text != '' LIMIT 1`);
                                        console.log(`    Sample from ${tableName}.${colName}: ${samples.rows[0].val.substring(0, 100)}...`);
                                    }
                                }
                            } catch (err) { }
                        }
                    }
                }
                await dbClient.end();
            } catch (err) {
                console.log(`  Error connecting to ${dbName}: ${err.message}`);
            }
        }
        await mainClient.end();
    } catch (err) {
        console.error('Main Client Error:', err.message);
    }
}

scanAllDBs();
