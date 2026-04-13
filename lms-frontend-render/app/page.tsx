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
  X
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [popupData, setPopupData] = useState<{ image_url: string } | null>(null);

  useEffect(() => {
    // Fetch dynamic popup data from the backend
    const fetchPopupData = async () => {
      try {
        const res = await fetch(`${API}/public/popup`);
        if (res.ok) {
          const data = await res.json();
          // Only show if the admin has toggled it to 'active' AND an image exists
          if (data && data.is_active && data.image_url) {
            setPopupData(data);
            
            // 🛠️ DEVELOPMENT MODE: Session storage is disabled so you can test it!
            // To make it show only once per session in production, uncomment the "popupSeen" lines.
            // const popupSeen = sessionStorage.getItem('welcomePopupSeen');
            // if (!popupSeen) {
              const timer = setTimeout(() => {
                setShowPopup(true);
                setTimeout(() => setIsFadingIn(true), 50); 
              }, 500); // Shows popup after 0.5 seconds
              return () => clearTimeout(timer);
            // }
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
      // sessionStorage.setItem('welcomePopupSeen', 'true'); // Disabled for testing
    }, 300); 
  };

  return (
    <main className="flex flex-col min-h-screen relative">
      
      {/* ─── DYNAMIC WELCOME POPUP MODAL ─── */}
      {showPopup && popupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isFadingIn ? "opacity-100" : "opacity-0"
            }`}
            onClick={closePopup}
          />

          {/* Modal Content (Image Only) */}
          <div 
            className={`relative max-w-2xl w-full z-10 flex flex-col items-center justify-center transform transition-all duration-300 ease-out ${
              isFadingIn ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            {/* Close Button hovering outside/corner of image */}
            <button 
              onClick={closePopup}
              className="absolute -top-4 -right-4 md:-right-6 z-20 bg-black/70 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg border border-white/20"
              aria-label="Close popup"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Dynamic Image from DB */}
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
      {/* ─── END POPUP ─── */}

      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white opacity-5 transform skew-x-12 translate-x-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 rounded-full px-4 py-1.5 border border-blue-400/30 mb-8 backdrop-blur-sm">
            <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-sm font-medium text-blue-100">Admissions Open for 2026 Batch</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Master Your Future <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
              With Hybrid Learning
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Sri Lanka's most advanced LMS. Experience the perfect blend of physical classes and smart online education with automated attendance and instant exam results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              href="/courses" 
              className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:bg-blue-50 transition transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2"
            >
              Find Your Course <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition flex items-center justify-center"
            >
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-extrabold text-blue-600">5,000+</h3>
              <p className="text-gray-600 font-medium">Active Students</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-extrabold text-blue-600">50+</h3>
              <p className="text-gray-600 font-medium">Expert Teachers</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-extrabold text-blue-600">100%</h3>
              <p className="text-gray-600 font-medium">Syllabus Coverage</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-extrabold text-blue-600">12</h3>
              <p className="text-gray-600 font-medium">Island Top Ranks</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">Why Choose Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Technology Driven Education
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              We don't just teach; we provide an ecosystem for success using the latest educational technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Attendance</h3>
              <p className="text-gray-600 leading-relaxed">
                Seamless entry with QR Code scanning. Parents receive instant SMS notifications when their child enters and leaves the institute.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <MonitorPlay className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">HD Video Recordings</h3>
              <p className="text-gray-600 leading-relaxed">
                Missed a class? No problem. Access high-quality recordings of every lecture and downloadable PDF notes anytime, anywhere.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Exam Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Participate in MCQ exams online with auto-marking. Get instant results, rank analysis, and performance tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GRID CONTENT */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                A Complete Learning Ecosystem
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform integrates everything a student needs to succeed in one simple dashboard.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Secure Online Fee Payments (PayHere)",
                  "Chat with Teachers & Doubt Solving",
                  "Automated Progress Reports",
                  "Mobile-Friendly Learning App"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link href="/about" className="text-blue-600 font-bold hover:text-blue-800 inline-flex items-center gap-1">
                  Learn more about our vision <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-3 opacity-10"></div>
              <div className="relative bg-white rounded-2xl h-96 overflow-hidden shadow-lg border border-gray-200">
                <img 
                  src="/Dashboard.png" 
                  alt="Dashboard Interface Preview" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of successful students who trusted us for their higher education. 
            Register today and get access to free introductory materials.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Register Now
            </Link>
            <Link 
              href="/contact" 
              className="bg-gray-800 text-gray-300 px-8 py-3 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
      
    </main>
  );
}