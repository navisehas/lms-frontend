"use client";

import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  QrCode,
  MonitorPlay,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Bell,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <main
      className="flex flex-col min-h-screen font-sans"
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          --glass-white: rgba(255, 255, 255, 0.15);
          --glass-border: rgba(255, 255, 255, 0.3);
          --glass-shadow: rgba(0, 0, 0, 0.15);
          --blue-primary: #0A84FF;
          --blue-deep: #0040C8;
          --purple-accent: #BF5AF2;
          --cyan-accent: #32D2FF;
          --green-accent: #30D158;
        }

        * { box-sizing: border-box; }

        body {
          background: #0a0a1a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* === LIQUID GLASS CORE === */
        .glass {
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.20);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.20),
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 -1px 0 rgba(0,0,0,0.10);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.30),
            0 1px 0 rgba(255, 255, 255, 0.20) inset,
            0 -1px 0 rgba(0, 0, 0, 0.15) inset;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.13);
          border-color: rgba(255, 255, 255, 0.28);
          transform: translateY(-6px) scale(1.01);
          box-shadow:
            0 32px 80px rgba(0, 0, 0, 0.35),
            0 1px 0 rgba(255, 255, 255, 0.30) inset;
        }

        .glass-dark {
          background: rgba(10, 10, 30, 0.45);
          backdrop-filter: blur(30px) saturate(180%);
          -webkit-backdrop-filter: blur(30px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.10);
          box-shadow:
            0 12px 48px rgba(0, 0, 0, 0.40),
            inset 0 1px 0 rgba(255,255,255,0.12);
        }

        /* Liquid orb blob animations */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }

        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(10,132,255,0.5) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(191,90,242,0.4) 0%, transparent 70%);
          top: 200px; right: -80px;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(50,210,255,0.35) 0%, transparent 70%);
          bottom: 0px; left: 30%;
          animation-delay: -5s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            #fff 0%,
            rgba(50,210,255,1) 30%,
            #fff 50%,
            rgba(191,90,242,1) 70%,
            #fff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .pill-badge {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0A84FF 0%, #0060D0 100%);
          box-shadow:
            0 8px 24px rgba(10,132,255,0.35),
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 -1px 0 rgba(0,0,0,0.15);
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(10,132,255,0.45), inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .btn-glass {
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .btn-glass:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .stat-number {
          background: linear-gradient(135deg, #ffffff 0%, #32D2FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .icon-glass {
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.20);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .feature-glow-blue { box-shadow: 0 0 30px rgba(10,132,255,0.2); }
        .feature-glow-purple { box-shadow: 0 0 30px rgba(191,90,242,0.2); }
        .feature-glow-green { box-shadow: 0 0 30px rgba(48,209,88,0.2); }

        .divider-glass {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
        }

        /* Mesh grid background */
        .mesh-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Floating particle dots */
        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0.4; }
          100% { transform: translateY(-120px) scale(0); opacity: 0; }
        }

        .particle {
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          animation: rise 4s ease-in infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }

        .live-dot::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #30D158;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .checklist-item {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.10);
          transition: all 0.3s ease;
        }
        .checklist-item:hover {
          background: rgba(255,255,255,0.10);
          border-color: rgba(10,132,255,0.4);
          transform: translateX(6px);
        }

        .cta-glass {
          background: rgba(10, 132, 255, 0.12);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(10,132,255,0.3);
          box-shadow:
            0 40px 120px rgba(10,132,255,0.2),
            inset 0 1px 0 rgba(255,255,255,0.15),
            0 0 0 1px rgba(10,132,255,0.1);
        }

        /* Scroll fade-in animation */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }

        .section-label {
          background: linear-gradient(135deg, rgba(10,132,255,0.15) 0%, rgba(191,90,242,0.15) 100%);
          border: 1px solid rgba(10,132,255,0.25);
          backdrop-filter: blur(10px);
        }

        /* Dashboard image glass frame */
        .dashboard-frame {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow:
            0 40px 100px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 0 1px rgba(255,255,255,0.05);
        }
      `}</style>

      {/* ============ 1. HERO ============ */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg"
        style={{ background: "linear-gradient(135deg, #040414 0%, #080825 40%, #0c0c2e 100%)" }}
      >
        {/* Liquid orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${8 + i * 8}%`,
              bottom: `${10 + (i % 4) * 15}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 3)}s`,
              width: i % 3 === 0 ? "6px" : "3px",
              height: i % 3 === 0 ? "6px" : "3px",
              opacity: 0.3 + (i % 4) * 0.1,
            }}
          />
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 pill-badge rounded-full px-5 py-2 mb-10 fade-up">
            <span className="relative flex items-center">
              <span className="live-dot relative w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
            </span>
            <span className="text-sm font-medium text-white/80 tracking-wide">
              Admissions Open for 2026 Batch
            </span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none fade-up delay-1">
            <span className="text-white block">Master Your</span>
            <span className="shimmer-text block mt-1">Future.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed fade-up delay-2 font-light">
            Sri Lanka's most advanced hybrid learning platform. Smart attendance, HD recordings, and instant exam results — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-up delay-3">
            <Link
              href="/courses"
              className="btn-primary text-white px-10 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 tracking-wide"
            >
              Find Your Course
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="btn-glass text-white px-10 py-4 rounded-2xl font-semibold text-base flex items-center justify-center tracking-wide"
            >
              Student Login
            </Link>
          </div>

          {/* Floating mini stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 fade-up delay-4">
            {[
              { icon: <Users className="w-4 h-4" />, val: "5,000+", label: "Students" },
              { icon: <GraduationCap className="w-4 h-4" />, val: "50+", label: "Teachers" },
              { icon: <Award className="w-4 h-4" />, val: "12", label: "Top Ranks" },
              { icon: <Star className="w-4 h-4" />, val: "100%", label: "Coverage" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
                <span className="text-blue-400">{s.icon}</span>
                <span className="text-2xl font-bold text-white">{s.val}</span>
                <span className="text-xs text-white/45 tracking-wide uppercase">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #040414)" }}
        />
      </section>

      {/* ============ 2. FEATURES ============ */}
      <section
        className="py-28 relative overflow-hidden mesh-bg"
        style={{ background: "linear-gradient(180deg, #040414 0%, #06061e 100%)" }}
      >
        {/* Subtle orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(10,132,255,0.07) 0%, transparent 70%)", filter: "blur(40px)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 section-label rounded-full px-5 py-2 mb-5">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Technology Driven
              <span className="block text-transparent" style={{
                background: "linear-gradient(90deg, #0A84FF, #BF5AF2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Education</span>
            </h2>
            <p className="text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
              An ecosystem built for success using the most advanced educational technology.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <QrCode className="w-7 h-7" />,
                color: "#0A84FF",
                colorBg: "rgba(10,132,255,0.12)",
                glow: "feature-glow-blue",
                title: "Smart Attendance",
                desc: "Seamless QR Code entry with instant SMS notifications to parents when their child enters or leaves.",
                tag: "Instant Alerts",
              },
              {
                icon: <MonitorPlay className="w-7 h-7" />,
                color: "#BF5AF2",
                colorBg: "rgba(191,90,242,0.12)",
                glow: "feature-glow-purple",
                title: "HD Recordings",
                desc: "Missed a class? Access crystal-clear lecture recordings and downloadable PDF notes anytime, anywhere.",
                tag: "On Demand",
              },
              {
                icon: <Clock className="w-7 h-7" />,
                color: "#30D158",
                colorBg: "rgba(48,209,88,0.12)",
                glow: "feature-glow-green",
                title: "Instant Results",
                desc: "Auto-marked MCQ exams with real-time results, rank analytics, and detailed performance tracking.",
                tag: "Auto Graded",
              },
            ].map((f, i) => (
              <div key={i} className={`glass-card rounded-3xl p-8 ${f.glow}`}>
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: f.colorBg, border: `1px solid ${f.color}33` }}
                >
                  <span style={{ color: f.color }}>{f.icon}</span>
                </div>

                {/* Tag pill */}
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-wide"
                  style={{ background: f.colorBg, color: f.color, border: `1px solid ${f.color}30` }}
                >
                  {f.tag}
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>

                {/* Bottom line accent */}
                <div
                  className="mt-6 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${f.color}60, transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. ECOSYSTEM SECTION ============ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #06061e 0%, #060618 100%)" }}
      >
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(191,90,242,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 section-label rounded-full px-5 py-2 mb-6">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Complete Ecosystem</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
                Everything You Need,<br />
                <span className="text-transparent" style={{
                  background: "linear-gradient(90deg, #32D2FF, #BF5AF2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>In One Dashboard</span>
              </h2>

              <p className="text-white/45 text-base leading-relaxed mb-10">
                Our platform integrates every tool a student needs to excel — from payments to live chat with teachers.
              </p>

              <ul className="space-y-3">
                {[
                  { label: "Secure Online Fee Payments (PayHere)", color: "#30D158" },
                  { label: "Chat with Teachers & Doubt Solving", color: "#0A84FF" },
                  { label: "Automated Progress Reports", color: "#BF5AF2" },
                  { label: "Mobile-Friendly Learning App", color: "#32D2FF" },
                ].map((item, i) => (
                  <li key={i} className="checklist-item rounded-xl px-4 py-3.5 flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    <span className="text-white/75 text-sm font-medium">{item.label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors text-sm"
                >
                  Learn more about our vision
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Dashboard preview */}
            <div className="relative">
              {/* Glow behind */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{ background: "radial-gradient(circle at 50% 50%, rgba(10,132,255,0.15), transparent 70%)", filter: "blur(30px)", transform: "scale(1.1)" }}
              />

              <div className="dashboard-frame relative rounded-3xl overflow-hidden" style={{ height: "420px" }}>
                {/* Top bar mockup */}
                <div
                  className="absolute top-0 left-0 right-0 h-10 flex items-center px-4 gap-2 z-10"
                  style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                  <div
                    className="flex-1 mx-4 h-5 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <span className="text-white/30 text-xs">lms.yourplatform.lk</span>
                  </div>
                </div>

                {/* Dashboard image */}
                <img
                  src="/Dashboard.png"
                  alt="Dashboard Interface Preview"
                  className="w-full h-full object-cover object-top"
                  style={{ paddingTop: "40px" }}
                />

                {/* Overlay gradient for glass feel */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, rgba(10,10,30,0.1) 0%, transparent 40%, rgba(10,10,30,0.4) 100%)" }}
                />
              </div>

              {/* Floating notification badge */}
              <div
                className="absolute -right-4 top-16 glass rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ minWidth: "180px" }}
              >
                <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <Bell className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Result Published</p>
                  <p className="text-white/40 text-xs">Physics MCQ · 98%</p>
                </div>
              </div>

              {/* Floating attendance badge */}
              <div
                className="absolute -left-4 bottom-16 glass rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ minWidth: "165px" }}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <QrCode className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Attendance Marked</p>
                  <p className="text-white/40 text-xs">✓ SMS Sent to Parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4. CTA ============ */}
      <section
        className="py-24 relative overflow-hidden mesh-bg"
        style={{ background: "linear-gradient(180deg, #060618 0%, #040414 100%)" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(10,132,255,0.12) 0%, transparent 70%)", filter: "blur(40px)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="cta-glass rounded-3xl p-12 md:p-16">
            <div className="inline-flex items-center gap-2 section-label rounded-full px-5 py-2 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Get Started Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
              Ready to Start Your
              <span className="block shimmer-text">Journey?</span>
            </h2>

            <p className="text-white/45 mb-10 leading-relaxed">
              Join thousands of successful students who trust us for their higher education. Register today and access free introductory materials.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-primary text-white px-10 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 tracking-wide"
              >
                Register Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="btn-glass text-white px-10 py-4 rounded-2xl font-semibold text-base flex items-center justify-center tracking-wide"
              >
                Contact Support
              </Link>
            </div>

            {/* Trust line */}
            <div className="divider-glass mt-10 mb-6" />
            <p className="text-white/25 text-xs tracking-wide">
              Trusted by 5,000+ students across Sri Lanka · Secure payments via PayHere
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
