"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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

  // URL PARAM
  const searchParams = useSearchParams();
  const teacherFromURL = searchParams.get("teacher");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string | number>("All");

  // Sync URL → state
  useEffect(() => {
    if (teacherFromURL) {
      setSelectedTeacher(Number(teacherFromURL));
    }
  }, [teacherFromURL]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, teacherRes] = await Promise.all([
          fetch(`${API}/courses`), 
          fetch(`${API}/public/teachers`)
        ]);

        const courseData = await courseRes.json();
        const teacherData = await teacherRes.json();

        const tMap: any = {};
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

  // Unique teachers for dropdown
  const uniqueTeachers = useMemo(() => {
    const teacherIds = [...new Set(rawCourses.map((c: any) => c.teacher_id).filter(Boolean))];

    return teacherIds.map((id) => ({
      id,
      name: teachersMap[id]?.teacher_name || "Unassigned"
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawCourses, teachersMap]);

  // Filter logic
  const filteredCourses = useMemo(() => {
    return rawCourses.filter((c: any) => {
      const tInfo = teachersMap[c.teacher_id] || {};
      const tName = tInfo.teacher_name || "Unassigned";

      const searchStr = `${c.title} ${tName}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

      const matchesTeacher =
        selectedTeacher === "All" ||
        c.teacher_id === Number(selectedTeacher);

      return matchesSearch && matchesTeacher;
    }).map((c: any) => ({
      ...c,
      teacher_name: teachersMap[c.teacher_id]?.teacher_name || "Unassigned Teacher",
      teacher_image: teachersMap[c.teacher_id]?.profile_picture_url || null
    }));
  }, [rawCourses, teachersMap, searchTerm, selectedTeacher]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Find the perfect class to accelerate your learning journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        
        {/* FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row gap-4 items-center justify-between mb-8 border">
          <div className="flex items-center gap-2 font-bold">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">

            {/* SEARCH */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* TEACHER FILTER */}
            <select 
              className="border p-2 rounded-xl"
              value={selectedTeacher}
              onChange={(e) =>
                setSelectedTeacher(
                  e.target.value === "All" ? "All" : Number(e.target.value)
                )
              }
            >
              <option value="All">All Teachers</option>
              {uniqueTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* RESULTS */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
            <p>No courses found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course: any) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// COURSE CARD
function CourseCard({ course }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
      
      <h3 className="font-bold text-lg">{course.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{course.teacher_name}</p>

      <p className="text-sm flex-1">{course.description}</p>

      <div className="mt-4">
        <span className="font-bold">Rs. {course.fee}</span>
      </div>

      <Link 
        href="/login"
        className="mt-4 bg-blue-600 text-white py-2 rounded text-center"
      >
        Enroll
      </Link>
    </div>
  );
}
