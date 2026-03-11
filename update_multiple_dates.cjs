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
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-01-20' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-03-22' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-04-25' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-05-10' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-06-05' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-07-25' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-08-24' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-09-26' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-10-16' },
    { name: 'Naimisharanyam Kashi Special Package', date: '2026-12-10' },

    { name: 'Kashi Prayagraj Gaya Package', date: '2026-01-20' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-03-22' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-04-25' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-05-10' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-06-05' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-07-27' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-08-26' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-09-28' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-10-18' },
    { name: 'Kashi Prayagraj Gaya Package', date: '2026-12-10' },

    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-01-19' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-02-03' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-03-21' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-04-24' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-05-09' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-06-04' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-07-24' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-08-23' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-09-25' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-10-17' },
    { name: 'Naimisharanyam Ayodhya Kashi Gaya Package', date: '2026-12-10' },

    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-01-25' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-03-25' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-04-25' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-05-15' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-06-25' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-07-25' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-08-23' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-09-22' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-10-15' },
    { name: 'Gujarat Madhya Pradesh Flight Package', date: '2026-12-15' },

    { name: 'Tamilnadu Special Flight Package', date: '2026-01-25' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-03-20' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-04-25' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-05-10' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-06-26' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-07-25' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-08-23' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-09-22' },
    { name: 'Tamilnadu Special Flight Package', date: '2026-12-14' }
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
                if (normDb.includes(normUp) || normUp.includes(normDb)) {
                    if (normUp.length > maxLen) {
                        maxLen = normUp.length;
                        bestMatchDates = dates;
                        matchedKey = key;
                    }
                }
            }

            // Hardcoded implicit matches like we did previously
            if (pkg.name === 'NAIMISARANYAM KASHI-GAYA SPECIAL') {
                bestMatchDates = groupedUpdates['Naimisharanyam Ayodhya Kashi Gaya Package'];
                matchedKey = 'Naimisharanyam Ayodhya Kashi Gaya Package (Hardcoded)';
            }
            if (pkg.name === 'KASHI SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Naimisharanyam Kashi Special Package'];
                matchedKey = 'Naimisharanyam Kashi Special Package (Hardcoded)';
            }
            if (pkg.name === 'KASHI-ALLAHABAD SPECIAL') {
                bestMatchDates = groupedUpdates['Kashi Prayagraj Gaya Package'];
                matchedKey = 'Kashi Prayagraj Gaya Package (Hardcoded)';
            }
            if (pkg.name === 'TAMIL NADU SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Tamilnadu Special Flight Package'];
                matchedKey = 'Tamilnadu Special Flight Package (Hardcoded)';
            }

            if (bestMatchDates) {
                const datesStr = bestMatchDates.join(', '); // Comma separated string of dates
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
