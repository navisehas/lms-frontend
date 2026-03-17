"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/'); 
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Courses', href: '/courses' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ];

  // --- NEW: Role-Based Dashboard Routing ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Ensure your login API saves this!

    if (token) {
      setIsLoggedIn(true);
      
      // Determine the correct URL based on the user's role
      // Note: Adjust the paths below if your folders are named differently (e.g., '/admin/dashboard')
      switch (role) {
        case 'ADMIN':
          setDashboardUrl('/admin/dashboard'); 
          break;
        case 'MANAGER':
          setDashboardUrl('/manager');
          break;
        case 'TEACHER':
          setDashboardUrl('/teacher/dashboard');
          break;
        case 'STUDENT':
          setDashboardUrl('/student/dashboard');
          break;
        default:
          setDashboardUrl('/dashboard'); // Fallback
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Institute Logo" className="h-15 w-15" width={32} height={32} priority />
              <span className="font-bold text-xl text-gray-800">English Gate LMS</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Conditional Login/Dashboard Button */}
            {isLoggedIn ? (
              <Link href={dashboardUrl} className="bg-blue-600 text-white px-5 py-2 rounded-md font-bold hover:bg-blue-700 transition shadow-sm">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-md font-bold hover:bg-blue-700 transition shadow-sm">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Conditional Login/Dashboard Button (Mobile) */}
            {isLoggedIn ? (
              <Link href={dashboardUrl} className="block w-full text-center mt-4 bg-blue-600 text-white px-4 py-3 rounded-md font-bold shadow-sm">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/login" className="block w-full text-center mt-4 bg-blue-600 text-white px-4 py-3 rounded-md font-bold shadow-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}