
import { TourPackage } from "../types";

const BASE_URL = "http://127.0.0.1:3001";
const BACKEND_SQL_URL = `${BASE_URL}/api/sql`;

async function safeJson(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  const text = await response.text();
  throw new Error(`Invalid response from server (expected JSON, got ${contentType || 'text'}): ${text.slice(0, 100)}...`);
}

async function executeSql(query: string, params: any[] = []) {
  const response = await fetch(BACKEND_SQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params })
  });
  if (!response.ok) {
    let errorMsg = 'Database error';
    try {
      const error = await safeJson(response);
      errorMsg = error.error || errorMsg;
    } catch (e) {
      errorMsg = `Server error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }
  return safeJson(response);
}

export const dbService = {
  async bootstrap() {
    // Handled by the backend server on startup
  },

  async getAdminStats() {
    try {
      const [users, associates, packages, bookings, commissions] = await Promise.all([
        executeSql("SELECT COUNT(*) FROM login_details WHERE role = 'user'"),
        executeSql("SELECT COUNT(*) FROM login_details WHERE role = 'associate'"),
        executeSql("SELECT COUNT(*) FROM packages"),
        executeSql("SELECT COUNT(*) FROM bookings"),
        executeSql("SELECT COALESCE(SUM(commission_amount), 0) as total FROM commissions WHERE status = 'pending'")
      ]);

      const [totalRevenueResult] = await Promise.all([
        executeSql("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings")
      ]);

      return {
        totalUsers: parseInt(users[0]?.count || '0', 10),
        totalAssociates: parseInt(associates[0]?.count || '0', 10),
        totalPackages: parseInt(packages[0]?.count || '0', 10),
        totalBookings: parseInt(bookings[0]?.count || '0', 10),
        totalRevenue: parseFloat(totalRevenueResult[0]?.total || '0'),
        pendingCommissions: parseFloat(commissions[0]?.total || '0'),
      };
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
      // Return defaults if tables don't exist yet or query fails
      return { totalUsers: 0, totalAssociates: 0, totalPackages: 0, totalBookings: 0, totalRevenue: 0, pendingCommissions: 0 };
    }
  },

  async getUsers() {
    return await executeSql("SELECT * FROM login_details WHERE role='user' ORDER BY created_at DESC");
  },

  async updateUserStatus(userId: number, status: string) {
    return await executeSql("UPDATE login_details SET status = $1 WHERE user_id = $2", [status, userId]);
  },

  async getAssociates() {
    return await executeSql(`
      SELECT l.*, a.parent_associate_id 
      FROM login_details l 
      LEFT JOIN associate_hierarchy a ON l.user_id = a.associate_id 
      WHERE l.role='associate' 
      ORDER BY l.created_at DESC
    `);
  },

  async updateAssociateStatus(userId: number, status: string) {
    return await executeSql("UPDATE login_details SET status = $1 WHERE user_id = $2", [status, userId]);
  },

  async updateAssociateKyc(userId: number, kycStatus: string) {
    return await executeSql("UPDATE login_details SET kyc_status = $1 WHERE user_id = $2", [kycStatus, userId]);
  },

  async getPackagesAdmin() {
    return await executeSql("SELECT * FROM packages ORDER BY created_at DESC");
  },

  async createPackageAdmin(pkg: any) {
    return await executeSql(
      "INSERT INTO packages (name, destination, duration, price, description, category, image, status, itinerary, location, track) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        pkg.name, pkg.destination, pkg.duration, pkg.price, pkg.description,
        pkg.category, pkg.image, pkg.status || 'active',
        JSON.stringify(pkg.itinerary || []),
        pkg.location || '',
        pkg.track || ''
      ]
    );
  },

  async updatePackageAdmin(pkg: any) {
    return await executeSql(
      "UPDATE packages SET name=$1, destination=$2, duration=$3, price=$4, description=$5, category=$6, image=$7, status=$8, itinerary=$9, location=$10, track=$11 WHERE package_id=$12",
      [
        pkg.name, pkg.destination, pkg.duration, pkg.price, pkg.description,
        pkg.category, pkg.image, pkg.status,
        JSON.stringify(pkg.itinerary || []),
        pkg.location || '',
        pkg.track || '',
        pkg.package_id
      ]
    );
  },

  async deletePackageAdmin(id: number) {
    return await executeSql("DELETE FROM packages WHERE package_id=$1", [id]);
  },

  async updatePackageStatus(id: number, status: string) {
    return await executeSql("UPDATE packages SET status=$1 WHERE package_id=$2", [status, id]);
  },

  async getBookingsAdmin() {
    return await executeSql(`
      SELECT b.*, u.first_name as user_first_name, u.last_name as user_last_name, 
             a.first_name as assoc_first_name, a.last_name as assoc_last_name, 
             p.name as package_name
      FROM bookings b
      LEFT JOIN login_details u ON b.user_id = u.user_id
      LEFT JOIN login_details a ON b.associate_id = a.user_id
      LEFT JOIN packages p ON b.package_id = p.package_id
      ORDER BY b.created_at DESC
    `);
  },

  async updateBookingStatus(bookingId: number, status: string) {
    return await executeSql("UPDATE bookings SET status=$1 WHERE booking_id=$2", [status, bookingId]);
  },

  async getCommissionsAdmin() {
    return await executeSql("SELECT * FROM commissions ORDER BY created_at DESC");
  },

  async updateCommissionStatus(commissionId: number, status: string) {
    return await executeSql("UPDATE commissions SET status=$1 WHERE commission_id=$2", [status, commissionId]);
  },

  async getPayoutsAdmin() {
    return await executeSql("SELECT * FROM payouts ORDER BY created_at DESC");
  },

  async createPayoutAdmin(payout: any) {
    return await executeSql(
      "INSERT INTO payouts (associate_id, amount, payment_mode, transaction_reference, status, paid_at) VALUES ($1, $2, $3, $4, $5, NOW())",
      [payout.associate_id, payout.amount, payout.payment_mode, payout.transaction_reference, payout.status || 'paid']
    );
  },

  async getPromoCodesAdmin() {
    return await executeSql("SELECT * FROM promo_codes ORDER BY created_at DESC");
  },

  async getRefundsAdmin() {
    return await executeSql("SELECT * FROM refunds ORDER BY created_at DESC");
  },

  async updateRefundStatus(refundId: number, status: string) {
    return await executeSql("UPDATE refunds SET status=$1 WHERE refund_id=$2", [status, refundId]);
  },

  async getCommissionLevelsAdmin() {
    return await executeSql("SELECT * FROM commission_levels ORDER BY level ASC");
  },

  async createCommissionLevelAdmin(data: { level: number; percentage: number }) {
    return await executeSql("INSERT INTO commission_levels (level, percentage) VALUES ($1, $2)", [data.level, data.percentage]);
  },

  async updateCommissionLevelAdmin(data: { level: number; percentage: number }) {
    return await executeSql("UPDATE commission_levels SET percentage = $1 WHERE level = $2", [data.percentage, data.level]);
  },

  async deleteCommissionLevelAdmin(level: number) {
    return await executeSql("DELETE FROM commission_levels WHERE level = $1", [level]);
  },


  async resolveUserIdByEmail(email: string): Promise<number | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/users/by-email/${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        return data.user_id || null;
      }
    } catch (e) {
      console.warn('Could not resolve user ID by email:', e);
    }
    return null;
  },

  async createBooking(data: {
    userId: string | number;
    userEmail?: string;
    packageId: string | number;
    travelDate: string;
    totalAmount: string | number;
    promoCode?: string;
    associateId?: string | number;
    passengers?: Array<{ name: string; age: number; gender: string; id_proof?: string | null }>;
  }) {
    const response = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMsg = 'Failed to create booking';
      try {
        const error = await safeJson(response);
        errorMsg = error.error || errorMsg;
      } catch (e) {
        errorMsg = `Booking failed (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }
    return await safeJson(response);
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
  },

  async getPackages(): Promise<TourPackage[]> {
    try {
      const query = `
        SELECT 
          package_id as db_id, 
          name as title, 
          category, 
          destination, 
          duration, 
          price, 
          description, 
          dates, 
          price_basis, 
          price_advance, 
          highlights, 
          image, 
          transport_type, 
          contact_phone, 
          contact_email, 
          features, 
          terms, 
          media_files, 
          itinerary, 
          custom_id,
          location,
          track
        FROM packages 
        WHERE status = 'active'
        ORDER BY package_id DESC
      `;
      const rows = await executeSql(query);

      return rows.map((row: any) => ({
        ...row,
        id: row.custom_id || row.db_id.toString(),
        price: typeof row.price === 'number' ? `₹${row.price.toLocaleString('en-IN')}` : row.price,
        highlights: row.highlights || [],
        features: row.features || [],
        terms: row.terms || [],
        mediaFiles: row.media_files || [],
        itinerary: row.itinerary || []
      }));
    } catch (err) {
      console.warn("SQL fetch failed, returning empty list", err);
      return [];
    }
  }
};
