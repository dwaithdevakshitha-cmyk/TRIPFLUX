
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    description: string;
    location?: string;
    image?: string;
  }[];
}

export interface TravelPlan {
  destination: string;
  duration: string;
  vibe: string;
  itinerary: ItineraryDay[];
  estimatedBudget: string;
  tips: string[];
}

export interface MediaFile {
  id: string;
  fileName: string;
  fileType: 'IMAGE' | 'PDF' | 'DOC' | 'XLS';
  fileUrl: string;
}

export interface TourPackage {
  id: string;
  title: string;
  category: 'Domestic' | 'International' | 'Honeymoon' | 'Pilgrimage' | 'Adventure';
  destination: string;
  dates: string;
  price: string;
  priceBasis: 'Per Person' | 'Per Couple' | 'Group';
  priceAdvance?: string;
  duration: string;
  highlights: string[];
  image: string;
  transportType?: string;
  contactPhone?: string;
  contactEmail?: string;
  terms?: string[];
  features?: string[];
  mediaFiles?: MediaFile[];
  itinerary?: ItineraryDay[];
}

export interface TravelTemplate {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  destination: string;
  duration: string;
  interests: string;
  image: string;
  color: string;
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  PLAN_READY = 'PLAN_READY',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN = 'ADMIN',
  ASSOCIATE_LOGIN = 'ASSOCIATE_LOGIN',
  ERROR = 'ERROR'
}
