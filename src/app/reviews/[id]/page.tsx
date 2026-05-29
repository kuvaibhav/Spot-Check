import { getReviews } from "@/lib/reviews";
import { CATEGORIES } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  RotateCcw,
  ArrowLeft,
  DollarSign,
  Tag,
  ExternalLink,
} from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  params: { id: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const data = await getReviews();
  const review = data.reviews.find((r) => r.id === params.id);

  if (!review) {
    notFound();
  }

  const categoryLabel =
    CATEGORIES.find((c) => c.value === review.category)?.label || review.category;

  const visitDate = new Date(review.visitDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to reviews
        </Link>

        {/* Image gallery */}
        {review.images.length > 0 && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={review.images[0]}
              alt={review.placeName}
              className="w-full aspect-[16/9] object-cover"
            />
            {review.images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {review.images.slice(1, 4).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${review.placeName} ${i + 2}`}
                    className="w-1/3 aspect-square object-cover rounded-xl"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start gap-3 mb-2">
          <span className="bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1 rounded-full">
            {categoryLabel}
          </span>
          {review.source !== "manual" && (
            <span className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full capitalize">
              From {review.source}
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-3">
          {review.placeName}
        </h1>

        <div className="flex items-center gap-2 mt-2 text-stone-500 text-sm">
          <MapPin className="w-4 h-4 text-stone-400" />
          {review.address}
        </div>

        {/* Rating & meta */}
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="lg" />
            <span className="text-lg font-semibold text-stone-800">
              {review.rating}/5
            </span>
          </div>

          {review.priceRange && (
            <div className="flex items-center gap-1 text-stone-500">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">
                {"$".repeat(review.priceRange)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-stone-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{visitDate}</span>
          </div>

          {review.wouldReturn && (
            <div className="flex items-center gap-1.5 text-green-600">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Would return</span>
            </div>
          )}
        </div>

        {/* Review text */}
        <div className="mt-8 prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed text-lg whitespace-pre-wrap">
            {review.reviewText}
          </p>
        </div>

        {/* Tags */}
        {review.tags.length > 0 && (
          <div className="mt-8 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-stone-400" />
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="bg-stone-100 text-stone-500 text-xs px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Map link */}
        {(review.googleMapsUrl || review.coordinates) && (
          <div className="mt-8 p-4 bg-stone-100 rounded-xl">
            <a
              href={
                review.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${review.coordinates?.lat},${review.coordinates?.lng}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Google Maps
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
