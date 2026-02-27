
import { TourPackage } from "../types";

const BACKEND_URL = "http://localhost:3001/api/sql";

async function executeSql(query: string, params: any[] = []) {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Database error');
  }
  return response.json();
}

export const dbService = {
  async bootstrap() {
    // Handled by the backend server on startup
  },

  async getSignatureTours(): Promise<TourPackage[]> {
    try {
      const result = await executeSql('SELECT * FROM signature_tours ORDER BY title ASC');

      return result.map((row: any) => ({
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
      console.warn("Database fetch failed", err);
      return [];
    }
  },

  async saveTour(tour: TourPackage): Promise<boolean> {
    try {
      const query = `
        INSERT INTO signature_tours (
          id, title, category, destination, dates, price, price_basis, price_advance, 
          duration, highlights, image, transport_type, 
          contact_phone, contact_email, features, terms, media_files, itinerary
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
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

      const params = [
        tour.id, tour.title, tour.category, tour.destination, tour.dates,
        tour.price, tour.priceBasis, tour.priceAdvance || null, tour.duration,
        tour.highlights, tour.image, tour.transportType,
        '7036665588', 'info@tripfux.com',
        tour.features || [], tour.terms || [], JSON.stringify(tour.mediaFiles || []),
        JSON.stringify(tour.itinerary || [])
      ];

      await executeSql(query, params);
      return true;
    } catch (err) {
      console.error("Database Save Error:", err);
      throw err;
    }
  }
};
