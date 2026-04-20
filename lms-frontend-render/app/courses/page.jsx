"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Loader2, 
  BookOpen, 
  Sparkles, 
  GraduationCap,
  ArrowRight,
  X,
  Users,
  Clock,
  Award,
  TrendingUp
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function CoursesContent() {
  const [rawCourses, setRawCourses] = useState([]);
  const [teachersMap, setTeachersMap] = useState({});
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const teacherFromURL = searchParams.get("teacher");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("All");

  useEffect(() => {
    if (teacherFromURL) setSelectedTeacher(String(teacherFromURL));
  }, [teacherFromURL]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, teacherRes] = await Promise.all([
          fetch(`${API}/courses`),
          fetch(`${API}/public/teachers`),
        ]);
        const courseData = await courseRes.json();
        const teacherData = await teacherRes.json();

        const tMap = {};
        if (Array.isArray(teacherData)) {
          teacherData.forEach((t) => {
            tMap[String(t.user_id)] = {
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

  const uniqueTeachers = useMemo(() => {
    const ids = [...new Set(rawCourses.map((c) => String(c.teacher_id)).filter(Boolean))];
    return ids
      .map((id) => ({ id, name: teachersMap[id]?.teacher_name || "Unassigned" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rawCourses, teachersMap]);

  const filteredCourses = useMemo(() => {
    return rawCourses
      .filter((c) => {
        const teacherId = String(c.teacher_id);
        const tName = teachersMap[teacherId]?.teacher_name || "Unassigned";
        const matchesSearch = `${c.title} ${tName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeacher = selectedTeacher === "All" || teacherId === String(selectedTeacher);
        return matchesSearch && matchesTeacher;
      })
      .map((c) => {
        const teacherId = String(c.teacher_id);
        return {
          ...c,
          teacher_name: teachersMap[teacherId]?.teacher_name || "Unassigned Teacher",
          teacher_image: teachersMap[teacherId]?.profile_picture_url || null,
        };
      });
  }, [rawCourses, teachersMap, searchTerm, selectedTeacher]);

  const selectedTeacherName = useMemo(() => {
    if (selectedTeacher === "All") return null;
    return teachersMap[String(selectedTeacher)]?.teacher_name || "Selected Teacher";
  }, [selectedTeacher, teachersMap]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
      
      {/* FILTER BAR - Floating card with gradient border */}
      <div className="relative p-[1px] bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 rounded-2xl shadow-2xl mb-8">
        <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold">Find Your Course</p>
              <p className="text-xs text-gray-500 font-medium">Search & filter to get started</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search course or teacher..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Teacher Select */}
            <div className="relative">
              <select
                className="appearance-none w-full sm:w-52 border border-gray-200 bg-gray-50 pl-4 pr-10 py-3 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="All">All Teachers</option>
                {uniqueTeachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chip */}
      {selectedTeacher !== "All" && (
        <div className="mb-6 flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-sm text-gray-600 font-medium">Filtering by:</span>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md shadow-blue-500/30">
            <GraduationCap className="w-4 h-4" />
            {selectedTeacherName}
            <button 
              onClick={() => setSelectedTeacher("All")}
              className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
              aria-label="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredCourses.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-extrabold text-gray-900">{filteredCourses.length}</span> {filteredCourses.length === 1 ? "course" : "courses"}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <Loader2 className="absolute top-0 left-0 animate-spin w-16 h-16 text-blue-600" />
          </div>
          <p className="text-gray-500 font-medium mt-4">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-dashed border-blue-200 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
            <BookOpen size={36} className="text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-gray-900 mb-2">No courses found</p>
          <p className="text-sm text-gray-500 mb-5">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedTeacher("All"); }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
          >
            Clear Filters
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {filteredCourses.map((course) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicCourses() {
  return (
    <main className="flex flex-col min-h-screen relative overflow-x-hidden bg-gray-50">
      
      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION - Matching home page design
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Animated Glow Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Geometric shapes */}
        <div className="absolute top-16 right-16 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-24 left-16 w-16 h-16 border-2 border-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 md:py-28 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">All Courses</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Explore Our
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-white">
                Courses
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Find the perfect class to accelerate your learning journey with Sri Lanka's top educators.
            </p>

            {/* Mini stats chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { icon: BookOpen, text: "All Subjects" },
                { icon: Users, text: "Expert Teachers" },
                { icon: Award, text: "Proven Results" }
              ].map((chip, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <chip.icon className="w-4 h-4 text-cyan-300" />
                  {chip.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
              <Loader2 className="absolute top-0 left-0 animate-spin w-16 h-16 text-blue-600" />
            </div>
            <p className="text-gray-500 font-medium mt-4">Loading...</p>
          </div>
        }
      >
        <CoursesContent />
      </Suspense>

    </main>
  );
}

function CourseCard({ course }) {
  return (
    <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
      
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="relative h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center overflow-hidden">
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            />
            {/* Glow orbs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400 rounded-full mix-blend-screen filter blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-screen filter blur-2xl opacity-30"></div>
            
            <BookOpen size={48} className="relative text-white/60 group-hover:scale-110 transition-transform" />
          </div>
        )}
        
        {/* Gradient overlay on thumbnail image */}
        {course.thumbnail_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        )}

        {/* Fee badge on thumbnail */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <p className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Rs. {Number(course.fee || 0).toLocaleString()}
            <span className="text-[10px] font-bold text-gray-500 ml-0.5">/mo</span>
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Course Title */}
        <h3 className="font-extrabold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {course.title}
        </h3>

        {/* Teacher with avatar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-extrabold overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
            {course.teacher_image ? (
              <img src={course.teacher_image} alt={course.teacher_name} className="w-full h-full object-cover" />
            ) : (
              course.teacher_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
            )}
          </div>
          <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 line-clamp-1">
            {course.teacher_name}
          </p>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Enroll Button */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <Link
            href="/login"
            className="group/btn relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/30 overflow-hidden"
          >
            <span className="relative z-10">Enroll Now</span>
            <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-b-3xl transition-all duration-500 w-0 group-hover:w-full"></div>
    </div>
  );
}
