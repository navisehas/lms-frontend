"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { getUser, isLoggedIn } from "@/lib/auth";

// Routes users to the correct dashboard based on their role
const ROLE_DASHBOARD = {
  ADMIN:   "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname  = usePathname();

  useEffect(() => {
    const u  = getUser();
    const ok = isLoggedIn();
    setUser(u);
    setLoggedIn(ok);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home",    href: "/" },
    { name: "About",   href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full relative">
      <div className="w-full px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/logo.png" alt="English Gate Logo" width={40} height={40} className="object-contain" />
            <span
              className="whitespace-nowrap font-extrabold text-xl tracking-tight"
              style={{
                fontFamily: "'Poppins', 'Nunito', 'Segoe UI', sans-serif",
                background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.3px",
              }}
            >
              English Gate <span style={{ fontWeight: 400, WebkitTextFillColor: "transparent" }}>LMS</span>
            </span>
          </Link>

          {/* RIGHT: nav links + auth (Desktop) */}
          <div className="hidden md:flex items-center gap-6">

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="whitespace-nowrap transition-all duration-200"
                style={{
                  fontFamily: "'Poppins', 'Segoe UI', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: pathname === link.href ? "700" : "500",
                  color: pathname === link.href ? "#2563eb" : "#1e3a8a",
                  borderBottom: pathname === link.href ? "2px solid #2563eb" : "2px solid transparent",
                  paddingBottom: "2px",
                  letterSpacing: "0.01em",
                }}
              >
                {link.name}
              </Link>
            ))}

            {/* Login / Dashboard Button */}
            {loggedIn && user ? (
              <Link 
                href={ROLE_DASHBOARD[user.role] || "/student/dashboard"}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            ) : (
              <Link href="/login"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm whitespace-nowrap">
                Login
              </Link>
            )}
          </div>

          {/* Hamburger (Mobile) */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DROPDOWN OVERLAY ── */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t shadow-2xl z-50 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-2">
            
            {/* Mobile Links */}
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600 font-bold border border-blue-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 border border-transparent"
                }`}>
                {link.name}
              </Link>
            ))}

            <div className="pt-4 mt-2 border-t border-gray-100">
              {/* Mobile Login / Dashboard Button */}
              {loggedIn && user ? (
                <Link href={ROLE_DASHBOARD[user.role] || "/student/dashboard"} onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                  <LayoutDashboard size={18} />
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full bg-blue-600 text-white px-4 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                  Student / Staff Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
