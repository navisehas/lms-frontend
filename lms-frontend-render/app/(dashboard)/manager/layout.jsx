"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, QrCode, Users, Banknote, Menu, X, LogOut, Clock, GraduationCap, MessageSquare } from "lucide-react";
import { guardRoute, logout } from "@/lib/auth";

export default function ManagerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const authorised = guardRoute("MANAGER", router);
    if (authorised) setUser(authorised);
  }, [router]);

  if (!user) return null;

  const menuItems = [
    { name: "Overview",           href: "/manager/dashboard",  icon: <LayoutDashboard size={20} /> },
    { name: "Scan Attendance",    href: "/manager/scan",       icon: <QrCode size={20} /> },
    { name: "Student Management", href: "/manager/students",   icon: <Users size={20} /> },
    { name: "Payments & Fees",    href: "/manager/payments",   icon: <Banknote size={20} /> },
    { name: "Class Schedule",     href: "/manager/schedule",   icon: <GraduationCap size={20} /> },
    { name: "All Attendance",     href: "/manager/attendance", icon: <Clock size={20} /> },
    { name: "Feedback",           href: "/manager/feedback",   icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-indigo-900 text-white
        transition-transform duration-300 ease-in-out transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-indigo-800">
          <span className="text-xl font-bold tracking-wide">Manager Panel</span>
          <button className="ml-auto md:hidden text-indigo-300" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href ? "bg-indigo-700 text-white shadow-lg" : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
              }`}>
              {item.icon}{item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button onClick={() => logout(router)}
            className="w-full flex items-center gap-3 px-4 py-3 text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg text-sm font-medium transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 md:hidden hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-700 hidden sm:block">Matara Center</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user.name}</p>
              <p className="text-xs text-green-600 font-bold">● System Online</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}