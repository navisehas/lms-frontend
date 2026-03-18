"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  QrCode,
  MonitorPlay,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Bell,
  Star,
  Users,
  Award,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #0d1b4b;
          color: #fff;
          overflow-x: hidden;
        }

        /* ─── LIQUID GLASS BASE ──────────────────────────────── */
        .lx {
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(28px) saturate(180%) brightness(1.05);
          -webkit-backdrop-filter: blur(28px) saturate(180%) brightness(1.05);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow:
            0 8px 32px rgba(15,40,120,0.25),
            inset 0 1px 0 rgba(255,255,255,0.30),
            inset 0 -1px 0 rgba(0,20,80,0.18);
        }

        .lx-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(36px) saturate(200%) brightness(1.08);
          -webkit-backdrop-filter: blur(36px) saturate(200%) brightness(1.08);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow:
            0 24px 64px rgba(10,30,100,0.30),
            inset 0 1px 0 rgba(255,255,255,0.28),
            inset 0 -1px 0 rgba(0,20,80,0.12),
            0 0 0 0.5px rgba(255,255,255,0.08);
          transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
        }

        .lx-card:hover {
          background: rgba(255,255,255,0.13);
          border-color: rgba(255,255,255,0.30);
          transform: translateY(-8px) scale(1.015);
          box-shadow:
            0 40px 90px rgba(10,30,100,0.40),
            inset 0 1px 0 rgba(255,255,255,0.35),
            0 0 40px rgba(96,165,250,0.18);
        }

        /* ─── NAVBAR ─────────────────────────────────────────── */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 0 1rem;
          transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
        }

        .navbar-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          padding: 0 1.75rem;
          border-radius: 0 0 1.5rem 1.5rem;
          transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
        }

        .navbar-scrolled .navbar-inner {
          margin-top: 10px;
          border-radius: 2rem;
          background: rgba(10,22,66,0.58);
          backdrop-filter: blur(44px) saturate(200%) brightness(1.08);
          -webkit-backdrop-filter: blur(44px) saturate(200%) brightness(1.08);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow:
            0 20px 60px rgba(10,30,120,0.35),
            inset 0 1px 0 rgba(255,255,255,0.26),
            inset 0 -1px 0 rgba(0,20,80,0.14);
        }

        .nav-logo {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.4rem;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #fff 30%, #93c5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          list-style: none;
        }

        .nav-link {
          color: rgba(255,255,255,0.65);
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.10);
        }

        .nav-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 700;
          padding: 0.58rem 1.4rem;
          border-radius: 999px;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(59,130,246,0.45), inset 0 1px 0 rgba(255,255,255,0.28);
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .nav-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(59,130,246,0.55);
        }

        .nav-login {
          color: rgba(255,255,255,0.70);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nav-login:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        /* Mobile */
        .mob-toggle {
          display: none;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.20);
          border-radius: 12px;
          padding: 0.48rem;
          color: #fff;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
        }

        .mobile-menu {
          background: rgba(10,22,66,0.88);
          backdrop-filter: blur(44px);
          -webkit-backdrop-filter: blur(44px);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 1.5rem;
          margin: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 24px 64px rgba(10,30,100,0.50), inset 0 1px 0 rgba(255,255,255,0.14);
        }

        .mobile-link {
          display: block;
          color: rgba(255,255,255,0.70);
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .mobile-link:hover { background: rgba(255,255,255,0.08); color: #fff; }

        /* ─── HERO BG ─────────────────────────────────────────── */
        .hero-bg {
          background:
            radial-gradient(ellipse 130% 90% at 5% 10%, rgba(37,99,235,0.60) 0%, transparent 55%),
            radial-gradient(ellipse 80% 60% at 95% 5%,  rgba(59,130,246,0.40) 0%, transparent 50%),
            radial-gradient(ellipse 100% 70% at 50% 110%, rgba(29,78,216,0.55) 0%, transparent 55%),
            linear-gradient(160deg, #0d1b4b 0%, #0f2460 45%, #163080 70%, #0d1b4b 100%);
        }

        .mesh {
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 58px 58px;
        }

        /* ─── ORBS ───────────────────────────────────────────── */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
        }

        @keyframes drift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-35px) scale(1.06); }
          66%      { transform: translate(-25px,25px) scale(0.94); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-35px,40px) scale(1.08); }
          75%      { transform: translate(30px,-20px) scale(0.96); }
        }
        @keyframes drift3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,30px) scale(1.04); }
        }

        .orb-a { width:600px;height:600px; background:radial-gradient(circle,rgba(59,130,246,0.48) 0%,transparent 68%); filter:blur(72px); top:-150px; left:-100px; animation:drift1 9s ease-in-out infinite; }
        .orb-b { width:480px;height:480px; background:radial-gradient(circle,rgba(96,165,250,0.38) 0%,transparent 68%); filter:blur(65px); top:40%; right:-80px; animation:drift2 11s ease-in-out infinite; }
        .orb-c { width:380px;height:380px; background:radial-gradient(circle,rgba(147,197,253,0.30) 0%,transparent 68%); filter:blur(60px); bottom:0; left:35%; animation:drift3 7s ease-in-out infinite; }

        /* ─── TYPE ───────────────────────────────────────────── */
        .display { font-family: 'Outfit', sans-serif; font-weight: 900; letter-spacing: -0.04em; line-height: 1; }

        @keyframes shimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        .shine {
          background: linear-gradient(90deg, #93c5fd 0%, #fff 25%, #60a5fa 50%, #bfdbfe 75%, #93c5fd 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        /* ─── BUTTONS ────────────────────────────────────────── */
        .btn-blue {
          display:inline-flex; align-items:center; gap:0.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color:#fff; font-weight:700; font-size:1rem;
          padding:1rem 2.2rem; border-radius:999px; text-decoration:none;
          box-shadow: 0 10px 30px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.28);
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .btn-blue:hover {
          transform:translateY(-3px);
          box-shadow: 0 18px 44px rgba(37,99,235,0.60), inset 0 1px 0 rgba(255,255,255,0.32);
        }

        .btn-glass {
          display:inline-flex; align-items:center; justify-content:center;
          color:#fff; font-weight:700; font-size:1rem;
          padding:1rem 2.2rem; border-radius:999px; text-decoration:none;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.26);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.24), 0 4px 16px rgba(0,20,80,0.20);
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .btn-glass:hover {
          background: rgba(255,255,255,0.18);
          transform:translateY(-3px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.32), 0 10px 30px rgba(0,20,80,0.30);
        }

        /* ─── BADGE ──────────────────────────────────────────── */
        .badge {
          display:inline-flex; align-items:center; gap:0.5rem;
          background: rgba(255,255,255,0.10);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.22);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 12px rgba(0,20,80,0.18);
          border-radius:999px; padding: 0.45rem 1.1rem;
          font-size:0.8rem; font-weight:600; color:rgba(255,255,255,0.85); letter-spacing:0.02em;
        }

        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.78); }
        }
        .live-dot { width:7px;height:7px;border-radius:50%;background:#4ade80;animation:pulse-dot 1.8s ease-in-out infinite;flex-shrink:0; }

        /* ─── PARTICLES ──────────────────────────────────────── */
        @keyframes rise {
          0%  { transform:translateY(0) scale(1); opacity:0.55; }
          100%{ transform:translateY(-100px) scale(0); opacity:0; }
        }
        .pt { position:absolute; border-radius:50%; background:rgba(147,197,253,0.65); animation:rise linear infinite; }

        /* ─── STAT NUMBER ────────────────────────────────────── */
        .stat-num {
          font-family:'Outfit',sans-serif; font-weight:800; font-size:2.1rem;
          background:linear-gradient(135deg,#fff 30%,#93c5fd 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        /* ─── SEC LABEL ──────────────────────────────────────── */
        .sec-label {
          display:inline-flex; align-items:center; gap:0.5rem;
          background:rgba(59,130,246,0.16);
          border:1px solid rgba(59,130,246,0.35);
          backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          border-radius:999px; padding:0.35rem 1rem;
          font-size:0.72rem; font-weight:700; letter-spacing:0.1em;
          color:#93c5fd; text-transform:uppercase;
        }

        /* ─── SECTION BACKGROUNDS ────────────────────────────── */
        .sec-blue {
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.20) 0%, transparent 60%),
            linear-gradient(180deg, #0d1b4b 0%, #111f55 100%);
        }
        .sec-mid {
          background:
            radial-gradient(ellipse 70% 60% at 80% 50%, rgba(29,78,216,0.22) 0%, transparent 60%),
            linear-gradient(180deg, #111f55 0%, #0d1b4b 100%);
        }
        .sec-dark { background: linear-gradient(180deg, #0d1b4b 0%, #091540 100%); }

        /* ─── CHECK ITEMS ────────────────────────────────────── */
        .check-item {
          display:flex; align-items:center; gap:0.85rem;
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          border:1px solid rgba(255,255,255,0.10);
          border-radius:14px; padding:0.9rem 1.1rem;
          transition:all 0.3s ease;
        }
        .check-item:hover {
          background:rgba(59,130,246,0.13);
          border-color:rgba(96,165,250,0.35);
          transform:translateX(6px);
        }

        /* ─── DASHBOARD FRAME ────────────────────────────────── */
        .dash-frame {
          background:rgba(255,255,255,0.06);
          backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px);
          border:1px solid rgba(255,255,255,0.14);
          border-radius:24px; overflow:hidden;
          box-shadow:
            0 48px 120px rgba(10,30,100,0.55),
            inset 0 1px 0 rgba(255,255,255,0.18),
            0 0 0 0.5px rgba(255,255,255,0.06);
        }
        .dash-bar {
          height:38px;
          background:rgba(255,255,255,0.05);
          border-bottom:1px solid rgba(255,255,255,0.08);
          display:flex; align-items:center; gap:6px; padding:0 14px;
        }

        /* ─── FLOAT BADGES ───────────────────────────────────── */
        .float-badge {
          position:absolute;
          background:rgba(10,22,66,0.68);
          backdrop-filter:blur(30px) saturate(180%); -webkit-backdrop-filter:blur(30px) saturate(180%);
          border:1px solid rgba(255,255,255,0.18);
          box-shadow:0 16px 48px rgba(10,30,100,0.40), inset 0 1px 0 rgba(255,255,255,0.20);
          border-radius:18px; padding:0.75rem 1rem;
          display:flex; align-items:center; gap:0.75rem; min-width:172px;
        }

        /* ─── CTA WRAP ───────────────────────────────────────── */
        .cta-wrap {
          background:rgba(37,99,235,0.10);
          backdrop-filter:blur(44px) saturate(180%); -webkit-backdrop-filter:blur(44px) saturate(180%);
          border:1px solid rgba(96,165,250,0.28);
          border-radius:32px;
          box-shadow:
            0 48px 120px rgba(10,30,120,0.30),
            inset 0 1px 0 rgba(255,255,255,0.18),
            0 0 80px rgba(37,99,235,0.12);
        }

        /* ─── DIVIDER ────────────────────────────────────────── */
        .div-line {
          height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15) 50%,transparent);
        }

        /* ─── FADE UP ────────────────────────────────────────── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fu  { opacity:0; animation:fadeUp 0.75s cubic-bezier(0.23,1,0.32,1) forwards; }
        .d1  { animation-delay:0.05s; }
        .d2  { animation-delay:0.15s; }
        .d3  { animation-delay:0.25s; }
        .d4  { animation-delay:0.35s; }
        .d5  { animation-delay:0.45s; }
        .d6  { animation-delay:0.55s; }

        /* ─── RESPONSIVE ─────────────────────────────────────── */
        @media(max-width:768px){
          .hide-mob { display:none !important; }
          .mob-toggle { display:flex !important; }
          .g3 { grid-template-columns:1fr !important; }
          .g2 { grid-template-columns:1fr !important; }
          .float-badge { display:none !important; }
          .hero-h { font-size:clamp(3rem,13vw,5rem) !important; }
        }

        ::-webkit-scrollbar{ width:6px; }
        ::-webkit-scrollbar-track{ background:#0d1b4b; }
        ::-webkit-scrollbar-thumb{ background:rgba(96,165,250,0.40); border-radius:99px; }
      `}</style>

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">🎓 EduLanka</Link>

          {/* Desktop links */}
          <ul className="nav-links hide-mob">
            {["Courses","Teachers","Results","About","Contact"].map((l) => (
              <li key={l}><Link href={`/${l.toLowerCase()}`} className="nav-link">{l}</Link></li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hide-mob" style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <Link href="/login" className="nav-login">Login</Link>
            <Link href="/register" className="nav-btn">Get Started</Link>
          </div>

          {/* Mobile toggle */}
          <button className="mob-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="mobile-menu">
            {["Courses","Teachers","Results","About","Contact"].map((l)=>(
              <Link key={l} href={`/${l.toLowerCase()}`} className="mobile-link">{l}</Link>
            ))}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.10)", marginTop:"0.75rem", paddingTop:"0.75rem", display:"flex", gap:"0.75rem" }}>
              <Link href="/login" className="mobile-link" style={{ flex:1, textAlign:"center" }}>Login</Link>
              <Link href="/register" className="btn-blue" style={{ flex:1, justifyContent:"center", fontSize:"0.875rem", padding:"0.65rem 1rem" }}>Register</Link>
            </div>
          </div>
        )}
      </nav>

      <main style={{ paddingTop:"68px" }}>

        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="hero-bg mesh" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="orb orb-c" />

          {Array.from({length:14}).map((_,i)=>(
            <div key={i} className="pt" style={{
              left:`${6+i*7}%`, bottom:`${5+(i%5)*12}%`,
              width:i%4===0?"6px":"3px", height:i%4===0?"6px":"3px",
              animationDuration:`${3.5+(i%4)*0.8}s`, animationDelay:`${i*0.35}s`,
              opacity:0.35+(i%4)*0.12,
            }}/>
          ))}

          <div style={{ position:"relative", zIndex:10, maxWidth:"1100px", margin:"0 auto", padding:"6rem 1.5rem", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", width:"100%" }}>
            <div className="badge fu d1" style={{ marginBottom:"2rem" }}>
              <span className="live-dot"/>
              Admissions Open for 2026 Batch
              <Sparkles size={13} color="#60a5fa"/>
            </div>

            <h1 className="display hero-h fu d2" style={{ fontSize:"clamp(3.5rem,9vw,7rem)", marginBottom:"1.25rem", color:"#fff" }}>
              Master Your<br/>
              <span className="shine">Future.</span>
            </h1>

            <p className="fu d3" style={{ fontSize:"1.1rem", color:"rgba(255,255,255,0.52)", maxWidth:"540px", lineHeight:"1.75", marginBottom:"2.5rem", fontWeight:400 }}>
              Sri Lanka's most advanced hybrid LMS. Smart attendance, HD class recordings, and real-time exam results — all in one beautiful platform.
            </p>

            <div className="fu d4" style={{ display:"flex", flexWrap:"wrap", gap:"1rem", justifyContent:"center", marginBottom:"4rem" }}>
              <Link href="/courses" className="btn-blue">Find Your Course <ArrowRight size={17}/></Link>
              <Link href="/login" className="btn-glass">Student Login</Link>
            </div>

            {/* Stat tiles */}
            <div className="fu d5 g3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", width:"100%", maxWidth:"780px" }}>
              {[
                { icon:<Users size={16} color="#60a5fa"/>, val:"5,000+", label:"Students" },
                { icon:<GraduationCap size={16} color="#60a5fa"/>, val:"50+", label:"Teachers" },
                { icon:<Award size={16} color="#60a5fa"/>, val:"12", label:"Top Ranks" },
                { icon:<Star size={16} color="#60a5fa"/>, val:"100%", label:"Syllabus" },
              ].map((s,i)=>(
                <div key={i} className="lx" style={{ borderRadius:"18px", padding:"1.1rem 0.75rem", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem" }}>
                  {s.icon}
                  <span className="stat-num">{s.val}</span>
                  <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.42)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"120px", background:"linear-gradient(transparent,#0d1b4b)", pointerEvents:"none" }}/>
        </section>

        {/* ═══════════════════ FEATURES ═══════════════════ */}
        <section className="sec-blue mesh" style={{ padding:"6rem 1.5rem", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"700px", height:"400px", background:"radial-gradient(ellipse,rgba(37,99,235,0.14) 0%,transparent 70%)", filter:"blur(40px)", pointerEvents:"none" }}/>

          <div style={{ maxWidth:"1100px", margin:"0 auto", position:"relative", zIndex:1 }}>
            <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
              <div className="sec-label" style={{ marginBottom:"1rem" }}>
                <Sparkles size={12}/> Why Choose Us
              </div>
              <h2 className="display" style={{ fontSize:"clamp(2rem,5vw,3.2rem)", color:"#fff", marginBottom:"0.75rem" }}>
                Technology Driven<br/>
                <span style={{ background:"linear-gradient(90deg,#60a5fa,#93c5fd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Education</span>
              </h2>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"1rem", maxWidth:"460px", margin:"0 auto", lineHeight:"1.7" }}>
                An ecosystem built for success using the most advanced educational technology.
              </p>
            </div>

            <div className="g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.25rem" }}>
              {[
                { icon:<QrCode size={26} color="#60a5fa"/>, tag:"Instant Alerts", title:"Smart Attendance", desc:"Seamless QR code entry. Parents get live SMS when their child arrives or leaves.", accent:"rgba(59,130,246,0.18)", border:"rgba(96,165,250,0.25)", glow:"rgba(59,130,246,0.15)" },
                { icon:<MonitorPlay size={26} color="#93c5fd"/>, tag:"On Demand", title:"HD Recordings", desc:"Access crystal-clear lecture recordings and downloadable PDF notes anytime, anywhere.", accent:"rgba(96,165,250,0.14)", border:"rgba(147,197,253,0.22)", glow:"rgba(96,165,250,0.12)" },
                { icon:<Clock size={26} color="#bfdbfe"/>, tag:"Auto Graded", title:"Instant Results", desc:"Auto-marked MCQ exams with real-time scores, rank analytics and performance tracking.", accent:"rgba(147,197,253,0.12)", border:"rgba(191,219,254,0.20)", glow:"rgba(147,197,253,0.10)" },
              ].map((f,i)=>(
                <div key={i} className="lx-card" style={{ borderRadius:"24px", padding:"2rem", boxShadow:`0 24px 64px rgba(10,30,100,0.30), inset 0 1px 0 rgba(255,255,255,0.28), 0 0 40px ${f.glow}` }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:f.accent, border:`1px solid ${f.border}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem", boxShadow:`0 0 20px ${f.glow}` }}>
                    {f.icon}
                  </div>
                  <span style={{ display:"inline-block", background:f.accent, border:`1px solid ${f.border}`, borderRadius:999, padding:"0.25rem 0.8rem", fontSize:"0.7rem", fontWeight:700, color:"#93c5fd", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.85rem" }}>{f.tag}</span>
                  <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"1.2rem", color:"#fff", marginBottom:"0.65rem" }}>{f.title}</h3>
                  <p style={{ color:"rgba(255,255,255,0.46)", fontSize:"0.88rem", lineHeight:"1.7" }}>{f.desc}</p>
                  <div style={{ marginTop:"1.5rem", height:1, background:`linear-gradient(90deg,${f.border},transparent)` }}/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ ECOSYSTEM ═══════════════════ */}
        <section className="sec-mid mesh" style={{ padding:"6rem 1.5rem", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", bottom:0, right:0, width:"500px", height:"500px", background:"radial-gradient(circle,rgba(37,99,235,0.16) 0%,transparent 70%)", filter:"blur(60px)", pointerEvents:"none" }}/>

          <div style={{ maxWidth:"1100px", margin:"0 auto", position:"relative", zIndex:1 }}>
            <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }}>
              {/* Left */}
              <div>
                <div className="sec-label" style={{ marginBottom:"1.25rem" }}>
                  <BookOpen size={12}/> Complete Ecosystem
                </div>
                <h2 className="display" style={{ fontSize:"clamp(1.8rem,4.5vw,3rem)", color:"#fff", lineHeight:1.1, marginBottom:"1rem" }}>
                  Everything You Need,<br/>
                  <span style={{ background:"linear-gradient(90deg,#60a5fa,#bfdbfe)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>One Dashboard.</span>
                </h2>
                <p style={{ color:"rgba(255,255,255,0.44)", lineHeight:"1.75", marginBottom:"2rem", fontSize:"0.93rem" }}>
                  Every tool a student needs to excel — payments, chat, reports, and a mobile app — all seamlessly integrated.
                </p>

                <div style={{ display:"flex", flexDirection:"column", gap:"0.65rem", marginBottom:"2rem" }}>
                  {[
                    "Secure Online Fee Payments (PayHere)",
                    "Chat with Teachers & Doubt Solving",
                    "Automated Progress Reports",
                    "Mobile-Friendly Learning App",
                  ].map((item,i)=>(
                    <div key={i} className="check-item">
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(59,130,246,0.18)", border:"1px solid rgba(96,165,250,0.35)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <CheckCircle size={15} color="#60a5fa"/>
                      </div>
                      <span style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.9rem", fontWeight:500 }}>{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/about" style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", color:"#60a5fa", fontWeight:600, textDecoration:"none", fontSize:"0.9rem" }}>
                  Learn more about our vision <ArrowRight size={15}/>
                </Link>
              </div>

              {/* Right — dashboard */}
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 50% 50%,rgba(37,99,235,0.20),transparent 70%)", filter:"blur(30px)", transform:"scale(1.15)", borderRadius:"24px", pointerEvents:"none" }}/>

                <div className="dash-frame">
                  <div className="dash-bar">
                    {["#ff5f57","#febc2e","#28c840"].map((c,i)=>(
                      <div key={i} style={{ width:11, height:11, borderRadius:"50%", background:c }}/>
                    ))}
                    <div style={{ flex:1, background:"rgba(255,255,255,0.07)", borderRadius:8, height:22, marginLeft:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.68rem" }}>lms.yourplatform.lk</span>
                    </div>
                  </div>
                  <div style={{ height:380, overflow:"hidden", position:"relative" }}>
                    <img src="/Dashboard.png" alt="Dashboard" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 60%,rgba(13,27,75,0.55) 100%)", pointerEvents:"none" }}/>
                  </div>
                </div>

                {/* Notification badge */}
                <div className="float-badge" style={{ top:"3.5rem", right:"-2rem" }}>
                  <div style={{ width:36, height:36, borderRadius:12, background:"rgba(59,130,246,0.25)", border:"1px solid rgba(96,165,250,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Bell size={16} color="#60a5fa"/>
                  </div>
                  <div>
                    <p style={{ color:"#fff", fontSize:"0.76rem", fontWeight:600, marginBottom:2 }}>Result Published</p>
                    <p style={{ color:"rgba(255,255,255,0.40)", fontSize:"0.7rem" }}>Physics MCQ · 98%</p>
                  </div>
                </div>

                {/* Attendance badge */}
                <div className="float-badge" style={{ bottom:"3.5rem", left:"-2rem" }}>
                  <div style={{ width:36, height:36, borderRadius:12, background:"rgba(59,130,246,0.20)", border:"1px solid rgba(96,165,250,0.30)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <QrCode size={16} color="#93c5fd"/>
                  </div>
                  <div>
                    <p style={{ color:"#fff", fontSize:"0.76rem", fontWeight:600, marginBottom:2 }}>Attendance Marked</p>
                    <p style={{ color:"rgba(255,255,255,0.40)", fontSize:"0.7rem" }}>✓ SMS Sent to Parent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ CTA ═══════════════════ */}
        <section className="sec-dark mesh" style={{ padding:"6rem 1.5rem", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"700px", height:"320px", background:"radial-gradient(ellipse,rgba(37,99,235,0.18) 0%,transparent 70%)", filter:"blur(50px)", pointerEvents:"none" }}/>

          <div style={{ maxWidth:"760px", margin:"0 auto", position:"relative", zIndex:1 }}>
            <div className="cta-wrap" style={{ padding:"clamp(2.5rem,6vw,4rem) clamp(1.5rem,5vw,3.5rem)", textAlign:"center" }}>
              <div className="sec-label" style={{ marginBottom:"1.25rem" }}>
                <Sparkles size={12}/> Get Started Today
              </div>

              <h2 className="display shine" style={{ fontSize:"clamp(2rem,5vw,3.2rem)", marginBottom:"1rem" }}>
                Ready to Start<br/>Your Journey?
              </h2>

              <p style={{ color:"rgba(255,255,255,0.44)", lineHeight:"1.75", maxWidth:"420px", margin:"0 auto 2.5rem", fontSize:"0.95rem" }}>
                Join thousands of successful students. Register today and access free introductory materials.
              </p>

              <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
                <Link href="/register" className="btn-blue">Register Now <ArrowRight size={17}/></Link>
                <Link href="/contact" className="btn-glass">Contact Support</Link>
              </div>

              <div className="div-line" style={{ margin:"2.5rem 0 1.25rem" }}/>
              <p style={{ color:"rgba(255,255,255,0.22)", fontSize:"0.76rem", letterSpacing:"0.04em" }}>
                Trusted by 5,000+ students across Sri Lanka · Secure payments via PayHere
              </p>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
