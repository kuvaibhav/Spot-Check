"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function StarRating({
  rating,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star
            className={`${iconSize} ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-stone-300"
            } ${interactive ? "hover:text-amber-300 transition-colors" : ""}`}
          />
        </button>
      ))}
    </div>
  );
}
