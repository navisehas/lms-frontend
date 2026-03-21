"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Lightbulb, Users, Heart, Loader2 } from 'lucide-react';
import Image from 'next/image';
const API = process.env.NEXT_PUBLIC_API_URL;


export default function About() {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teachers from the database on component load
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${API}/public/teachers`);
        if (res.ok) {
          const data = await res.json();
          setLecturers(data);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const values = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Excellence",
      desc: "We strive for the highest standards in teaching and student performance."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
      title: "Innovation",
      desc: "Embracing modern technology (LMS, Online Exams) to make learning smarter."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Student-Centric",
      desc: "Every decision we make is focused on the well-being and success of our students."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Integrity",
      desc: "We maintain transparency with parents regarding attendance and progress."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO HEADER */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Our Institute</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Empowering the next generation of Sri Lankan professionals through dedication, discipline, and digital innovation.
          </p>
        </div>
      </section>

      {/* 2. VISION & MISSION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-lg border-4 border-white flex items-center justify-center">
             <Image 
               src="/logo.png" 
               alt="Institute Logo" 
               width={400} 
               height={400} 
               className="object-contain" 
               priority
             />
          </div>
          
          {/* Text Side */}
          <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h2>
              <p className="text-gray-700">
                To be the undisputed leader in supplementary education in Sri Lanka, creating a society of intelligent, disciplined, and capable youth.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h2>
              <p className="text-gray-700">
                Providing accessible, high-quality education by combining experienced lectures with state-of-the-art technology to ensure every student reaches their full potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            <p className="text-gray-600 mt-2">The principles that guide us every day.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center group">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-gray-600 text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC EXPERT PANEL (Fetched from Database) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Meet Our Expert Panel</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Our greatest asset is our teaching staff. We have brought together the island's most experienced and qualified lecturers.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-4" />
            <p className="text-gray-500 font-medium">Loading our experts...</p>
          </div>
        ) : lecturers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-lg font-bold">Teachers list is currently empty.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {lecturers.map((lec) => (
              <div key={lec.user_id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Profile Image Background */}
                <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                
                {/* Profile Avatar */}
                <div className="flex justify-center -mt-12">
                  <img 
                    src={lec.profile_picture_url || `https://api.dicebear.com/7.x/initials/svg?seed=${lec.name}&backgroundColor=0f172a&textColor=ffffff`} 
                    alt={lec.name} 
                    className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md object-cover"
                  />
                </div>
                
                {/* Card Content */}
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900">{lec.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{lec.specialization || "Expert Lecturer"}</p>
                  
                  <div className="h-px bg-gray-100 my-3"></div>
                  
                  <p className="text-sm text-gray-700 font-medium">
                    {lec.description || "A dedicated professional with a proven track record of guiding students to success."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. CTA Footer for About */}
      <section className="bg-gray-900 text-white py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Want to learn from the best?</h2>
        <Link href="/courses" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          View Our Courses
        </Link>
      </section>

    </div>
  );
}