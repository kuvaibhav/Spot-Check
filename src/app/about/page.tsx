import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Star, Utensils, Coffee } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          About SpotCheck
        </h1>

        <div className="mt-8 space-y-6 text-stone-600 leading-relaxed">
          <p className="text-lg">
            SpotCheck is my personal digital notebook for tracking the food I eat
            and the places I visit. No influencer hype or conflicting crowdsourced
            reviews — just my genuine, unfiltered thoughts on everyday spots.
          </p>

          <p>
            If I&apos;ve been there, it gets a SpotCheck. Simple as that.
          </p>

          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="bg-white rounded-xl p-5 border border-stone-200 text-center">
              <Utensils className="w-6 h-6 text-brand-500 mx-auto" />
              <p className="mt-2 font-display font-semibold text-stone-900">
                The Bites
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Honest takes on menus, drinks, and culinary experiences.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-200 text-center">
              <Coffee className="w-6 h-6 text-brand-500 mx-auto" />
              <p className="mt-2 font-display font-semibold text-stone-900">
                The Vibes
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Real looks at atmosphere, design, and comfort.
              </p>
            </div>
          </div>

          <div className="bg-stone-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="font-display font-semibold text-stone-900">
                Rating System
              </h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <strong className="text-stone-800">5 stars</strong> — Exceptional. A must-visit.
              </li>
              <li>
                <strong className="text-stone-800">4 stars</strong> — Great experience. Would recommend.
              </li>
              <li>
                <strong className="text-stone-800">3 stars</strong> — Decent. Nothing wrong, nothing special.
              </li>
              <li>
                <strong className="text-stone-800">2 stars</strong> — Below average. Unlikely to return.
              </li>
              <li>
                <strong className="text-stone-800">1 star</strong> — Bad experience. Avoid.
              </li>
            </ul>
          </div>

          <p className="text-sm text-stone-400 pt-4">
            Built by Kumar V. with Next.js, Tailwind CSS, and AWS S3.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
