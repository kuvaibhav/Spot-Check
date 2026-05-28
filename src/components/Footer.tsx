import { MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-500">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-display font-semibold">SpotCheck</span>
          </div>
          <p className="text-xs text-stone-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by
            Kumar V.
          </p>
        </div>
      </div>
    </footer>
  );
}
