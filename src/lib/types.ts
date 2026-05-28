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
  category: Category;
  rating: number; // 1-5
  reviewText: string;
  visitDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  images: string[]; // S3 URLs
  coordinates?: {
    lat: number;
    lng: number;
  };
  source: "manual" | "google" | "yelp";
  tags: string[];
  priceRange?: 1 | 2 | 3 | 4; // $ to $$$$
  wouldReturn: boolean;
}

export interface ReviewsData {
  reviews: Review[];
  lastUpdated: string;
}

// Google Takeout GeoJSON format
export interface GoogleTakeoutFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    "Google Maps URL"?: string;
    Location?: {
      "Business Name"?: string;
      Address?: string;
      "Country Code"?: string;
      "Geo Coordinates"?: {
        Latitude?: number;
        Longitude?: number;
      };
    };
    Published?: string;
    "Star Rating"?: number;
    "Review Comment"?: string;
  };
}

export interface GoogleTakeoutGeoJSON {
  type: "FeatureCollection";
  features: GoogleTakeoutFeature[];
}
