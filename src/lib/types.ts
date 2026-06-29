export type Category =
  | "restaurant"
  | "cafe"
  | "bar"
  | "dessert"
  | "fast-food"
  | "fine-dining"
  | "street-food"
  | "bakery"
  | "travel"
  | "nightlife"
  | "other";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "restaurant", label: "Restaurants" },
  { value: "cafe", label: "Cafés" },
  { value: "bar", label: "Bars" },
  { value: "dessert", label: "Desserts" },
  { value: "fast-food", label: "Fast Food" },
  { value: "fine-dining", label: "Fine Dining" },
  { value: "street-food", label: "Street Food" },
  { value: "bakery", label: "Bakeries" },
  { value: "travel", label: "Travel" },
  { value: "nightlife", label: "Nightlife" },
  { value: "other", label: "Other" },
];

export interface Review {
  id: string;
  placeName: string;
  address: string;
  city?: string; // extracted from address, e.g. "Seattle"
  category: Category;
  rating: number; // 1-5
  reviewText: string;
  visitDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  images: string[]; // R2 URLs
  coordinates?: {
    lat: number;
    lng: number;
  };
  source: "manual" | "google" | "yelp";
  tags: string[];
  priceRange?: 1 | 2 | 3 | 4; // $ to $$$$
  wouldReturn: boolean;
  googleMapsUrl?: string;
}

export interface ReviewsData {
  reviews: Review[];
  lastUpdated: string;
}

// Google Takeout GeoJSON format (actual structure from export)
export interface GoogleTakeoutFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    google_maps_url?: string;
    date?: string;
    five_star_rating_published?: number;
    review_text_published?: string;
    location?: {
      name?: string;
      address?: string;
      country_code?: string;
    };
    questions?: {
      question: string;
      rating: number;
    }[];
  };
}

export interface GoogleTakeoutGeoJSON {
  type: "FeatureCollection";
  features: GoogleTakeoutFeature[];
}
