const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/certs/global-bundle.pem').toString(),
  },
});

// Extracted from App.tsx
const DEFAULT_TOURS = [
  {
    id: 'intl-1',
    title: 'EUROPE SPL',
    category: 'International',
    destination: 'Europe',
    price: '₹1,45,000',
    priceBasis: 'Per Person',
    duration: '14 Nights - 15 Days',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Paris Sightseeing', 'Disneyland Exhibit', 'Brussels Discovery', 'Amsterdam Canal Cruise', 'Swiss Alps Excursion'],
    features: ['Premium Accommodation', 'Inter-city Coach Transfers', 'Sightseeing as per Itinerary', 'Indian Packed Dinner'],
    itinerary: [
      { day: 1, title: 'Flight to Paris & City Tour', activities: [{ time: 'Morning', activity: 'Arrival Paris', description: 'After immigration, start Paris city tour' }, { time: 'Afternoon', activity: 'Paris City Tour', description: '2 Hour guided city tour' }, { time: 'Evening', activity: 'Hotel Check-in', description: '05.00pm check in and rest' }, { time: 'Dinner', activity: 'Packed Dinner', description: 'Included' }] },
      { day: 2, title: 'Eiffel Tower & Seine Cruise', activities: [{ time: 'Breakfast', activity: 'Hotel Breakfast' }, { time: 'Morning', activity: 'Eiffel Tower visit' }, { time: 'Afternoon', activity: 'Seine River Cruise' }] },
      { day: 3, title: 'Disneyland Adventure', activities: [{ time: 'Full Day', activity: 'DisneyLand Visit' }] }
    ]
  },
  {
    id: 'intl-2',
    title: 'BALI SPECIAL TOUR',
    category: 'International',
    destination: 'Bali',
    price: '₹55,000',
    priceBasis: 'Per Person',
    duration: '4 Nights - 5 Days',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    dates: '2025 Flexible',
    highlights: ['Pirates Dinner Cruise', 'Kintamani Volcano', 'Tanah Lot Sunset', 'Ubud Village Market', 'Tanjung Benoa Beach'],
    features: ['4* Hotel Accommodation', 'Kintamani Volcano Tour', 'Uluwatu & Ubud Temple Tour'],
    itinerary: [
      { day: 1, title: 'Arrival & Pirates Dinner Cruise', activities: [{ time: 'Evening', activity: 'Pirates Dinner Cruise' }] },
      { day: 2, title: 'Kintamani & Ubud Culture', activities: [{ time: 'Morning', activity: 'Kintamani Volcano' }] }
    ]
  }
];

async function migrate() {
  try {
    console.log('Starting migration...');
    
    for (const pkg of DEFAULT_TOURS) {
      const cleanPrice = parseFloat(pkg.price.replace(/[^0-9]/g, ''));
      
      const res = await pool.query(
        `INSERT INTO packages (name, category, destination, duration, price, price_basis, image, dates, highlights, features, status, itinerary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11)
         RETURNING package_id`,
        [pkg.title, pkg.category, pkg.destination, pkg.duration, cleanPrice, pkg.priceBasis, pkg.image, pkg.dates, pkg.highlights, pkg.features, JSON.stringify(pkg.itinerary)]
      );
      
      const pkgId = res.rows[0].package_id;
      console.log(`Migrated: ${pkg.title} (ID: ${pkgId})`);
      
      for (const item of pkg.itinerary) {
        await pool.query(
          `INSERT INTO package_itinerary (package_id, day_number, title, activities)
           VALUES ($1, $2, $3, $4)`,
          [pkgId, item.day, item.title, JSON.stringify(item.activities)]
        );
      }
    }
    
    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
