const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const rawUpdates = [
    { name: 'Maharastra Special Bus Package', date: '2026-03-25' },
    { name: 'Maharastra Special Bus Package', date: '2026-04-20' },
    { name: 'Maharastra Special Bus Package', date: '2026-05-25' },
    { name: 'Maharastra Special Bus Package', date: '2026-06-22' },
    { name: 'Maharastra Special Bus Package', date: '2026-07-24' },
    { name: 'Maharastra Special Bus Package', date: '2026-09-22' },
    { name: 'Maharastra Special Bus Package', date: '2026-12-09' },

    { name: 'Maharastra Jyothirlinga Special Package', date: '2026-03-25' },
    { name: 'Maharastra Jyothirlinga Special Package', date: '2026-04-20' },
    { name: 'Maharastra Jyothirlinga Special Package', date: '2026-05-25' },
    { name: 'Maharastra Jyothirlinga Special Package', date: '2026-06-22' },
    { name: 'Maharastra Jyothirlinga Special Package', date: '2026-07-24' },
    { name: 'Maharastra Jyothirlinga Special Package', date: '2026-09-22' },
    { name: 'Maharastra Jyothirlinga Special Package', date: '2026-11-16' },

    { name: 'Karnataka Flight Package', date: '2026-01-19' },
    { name: 'Karnataka Flight Package', date: '2026-04-25' },
    { name: 'Karnataka Flight Package', date: '2026-05-20' },
    { name: 'Karnataka Flight Package', date: '2026-06-25' },
    { name: 'Karnataka Flight Package', date: '2026-07-25' },
    { name: 'Karnataka Flight Package', date: '2026-08-23' },
    { name: 'Karnataka Flight Package', date: '2026-09-22' },
    { name: 'Karnataka Flight Package', date: '2026-10-22' },
    { name: 'Karnataka Flight Package', date: '2026-12-10' },

    { name: 'Muktinath Flight Package', date: '2026-03-25' },
    { name: 'Muktinath Flight Package', date: '2026-04-26' },
    { name: 'Muktinath Flight Package', date: '2026-05-25' },
    { name: 'Muktinath Flight Package', date: '2026-06-25' },
    { name: 'Muktinath Flight Package', date: '2026-07-20' },
    { name: 'Muktinath Flight Package', date: '2026-09-22' },
    { name: 'Muktinath Flight Package', date: '2026-10-23' },
    { name: 'Muktinath Flight Package', date: '2026-11-25' },

    { name: 'Chardham Flight Package', date: '2026-04-20' },
    { name: 'Chardham Flight Package', date: '2026-09-01' },
    { name: 'Chardham Flight Package', date: '2026-09-18' },
    { name: 'Chardham Flight Package', date: '2026-09-24' },
    { name: 'Chardham Flight Package', date: '2026-10-02' },
    { name: 'Chardham Flight Package', date: '2026-10-08' },
    { name: 'Chardham Flight Package', date: '2026-10-24' },

    { name: 'Do Dham Package', date: '2026-04-25' },
    { name: 'Do Dham Package', date: '2026-05-05' },
    { name: 'Do Dham Package', date: '2026-05-15' },
    { name: 'Do Dham Package', date: '2026-05-25' },
    { name: 'Do Dham Package', date: '2026-09-01' },
    { name: 'Do Dham Package', date: '2026-09-17' },
    { name: 'Do Dham Package', date: '2026-09-27' },
    { name: 'Do Dham Package', date: '2026-10-07' },
    { name: 'Do Dham Package', date: '2026-10-11' },
    { name: 'Do Dham Package', date: '2026-10-23' }
];

// Group dates by package
const groupedUpdates = {};
rawUpdates.forEach(u => {
    if (!groupedUpdates[u.name]) groupedUpdates[u.name] = [];
    groupedUpdates[u.name].push(u.date);
});

function normalize(name) {
    return name.toLowerCase()
        .replace(/package|special|flight|bus|regular|tour|yatra|spl/g, '')
        .replace(/[^a-z0-9]/g, '');
}

async function runDateUpdates() {
    try {
        const res = await pool.query("SELECT package_id, name FROM packages");
        const dbPackages = res.rows;
        let updatedCount = 0;

        for (const pkg of dbPackages) {
            const normDb = normalize(pkg.name);

            let bestMatchDates = null;
            let maxLen = 0;
            let matchedKey = null;

            for (const [key, dates] of Object.entries(groupedUpdates)) {
                const normUp = normalize(key);
                if (normDb === normUp) {
                    bestMatchDates = dates;
                    matchedKey = key;
                    break;
                }
                if (normDb.includes(normUp) || normUp.includes(normDb)) {
                    if (normUp.length > maxLen) {
                        maxLen = normUp.length;
                        bestMatchDates = dates;
                        matchedKey = key;
                    }
                }
            }

            // Hardcoded explicit mappings
            if (pkg.name === 'MAHARASHTRA SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Maharastra Jyothirlinga Special Package'] || groupedUpdates['Maharastra Special Bus Package'];
                matchedKey = 'Maharastra Special Bus Package (Hardcoded)';
            }
            if (pkg.name === 'CHARDHAM SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Chardham Flight Package'];
                matchedKey = 'Chardham Flight Package (Hardcoded)';
            }
            if (pkg.name === 'DODHAM SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Do Dham Package'];
                matchedKey = 'Do Dham Package (Hardcoded)';
            }
            if (pkg.name === 'KARNATAKA SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Karnataka Flight Package'];
                matchedKey = 'Karnataka Flight Package (Hardcoded)';
            }
            if (pkg.name === 'MUKTHINATH SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Muktinath Flight Package'];
                matchedKey = 'Muktinath Flight Package (Hardcoded)';
            }


            if (bestMatchDates) {
                const datesStr = bestMatchDates.join(', ');
                await pool.query(
                    "UPDATE packages SET dates=$1 WHERE package_id=$2",
                    [datesStr, pkg.package_id]
                );
                console.log(`Updated '${pkg.name}' -> dates: ${datesStr}`);
                updatedCount++;
            }
        }
        console.log(`Successfully updated ${updatedCount} packages. Note: Not all packages were provided in the prompt.`);
    } catch (err) {
        console.error('Error updating multiple dates:', err);
    } finally {
        await pool.end();
    }
}

runDateUpdates();
