
import { neon } from '@neondatabase/serverless';
import { TourPackage } from "../types";

const NEON_CONNECTION_STRING = "postgresql://neondb_owner:npg_vpWmaQ6h1OPZ@ep-twilight-morning-aimcmzz8-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(NEON_CONNECTION_STRING);

export const dbService = {
  async bootstrap() {
    try {
      // Create base table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS signature_tours (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          destination TEXT NOT NULL,
          dates TEXT NOT NULL,
          price TEXT NOT NULL,
          duration TEXT NOT NULL
        )
      `;

      const columns = [
        { name: 'category', type: "TEXT DEFAULT 'Domestic'" },
        { name: 'price_basis', type: "TEXT DEFAULT 'Per Person'" },
        { name: 'price_advance', type: "TEXT" },
        { name: 'highlights', type: "TEXT[]" },
        { name: 'image', type: "TEXT" },
        { name: 'transport_type', type: "TEXT" },
        { name: 'contact_phone', type: "TEXT" },
        { name: 'contact_email', type: "TEXT" },
        { name: 'features', type: "TEXT[]" },
        { name: 'terms', type: "TEXT[]" },
        { name: 'media_files', type: "JSONB DEFAULT '[]'" },
        { name: 'itinerary', type: "JSONB DEFAULT '[]'" }
      ];

      for (const col of columns) {
        try {
          await sql.raw(`ALTER TABLE signature_tours ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        } catch (e) {
          try {
             await sql.raw(`ALTER TABLE signature_tours ADD COLUMN ${col.name} ${col.type}`);
          } catch (inner) {}
        }
      }
    } catch (err) {
      console.error("Neon Bootstrap Error:", err);
    }
  },

  async getSignatureTours(): Promise<TourPackage[]> {
    try {
      await this.bootstrap();
      const result = await sql`SELECT * FROM signature_tours ORDER BY title ASC`;
      
      return result.map(row => ({
        id: row.id,
        title: row.title,
        category: row.category as any,
        destination: row.destination,
        dates: row.dates,
        price: row.price,
        priceBasis: row.price_basis as any,
        priceAdvance: row.price_advance,
        duration: row.duration,
        highlights: row.highlights || [],
        image: row.image,
        transportType: row.transport_type,
        contactPhone: row.contact_phone || '7036665588',
        contactEmail: row.contact_email || 'info@tripfux.com',
        features: row.features || [],
        terms: row.terms || [],
        mediaFiles: row.media_files || [],
        itinerary: row.itinerary || []
      }));
    } catch (err) {
      console.warn("Neon fetch failed", err);
      return [];
    }
  },

  async saveTour(tour: TourPackage): Promise<boolean> {
    try {
      await this.bootstrap();
      await sql`
        INSERT INTO signature_tours (
          id, title, category, destination, dates, price, price_basis, price_advance, 
          duration, highlights, image, transport_type, 
          contact_phone, contact_email, features, terms, media_files, itinerary
        ) VALUES (
          ${tour.id}, ${tour.title}, ${tour.category}, ${tour.destination}, ${tour.dates}, 
          ${tour.price}, ${tour.priceBasis}, ${tour.priceAdvance || null}, ${tour.duration}, 
          ${tour.highlights}, ${tour.image}, ${tour.transportType}, 
          ${'7036665588'}, ${'info@tripfux.com'}, 
          ${tour.features || []}, ${tour.terms || []}, ${JSON.stringify(tour.mediaFiles || [])},
          ${JSON.stringify(tour.itinerary || [])}
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          destination = EXCLUDED.destination,
          dates = EXCLUDED.dates,
          price = EXCLUDED.price,
          price_basis = EXCLUDED.price_basis,
          duration = EXCLUDED.duration,
          itinerary = EXCLUDED.itinerary,
          image = EXCLUDED.image,
          features = EXCLUDED.features
      `;
      return true;
    } catch (err) {
      console.error("Neon Save Error:", err);
      throw err;
    }
  }
};
