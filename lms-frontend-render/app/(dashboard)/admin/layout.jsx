"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  MessageSquare,
  User,
  Building2,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { guardRoute, logout } from "@/lib/auth";

const BRAND = "#1E40AF";
const BRAND_BG = "#DBEAFE";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const authorised = guardRoute("ADMIN", router);
    if (authorised) setUser(authorised);
  }, [router]);

  if (!user) return null;

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "User Management", href: "/admin/users", icon: <Users size={20} /> },
    { name: "Courses", href: "/admin/courses", icon: <BookOpen size={20} /> },
    { name: "Payment History", href: "/admin/payments", icon: <DollarSign size={20} /> },
    { name: "Institute Income", href: "/admin/income", icon: <Building2 size={20} /> },
    { name: "Feedback", href: "/admin/feedback", icon: <MessageSquare size={20} /> },
    { name: "Complaints", href: "/admin/complaints", icon: <AlertTriangle size={20} /> },
    { name: "Welcome popup", href: "/admin/popup", icon: <Settings size={20} /> },
    { name: "Notices", href: "/admin/notice", icon: <Bell size={20} /> },
    { name: "Profile", href: "/admin/profile", icon: <User size={20} /> },
  ];

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 flex-shrink-0 bg-white border-b shadow-sm flex items-center justify-between px-4 md:px-6 lg:px-8 z-40 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2 md:w-[200px]">
            <Shield size={22} style={{ color: BRAND }} />
            <span className="text-lg font-bold" style={{ color: BRAND }}>
              Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-blue-800 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs" style={{ color: BRAND }}>
                Administrator
              </p>
            </div>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
              style={{ backgroundColor: BRAND_BG, color: BRAND }}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">

        {/* BACKDROP */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[45] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-[#1E40AF] text-white flex flex-col
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:translate-x-0
          `}
        >
          <div className="md:hidden h-16 flex items-center justify-between px-5 border-b border-blue-700/30">
            <span className="font-bold">Admin Console</span>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  pathname === item.href
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {/* LOGOUT */}
            <div className="mt-4 pt-4 border-t border-blue-700/30">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <LogOut size={24} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Logout
            </h3>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Are you sure you want to log out of the Admin Console? You will need to sign in again to access your account.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout(router);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                Yes, Log out
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
