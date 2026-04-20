"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FolderOpen, ClipboardEdit,
  ClipboardList, LineChart, Wallet, MessageSquare,
  GraduationCap, Bell, Menu, X, LogOut,User,
} from "lucide-react";
import { guardRoute, logout } from "@/lib/auth";

const BRAND    = "#1E40AF";
const BRAND_BG = "#DBEAFE";

export default function TeacherLayout({ children }) {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [user, setUser]                   = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const authorised = guardRoute("TEACHER", router);
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
    { name: "Dashboard",         href: "/teacher/dashboard",      icon: <LayoutDashboard  size={20} /> },
    { name: "My Courses",       href: "/teacher/courses",         icon: <BookOpen         size={20} /> },
    { name: "Course Materials", href: "/teacher/materials",       icon: <FolderOpen       size={20} /> },
    { name: "Exams & Quizzes",  href: "/teacher/exams/create",    icon: <ClipboardEdit    size={20} /> },
    { name: "Exam Results",     href: "/teacher/exams/results",   icon: <ClipboardList    size={20} /> },
    { name: "Student Progress", href: "/teacher/analytics",       icon: <LineChart        size={20} /> },
    { name: "My Income",        href: "/teacher/income",          icon: <Wallet           size={20} /> },
    { name: "Attendance",       href: "/teacher/attendance",      icon: <GraduationCap    size={20} /> },
    { name: "Feedback",         href: "/teacher/feedback",        icon: <MessageSquare    size={20} /> },
    { name: "Profile",          href: "/teacher/profile",         icon: <User    size={20} /> },
  ];

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden relative">

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Are you sure you want to log out of the Teacher Portal? You will need to sign in again to access your account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutModal(false); logout(router); }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <header className="h-16 flex-shrink-0 bg-white border-b shadow-sm flex items-center justify-between px-4 md:px-6 lg:px-8 z-40 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 md:w-[200px]">
            <GraduationCap size={22} style={{ color: BRAND }} />
            <span className="text-lg font-bold tracking-tight" style={{ color: BRAND }}>
              <span className="hidden sm:inline">Teacher Portal</span>
              <span className="sm:hidden">Portal</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button className="p-2 text-gray-400 hover:text-blue-800 relative transition-colors" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs font-medium" style={{ color: BRAND }}>Teacher</p>
            </div>
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm"
              style={{ backgroundColor: BRAND_BG, color: BRAND }}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ── LOWER SECTION ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[45] md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-[#1E40AF] text-white shadow-2xl flex flex-col
            md:relative md:z-0 md:shadow-none
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          {/* Mobile sidebar header */}
          <div className="md:hidden h-16 flex items-center justify-between px-5 border-b border-blue-700/30 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <GraduationCap size={20} className="text-blue-200" />
              <span className="text-lg font-bold tracking-tight">Teacher Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 -mr-1 text-blue-200 hover:text-white rounded-md">
              <X size={24} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3.5 md:py-2.5 rounded-lg text-[15px] font-medium
                  transition-colors duration-150
                  ${pathname === item.href
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <span className="text-blue-200">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {/* Logout */}
            <div className="mt-4 pt-4 border-t border-blue-700/30">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 md:py-2.5 rounded-lg text-[15px] font-medium text-blue-100 hover:bg-red-500/20 hover:text-red-100 transition-colors duration-150"
              >
                <LogOut size={20} className="text-blue-200" />
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50 relative">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
