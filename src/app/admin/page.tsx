"use client";

import { useState, useEffect } from "react";
import { Review, Category, CATEGORIES } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import ImageUploader from "@/components/ImageUploader";
import {
  Plus,
  Upload,
  Save,
  Trash2,
  FileJson,
  Loader2,
  Check,
  AlertCircle,
  Lock,
  LogOut,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";

type Tab = "create" | "import" | "manage";

const EMPTY_FORM = {
  placeName: "",
  address: "",
  category: "restaurant" as Category,
  rating: 4,
  reviewText: "",
  visitDate: new Date().toISOString().split("T")[0],
  tags: "",
  priceRange: 2 as 1 | 2 | 3 | 4,
  wouldReturn: true,
  source: "manual" as "manual" | "google" | "yelp",
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState<Tab>("create");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [createImages, setCreateImages] = useState<string[]>([]);

  // Manage tab state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForms, setEditForms] = useState<Record<string, {
    placeName: string; address: string; category: Category;
    rating: number; reviewText: string; visitDate: string;
    tags: string; priceRange: 1|2|3|4; wouldReturn: boolean; images: string[];
  }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => { if (res.ok) setAuthenticated(true); })
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    if (authenticated) fetchReviews();
  }, [authenticated]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { setAuthenticated(true); setPassword(""); }
      else setAuthError("Invalid password");
    } catch { setAuthError("Auth failed"); }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
  }

  async function fetchReviews() {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch { console.error("Failed to fetch reviews"); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images: createImages,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: "Review saved!" });
      setForm(EMPTY_FORM);
      setCreateImages([]);
      fetchReviews();
    } catch {
      setMessage({ type: "error", text: "Failed to save review." });
    } finally { setLoading(false); }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const text = await file.text();
      const geojson = JSON.parse(text);
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geojson),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setMessage({ type: "success", text: `Imported ${result.imported} reviews!` });
      fetchReviews();
    } catch {
      setMessage({ type: "error", text: "Failed to import. Check file format." });
    } finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: "Review deleted." });
      setExpandedId(null);
      fetchReviews();
    } catch {
      setMessage({ type: "error", text: "Failed to delete review." });
    }
  }

  function openEdit(review: Review) {
    setExpandedId(review.id);
    setEditForms((prev) => ({
      ...prev,
      [review.id]: {
        placeName: review.placeName,
        address: review.address ?? "",
        category: review.category,
        rating: review.rating,
        reviewText: review.reviewText,
        visitDate: review.visitDate.split("T")[0],
        tags: review.tags.join(", "),
        priceRange: review.priceRange ?? 2,
        wouldReturn: review.wouldReturn,
        images: review.images ?? [],
      },
    }));
  }

  function closeEdit() {
    setExpandedId(null);
  }

  async function handleSaveEdit(id: string) {
    const ef = editForms[id];
    if (!ef) return;
    setSavingId(id);
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...ef,
          tags: ef.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: "Review updated!" });
      setExpandedId(null);
      fetchReviews();
    } catch {
      setMessage({ type: "error", text: "Failed to update review." });
    } finally { setSavingId(null); }
  }

  function updateEditForm(id: string, patch: Partial<typeof editForms[string]>) {
    setEditForms((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <form onSubmit={handleLogin} className="bg-white border border-stone-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-stone-100 rounded-full">
                <Lock className="w-6 h-6 text-stone-500" />
              </div>
            </div>
            <h1 className="font-display text-xl font-bold text-center">Admin Access</h1>
            <p className="text-sm text-stone-500 text-center mt-1">Enter your password to continue.</p>
            {authError && <p className="mt-3 text-sm text-red-600 text-center">{authError}</p>}
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mt-4 w-full px-3 py-2.5 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              autoFocus
            />
            <button type="submit" className="mt-3 w-full bg-brand-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
              Sign In
            </button>
          </form>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="mt-1 text-stone-500 text-sm">Create, import, and manage your reviews.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors py-2 px-3 -mr-1 min-h-[44px]">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 bg-stone-100 p-1 rounded-xl w-full sm:w-fit">
          {(["create", "import", "manage"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all capitalize min-h-[44px] ${tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
            >
              {t === "create" && <Plus className="w-4 h-4" />}
              {t === "import" && <FileJson className="w-4 h-4" />}
              {t === "manage" && <Pencil className="w-4 h-4" />}
              {t}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {/* ── CREATE TAB ── */}
        {tab === "create" && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Place Name *</label>
                <input type="text" required value={form.placeName}
                  onChange={(e) => setForm({ ...form, placeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  placeholder="e.g. Flour + Water" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                <input type="text" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  placeholder="e.g. 2401 Harrison St, SF" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Visit Date</label>
                <input type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Price Range</label>
                <select value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: parseInt(e.target.value) as 1|2|3|4 })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                  <option value={1}>$ — Budget</option>
                  <option value={2}>$$ — Moderate</option>
                  <option value={3}>$$$ — Upscale</option>
                  <option value={4}>$$$$ — Fine Dining</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Rating</label>
              <StarRating rating={form.rating} size="lg" interactive onChange={(r) => setForm({ ...form, rating: r })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Review *</label>
              <textarea required rows={5} value={form.reviewText}
                onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                placeholder="Write your honest review..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  placeholder="e.g. pasta, italian, date-night" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.wouldReturn}
                    onChange={(e) => setForm({ ...form, wouldReturn: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500" />
                  <span className="text-sm text-stone-700">Would return</span>
                </label>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Photos</label>
              <ImageUploader images={createImages} onChange={setCreateImages} />
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-brand-600 transition-colors disabled:opacity-50 min-h-[44px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Review
            </button>
          </form>
        )}

        {/* ── IMPORT TAB ── */}
        {tab === "import" && (
          <div className="mt-6 space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="font-display font-semibold text-lg">Import Google Takeout Reviews</h2>
              <p className="mt-1 text-sm text-stone-500">
                Upload your Google Takeout GeoJSON file to bulk-import reviews. Categories will be auto-detected.
              </p>
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl p-8 hover:border-brand-400 transition-colors">
                  <Upload className="w-6 h-6 text-stone-400" />
                  <div>
                    <p className="text-sm font-medium text-stone-700">Choose GeoJSON file</p>
                    <p className="text-xs text-stone-400">Exported from Google Takeout → Maps (your places) → Reviews</p>
                  </div>
                  <input type="file" accept=".json,.geojson" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>
            <div className="bg-stone-50 rounded-xl p-6 text-sm text-stone-600 space-y-2">
              <p className="font-medium text-stone-800">How to export from Google:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to takeout.google.com</li>
                <li>Click &ldquo;Deselect all&rdquo;</li>
                <li>Check &ldquo;Maps (your places)&rdquo;</li>
                <li>Click Next step → Create export</li>
                <li>Download the archive and find the Reviews GeoJSON file</li>
                <li>Upload it here</li>
              </ol>
            </div>
          </div>
        )}

        {/* ── MANAGE TAB ── */}
        {tab === "manage" && (
          <div className="mt-6">
            <p className="text-sm text-stone-500 mb-4">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""} total — click a review to edit
            </p>
            <div className="space-y-2">
              {reviews.map((review) => {
                const isOpen = expandedId === review.id;
                const ef = editForms[review.id];

                return (
                  <div key={review.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    {/* Row header */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <button
                        type="button"
                        onClick={() => isOpen ? closeEdit() : openEdit(review)}
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-stone-900 truncate">{review.placeName}</p>
                          <p className="text-xs text-stone-400">
                            {review.category} · {"★".repeat(review.rating)} · {new Date(review.visitDate).toLocaleDateString()}
                            {review.city ? ` · ${review.city}` : ""}
                            {review.images?.length ? ` · ${review.images.length} photo${review.images.length !== 1 ? "s" : ""}` : ""}
                          </p>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                      </button>
                      <button onClick={() => handleDelete(review.id)} className="ml-3 p-3 text-stone-300 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Inline edit form */}
                    {isOpen && ef && (
                      <div className="border-t border-stone-100 px-4 pb-5 pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Place Name</label>
                            <input type="text" value={ef.placeName}
                              onChange={(e) => updateEditForm(review.id, { placeName: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Address</label>
                            <input type="text" value={ef.address}
                              onChange={(e) => updateEditForm(review.id, { address: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
                            <select value={ef.category} onChange={(e) => updateEditForm(review.id, { category: e.target.value as Category })}
                              className="w-full px-2 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Visit Date</label>
                            <input type="date" value={ef.visitDate}
                              onChange={(e) => updateEditForm(review.id, { visitDate: e.target.value })}
                              className="w-full px-2 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Price</label>
                            <select value={ef.priceRange} onChange={(e) => updateEditForm(review.id, { priceRange: parseInt(e.target.value) as 1|2|3|4 })}
                              className="w-full px-2 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                              <option value={1}>$</option>
                              <option value={2}>$$</option>
                              <option value={3}>$$$</option>
                              <option value={4}>$$$$</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Rating</label>
                            <StarRating rating={ef.rating} size="sm" interactive onChange={(r) => updateEditForm(review.id, { rating: r })} />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">Review Text</label>
                          <textarea rows={4} value={ef.reviewText}
                            onChange={(e) => updateEditForm(review.id, { reviewText: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Tags (comma-separated)</label>
                            <input type="text" value={ef.tags}
                              onChange={(e) => updateEditForm(review.id, { tags: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={ef.wouldReturn}
                                onChange={(e) => updateEditForm(review.id, { wouldReturn: e.target.checked })}
                                className="w-4 h-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500" />
                              <span className="text-sm text-stone-700">Would return</span>
                            </label>
                          </div>
                        </div>

                        {/* Image management */}
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-2">Photos</label>
                          <ImageUploader
                            images={ef.images}
                            onChange={(imgs) => updateEditForm(review.id, { images: imgs })}
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <button type="button" onClick={() => handleSaveEdit(review.id)} disabled={savingId === review.id}
                            className="flex items-center gap-2 bg-brand-500 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 min-h-[44px]">
                            {savingId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </button>
                          <button type="button" onClick={closeEdit}
                            className="text-sm text-stone-400 hover:text-stone-600 transition-colors py-3 px-2 min-h-[44px]">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {reviews.length === 0 && (
                <p className="text-center py-8 text-stone-400 text-sm">No reviews yet.</p>
              )}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
