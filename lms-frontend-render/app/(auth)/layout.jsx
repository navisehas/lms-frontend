import Link from "next/link";
import { Sparkles, Star, TrendingUp } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="h-screen grid lg:grid-cols-2 overflow-hidden">
      
      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDE: Brand Showcase (unchanged)
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-10">
        
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Glowing Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-32 right-20 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 border-2 border-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 right-32 w-12 h-12 border-2 border-white/20 rounded-lg rotate-45 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* TOP: Empty */}
        <div className="relative z-10"></div>

        {/* MIDDLE: Hero Content */}
        <div className="relative z-10 max-w-md space-y-5">
          
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-wide">Premium LMS Platform</span>
          </div>

          <h2 className="text-5xl font-extrabold tracking-tight leading-[1.05]">
            Welcome
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-white">
              Back!
            </span>
          </h2>

          <p className="text-blue-100 text-base leading-relaxed">
            "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hover:bg-white/15 transition-all overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-extrabold text-2xl tracking-tight">5K+</h3>
                <div className="w-7 h-7 bg-cyan-400/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
              <p className="text-xs text-blue-200 font-medium">Active Students</p>
            </div>
            
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl hover:bg-white/15 transition-all overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-extrabold text-2xl tracking-tight">100%</h3>
                <div className="w-7 h-7 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                </div>
              </div>
              <p className="text-xs text-blue-200 font-medium">Success Rate</p>
            </div>
          </div>

          {/* Trust Avatars */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-blue-900 flex items-center justify-center text-xs font-bold">SP</div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-900 flex items-center justify-center text-xs font-bold">RK</div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-blue-900 flex items-center justify-center text-xs font-bold">AM</div>
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-blue-200">Trusted by thousands</p>
            </div>
          </div>
        </div>

        {/* BOTTOM: Copyright */}
        <div className="relative z-10 text-xs text-blue-300/80">
          &copy; 2026 English Gate LMS. All rights reserved.
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT SIDE: Clean White with Subtle Accents
          User-friendly, professional, welcoming
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative flex flex-col justify-center items-center p-6 overflow-hidden bg-white">
        
        {/* Very subtle background accents - just enough to not be plain */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/3"></div>
        
        {/* Very subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* ═══ CLEAN WHITE CARD WITH SUBTLE SHADOW ═══ */}
        <div className="relative w-full max-w-sm z-10">
          
          {/* Subtle blue glow behind card */}
          <div className="absolute -inset-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl blur-2xl opacity-50"></div>
          
          {/* The Card - Clean white with shadow */}
          <div className="relative bg-white rounded-3xl shadow-xl shadow-blue-500/10 border border-gray-100 p-7 overflow-hidden">
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
            
            {children}
          </div>
        </div>
      </div>
      
    </div>
  );
}
