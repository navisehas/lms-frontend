"use client";

import Link from "next/link";
import { QrCode, Banknote, PlusCircle } from "lucide-react";

export default function ManagerDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* The Main SCAN Button */}
          <Link 
            href="/manager/scan" 
            className="group relative bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
          >
            {/* Background decorative icon */}
            <div className="absolute -top-4 -right-4 p-4 opacity-10 transform rotate-12">
              <QrCode size={140} />
            </div>
            
            <div className="relative z-10">
              <QrCode size={40} className="mb-4 text-white" />
              <h3 className="text-2xl font-bold">Scan QR Code</h3>
              <p className="text-indigo-100 mt-2 font-medium">Mark attendance for incoming students.</p>
            </div>
          </Link>

          {/* Manual Payment Button */}
          <Link 
            href="/manager/payments" 
            className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col justify-center"
          >
            <Banknote size={40} className="mb-4 text-green-600 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-900">Collect Payment</h3>
            <p className="text-gray-500 mt-2">Record a cash payment manually.</p>
          </Link>

          {/* Enroll New Student Button */}
          <Link 
            href="/manager/students" 
            className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col justify-center"
          >
            <PlusCircle size={40} className="mb-4 text-purple-600 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-gray-900">New Enrollment</h3>
            <p className="text-gray-500 mt-2">Register a walk-in student.</p>
          </Link>
          
        </div>
      </div>

    </div>
  );
}
