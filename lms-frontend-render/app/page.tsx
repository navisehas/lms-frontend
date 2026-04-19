"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  Award, 
  QrCode, 
  MonitorPlay, 
  Clock, 
  CheckCircle,
  ArrowRight,
  X,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Play,
  Star
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [popupData, setPopupData] = useState<{ image_url: string } | null>(null);
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchPopupData = async () => {
      try {
        const res = await fetch(`${API}/public/popup`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.is_active && data.image_url) {
            setPopupData(data);

            const img = new Image();
            img.onload = () => {
              setIsLandscape(img.naturalWidth >= img.naturalHeight);
            };
            img.src = data.image_url;

            const timer = setTimeout(() => {
              setShowPopup(true);
              setTimeout(() => setIsFadingIn(true), 50);
            }, 500);
            return () => clearTimeout(timer);
          }
        }
      } catch (error) {
        console.error("Failed to load popup data:", error);
      }
    };

    fetchPopupData();
  }, []);

  const closePopup = () => {
    setIsFadingIn(false);
    setTimeout(() => {
      setShowPopup(false);
    }, 300);
  };

  const modalWidthClass = isLandscape === null
    ? "max-w-4xl"
    : isLandscape
      ? "max-w-4xl"
      : "max-w-lg";

  return (
    <main className="flex flex-col min-h-screen relative overflow-x-hidden">
      
      {/* ─── DYNAMIC WELCOME POPUP MODAL ─── */}
      {showPopup && popupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isFadingIn ? "opacity-100" : "opacity-0"
            }`}
            onClick={closePopup}
          />
          <div 
            className={`relative ${modalWidthClass} w-full z-10 flex flex-col items-center justify-center transform transition-all duration-300 ease-out ${
              isFadingIn ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <button 
              onClick={closePopup}
              className="absolute -top-4 -right-4 md:-right-6 z-20 bg-black/70 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg border border-white/20"
              aria-label="Close popup"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <img 
              src={popupData.image_url} 
              alt="Welcome Promotional Offer" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION - Modern with Grid Pattern + Floating Cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white min-h-screen flex items-center overflow-hidden">
        
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-16 h-16 border-2 border-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            
            {/* ✅ REMOVED: "Admissions Open for 2026 Batch" badge */}
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Master Your
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-white">
                Future Today
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-xl">
              Sri Lanka's most advanced LMS combining physical classes with smart online education. Automated attendance, instant results, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/courses" 
                className="group relative px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">Find Your Course</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" /> Student Login
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-6 border-t border-white/10">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white flex items-center justify-center text-xs font-bold">SP</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-xs font-bold">RK</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-white flex items-center justify-center text-xs font-bold">AM</div>
                <div className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-xs font-bold text-blue-900">+5K</div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-blue-100">Trusted by 5,000+ students</p>
              </div>
            </div>
          </div>
          
          {/* RIGHT: Floating Feature Cards */}
          <div className="relative hidden lg:block animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="relative w-full h-[500px]">
              
              {/* Main Card */}
              <div className="absolute top-0 right-0 w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded-full">LIVE</span>
                </div>
                <h4 className="text-lg font-bold mb-2">Real-time Progress</h4>
                <p className="text-sm text-blue-100 mb-4">Track your journey with instant analytics</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-200">Overall Progress</span>
                    <span className="font-bold">87%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-full rounded-full animate-pulse" style={{width: '87%'}}></div>
                  </div>
                </div>
              </div>
              
              {/* QR Card */}
              <div className="absolute top-32 left-0 w-64 bg-white rounded-2xl p-5 shadow-2xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Smart Check-in</h4>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  Attendance Marked ✓
                </div>
              </div>
              
              {/* Exam Result Card */}
              <div className="absolute bottom-0 right-12 w-72 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 shadow-2xl border border-blue-400/30 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm font-bold">Physics MCQ</span>
                  </div>
                  <span className="text-xs text-blue-200">2 min ago</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-extrabold">92</span>
                  <span className="text-blue-200 mb-1">/100</span>
                </div>
                <p className="text-xs text-blue-100">Rank #4 out of 180 students</p>
              </div>
              
            </div>
          </div>
        </div>
        
        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. STATS SECTION - Enhanced with Icons + Hover Effects
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {[
              { number: "5,000+", label: "Active Students", icon: Users, color: "blue" },
              { number: "50+", label: "Expert Teachers", icon: Award, color: "blue" },
              { number: "100%", label: "Syllabus Coverage", icon: BookOpen, color: "blue" },
              { number: "12", label: "Island Top Ranks", icon: TrendingUp, color: "blue" }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="group relative bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <stat.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-1 tracking-tight">
                  {stat.number}
                </h3>
                <p className="text-gray-600 font-medium text-sm md:text-base">{stat.label}</p>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-b-2xl transition-all duration-300 w-0 group-hover:w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. FEATURES SECTION - Modern Cards with Visual Interest
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        
        {/* Decorative bg pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Technology Driven
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Education Ecosystem
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              We don't just teach; we provide an ecosystem for success using the latest educational technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Smart Attendance</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Seamless QR code entry. Parents get instant SMS when their child enters and leaves the institute.
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Feature 2 - Highlighted */}
            <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full translate-y-16 -translate-x-16"></div>
              <div className="relative">
                <div className="inline-flex items-center gap-1 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                  <Sparkles className="w-3 h-3" /> POPULAR
                </div>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <MonitorPlay className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-extrabold mb-3">HD Video Recordings</h3>
                <p className="text-blue-100 leading-relaxed mb-4">
                  Missed a class? Access high-quality recordings and downloadable PDF notes anytime, anywhere.
                </p>
                <div className="flex items-center gap-2 text-cyan-200 font-bold text-sm group-hover:gap-3 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Instant Exam Results</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Online MCQ exams with auto-marking. Get instant results, rank analysis, and performance tracking.
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. DASHBOARD SHOWCASE - Split Layout with Accents
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* LEFT Content */}
            <div className="mb-12 lg:mb-0">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-4">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wide">All-in-One Platform</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                A Complete Learning
                <span className="block text-blue-600">Ecosystem</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform integrates everything a student needs to succeed in one simple, beautiful dashboard.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  { icon: Shield, text: "Secure Online Fee Payments (PayHere)" },
                  { icon: Users, text: "Chat with Teachers & Doubt Solving" },
                  { icon: TrendingUp, text: "Automated Progress Reports" },
                  { icon: MonitorPlay, text: "Mobile-Friendly Learning App" }
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                      <item.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/about" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition group shadow-lg shadow-blue-600/20"
              >
                Learn more about our vision 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* RIGHT Dashboard Mockup */}
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-cyan-100 rounded-2xl rotate-12 -z-10"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full -z-10"></div>
              
              {/* Gradient border frame */}
              <div className="relative p-1 bg-gradient-to-br from-blue-600 via-cyan-400 to-blue-600 rounded-3xl shadow-2xl">
                <div className="bg-white rounded-[22px] overflow-hidden">
                  {/* Fake browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    </div>
                    {/* ✅ CHANGED URL: englishgate.edu.lk */}
                    <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                      englishgate.edu.lk/dashboard
                    </div>
                  </div>
                  {/* ✅ FIXED: Full image display, no cropping */}
                  <div>
                    <img 
                      src="/Dashboard.png" 
                      alt="Dashboard Interface Preview" 
                      className="w-full h-auto block"
                    />
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 flex items-center gap-3 hidden md:flex">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">System Status</p>
                  <p className="text-sm font-bold text-gray-900">All Systems Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. CTA SECTION - Dark with Pattern & Glow
          ✅ FIXED: pb-16 instead of py-24 to remove bottom space
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gray-900 pt-24 pb-16 overflow-hidden">
        
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wide">Start Today</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Start Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              Success Journey?
            </span>
          </h2>
          
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful students who trusted us for their higher education. 
            Register today and get access to free introductory materials.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register" 
              className="group relative bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Register Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/contact" 
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition flex items-center justify-center"
            >
              Contact Support
            </Link>
          </div>
          
          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-10 text-sm">
            {['No Hidden Fees', 'Cancel Anytime', '24/7 Support', 'Free Trial Class'].map((feat) => (
              <div key={feat} className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm text-gray-300 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </main>
  );
}
