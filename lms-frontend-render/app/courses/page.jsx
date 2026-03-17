"use client";
import { useState } from 'react';
import { Search, Filter, Clock, MapPin, Globe, CheckCircle } from 'lucide-react';

export default function Courses() {
  
  // 1. MOCK DATA (This will come from your PostgreSQL DB later)
  const allCourses = [
    {
      id: 1,
      title: "2026 A/L Combined Maths (Theory)",
      instructor: "Mr. Sameera Bandara",
      grade: "A/L",
      medium: "Sinhala",
      type: "Hybrid", // Both Physical & Online
      time: "Saturday 8:00 AM - 1:00 PM",
      venue: "Main Hall A / Zoom",
      fee: "Rs. 3,500/mo",
      image: "bg-blue-600",
      topics: ["Pure Maths", "Applied Maths", "Past Papers"]
    },
    {
      id: 2,
      title: "2026 A/L Physics (Revision)",
      instructor: "Dr. Nimal Perera",
      grade: "A/L",
      medium: "English",
      type: "Physical",
      time: "Sunday 8:00 AM - 12:00 PM",
      venue: "Hall B",
      fee: "Rs. 3,000/mo",
      image: "bg-purple-600",
      topics: ["Mechanics", "Electronics", "Waves"]
    },
    {
      id: 3,
      title: "2025 O/L Mathematics",
      instructor: "Mrs. Kanthi Silva",
      grade: "O/L",
      medium: "Sinhala",
      type: "Online",
      time: "Monday 6:00 PM - 8:00 PM",
      venue: "Zoom Live",
      fee: "Rs. 2,000/mo",
      image: "bg-green-600",
      topics: ["Geometry", "Algebra", "Graphs"]
    },
    {
      id: 4,
      title: "ICT for Beginners (Grade 6-9)",
      instructor: "Mr. Amal Fernando",
      grade: "Junior",
      medium: "English",
      type: "Physical",
      time: "Wednesday 3:00 PM - 5:00 PM",
      venue: "Computer Lab",
      fee: "Rs. 1,500/mo",
      image: "bg-orange-500",
      topics: ["Coding", "MS Office", "Internet Safety"]
    },
    {
      id: 5,
      title: "2026 A/L Chemistry",
      instructor: "Mr. Kapila Perera",
      grade: "A/L",
      medium: "Sinhala",
      type: "Hybrid",
      time: "Friday 2:30 PM - 6:30 PM",
      venue: "Main Hall A",
      fee: "Rs. 3,200/mo",
      image: "bg-red-600",
      topics: ["Organic", "Inorganic", "Industrial"]
    }
  ];

  // 2. STATE FOR FILTERING
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedMedium, setSelectedMedium] = useState("All");

  // 3. FILTER LOGIC
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === "All" || course.grade === selectedGrade;
    const matchesMedium = selectedMedium === "All" || course.medium === selectedMedium;

    return matchesSearch && matchesGrade && matchesMedium;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Find the perfect class to accelerate your learning journey. Join physically or learn from home.
          </p>
          
          {/* SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search for subject or teacher..."
              className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* FILTERS BAR */}
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-gray-700 font-bold">
            <Filter className="w-5 h-5" />
            <span>Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <select 
              className="border p-2 rounded-md bg-gray-50 text-gray-700 hover:border-blue-500 focus:outline-none"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="A/L">Advanced Level (A/L)</option>
              <option value="O/L">Ordinary Level (O/L)</option>
              <option value="Junior">Junior (Gr 6-9)</option>
            </select>

            <select 
              className="border p-2 rounded-md bg-gray-50 text-gray-700 hover:border-blue-500 focus:outline-none"
              value={selectedMedium}
              onChange={(e) => setSelectedMedium(e.target.value)}
            >
              <option value="All">All Mediums</option>
              <option value="Sinhala">Sinhala Medium</option>
              <option value="English">English Medium</option>
            </select>
          </div>
        </div>

        {/* RESULTS GRID */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-500">No courses found matching your criteria.</h3>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedGrade("All");}}
              className="mt-4 text-blue-600 underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                
                {/* Card Header (Color coded by subject) */}
                <div className={`h-32 ${course.image} relative rounded-t-xl p-6`}>
                   <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                     {course.grade}
                   </span>
                   <h3 className="text-white font-bold text-xl mt-4 text-shadow">{course.title}</h3>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow">
                  <p className="text-gray-500 text-sm mb-4">by <span className="font-bold text-gray-800">{course.instructor}</span></p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>{course.time}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                      <span>{course.venue}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Globe className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{course.medium} Medium</span>
                    </div>
                  </div>

                  {/* Topics Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.topics.map((topic, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 border-t bg-gray-50 rounded-b-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Course Fee</span>
                    <span className="text-lg font-bold text-blue-600">{course.fee}</span>
                  </div>
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Simple Instruction */}
      <div className="max-w-7xl mx-auto px-4 mt-16 text-center">
         <p className="text-gray-500 text-sm">
           <CheckCircle className="w-4 h-4 inline mr-1 text-green-500"/>
           New courses start at the beginning of every month. Payments can be made online via the Student Portal.
         </p>
      </div>

    </div>
  );
}