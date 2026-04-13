"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, Filter, Loader2, Clock, Tag, 
  Play, BookOpen, User, ArrowRight 
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PublicCourses() {
  const [rawCourses, setRawCourses] = useState([]);
  const [teachersMap, setTeachersMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTeacher, setSelectedTeacher] = useState("All");

  // Fetch data from API on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, teacherRes] = await Promise.all([
          fetch(`${API}/courses`), 
          fetch(`${API}/public/teachers`)
        ]);

        const courseData = await courseRes.json();
        const teacherData = await teacherRes.json();

        // Build Teacher Map for quick lookup
        const tMap = {};
        if (Array.isArray(teacherData)) {
          teacherData.forEach((t) => {
            tMap[t.user_id] = {
              teacher_name: t.name || "No Teacher Assigned",
              profile_picture_url: t.profile_picture_url || null,
            };
          });
        }
        setTeachersMap(tMap);
        setRawCourses(Array.isArray(courseData) ? courseData : []);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extract unique categories for the filter dropdown dynamically
  const uniqueCategories = useMemo(() => {
    const cats = rawCourses.map(c => c.category).filter(Boolean);
    return ["All", ...new Set(cats)];
  }, [rawCourses]);

  // Extract unique teachers for the filter dropdown dynamically
  const uniqueTeachers = useMemo(() => {
    const teacherIds = [...new Set(rawCourses.map(c => c.teacher_id).filter(Boolean))];
    return teacherIds.map(id => ({
      id,
      name: teachersMap[id]?.teacher_name || "Unassigned"
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawCourses, teachersMap]);

  // Apply Search and Filters to create a flat list of courses
  const filteredCourses = useMemo(() => {
    return rawCourses.filter((c) => {
      const tInfo = teachersMap[c.teacher_id] || {};
      const tName = tInfo.teacher_name || "Unassigned";

      // Search Match (checks course title OR teacher name)
      const searchStr = `${c.title} ${tName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      
      // Category Match
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      
      // Teacher Match
      const matchesTeacher = selectedTeacher === "All" || c.teacher_id === selectedTeacher;

      return matchesSearch && matchesCategory && matchesTeacher;
    }).map((c) => ({
      ...c,
      // Inject teacher details directly into the course object for the card
      teacher_name: teachersMap[c.teacher_id]?.teacher_name || "Unassigned Teacher",
      teacher_image: teachersMap[c.teacher_id]?.profile_picture_url || null
    }));
  }, [rawCourses, teachersMap, searchTerm, selectedCategory, selectedTeacher]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* ── HEADER SECTION ── */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Find the perfect class to accelerate your learning journey. Learn from the best educators in the country.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* ── FILTERS BAR ── */}
        <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between mb-8 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-700 font-bold">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
            {/* SEARCH BAR */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search course or teacher..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select 
              className="border border-gray-200 p-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] transition"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>

            {/* Teacher Filter */}
            <select 
              className="border border-gray-200 p-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px] transition"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="All">All Teachers</option>
              {uniqueTeachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="font-medium">Loading courses…</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center mt-8">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No courses found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedTeacher("All"); }}
              className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Course Card Component ────────────────────────────────────────────────────────
function CourseCard({ course }) {
  const fee = parseFloat(course.fee || 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
      
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-blue-900 to-blue-600 overflow-hidden group">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play size={40} className="text-white opacity-20" />
          </div>
        )}
        {/* Category Tag */}
        {course.category && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur text-blue-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
            <Tag size={12} /> {course.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Teacher Info */}
        <div className="flex items-center gap-2 mb-2 text-gray-700">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
            <User size={16} className="text-indigo-600" />
          </div>
          <span className="text-sm font-bold truncate leading-tight">
            {course.teacher_name}
          </span>
        </div>

        {/* Course Title */}
        <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 mb-2 mt-1">
          {course.title}
        </h3>
        
        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
            {course.description}
          </p>
        )}
        
        {/* Course Details Tags (Duration, etc.) */}
        <div className="flex flex-wrap items-center gap-2 mb-4 mt-auto">
          {course.duration && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
              <Clock size={14} className="text-blue-500 shrink-0" />
              <span>{course.duration}</span>
            </div>
          )}
        </div>

        {/* Fee & Action */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-400 font-bold">Rs.</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {fee.toLocaleString()}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded-full px-3 py-1">
              Monthly
            </span>
          </div>

          <Link 
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-md"
          >
            Login to Enroll <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
