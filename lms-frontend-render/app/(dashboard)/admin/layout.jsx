"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, DollarSign, Globe,
  Settings, Menu, X, LogOut, Shield, MessageSquare,
  Building2, Bell,
} from "lucide-react";
import { guardRoute, logout } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const authorised = guardRoute("ADMIN", router);
    if (authorised) setUser(authorised);
  }, [router]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    { name: "Dashboard",        href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "User Management",  href: "/admin/users",     icon: <Users size={20} /> },
    { name: "Courses",          href: "/admin/courses",   icon: <BookOpen size={20} /> },
    { name: "Payment History",  href: "/admin/payments",  icon: <DollarSign size={20} /> },
    { name: "Institute Income", href: "/admin/income",    icon: <Building2 size={20} /> },
    { name: "Feedback",         href: "/admin/feedback",  icon: <MessageSquare size={20} /> },
    { name: "Website CMS",      href: "/admin/cms",       icon: <Globe size={20} /> },
    { name: "Settings",         href: "/admin/settings",  icon: <Settings size={20} /> },
  ];

  const BRAND = "#1E40AF"; // blue-900 equivalent
  const BRAND_BG = "#DBEAFE";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR — fixed full-width ── */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b shadow-sm
                   flex items-center justify-between px-4 md:px-8"
      >
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          {/* Logo area — aligns with sidebar width on desktop */}
          <div className="hidden md:flex items-center gap-2" style={{ width: "200px" }}>
            <Shield size={22} style={{ color: BRAND }} />
            <span className="text-lg font-bold tracking-wide" style={{ color: BRAND }}>
              Admin Console
            </span>
          </div>

          <h2 className="text-lg font-semibold text-gray-700 hidden sm:block">
            Welcome back, {user.name.split(" ")[0]}
          </h2>
        </div>

        {/* Right side — user info + avatar */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <button className="p-2 text-gray-400 hover:text-blue-800 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user.name}</p>
              <p className="text-xs font-bold" style={{ color: BRAND }}>Administrator</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: BRAND_BG, color: BRAND }}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY BELOW NAVBAR ── */}
      <div className="flex pt-16 min-h-screen">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside
          style={{ backgroundColor: BRAND, width: "256px", top: "64px" }}
          className={`fixed left-0 bottom-0 z-30 flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          {/* Mobile brand header */}
          <div
            className="h-14 flex items-center px-6 gap-2 flex-shrink-0 md:hidden"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
          >
            <Shield className="text-blue-200" size={20} />
            <span className="text-lg font-bold tracking-wide text-white">Admin Console</span>
            <button className="ml-auto text-blue-200" onClick={() => setSidebarOpen(false)}>
              <X size={22} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={
                  pathname === item.href
                    ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff" }
                    : { color: "#BFDBFE" }
                }
                onMouseEnter={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== item.href) {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "#BFDBFE";
                  }
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <button
              onClick={() => logout(router)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              style={{ color: "#BFDBFE" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.color = "#BFDBFE";
              }}
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 min-w-0 md:ml-64 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
