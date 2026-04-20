"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Loader2, BookOpen } from "lucide-react";

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

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-8">
      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between mb-6 border border-gray-200">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <Filter className="w-5 h-5 text-blue-600" />
          Filters
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search course or teacher..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 p-2 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="All">All Teachers</option>
            {uniqueTeachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedTeacher !== "All" && (
        <div className="mb-4 text-sm text-blue-600 font-semibold">
          Showing courses for selected teacher
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-700 font-medium">No courses found</p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedTeacher("All"); }}
            className="mt-4 px-5 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Find the perfect class to accelerate your learning journey.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        }
      >
        <CoursesContent />
      </Suspense>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      
      {/* Thumbnail */}
      {course.thumbnail_url ? (
        <div className="h-40 overflow-hidden">
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center">
          <BookOpen size={36} className="text-white opacity-40" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Course Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Teacher */}
        <p className="text-sm font-semibold text-blue-700 mb-2">
          {course.teacher_name}
        </p>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Fee */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <p className="text-lg font-black text-gray-900 mb-3">
            Rs. {Number(course.fee || 0).toLocaleString()}
            <span className="text-xs font-medium text-gray-500 ml-1">/ month</span>
          </p>

          <Link
            href="/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-lg text-center transition-colors"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
}
