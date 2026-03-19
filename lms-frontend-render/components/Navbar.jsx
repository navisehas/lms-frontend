"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, User } from "lucide-react";
import Image from "next/image";
import { getUser, isLoggedIn, logout } from "@/lib/auth";

// All roles use the same blue pill style
const ROLE_COLORS = {
  ADMIN:   { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600" },
  MANAGER: { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600" },
  TEACHER: { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600" },
  STUDENT: { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-600" },
};

const ROLE_DASHBOARD = {
  ADMIN:   "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

const ROLE_PROFILE = {
  ADMIN:   "/admin/users",
  MANAGER: "/manager/students",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/profile",
};

export default function Navbar() {
  const [isOpen, setIsOpen]         = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const [user, setUser]             = useState(null);
  const [loggedIn, setLoggedIn]     = useState(false);
  const pathname  = usePathname();
  const router    = useRouter();
  const dropRef   = useRef(null);

  useEffect(() => {
    const u  = getUser();
    const ok = isLoggedIn();
    setUser(u);
    setLoggedIn(ok);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    setDropdown(false);
    setIsOpen(false);
    logout(router);
  };

  const navLinks = [
    { name: "Home",    href: "/" },
    { name: "About",   href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const colors   = user ? (ROLE_COLORS[user.role] || ROLE_COLORS.STUDENT) : null;
  const initials = user
    ? (user.name
        ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : (user.user_id || "?").slice(0, 2).toUpperCase())
    : "";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
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

          {/* RIGHT: nav links + auth */}
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

            {loggedIn && user ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdown((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${colors.bg} ${colors.text} border-current hover:opacity-90`}
                >
                  <span className={`w-7 h-7 rounded-full ${colors.badge} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                    {initials}
                  </span>
                  <span className="text-sm font-semibold max-w-[120px] truncate">
                    {user.name || user.user_id}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className={`px-4 py-3 ${colors.bg}`}>
                      <p className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>{user.role}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{user.name || user.user_id}</p>
                      {user.name && <p className="text-xs text-gray-500 truncate">{user.user_id}</p>}
                    </div>
                    <div className="py-1">
                      <Link href={ROLE_DASHBOARD[user.role] || "/"} onClick={() => setDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={16} className="text-gray-400" /> Dashboard
                      </Link>
                      <Link href={ROLE_PROFILE[user.role] || "/"} onClick={() => setDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={16} className="text-gray-400" /> My Profile
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}>
                {link.name}
              </Link>
            ))}

            <div className="pt-2">
              {loggedIn && user ? (
                <>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-2 ${colors.bg}`}>
                    <span className={`w-9 h-9 rounded-full ${colors.badge} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${colors.text}`}>{user.name || user.user_id}</p>
                      <p className={`text-xs font-bold ${colors.text} opacity-70`}>{user.role}</p>
                    </div>
                  </div>
                  <Link href={ROLE_DASHBOARD[user.role] || "/"} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href={ROLE_PROFILE[user.role] || "/"} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    <User size={16} /> My Profile
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-1">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}