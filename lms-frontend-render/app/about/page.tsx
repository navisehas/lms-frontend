"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Target, 
  Lightbulb, 
  Users, 
  Heart, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle,
  GraduationCap,
  Star,
  Eye,
  Compass
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Lecturer {
  user_id: number;
  name: string;
  specialization?: string;
  description?: string;
  profile_picture_url?: string;
}

export default function About() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teachers from the database on component load
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API}/public/teachers`);
        if (res.ok) {
          const data = await res.json();
          setLecturers(data);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const values = [
    {
      icon: Target,
      title: "Excellence",
      desc: "We strive for the highest standards in teaching and student performance.",
      gradient: "from-blue-500 to-blue-700",
      bgGlow: "bg-blue-100"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      desc: "Embracing modern technology (LMS, Online Exams) to make learning smarter.",
      gradient: "from-cyan-500 to-blue-600",
      bgGlow: "bg-cyan-100"
    },
    {
      icon: Heart,
      title: "Student-Centric",
      desc: "Every decision we make is focused on the well-being and success of our students.",
      gradient: "from-blue-600 to-blue-800",
      bgGlow: "bg-blue-100"
    },
    {
      icon: Users,
      title: "Integrity",
      desc: "We maintain transparency with parents regarding attendance and progress.",
      gradient: "from-cyan-400 to-blue-600",
      bgGlow: "bg-cyan-100"
    }
  ];

  return (
    <main className="flex flex-col min-h-screen relative overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION - Modern with Grid Pattern + Glow Orbs
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-16 h-16 border-2 border-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-32 text-center">
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Our Story</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              About Our
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-white">
                Institute
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Empowering the next generation of Sri Lankan professionals through dedication, 
              discipline, and digital innovation.
            </p>

            {/* Mini stats chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {[
                { icon: Users, text: "5,000+ Students" },
                { icon: Award, text: "50+ Teachers" },
                { icon: Star, text: "12 Island Ranks" }
              ].map((chip, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <chip.icon className="w-4 h-4 text-cyan-300" />
                  {chip.text}
                </div>
              ))}
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
          2. VISION & MISSION - Split Layout with Gradient Borders
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        
        {/* Decorative bg elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-60"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* LEFT: Image with decorative frame */}
            <div className="relative mb-12 lg:mb-0">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-cyan-100 rounded-2xl rotate-12 -z-10"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full -z-10"></div>
              
              {/* Gradient border frame */}
              <div className="relative p-1 bg-gradient-to-br from-blue-600 via-cyan-400 to-blue-600 rounded-3xl shadow-2xl">
                <div className="bg-white rounded-[22px] overflow-hidden p-12 flex items-center justify-center min-h-[400px]">
                  <Image 
                    src="/logo.png" 
                    alt="Institute Logo" 
                    width={400} 
                    height={400} 
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. Since</p>
                  <p className="text-sm font-bold text-gray-900">2015</p>
                </div>
              </div>

              {/* Floating badge 2 */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Quality</p>
                  <p className="text-sm font-bold text-gray-900">Accredited</p>
                </div>
              </div>
            </div>
            
            {/* RIGHT: Vision & Mission Cards */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-2">
                <Compass className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wide">Who We Are</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Driven by Purpose,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  Guided by Vision
                </span>
              </h2>

              {/* Vision Card */}
              <div className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Our Vision</h3>
                    <p className="text-gray-600 leading-relaxed">
                      To be the undisputed leader in supplementary education in Sri Lanka, creating a society of intelligent, disciplined, and capable youth.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Card */}
              <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full translate-y-16 -translate-x-16"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold mb-2">Our Mission</h3>
                    <p className="text-blue-100 leading-relaxed">
                      Providing accessible, high-quality education by combining experienced lectures with state-of-the-art technology to ensure every student reaches their full potential.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. CORE VALUES - Modern Cards with Hover Effects
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        
        {/* Decorative bg pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-4">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Our Core Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              The Principles
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                That Guide Us
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Four pillars that shape every decision we make and every student we serve.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Decorative bg circle */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${val.bgGlow} rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${val.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform`}>
                    <val.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">{val.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-b-3xl transition-all duration-500 w-0 group-hover:w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. EXPERT PANEL - Dynamic Team Cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        
        {/* Decorative glow orbs */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-4">
              <Award className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Meet The Experts</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Learn From the
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Best in Sri Lanka
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Our greatest asset is our teaching staff. We have brought together the island's most experienced and qualified lecturers.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <Loader2 className="absolute top-0 left-0 animate-spin w-16 h-16 text-blue-600" />
              </div>
              <p className="text-gray-500 font-medium mt-4">Loading our experts...</p>
            </div>
          ) : lecturers.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-dashed border-blue-200 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Teachers list is currently empty.</p>
              <p className="text-sm text-gray-500 mt-1">Check back soon to meet our amazing team.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {lecturers.map((lec) => (
                <div 
                  key={lec.user_id} 
                  className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                >
                  {/* Gradient header with glow */}
                  <div className="relative h-28 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
                    {/* Grid pattern overlay */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}
                    />
                    {/* Glow orb */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400 rounded-full mix-blend-screen filter blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-screen filter blur-2xl opacity-30"></div>
                  </div>
                  
                  {/* Profile Avatar */}
                  <div className="flex justify-center -mt-14 relative z-10">
                    <div className="relative">
                      {/* Gradient border ring */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full p-1 group-hover:scale-110 transition-transform duration-500">
                        <div className="w-full h-full bg-white rounded-full"></div>
                      </div>
                      <img 
                        src={lec.profile_picture_url || `https://api.dicebear.com/7.x/initials/svg?seed=${lec.name}&backgroundColor=0f172a&textColor=ffffff`} 
                        alt={lec.name} 
                        className="relative w-24 h-24 rounded-full bg-white object-cover m-1"
                      />
                      {/* Verified badge */}
                      <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 text-center flex flex-col flex-1">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-1">{lec.name}</h3>
                    <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-3">
                      {lec.specialization || "Expert Lecturer"}
                    </p>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5 mt-2">
                      {lec.description || "A dedicated professional with a proven track record of guiding students to success."}
                    </p>
                    
                    <Link 
                      href={`/courses?teacher=${lec.user_id}`}
                      className="group/btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/30 mt-auto"
                    >
                      View Courses 
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-b-3xl transition-all duration-500 w-0 group-hover:w-full"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. WHY CHOOSE US STATS - Enhanced Cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-100 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Our Impact in Numbers
            </h2>
            <p className="text-gray-600">
              A decade of dedication, thousands of success stories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "10+", label: "Years of Excellence", icon: Award },
              { number: "5,000+", label: "Students Taught", icon: Users },
              { number: "50+", label: "Expert Teachers", icon: GraduationCap },
              { number: "98%", label: "Satisfaction Rate", icon: TrendingUp }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="group relative bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-4 right-4 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <stat.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-1 tracking-tight">
                  {stat.number}
                </h3>
                <p className="text-gray-600 font-medium text-sm">{stat.label}</p>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-b-2xl transition-all duration-300 w-0 group-hover:w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. CTA SECTION - Dark with Pattern & Glow
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
            <span className="text-sm font-bold uppercase tracking-wide">Join Our Community</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Want to Learn from
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              The Best?
            </span>
          </h2>

          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover our wide range of courses taught by Sri Lanka's top educators. 
            Your journey to excellence starts with one click.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/courses" 
              className="group relative bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              View Our Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/contact" 
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition flex items-center justify-center"
            >
              Contact Us
            </Link>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-10 text-sm">
            {['Expert Lecturers', 'Modern Tech', 'Proven Results', 'Flexible Learning'].map((feat) => (
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
