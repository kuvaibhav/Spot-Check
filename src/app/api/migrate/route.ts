import { NextResponse } from "next/server";
import { getReviews, saveReviews } from "@/lib/reviews";
import { extractCity } from "@/lib/import-google";

/**
 * POST /api/migrate
 * One-time migration to backfill the city field on all existing reviews
 * that were imported before city extraction was added.
 */
export async function POST() {
  try {
    const data = await getReviews();
    let updated = 0;

    data.reviews = data.reviews.map((review) => {
      if (!review.city && review.address) {
        const city = extractCity(review.address);
        if (city) {
          updated++;
          return { ...review, city };
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
