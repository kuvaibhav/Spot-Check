import { Review, ReviewsData, Category } from "./types";
import sampleData from "@/data/sample-reviews.json";

const USE_S3 = !!(
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_ACCESS_KEY_ID !== "your-r2-access-key"
);

export async function getReviews(): Promise<ReviewsData> {
  if (USE_S3) {
    const { getReviewsFromS3 } = await import("./s3");
    return getReviewsFromS3();
  }
  return sampleData as unknown as ReviewsData;
}

export async function saveReviews(data: ReviewsData): Promise<void> {
  if (USE_S3) {
    const { saveReviewsToS3 } = await import("./s3");
    return saveReviewsToS3(data);
  }
  // In local mode, we just return (data lives in memory per request)
  console.log("S3 not configured — review not persisted. Configure AWS credentials in .env.local");
}

export function filterReviews(
  reviews: Review[],
  options: {
    category?: Category | "all";
    search?: string;
    sortBy?: "date" | "rating" | "name";
    sortOrder?: "asc" | "desc";
  }
): Review[] {
  let filtered = [...reviews];

  if (options.category && options.category !== "all") {
    filtered = filtered.filter((r) => r.category === options.category);
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.placeName.toLowerCase().includes(q) ||
        r.reviewText.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const sortBy = options.sortBy || "date";
  const sortOrder = options.sortOrder || "desc";
  const mult = sortOrder === "desc" ? -1 : 1;

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return mult * (new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
      case "rating":
        return mult * (a.rating - b.rating);
      case "name":
        return mult * a.placeName.localeCompare(b.placeName);
      default:
        return 0;
    }
  });

  return filtered;
}
