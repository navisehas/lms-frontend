"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  ImageIcon,
  Loader,
  RefreshCw,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) {
      setUser(auth);
      fetchCourses(auth.user_id);
    }
  }, [router]);

  async function fetchCourses(teacherId) {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/courses`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setError(data?.error || "Failed to load assigned courses.");
        setCourses([]);
        return;
      }
      setCourses(data.filter((course) => course.teacher_id === teacherId));
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: courses.length,
    enrolled: courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0),
    value: courses.reduce((sum, c) => sum + parseFloat(c.fee || 0), 0),
  };

  return (
    <div className="min-h-screen bg-[#0D0F1A] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .page-wrap { font-family: 'DM Sans', sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
        .heading-font { font-family: 'Syne', sans-serif; }

        .glass-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border-radius: 20px;
        }

        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(139,92,246,0.3); }

        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .course-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(139,92,246,0.15);
          border-color: rgba(139,92,246,0.3);
        }

        .course-img {
          height: 180px;
          position: relative;
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          overflow: hidden;
        }
        .course-img img { width: 100%; height: 100%; object-fit: cover; }
        .course-img .no-img {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px; color: rgba(139,92,246,0.4);
        }

        .course-id-badge {
          position: absolute; top: 10px; left: 10px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 3px 10px;
          font-size: 10px;
          font-family: 'DM Mono', monospace;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.05em;
        }

        .course-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
        .course-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .course-desc { font-size: 0.8rem; color: rgba(255,255,255,0.4); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem; }

        .meta-row { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: rgba(255,255,255,0.45); margin-bottom: 5px; }
        .meta-row svg { flex-shrink: 0; }

        .course-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; }
        .fee-text { font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 800; color: #a78bfa; }
        .fee-label { font-size: 0.7rem; color: rgba(255,255,255,0.3); display: block; }

        .open-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; font-size: 0.78rem; font-weight: 600;
          padding: 8px 16px; border-radius: 10px;
          text-decoration: none; transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(109,40,217,0.3);
        }
        .open-btn:hover { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 6px 20px rgba(109,40,217,0.45); transform: translateX(2px); }

        .grid-courses { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }

        .error-box { display: flex; align-items: center; gap: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; border-radius: 14px; padding: 14px 18px; font-size: 0.85rem; }

        .refresh-btn {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.82rem; color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 16px; border-radius: 12px;
          cursor: pointer; transition: all 0.2s;
        }
        .refresh-btn:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.2); }

        .empty-state { text-align: center; padding: 5rem 2rem; }
        .empty-state h2 { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: rgba(255,255,255,0.6); margin-top: 1rem; }
        .empty-state p { font-size: 0.85rem; color: rgba(255,255,255,0.3); margin-top: 0.5rem; }

        .loading-state { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 6rem 0; color: rgba(255,255,255,0.3); font-size: 0.875rem; }

        .page-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        @media (min-width: 640px) { .page-header { flex-direction: row; align-items: center; justify-content: space-between; } }

        .stats-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1rem; margin-bottom: 2rem; }
        @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }

        .glow-dot { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; display: inline-block; margin-right: 8px; box-shadow: 0 0 8px #a78bfa; }

        .teacher-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 8px; padding: 3px 10px;
          font-size: 0.75rem; color: #a78bfa; font-weight: 500;
        }
      `}</style>

      <div className="page-wrap">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="heading-font" style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="glow-dot" />
              My Courses
            </h1>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>
              Courses assigned to <span style={{ color: "rgba(167,139,250,0.8)", fontWeight: 600 }}>{user?.name || "you"}</span>
            </p>
          </div>
          <button className="refresh-btn" onClick={() => user && fetchCourses(user.user_id)}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box" style={{ marginBottom: "1.5rem" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(139,92,246,0.15)" }}>
              <BookOpen size={18} color="#a78bfa" />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Assigned Courses</p>
              <p className="heading-font" style={{ fontSize: "1.75rem", fontWeight: 800 }}>{stats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(16,185,129,0.12)" }}>
              <Users size={18} color="#34d399" />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Total Students</p>
              <p className="heading-font" style={{ fontSize: "1.75rem", fontWeight: 800 }}>{stats.enrolled}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(251,191,36,0.12)" }}>
              <TrendingUp size={18} color="#fbbf24" />
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Combined Value</p>
              <p className="heading-font" style={{ fontSize: "1.75rem", fontWeight: 800 }}>Rs. {stats.value.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <Loader size={18} color="#7c3aed" className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
            Loading your courses…
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card empty-state">
            <Sparkles size={48} color="rgba(139,92,246,0.3)" />
            <h2>No courses assigned yet</h2>
            <p>Once an admin assigns courses to your account, they will appear here.</p>
          </div>
        ) : (
          <div className="grid-courses">
            {courses.map((course) => (
              <div key={course.course_id} className="course-card">
                <div className="course-img">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} />
                  ) : (
                    <div className="no-img">
                      <ImageIcon size={30} />
                      <span style={{ fontSize: "0.7rem" }}>No image</span>
                    </div>
                  )}
                  <span className="course-id-badge">{course.course_id}</span>
                </div>

                <div className="course-body">
                  <h2 className="course-title">{course.title}</h2>
                  {course.description && (
                    <p className="course-desc">{course.description}</p>
                  )}

                  <div className="meta-row">
                    <GraduationCap size={12} color="#a78bfa" />
                    <span style={{ color: "#a78bfa", fontWeight: 500 }}>{course.teacher_name || user?.name}</span>
                  </div>
                  <div className="meta-row">
                    <Users size={12} color="#34d399" />
                    <span>{course.enrolled_count || 0} enrolled</span>
                  </div>
                  {course.duration && (
                    <div className="meta-row">
                      <Clock size={12} />
                      <span>{course.duration}</span>
                    </div>
                  )}

                  <div className="course-footer">
                    <div>
                      <span className="fee-label">Monthly fee</span>
                      <span className="fee-text">Rs. {parseFloat(course.fee || 0).toLocaleString()}</span>
                    </div>
                    <Link href={`/teacher/courses/${course.course_id}`} className="open-btn">
                      Open <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}