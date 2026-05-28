import { NextRequest, NextResponse } from "next/server";
import { getReviews, saveReviews } from "@/lib/reviews";
import { parseGoogleTakeoutReviews } from "@/lib/import-google";
import { GoogleTakeoutGeoJSON } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const geojson: GoogleTakeoutGeoJSON = await req.json();

    if (!geojson.features || !Array.isArray(geojson.features)) {
      return NextResponse.json(
        { error: "Invalid GeoJSON format. Expected a FeatureCollection with features array." },
        { status: 400 }
      );
    }

    const importedReviews = parseGoogleTakeoutReviews(geojson);

    if (importedReviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews found in the uploaded file." },
        { status: 400 }
      );
    }

    const data = await getReviews();

    // Avoid duplicates: check by placeName + visitDate
    const existingKeys = new Set(
      data.reviews.map((r) => `${r.placeName}::${r.visitDate}`)
    );

    const newReviews = importedReviews.filter(
      (r) => !existingKeys.has(`${r.placeName}::${r.visitDate}`)
    );

    data.reviews = [...newReviews, ...data.reviews];
    data.lastUpdated = new Date().toISOString();

    await saveReviews(data);

    return NextResponse.json({
      imported: newReviews.length,
      skipped: importedReviews.length - newReviews.length,
      total: data.reviews.length,
    });
  } catch (error) {
    console.error("Failed to import reviews:", error);
    return NextResponse.json(
      { error: "Failed to import reviews" },
      { status: 500 }
    );
  }
}
