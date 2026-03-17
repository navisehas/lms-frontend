import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* LEFT SIDE: Brand & Image */}
      <div className="hidden lg:flex flex-col justify-between bg-blue-900 text-white p-12 relative overflow-hidden">
        {/* Abstract Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-20 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="w-8 h-8" />
            <span>Institute LMS</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-6">Welcome back!</h2>
          <p className="text-blue-200 text-lg mb-8">
            "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
          </p>
          <div className="flex gap-4">
             <div className="bg-blue-800/50 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-bold text-2xl">5k+</h3>
                <p className="text-sm text-blue-200">Students</p>
             </div>
             <div className="bg-blue-800/50 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-bold text-2xl">100%</h3>
                <p className="text-sm text-blue-200">Success Rate</p>
             </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-300">
          &copy; 2026 Institute LMS. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: The Form (Children) */}
      <div className="flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          {children}
        </div>
      </div>
      
    </div>
  );
}