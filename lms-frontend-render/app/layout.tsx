import React from 'react';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

export const metadata = {
  title: "Institute LMS",
  description: "Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 relative" suppressHydrationWarning>
        <Navbar />
        
        {children}
        
        <footer className="bg-gray-900 text-white py-8 mt-12 text-center">
          <p>© 2026 Institute LMS. All rights reserved.</p>
        </footer>

        <Chatbot />
      </body>
    </html>
  );
}