"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard, Loader2, AlertCircle, RefreshCw,
  Wifi, Clock, Tag, ShieldCheck, Lock, Play,
  XCircle, BookOpen, User, GraduationCap, FileText,
  CheckCircle, Search, Filter, Calendar, X,
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API                  = process.env.NEXT_PUBLIC_API_URL;
const PAYHERE_CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYHERE_URL;
const CURRENCY             = "LKR";
const FRONTEND_URL         = process.env.NEXT_PUBLIC_FRONTEND_URL;

const POLL_INTERVAL = 10000;

export default function StudentPaymentsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [grouped, setGrouped] = useState([]);
  const [filteredGrouped, setFilteredGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingCourse, setPayingCourse] = useState(null);
  const [backWarning, setBackWarning] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const leftForPayHere = useRef(false);
  const warningTimer = useRef(null);
  const pollTimer = useRef(null);
  const userRef = useRef(null);

  function showWarning() {
    setBackWarning(true);
    clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => setBackWarning(false), 10000);
  }
  
  function hideWarning() {
    setBackWarning(false);
    clearTimeout(warningTimer.current);
  }

  const filterCourses = useCallback((groups) => {
    if (!groups || groups.length === 0) {
      setFilteredGrouped([]);
      return;
    }

    let filteredGroups = groups.map(group => ({
      ...group,
      courses: group.courses.filter(course => {
        const matchesSearch = searchTerm === "" || 
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesStatus = true;
        switch (statusFilter) {
          case "paid":
            matchesStatus = course.current_month_paid === true;
            break;
          case "unpaid":
            matchesStatus = course.current_month_paid === false;
            break;
          case "enrolled":
            matchesStatus = course.is_enrolled === true;
            break;
          case "expired":
            matchesStatus = course.ever_enrolled === true && course.is_enrolled === false;
            break;
          default:
            matchesStatus = true;
        }
        
        return matchesSearch && matchesStatus;
      })
    }));
    
    filteredGroups = filteredGroups.filter(group => group.courses.length > 0);
    setFilteredGrouped(filteredGroups);
  }, [searchTerm, statusFilter]);

  const fetchAll = useCallback(async (studentId, silent = false) => {
    if (!studentId) return;
    if (!silent) setLoading(true);
    if (!silent) setError("");

    try {
      const [payRes, courseRes, teacherRes] = await Promise.all([
        authFetch(`${API}/payments/courses/${studentId}`),
        authFetch(`${API}/courses`),
        fetch(`${API}/public/teachers`),
      ]);

      const payData = await payRes.json();
      const courseData = await courseRes.json();
      const teacherData = await teacherRes.json();

      if (!payData.success) {
        if (!silent) setError(payData.error || "Failed to load courses.");
        setGrouped([]);
        setFilteredGrouped([]);
        return;
      }

      const teacherInfoMap = {};
      if (Array.isArray(teacherData)) {
        teacherData.forEach((t) => {
          teacherInfoMap[t.user_id] = {
            teacher_name: t.name || "No Teacher Assigned",
            specialization: t.specialization || null,
            description: t.description || null,
            profile_picture_url: t.profile_picture_url || null,
          };
        });
      }

      const courseTeacherMap = {};
      if (Array.isArray(courseData)) {
        courseData.forEach((c) => {
          courseTeacherMap[c.course_id] = c.teacher_id || null;
        });
      }

      const paymentStatusMap = {};
      (payData.courses || []).forEach((c) => {
        paymentStatusMap[c.course_id] = {
          is_enrolled: c.is_enrolled,
          ever_enrolled: c.ever_enrolled,
          current_month_paid: c.current_month_paid,
          access_until: c.access_until,
          current_month_payment_id: c.current_month_payment_id,
          current_month_paid_amount: c.current_month_paid_amount,
          current_month_payment_type: c.current_month_payment_type,
          current_month_payment_date: c.current_month_payment_date,
        };
      });

      const allCoursesWithStatus = [];
      
      if (Array.isArray(courseData)) {
        courseData.forEach((course) => {
          const status = paymentStatusMap[course.course_id] || {
            is_enrolled: false,
            ever_enrolled: false,
            current_month_paid: false,
            access_until: null,
            current_month_payment_id: null,
            current_month_paid_amount: null,
            current_month_payment_type: null,
            current_month_payment_date: null,
          };
          
          const tid = course.teacher_id || null;
          const info = tid ? (teacherInfoMap[tid] || null) : null;
          
          allCoursesWithStatus.push({
            course_id: course.course_id,
            title: course.title,
            description: course.description,
            fee: course.fee,
            thumbnail_url: course.thumbnail_url,
            category: course.category,
            duration: course.duration,
            teacher_id: tid,
            teacher_name: info?.teacher_name || "No Teacher Assigned",
            specialization: info?.specialization || null,
            teacher_description: info?.description || null,
            profile_picture_url: info?.profile_picture_url || null,
            is_enrolled: status.is_enrolled,
            ever_enrolled: status.ever_enrolled,
            current_month_paid: status.current_month_paid,
            access_until: status.access_until,
            current_month_payment_id: status.current_month_payment_id,
            current_month_paid_amount: status.current_month_paid_amount,
            current_month_payment_type: status.current_month_payment_type,
            current_month_payment_date: status.current_month_payment_date,
          });
        });
      } else {
        (payData.courses || []).forEach((c) => {
          const tid = courseTeacherMap[c.course_id] || null;
          const info = tid ? (teacherInfoMap[tid] || null) : null;
          allCoursesWithStatus.push({
            ...c,
            teacher_id: tid,
            teacher_name: info?.teacher_name || "No Teacher Assigned",
            specialization: info?.specialization || null,
            teacher_description: info?.description || null,
            profile_picture_url: info?.profile_picture_url || null,
          });
        });
      }

      const groupMap = {};
      allCoursesWithStatus.forEach((c) => {
        const key = c.teacher_id || "unassigned";
        if (!groupMap[key]) {
          groupMap[key] = {
            teacher_id: c.teacher_id,
            teacher_name: c.teacher_name,
            specialization: c.specialization,
            description: c.teacher_description,
            profile_picture_url: c.profile_picture_url,
            courses: [],
          };
        }
        groupMap[key].courses.push(c);
      });

      const groups = Object.values(groupMap).sort((a, b) => {
        if (!a.teacher_id) return 1;
        if (!b.teacher_id) return -1;
        return a.teacher_name.localeCompare(b.teacher_name);
      });

      setGrouped(groups);
      filterCourses(groups);
    } catch (err) {
      console.error("Fetch error:", err);
      if (!silent) setError("Network error. Please check your connection.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filterCourses]);

  useEffect(() => {
    if (grouped.length > 0) {
      filterCourses(grouped);
    }
  }, [grouped, searchTerm, statusFilter, filterCourses]);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      userRef.current = auth;
      fetchAll(auth.user_id, false);

      pollTimer.current = setInterval(() => {
        if (userRef.current) fetchAll(userRef.current.user_id, true);
      }, POLL_INTERVAL);
    }
    return () => {
      clearTimeout(warningTimer.current);
      clearInterval(pollTimer.current);
    };
  }, [router, fetchAll]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      showWarning();
      window.history.replaceState({}, "", "/student/payments");
    }

    const handlePageShow = (e) => {
      if (e.persisted && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        showWarning();
        if (userRef.current) fetchAll(userRef.current.user_id, false);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (leftForPayHere.current) {
          leftForPayHere.current = false;
          setPayingCourse(null);
          showWarning();
        }
        if (userRef.current) fetchAll(userRef.current.user_id, true);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAll]);

  async function handlePayNow(course) {
    if (payingCourse || course.current_month_paid) return;
    setPayingCourse(course.course_id);
    hideWarning();
    setError("");

    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const billMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
      const order_id = `${course.course_id}::${user.user_id}::${billMonth}`;
      const amount = parseFloat(course.fee).toFixed(2);

      const hashRes = await authFetch(`${API}/payments/online/hash`, {
        method: "POST",
        body: JSON.stringify({ order_id, amount, currency: CURRENCY }),
      });
      const hashData = await hashRes.json();

      if (!hashData.success) {
        setError(hashData.error || "Could not initiate payment.");
        setPayingCourse(null);
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYHERE_CHECKOUT_URL;

      const fields = {
        merchant_id: hashData.merchant_id,
        return_url: `${FRONTEND_URL}/student/success?order_id=${encodeURIComponent(order_id)}`,
        cancel_url: `${FRONTEND_URL}/student/payments?cancelled=1`,
        notify_url: `${API}/payments/online/notify`,
        order_id,
        items: course.title,
        currency: CURRENCY,
        amount,
        first_name: user.name?.split(" ")[0] || "Student",
        last_name: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || `${user.user_id}@lms.lk`,
        phone: user.phone_no || "0000000000",
        address: user.address || "Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hashData.hash,
      };

      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v ?? "");
        form.appendChild(input);
      });

      leftForPayHere.current = true;
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Pay error:", err);
      setError("Payment initiation failed. Please try again.");
      setPayingCourse(null);
      leftForPayHere.current = false;
    }
  }

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const totalCourses = filteredGrouped.reduce((s, g) => s + g.courses.length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-blue-800" size={24} />
            Courses & Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All available courses — pay your monthly fee by the <strong>8th of each month</strong>.
          </p>
        </div>
        <button
          onClick={() => user && fetchAll(user.user_id, false)}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by course name, teacher name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-base"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-base appearance-none bg-white cursor-pointer min-w-[200px]"
            >
              <option value="all">📚 All Courses</option>
              <option value="paid">✅ Paid This Month</option>
              <option value="unpaid">⏳ Unpaid</option>
              <option value="enrolled">🎓 Currently Enrolled</option>
              <option value="expired">⚠️ Expired / Renewal Due</option>
            </select>
          </div>
        </div>
        
        {/* Active filters display */}
        {(searchTerm || statusFilter !== "all") && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  🔍 Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-blue-900 ml-1">
                    <X size={12} />
                  </button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                  🏷️ Filter: {statusFilter === "paid" ? "Paid This Month" : 
                           statusFilter === "unpaid" ? "Unpaid" :
                           statusFilter === "enrolled" ? "Currently Enrolled" : "Expired"}
                  <button onClick={() => setStatusFilter("all")} className="hover:text-green-900 ml-1">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <div className="text-sm text-gray-500 font-medium">
          Showing {totalCourses} course{totalCourses !== 1 ? 's' : ''}
          {totalCourses > 0 && (searchTerm || statusFilter !== "all") && " (filtered)"}
        </div>
      )}

      {/* Cancelled warning */}
      {backWarning && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl px-5 py-4 text-sm">
          <XCircle size={18} className="mt-0.5 flex-shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Payment Not Completed</p>
            <p className="text-orange-700">You returned without completing payment. Please try again.</p>
          </div>
          <button onClick={hideWarning} className="text-orange-400 hover:text-orange-600 flex-shrink-0 mt-0.5">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={22} className="animate-spin text-blue-500" />
          <span className="text-sm">Loading courses…</span>
        </div>

      ) : totalCourses === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <BookOpen size={48} className="mx-auto text-blue-200 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">No courses found</h2>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Check back later for available courses"}
          </p>
          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

      ) : (
        <div className="space-y-10">
          {filteredGrouped.map((group) => (
            <section key={group.teacher_id || "unassigned"}>

              {/* Teacher profile card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  {group.profile_picture_url ? (
                    <img
                      src={group.profile_picture_url}
                      alt={group.teacher_name}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <User size={28} className="text-blue-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{group.teacher_name}</h2>
                      {group.specialization && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium mt-0.5">
                          <GraduationCap size={12} />
                          {group.specialization}
                        </div>
                      )}
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                      {group.courses.length} {group.courses.length === 1 ? "course" : "courses"}
                    </span>
                  </div>

                  {group.description && (
                    <div className="mt-2.5 flex items-start gap-1.5">
                      <FileText size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-500 leading-relaxed">{group.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Courses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {group.courses.map((course) => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    paying={payingCourse === course.course_id}
                    onPay={handlePayNow}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-4 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-green-500" />
        Payments secured by{" "}
        <span className="font-semibold text-gray-500">PayHere</span>
        {" "}— Sri Lanka's trusted payment gateway
        <Lock size={12} className="text-gray-300 ml-1" />
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, paying, onPay }) {
  const fee = parseFloat(course.fee || 0);
  const paid = course.current_month_paid === true;
  const enrolled = course.is_enrolled === true;
  const everEnrolled = course.ever_enrolled === true;

  let cardBorderClass = "border-gray-100";
  if (paid) cardBorderClass = "border-green-200";
  else if (enrolled) cardBorderClass = "border-blue-100";
  else if (everEnrolled) cardBorderClass = "border-amber-100";

  return (
    <div className={`bg-white rounded-2xl border ${cardBorderClass} shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5`}>
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-blue-700 to-blue-500 overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play size={36} className="text-white opacity-30" />
          </div>
        )}
        {course.category && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            <Tag size={10} /> {course.category}
          </div>
        )}
        
        {/* Status Badge */}
        {paid && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            <CheckCircle size={11} /> Paid
          </div>
        )}
        {!paid && enrolled && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            <CheckCircle size={11} /> Enrolled
          </div>
        )}
        {!paid && !enrolled && everEnrolled && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            <Lock size={10} /> Renewal Due
          </div>
        )}
        {!paid && !enrolled && !everEnrolled && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-gray-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            <Lock size={10} /> Not Enrolled
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>
        
        {/* Teacher name */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <User size={11} />
          <span className="font-medium">{course.teacher_name}</span>
        </div>
        
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
        )}
        {course.duration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Clock size={12} />
            <span>{course.duration}</span>
          </div>
        )}

        {/* Payment confirmation (for paid courses) */}
        {paid && course.current_month_payment_date && (
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5 mb-3">
            <Calendar size={11} />
            Paid on{" "}
            {new Date(course.current_month_payment_date).toLocaleDateString("en-LK", {
              day: "numeric", month: "long", year: "numeric",
            })}
            {course.current_month_payment_type && (
              <span className="ml-1 capitalize text-green-600">
                · {course.current_month_payment_type.toLowerCase()}
              </span>
            )}
          </div>
        )}

        {/* Renewal message (expired but ever enrolled) */}
        {!paid && !enrolled && everEnrolled && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mb-3">
            ⚠️ Your access has expired. Pay to renew.
          </p>
        )}

        {/* First time enrollment message */}
        {!paid && !enrolled && !everEnrolled && (
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 mb-3">
            💰 Pay to enroll in this course for the first time.
          </p>
        )}

        {/* Fee + Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-400 font-medium">Rs.</span>
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                {fee.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
              per month
            </span>
          </div>

          {fee === 0 ? (
            <div className="w-full text-center text-sm text-gray-400 py-3 border border-dashed border-gray-200 rounded-xl">
              🎉 Free Course
            </div>
          ) : paid ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 border border-green-200 text-sm font-bold py-3 rounded-xl cursor-not-allowed"
            >
              <CheckCircle size={15} /> Paid for {new Date().toLocaleString("default", { month: "long" })}
            </button>
          ) : (
            <button
              onClick={() => onPay(course)}
              disabled={!!paying}
              className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all duration-150 shadow-sm"
            >
              {paying ? (
                <><Loader2 size={15} className="animate-spin" /> Processing...</>
              ) : (
                <><Wifi size={15} /> {enrolled ? "Pay Now" : everEnrolled ? "Pay to Renew" : "Enroll & Pay"}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
