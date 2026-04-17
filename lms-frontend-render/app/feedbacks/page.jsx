"use client";
import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader, AlertCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const AREA_LABELS = {
  courses:    "📚 Courses",
  payment:    "💳 Payment",
  teacher:    "👨‍🏫 Teacher",
  attendance: "📋 Attendance",
  materials:  "📄 Materials",
  exam:       "📝 Exams",
  technical:  "💻 Technical",
  other:      "🔖 Other",
};

function StarDisplay({ value, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size}
          className={s <= value ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5 w-16 justify-end flex-shrink-0">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={10}
            className={s <= star ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
        ))}
      </div>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="w-5 text-xs text-gray-400 text-right">{count}</span>
    </div>
  );
}

export default function PublicFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${API}/feedback/public/all`);
        const data = await res.json();
        if (data.success) setFeedbacks(data.feedbacks);
        else setError("Failed to load feedbacks.");
      } catch { setError("Could not connect to server."); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const totalWithRating = feedbacks.filter(f => f.rating).length;
  const avgRating = totalWithRating > 0
    ? feedbacks.reduce((a, f) => a + (f.rating || 0), 0) / totalWithRating
    : 0;

  const ratingCounts = [5,4,3,2,1].map(star => ({
    star,
    count: feedbacks.filter(f => f.rating === star).length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-14 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageSquare size={28} className="opacity-80" />
          <h1 className="text-3xl font-extrabold tracking-tight">What Our Community Says</h1>
        </div>
        <p className="text-blue-100 text-sm max-w-md mx-auto">
          Users share their positive experiences here, helping us understand what we are doing well. Any complaints or issues are submitted through a separate section so we can review and improve the system properly.
        </p>
        {avgRating > 0 && (
          <div className="mt-6 inline-flex flex-col items-center bg-white/10 rounded-2xl px-8 py-4 backdrop-blur">
            <span className="text-5xl font-black text-white">{avgRating.toFixed(1)}</span>
            <StarDisplay value={Math.round(avgRating)} size={20} />
            <span className="text-blue-100 text-xs mt-1">
              {totalWithRating} review{totalWithRating !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {totalWithRating > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Rating Breakdown</h2>
            <div className="space-y-2.5">
              {ratingCounts.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={totalWithRating} />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader size={20} className="animate-spin" /> Loading feedbacks...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-25" />
            <p className="font-semibold">No feedbacks yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {feedbacks.map(fb => (
              <div key={fb.feedback_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{fb.user_name}</p>
                  {fb.rating && <StarDisplay value={fb.rating} size={14} />}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">&ldquo;{fb.message}&rdquo;</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {fb.area ? (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {AREA_LABELS[fb.area] || fb.area}
                    </span>
                  ) : <span />}
                  <span className="text-xs text-gray-400">
                    {new Date(fb.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
