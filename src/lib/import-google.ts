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
    .filter(
      (f) =>
        f.properties?.five_star_rating_published != null &&
        f.properties.five_star_rating_published > 0
    )
    .map((feature) => featureToReview(feature));
}

function featureToReview(feature: GoogleTakeoutFeature): Review {
  const props = feature.properties;
  const location = props.location;
  const placeName = location?.name || "Unknown Place";
  const address = location?.address || "";
  const rating = props.five_star_rating_published || 3;
  const reviewText = props.review_text_published || "";
  const published = props.date || new Date().toISOString();
  const googleMapsUrl = props.google_maps_url || "";

  const [lng, lat] = feature.geometry?.coordinates || [0, 0];

  // Extract sub-ratings (Food, Service, Atmosphere) as tags
  const tags: string[] = [];
  if (props.questions) {
    for (const q of props.questions) {
      tags.push(`${q.question}: ${q.rating}/5`);
    }
  }

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
    tags,
    wouldReturn: rating >= 4,
    googleMapsUrl,
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
