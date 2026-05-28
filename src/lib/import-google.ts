import { v4 as uuidv4 } from "uuid";
import {
  Review,
  Category,
  GoogleTakeoutGeoJSON,
  GoogleTakeoutFeature,
} from "./types";

/**
 * Parses Google Takeout GeoJSON review data into SpotCheck Review format.
 * Attempts to auto-categorize based on business name keywords.
 */
export function parseGoogleTakeoutReviews(
  geojson: GoogleTakeoutGeoJSON
): Review[] {
  return geojson.features
    .filter((f) => f.properties?.["Star Rating"] != null)
    .map((feature) => featureToReview(feature));
}

function featureToReview(feature: GoogleTakeoutFeature): Review {
  const props = feature.properties;
  const location = props.Location;
  const placeName = location?.["Business Name"] || "Unknown Place";
  const address = location?.Address || "";
  const rating = props["Star Rating"] || 3;
  const reviewText = props["Review Comment"] || "";
  const published = props.Published || new Date().toISOString();

  const [lng, lat] = feature.geometry?.coordinates || [0, 0];

  return {
    id: uuidv4(),
    placeName,
    address,
    category: guessCategory(placeName, reviewText),
    rating,
    reviewText,
    visitDate: published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [],
    coordinates: lat && lng ? { lat, lng } : undefined,
    source: "google",
    tags: [],
    wouldReturn: rating >= 4,
  };
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  cafe: ["cafe", "coffee", "espresso", "latte", "starbucks", "tea house"],
  bar: ["bar", "pub", "brewery", "taproom", "lounge", "cocktail", "wine bar"],
  dessert: [
    "ice cream",
    "gelato",
    "frozen yogurt",
    "donut",
    "doughnut",
    "sweet",
    "candy",
    "chocolate",
  ],
  "fast-food": [
    "mcdonald",
    "burger king",
    "wendy",
    "taco bell",
    "chipotle",
    "subway",
    "chick-fil-a",
    "popeyes",
    "kfc",
    "five guys",
    "in-n-out",
    "shake shack",
    "panda express",
  ],
  "fine-dining": [
    "fine dining",
    "michelin",
    "tasting menu",
    "prix fixe",
    "omakase",
  ],
  "street-food": ["food truck", "street food", "cart", "stand", "hawker"],
  bakery: ["bakery", "bread", "pastry", "patisserie", "boulangerie", "cake"],
  nightlife: ["club", "nightclub", "dance", "dj", "karaoke"],
  travel: ["hotel", "resort", "airbnb", "hostel", "motel", "lodge"],
  restaurant: [],
  other: [],
};

function guessCategory(name: string, text: string): Category {
  const combined = `${name} ${text}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "restaurant" || category === "other") continue;
    if (keywords.some((kw) => combined.includes(kw))) {
      return category as Category;
    }
  }
  return "restaurant"; // default
}
