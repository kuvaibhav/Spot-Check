import { v4 as uuidv4 } from "uuid";
import {
  Review,
  Category,
  GoogleTakeoutGeoJSON,
  GoogleTakeoutFeature,
} from "./types";

const US_CA_COUNTRIES = new Set(["United States", "USA", "US", "Canada"]);

/**
 * Returns true if the address is in the US or Canada.
 */
export function isUsOrCanada(country: string): boolean {
  return US_CA_COUNTRIES.has(country);
}

// US state abbreviations — last part of a 3-part address like "City, ST ZIP"
const US_STATE_ABBREVS = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

// Canadian province abbreviations
const CA_PROVINCE_ABBREVS = new Set([
  "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT",
]);

/**
 * Extracts city and country from a standard address string.
 * Handles:
 *   "123 Main St, Seattle, WA 98101, United States"  → Seattle / United States
 *   "123 St, Vancouver, BC V1A 2B3, Canada"          → Vancouver / Canada
 *   "123 St, City, CA"  (short US format)            → City / United States
 *   "123 St, City, State"  (no country suffix)        → City / inferred
 */
export function extractLocation(address: string): { city: string; country: string } {
  if (!address) return { city: "", country: "" };
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length < 2) return { city: "", country: "" };

  const last = parts[parts.length - 1];
  // Normalize known aliases
  const normalized =
    last === "USA" || last === "US" ? "United States" : last;

  // Full address with explicit country: "Street, City, State ZIP, Country"
  if (parts.length >= 4 && !US_STATE_ABBREVS.has(last) && !CA_PROVINCE_ABBREVS.has(last)) {
    return { city: parts[1], country: normalized };
  }

  // Short format where last part is a state/province abbreviation (no country suffix)
  // e.g. "Street, City, CA" or "Street, City, WA 98101"
  const stateToken = last.split(" ")[0]; // handle "WA 98101" → "WA"
  if (US_STATE_ABBREVS.has(stateToken)) {
    return { city: parts[1], country: "United States" };
  }
  if (CA_PROVINCE_ABBREVS.has(stateToken)) {
    return { city: parts[1], country: "Canada" };
  }

  // Fallback: treat last part as country, second part as city
  return { city: parts.length >= 3 ? parts[1] : "", country: normalized };
}

/**
 * Extracts the city from a standard address string.
 * @deprecated Use extractLocation() instead.
 */
export function extractCity(address: string): string {
  return extractLocation(address).city;
}

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

  const { city, country } = extractLocation(address);

  return {
    id: uuidv4(),
    placeName,
    address,
    city,
    country,
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
