import { NextResponse } from "next/server";
import { getReviews, saveReviews } from "@/lib/reviews";
import { extractLocation } from "@/lib/import-google";

/**
 * POST /api/migrate
 * Backfills city and country fields on all existing reviews.
 * Safe to re-run — only updates reviews missing either field.
 */
export async function POST() {
  try {
    const data = await getReviews();
    let updated = 0;

    data.reviews = data.reviews.map((review) => {
      if ((!review.city || !review.country) && review.address) {
        const { city, country } = extractLocation(review.address);
        if (city || country) {
          updated++;
          return { ...review, city: city || review.city, country: country || review.country };
        }
      }
      return review;
    });

    data.lastUpdated = new Date().toISOString();
    await saveReviews(data);

    return NextResponse.json({
      success: true,
      updated,
      total: data.reviews.length,
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
