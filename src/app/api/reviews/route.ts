import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getReviews, saveReviews } from "@/lib/reviews";
import { Review } from "@/lib/types";

export async function GET() {
  try {
    const data = await getReviews();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await getReviews();

    const newReview: Review = {
      id: uuidv4(),
      placeName: body.placeName,
      address: body.address || "",
      category: body.category || "restaurant",
      rating: body.rating || 3,
      reviewText: body.reviewText || "",
      visitDate: body.visitDate
        ? new Date(body.visitDate).toISOString()
        : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: body.images || [],
      coordinates: body.coordinates,
      source: body.source || "manual",
      tags: body.tags || [],
      priceRange: body.priceRange,
      wouldReturn: body.wouldReturn ?? true,
    };

    data.reviews.unshift(newReview);
    data.lastUpdated = new Date().toISOString();

    await saveReviews(data);

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const data = await getReviews();
    const index = data.reviews.findIndex((r) => r.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updated: Review = {
      ...data.reviews[index],
      placeName: body.placeName ?? data.reviews[index].placeName,
      address: body.address ?? data.reviews[index].address,
      category: body.category ?? data.reviews[index].category,
      rating: body.rating ?? data.reviews[index].rating,
      reviewText: body.reviewText ?? data.reviews[index].reviewText,
      visitDate: body.visitDate
        ? new Date(body.visitDate).toISOString()
        : data.reviews[index].visitDate,
      images: body.images ?? data.reviews[index].images,
      tags: body.tags ?? data.reviews[index].tags,
      priceRange: body.priceRange ?? data.reviews[index].priceRange,
      wouldReturn: body.wouldReturn ?? data.reviews[index].wouldReturn,
      updatedAt: new Date().toISOString(),
    };

    data.reviews[index] = updated;
    data.lastUpdated = new Date().toISOString();
    await saveReviews(data);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const data = await getReviews();
    const index = data.reviews.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    data.reviews.splice(index, 1);
    data.lastUpdated = new Date().toISOString();

    await saveReviews(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
