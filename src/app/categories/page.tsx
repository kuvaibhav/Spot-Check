import Link from "next/link";
import { getReviews } from "@/lib/reviews";
import { CATEGORIES, Category } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import {
  Utensils,
  Coffee,
  Wine,
  IceCream,
  Sandwich,
  ChefHat,
  Truck,
  Croissant,
  Plane,
  Music,
  HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  restaurant: <Utensils className="w-6 h-6" />,
  cafe: <Coffee className="w-6 h-6" />,
  bar: <Wine className="w-6 h-6" />,
  dessert: <IceCream className="w-6 h-6" />,
  "fast-food": <Sandwich className="w-6 h-6" />,
  "fine-dining": <ChefHat className="w-6 h-6" />,
  "street-food": <Truck className="w-6 h-6" />,
  bakery: <Croissant className="w-6 h-6" />,
  travel: <Plane className="w-6 h-6" />,
  nightlife: <Music className="w-6 h-6" />,
  other: <HelpCircle className="w-6 h-6" />,
};

export default async function CategoriesPage() {
  const data = await getReviews();

  const categoryStats = CATEGORIES.map((cat) => {
    const reviews = data.reviews.filter((r) => r.category === cat.value);
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    return {
      ...cat,
      count: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }).filter((cat) => cat.count > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Categories
        </h1>
        <p className="mt-2 text-stone-500">
          Browse reviews by category. {data.reviews.length} total reviews across{" "}
          {categoryStats.length} categories.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((cat) => (
            <Link
              key={cat.value}
              href={`/?category=${cat.value}`}
              className="group bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md hover:border-stone-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 bg-brand-50 rounded-xl text-brand-500 group-hover:bg-brand-100 transition-colors">
                  {CATEGORY_ICONS[cat.value]}
                </div>
                <span className="text-2xl font-bold text-stone-300 group-hover:text-stone-400 transition-colors">
                  {cat.count}
                </span>
              </div>
              <h2 className="mt-4 font-display font-semibold text-lg text-stone-900">
                {cat.label}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={Math.round(cat.avgRating)} size="sm" />
                <span className="text-sm text-stone-500">
                  {cat.avgRating} avg
                </span>
              </div>
            </Link>
          ))}
        </div>

        {categoryStats.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-400 text-lg">No reviews yet.</p>
            <Link
              href="/admin"
              className="mt-2 inline-block text-brand-500 text-sm hover:text-brand-600"
            >
              Add your first review
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
