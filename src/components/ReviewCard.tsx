import Link from "next/link";
import { MapPin, Calendar, RotateCcw } from "lucide-react";
import { Review, CATEGORIES } from "@/lib/types";
import StarRating from "./StarRating";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === review.category)?.label || review.category;

  const visitDate = new Date(review.visitDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/reviews/${review.id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:border-stone-300 transition-all duration-200"
    >
      {/* Image placeholder */}
      <div className="aspect-[16/10] bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden">
        {review.images.length > 0 ? (
          <img
            src={review.images[0]}
            alt={review.placeName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-stone-300" />
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-stone-700 max-w-[45%] truncate">
          {categoryLabel}
        </span>

        {/* Source badge */}
        {review.source !== "manual" && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-stone-500 capitalize max-w-[45%] truncate">
            {review.source}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-brand-600 transition-colors">
          {review.placeName}
        </h3>

        <div className="mt-2 flex items-center gap-3">
          <StarRating rating={review.rating} size="sm" />
          {review.priceRange && (
            <span className="text-xs text-stone-400 font-medium">
              {"$".repeat(review.priceRange)}
            </span>
          )}
        </div>

        {review.reviewText && (
          <p className="mt-2 text-sm text-stone-500 line-clamp-2 leading-relaxed">
            {review.reviewText}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {visitDate}
          </span>
          {review.wouldReturn && (
            <span className="flex items-center gap-1 text-green-600">
              <RotateCcw className="w-3 h-3" />
              Would return
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
