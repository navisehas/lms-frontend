"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, ArrowLeft, Loader, Download,
  Clock, User, DollarSign, Lock,
  BookOpen, FileText, ExternalLink, BadgeCheck,
  ChevronDown, ChevronRight, GraduationCap, PlayCircle,
  RefreshCw, CheckCircle,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL = 5000;

function getMaterialHref(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  // If it's a relative path, ensure it starts with /
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${API}${path}`;
}

// Function to handle file download
const handleDownload = async (url, filename) => {
  try {
    // If it's a full URL
    if (url.startsWith('http')) {
      window.open(url, '_blank');
      return;
    }
    
    // If it's an API endpoint that requires auth
    const response = await authFetch(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    window.open(url, '_blank');
  }
};

export default function CourseDetailsPage() {
  const router   = useRouter();
  const params   = useParams();
  const courseId = params.id;

  const [user,        setUser]        = useState(null);
  const [course,      setCourse]      = useState(null);
  const [materials,   setMaterials]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [isEnrolled,  setIsEnrolled]  = useState(false);
  const [openLessons, setOpenLessons] = useState({});
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState(false);
  
  const pollTimer = useRef(null);
  const userRef = useRef(null);

  const materialsByLesson = useMemo(() => {
    const grouped = new Map();
    materials.forEach((m) => {
      const key = m.lesson_title || "General";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(m);
    });
    return Array.from(grouped.entries()).map(([lessonTitle, lessonMaterials]) => ({
      lessonTitle, lessonMaterials,
    }));
  }, [materials]);

  useEffect(() => {
    if (materialsByLesson.length > 0) {
      const initial = {};
      materialsByLesson.forEach(({ lessonTitle }) => { initial[lessonTitle] = true; });
      setOpenLessons(initial);
    }
  }, [materialsByLesson.length]);

  const fetchCourseDetails = useCallback(async (studentId, silent = false) => {
    if (!studentId || !courseId) return;
    if (!silent) setLoading(true);
    
    try {
      const courseRes = await authFetch(`${API}/courses/${courseId}`);
      if (!courseRes.ok) { 
        if (!silent) setError("Course not found."); 
        setCourse(null); 
        return; 
      }
      const courseData = await courseRes.json();
      setCourse(courseData);

      const enrollRes = await authFetch(`${API}/payments/courses/${studentId}`);
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        const matchedCourse = (enrollData.courses || []).find((c) => c.course_id === courseId);
        const enrolled = Boolean(matchedCourse?.is_enrolled);
        
        if (enrolled !== isEnrolled) {
          setIsEnrolled(enrolled);
          
          if (enrolled) {
            await fetchMaterials(courseId);
            setPaymentChecked(true);
            setTimeout(() => setPaymentChecked(false), 5000);
            if (pollTimer.current) {
              clearInterval(pollTimer.current);
              pollTimer.current = null;
            }
          } else {
            setMaterials([]);
          }
        } else if (enrolled && materials.length === 0 && !silent) {
          await fetchMaterials(courseId);
        }
      }
    } catch (err) {
      console.error("Fetch course details error:", err);
      if (!silent) setError("Failed to load course details.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [courseId, isEnrolled, materials.length]);

  const fetchMaterials = useCallback(async (courseId) => {
    try {
      const matRes = await authFetch(`${API}/courses/${courseId}/materials`);
      const matData = await matRes.json();
      if (!matRes.ok || !matData.success) {
        console.error("Failed to load materials:", matData.error);
        if (matData.error) {
          setError(matData.error);
        }
        setMaterials([]);
      } else {
        setMaterials(matData.materials || []);
        setError("");
      }
    } catch (err) {
      console.error("Fetch materials error:", err);
      setMaterials([]);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (studentId) => {
    if (!studentId || !courseId) return;
    
    try {
      const enrollRes = await authFetch(`${API}/payments/courses/${studentId}`);
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        const matchedCourse = (enrollData.courses || []).find((c) => c.course_id === courseId);
        const enrolled = Boolean(matchedCourse?.is_enrolled);
        
        if (enrolled !== isEnrolled) {
          setIsEnrolled(enrolled);
          if (enrolled) {
            await fetchMaterials(courseId);
            setPaymentChecked(true);
            setTimeout(() => setPaymentChecked(false), 5000);
            if (pollTimer.current) {
              clearInterval(pollTimer.current);
              pollTimer.current = null;
            }
          }
        }
      }
    } catch (err) {
      console.error("Payment check error:", err);
    }
  }, [courseId, isEnrolled, fetchMaterials]);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      userRef.current = auth;
      fetchCourseDetails(auth.user_id, false);
      
      if (!isEnrolled) {
        setCheckingPayment(true);
        pollTimer.current = setInterval(() => {
          if (userRef.current && !isEnrolled) {
            checkPaymentStatus(userRef.current.user_id);
          }
        }, POLL_INTERVAL);
      }
    }
    
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [router, courseId, fetchCourseDetails, checkPaymentStatus, isEnrolled]);

  const handleManualRefresh = async () => {
    if (user) {
      setCheckingPayment(true);
      await fetchCourseDetails(user.user_id, false);
      setCheckingPayment(false);
    }
  };

  function toggleLesson(title) {
    setOpenLessons((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Back link */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to My Courses
      </Link>

      {/* Payment checking indicator */}
      {checkingPayment && !isEnrolled && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3.5 text-sm">
          <Loader size={16} className="animate-spin flex-shrink-0" />
          <span>Checking for payment confirmation...</span>
        </div>
      )}

      {/* Payment success message */}
      {paymentChecked && isEnrolled && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3.5 text-sm">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>Payment confirmed! Course materials are now available.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
          <Loader size={28} className="animate-spin text-indigo-400" />
          <span className="text-sm font-medium">Loading course…</span>
        </div>
      ) : !course ? null : (
        <>
          {/* Course Hero Card */}
          <div className={`relative bg-white rounded-3xl border shadow-sm overflow-hidden ${isEnrolled ? "border-green-200" : "border-gray-200"}`}>
            <div className={`h-1.5 w-full ${isEnrolled ? "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" : "bg-gradient-to-r from-amber-300 to-orange-300"}`} />

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isEnrolled ? "bg-green-50" : "bg-amber-50"}`}>
                    <GraduationCap size={24} className={isEnrolled ? "text-green-600" : "text-amber-500"} />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{course.title}</h1>
                  </div>
                </div>
                {isEnrolled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-xs font-bold flex-shrink-0 shadow-sm">
                    <BadgeCheck size={13} /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 text-xs font-bold flex-shrink-0 shadow-sm">
                    <Lock size={13} /> Locked
                  </span>
                )}
              </div>

              {course.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{course.description}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {course.teacher_name && (
                  <div className="bg-gray-50 rounded-xl p-3.5">
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><User size={11} /> Teacher</p>
                    <p className="font-bold text-gray-800 text-sm">{course.teacher_name}</p>
                  </div>
                )}
                {course.duration && (
                  <div className="bg-gray-50 rounded-xl p-3.5">
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Clock size={11} /> Duration</p>
                    <p className="font-bold text-gray-800 text-sm">{course.duration}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><DollarSign size={11} /> Monthly Fee</p>
                  <p className="font-bold text-indigo-600 text-sm">
                    {course.fee > 0 ? `Rs. ${parseFloat(course.fee).toLocaleString()}` : "Free"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-500" /> Course Materials
              </h2>
              <div className="flex items-center gap-2">
                {isEnrolled && materials.length > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                    {materials.length} file{materials.length !== 1 ? "s" : ""}
                  </span>
                )}
                {!isEnrolled && (
                  <button
                    onClick={handleManualRefresh}
                    disabled={checkingPayment}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={checkingPayment ? "animate-spin" : ""} />
                    Check Payment
                  </button>
                )}
              </div>
            </div>

            {!isEnrolled ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} className="text-amber-400" />
                </div>
                <p className="text-amber-900 font-bold text-base mb-2">Materials Locked</p>
                <p className="text-amber-600 text-sm mb-3 max-w-xs mx-auto">
                  Complete your payment to unlock all lessons and course materials.
                </p>
                <p className="text-amber-500 text-xs mb-6">
                  After payment confirmation, materials will appear here automatically.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/student/payments"
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm"
                  >
                    <Lock size={14} /> Go to Payments
                  </Link>
                  <button
                    onClick={handleManualRefresh}
                    disabled={checkingPayment}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-amber-600 border border-amber-200 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                  >
                    <RefreshCw size={14} className={checkingPayment ? "animate-spin" : ""} />
                    {checkingPayment ? "Checking..." : "Refresh Status"}
                  </button>
                </div>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-14 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={26} className="text-gray-300" />
                </div>
                <p className="text-gray-600 font-semibold">No materials yet</p>
                <p className="text-gray-400 text-sm mt-1">Your teacher will add them soon.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materialsByLesson.map(({ lessonTitle, lessonMaterials }, idx) => (
                  <div key={lessonTitle} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleLesson(lessonTitle)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{lessonTitle}</span>
                        <span className="text-xs text-gray-400 font-medium">
                          {lessonMaterials.length} item{lessonMaterials.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {openLessons[lessonTitle]
                        ? <ChevronDown size={16} className="text-gray-400" />
                        : <ChevronRight size={16} className="text-gray-400" />}
                    </button>

                    {openLessons[lessonTitle] && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {lessonMaterials.map((material) => {
                          const downloadUrl = getMaterialHref(material.content_url);
                          const externalUrl = material.external_url;
                          
                          return (
                            <div
                              key={material.material_id}
                              className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors gap-4"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                  {material.external_url
                                    ? <PlayCircle size={15} className="text-indigo-500" />
                                    : <FileText size={15} className="text-indigo-400" />}
                                </div>
                                <span className="text-sm font-semibold text-gray-800 truncate">{material.title}</span>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                {material.content_url && downloadUrl && (
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                                    onClick={(e) => {
                                      // For direct file downloads, prevent default if needed
                                      if (!downloadUrl.startsWith('http')) {
                                        e.preventDefault();
                                        handleDownload(downloadUrl, material.title);
                                      }
                                    }}
                                  >
                                    <Download size={12} /> Download
                                  </a>
                                )}
                                {material.external_url && externalUrl && (
                                  <a
                                    href={externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <ExternalLink size={12} /> Open Link
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
