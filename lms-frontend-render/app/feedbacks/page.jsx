"use client";
import { useState, useEffect } from "react";
import { 
  Star, 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  TrendingUp,
  Quote,
  BookOpen,
  CreditCard,
  GraduationCap,
  ClipboardList,
  FileText,
  PenSquare,
  Monitor,
  Bookmark,
  ThumbsUp,
  Award
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const AREA_LABELS = {
  courses:    { label: "Courses",    icon: BookOpen,       color: "from-blue-500 to-blue-700" },
  payment:    { label: "Payment",    icon: CreditCard,     color: "from-green-500 to-emerald-600" },
  teacher:    { label: "Teacher",    icon: GraduationCap,  color: "from-cyan-500 to-blue-600" },
  attendance: { label: "Attendance", icon: ClipboardList,  color: "from-purple-500 to-blue-600" },
  materials:  { label: "Materials",  icon: FileText,       color: "from-orange-500 to-red-500" },
  exam:       { label: "Exams",      icon: PenSquare,      color: "from-pink-500 to-rose-600" },
  technical:  { label: "Technical",  icon: Monitor,        color: "from-indigo-500 to-blue-700" },
  other:      { label: "Other",      icon: Bookmark,       color: "from-gray-500 to-gray-700" },
};

function StarDisplay({ value, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star 
          key={s} 
          size={size}
          className={s <= value ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} 
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <div className="flex items-center gap-1 w-14 flex-shrink-0">
        <span className="text-sm font-bold text-gray-700">{star}</span>
        <Star size={12} className="fill-yellow-400 text-yellow-400" />
      </div>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:from-yellow-500 group-hover:to-amber-600"
          style={{ width: `${pct}%` }} 
        />
      </div>
      <div className="w-16 text-right flex-shrink-0">
        <span className="text-xs font-bold text-gray-700">{count}</span>
        <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
      </div>
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

  // Calculate % of 4+ star reviews (satisfaction)
  const highRatings = feedbacks.filter(f => f.rating >= 4).length;
  const satisfactionPct = totalWithRating > 0 ? Math.round((highRatings / totalWithRating) * 100) : 0;

  return (
    <main className="flex flex-col min-h-screen relative overflow-x-hidden bg-gray-50">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION - Gradient with glow orbs
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Animated Glow Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Geometric shapes */}
        <div className="absolute top-16 right-16 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-24 left-16 w-16 h-16 border-2 border-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 md:py-28 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 rounded-full px-4 py-1.5 mb-6">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Community Reviews</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
              What Our
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-white">
                Community Says
              </span>
            </h1>

            <p className="text-lg text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Users share their positive experiences here, helping us understand what we're doing well. 
              Complaints are handled separately so we can review and improve.
            </p>

            {/* Big Rating Display */}
            {avgRating > 0 && (
              <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6">
                
                {/* Main Rating Card */}
                <div className="relative p-[2px] bg-gradient-to-br from-yellow-300 via-cyan-300 to-blue-400 rounded-3xl shadow-2xl">
                  <div className="bg-blue-900/80 backdrop-blur-md rounded-[22px] px-8 py-6 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-200">Average Rating</span>
                    </div>
                    <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400 leading-none">
                      {avgRating.toFixed(1)}
                    </span>
                    <div className="mt-2">
                      <StarDisplay value={Math.round(avgRating)} size={22} />
                    </div>
                    <span className="text-blue-200 text-sm mt-2 font-medium">
                      Based on {totalWithRating} review{totalWithRating !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Satisfaction Badge */}
                {satisfactionPct > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <ThumbsUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-extrabold text-white leading-none">{satisfactionPct}%</p>
                        <p className="text-xs text-blue-200 font-medium mt-1">Satisfaction Rate</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-extrabold text-white leading-none">{feedbacks.length}</p>
                        <p className="text-xs text-blue-200 font-medium mt-1">Total Feedbacks</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. MAIN CONTENT - Rating Breakdown + Reviews
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Rating Breakdown Card */}
        {totalWithRating > 0 && (
          <div className="relative p-[1px] bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 rounded-3xl shadow-xl mb-10">
            <div className="bg-white rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Rating Breakdown</h2>
                  <p className="text-sm text-gray-500">How our community rates us</p>
                </div>
              </div>

              <div className="space-y-3">
                {ratingCounts.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={totalWithRating} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Title for Reviews */}
        {!loading && !error && feedbacks.length > 0 && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-extrabold text-gray-900">Recent Reviews</h2>
            </div>
            <span className="text-sm text-gray-600 font-medium">
              <span className="font-extrabold text-gray-900">{feedbacks.length}</span> {feedbacks.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}

        {/* Content States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
              <Loader2 className="absolute top-0 left-0 animate-spin w-16 h-16 text-blue-600" />
            </div>
            <p className="text-gray-500 font-medium mt-4">Loading feedbacks...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-bold">Something went wrong</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-dashed border-blue-200 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-9 h-9 text-blue-600" />
            </div>
            <p className="text-xl font-extrabold text-gray-900 mb-2">No feedbacks yet</p>
            <p className="text-sm text-gray-500">Be the first to share your experience with us!</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {feedbacks.map((fb, idx) => {
              const areaData = AREA_LABELS[fb.area];
              const AreaIcon = areaData?.icon;
              const initials = (fb.user_name || "U")
                .split(' ')
                .map(w => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              
              return (
                <div 
                  key={fb.feedback_id}
                  className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col"
                >
                  {/* Decorative bg circle */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500 opacity-60"></div>
                  
                  {/* Quote icon decorative */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Quote className="w-10 h-10 text-blue-600 rotate-180" />
                  </div>

                  <div className="relative p-5 flex flex-col flex-1">
                    {/* User info + Rating */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md border-2 border-white flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-gray-900 text-sm truncate">{fb.user_name}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(fb.created_at).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric", 
                              year: "numeric" 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {fb.rating && (
                        <div className="flex-shrink-0">
                          <StarDisplay value={fb.rating} size={14} />
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-4 italic">
                      &ldquo;{fb.message}&rdquo;
                    </p>

                    {/* Area badge */}
                    {fb.area && areaData && (
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <span className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${areaData.color} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm`}>
                          {AreaIcon && <AreaIcon className="w-3.5 h-3.5" />}
                          {areaData.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 w-0 group-hover:w-full"></div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
