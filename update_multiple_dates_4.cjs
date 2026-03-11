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
    { name: 'Srinagar Kashmir Flight Package', date: '2026-04-25' },
    { name: 'Srinagar Kashmir Flight Package', date: '2026-05-03' },
    { name: 'Srinagar Kashmir Flight Package', date: '2026-06-04' },
    { name: 'Srinagar Kashmir Flight Package', date: '2026-07-28' },
    { name: 'Srinagar Kashmir Flight Package', date: '2026-08-25' },
    { name: 'Srinagar Kashmir Flight Package', date: '2026-09-24' },
    { name: 'Srinagar Kashmir Flight Package', date: '2026-10-11' },
    { name: 'Srinagar Kashmir Flight Package', date: '2026-11-20' },

    { name: 'Kashmir Package', date: '2026-04-25' },
    { name: 'Kashmir Package', date: '2026-05-03' },
    { name: 'Kashmir Package', date: '2026-06-04' },
    { name: 'Kashmir Package', date: '2026-07-28' },
    { name: 'Kashmir Package', date: '2026-08-28' },
    { name: 'Kashmir Package', date: '2026-09-25' },
    { name: 'Kashmir Package', date: '2026-10-13' },
    { name: 'Kashmir Package', date: '2026-11-25' },

    { name: 'Gangtok Darjeeling Special Package', date: '2026-04-25' },
    { name: 'Gangtok Darjeeling Special Package', date: '2026-05-04' },
    { name: 'Gangtok Darjeeling Special Package', date: '2026-07-25' },
    { name: 'Gangtok Darjeeling Special Package', date: '2026-08-23' },
    { name: 'Gangtok Darjeeling Special Package', date: '2026-09-22' },
    { name: 'Gangtok Darjeeling Special Package', date: '2026-11-22' },

    { name: 'Guwahati Special Package', date: '2026-04-25' },
    { name: 'Guwahati Special Package', date: '2026-05-04' },
    { name: 'Guwahati Special Package', date: '2026-06-25' },
    { name: 'Guwahati Special Package', date: '2026-07-25' },
    { name: 'Guwahati Special Package', date: '2026-08-23' },
    { name: 'Guwahati Special Package', date: '2026-09-22' },
    { name: 'Guwahati Special Package', date: '2026-10-23' },
    { name: 'Guwahati Special Package', date: '2026-11-25' },

    { name: 'Shimla Manali Special Package', date: '2026-04-25' },
    { name: 'Shimla Manali Special Package', date: '2026-05-04' },
    { name: 'Shimla Manali Special Package', date: '2026-06-25' },
    { name: 'Shimla Manali Special Package', date: '2026-07-25' },
    { name: 'Shimla Manali Special Package', date: '2026-08-25' },
    { name: 'Shimla Manali Special Package', date: '2026-09-22' },
    { name: 'Shimla Manali Special Package', date: '2026-10-12' },
    { name: 'Shimla Manali Special Package', date: '2026-11-20' },
    { name: 'Shimla Manali Special Package', date: '2026-12-15' },

    { name: 'Tamil Nadu Special Package', date: '2026-03-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-04-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-05-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-06-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-07-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-08-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-09-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-10-27' },
    { name: 'Tamil Nadu Special Package', date: '2026-11-28' },
    { name: 'Tamil Nadu Special Package', date: '2026-12-15' },

    { name: 'Andaman Special Package', date: '2026-01-28' },
    { name: 'Andaman Special Package', date: '2026-02-28' },
    { name: 'Andaman Special Package', date: '2026-03-28' },
    { name: 'Andaman Special Package', date: '2026-04-28' },
    { name: 'Andaman Special Package', date: '2026-05-28' },
    { name: 'Andaman Special Package', date: '2026-06-28' },
    { name: 'Andaman Special Package', date: '2026-07-28' },
    { name: 'Andaman Special Package', date: '2026-08-28' },
    { name: 'Andaman Special Package', date: '2026-09-28' },
    { name: 'Andaman Special Package', date: '2026-10-28' },
    { name: 'Andaman Special Package', date: '2026-11-28' },
    { name: 'Andaman Special Package', date: '2026-12-10' },

    { name: 'Goa Special Package', date: '2026-01-10' },
    { name: 'Goa Special Package', date: '2026-02-10' },
    { name: 'Goa Special Package', date: '2026-03-10' },
    { name: 'Goa Special Package', date: '2026-04-10' },
    { name: 'Goa Special Package', date: '2026-05-10' },
    { name: 'Goa Special Package', date: '2026-06-10' },
    { name: 'Goa Special Package', date: '2026-07-10' },
    { name: 'Goa Special Package', date: '2026-08-09' },
    { name: 'Goa Special Package', date: '2026-09-09' },
    { name: 'Goa Special Package', date: '2026-10-12' },
    { name: 'Goa Special Package', date: '2026-11-10' },
    { name: 'Goa Special Package', date: '2026-12-10' },

    { name: 'Kolkata Ganga Sagar Package', date: '2026-04-25' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-05-03' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-06-04' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-07-15' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-08-16' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-09-12' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-10-12' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-11-10' },
    { name: 'Kolkata Ganga Sagar Package', date: '2026-12-04' }
];

// Group dates by package
const groupedUpdates = {};
rawUpdates.forEach(u => {
    if (!groupedUpdates[u.name]) groupedUpdates[u.name] = new Set();
    groupedUpdates[u.name].add(u.date);
});

// Convert sets to arrays
for (const key in groupedUpdates) {
    groupedUpdates[key] = Array.from(groupedUpdates[key]).sort();
}

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

            for (const [key, dates] of Object.entries(groupedUpdates)) {
                const normUp = normalize(key);
                if (normDb === normUp) {
                    bestMatchDates = dates;
                    break;
                }
                if (normDb.includes(normUp) || normUp.includes(normDb)) {
                    if (normUp.length > maxLen) {
                        maxLen = normUp.length;
                        bestMatchDates = dates;
                    }
                }
            }

            // Hardcoded explicit mappings
            if (pkg.name === 'KASHMIR SPECIAL PACKAGE') {
                const allKashmirDates = new Set([
                    ...(groupedUpdates['Srinagar Kashmir Flight Package'] || []),
                    ...(groupedUpdates['Kashmir Package'] || [])
                ]);
                bestMatchDates = Array.from(allKashmirDates).sort();
            }

            if (bestMatchDates && bestMatchDates.length > 0) {
                // Merge with existing dates if TAMIL NADU SPECIAL PACKAGE to not overwrite previous script's dates, or just overwrite since we have a new set.
                // Wait, the prompt says "UPDATE packages SET dates=..." which implies overwriting or setting. 
                // Since Tamil Nadu Special Flight Package was handled earlier but now we have Tamil Nadu Special Package, let's union them if we already have dates.
                // For simplicity and since these are the *new* dates from the schedule, we will overwrite or combine them.

                const datesStr = bestMatchDates.join(', ');

                if (pkg.name === 'TAMIL NADU SPECIAL PACKAGE') {
                    // Fetch existing dates
                    const existingRes = await pool.query("SELECT dates FROM packages WHERE package_id=$1", [pkg.package_id]);
                    const existingDatesStr = existingRes.rows[0].dates || "";
                    const existingDatesArray = existingDatesStr ? existingDatesStr.split(',').map(d => d.trim()) : [];
                    const finalDates = Array.from(new Set([...existingDatesArray, ...bestMatchDates])).sort().join(', ');

                    await pool.query(
                        "UPDATE packages SET dates=$1 WHERE package_id=$2",
                        [finalDates, pkg.package_id]
                    );
                    console.log(`Updated '${pkg.name}' -> dates: ${finalDates}`);
                    updatedCount++;
                } else {
                    await pool.query(
                        "UPDATE packages SET dates=$1 WHERE package_id=$2",
                        [datesStr, pkg.package_id]
                    );
                    console.log(`Updated '${pkg.name}' -> dates: ${datesStr}`);
                    updatedCount++;
                }
            }
        }
        console.log(`Successfully updated ${updatedCount} packages.`);
    } catch (err) {
        console.error('Error updating multiple dates:', err);
    } finally {
        await pool.end();
    }
}

runDateUpdates();
