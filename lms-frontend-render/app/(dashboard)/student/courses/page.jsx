"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  CreditCard,
  DollarSign,
  Loader,
  RefreshCw,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const PAYHERE_URL = process.env.NEXT_PUBLIC_PAYHERE_URL || "https://sandbox.payhere.lk/pay/checkout";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function StudentCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingCourseId, setPayingCourseId] = useState("");

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      fetchCourses(auth.user_id);
    }
  }, [router]);

  async function fetchCourses(studentId) {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/payments/courses/${studentId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load your courses.");
        setCourses([]);
        return;
      }

      setCourses((data.courses || []).filter((course) => course.is_enrolled));
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  function submitPayHerePayment(payload) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = PAYHERE_URL;
    form.style.display = "none";

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  async function handlePayNow(course) {
    if (!user || !course?.course_id || payingCourseId) return;

    setError("");
    setPayingCourseId(course.course_id);
    try {
      const amount = Number(course.fee || 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        setError("Invalid course fee. Please contact support.");
        return;
      }

      const orderId = `${course.course_id}::${user.user_id}`;
      const hashRes = await authFetch(`${API}/payments/online/hash`, {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          amount: amount.toFixed(2),
          currency: "LKR",
        }),
      });

      const hashData = await hashRes.json();
      if (!hashRes.ok || !hashData.success) {
        setError(hashData.error || "Failed to initialize online payment.");
        return;
      }

      const nameParts = (user.name || "Student").trim().split(/\s+/);
      const firstName = nameParts[0] || "Student";
      const lastName = nameParts.slice(1).join(" ") || "User";

      submitPayHerePayment({
        merchant_id: hashData.merchant_id,
        return_url: `${APP_URL}/student/courses`,
        cancel_url: `${APP_URL}/student/courses`,
        notify_url: `${API}/payments/online/notify`,
        order_id: orderId,
        items: course.title || course.course_id,
        currency: "LKR",
        amount: amount.toFixed(2),
        first_name: firstName,
        last_name: lastName,
        email: `${user.user_id.toLowerCase()}@englishgate.local`,
        phone: "0700000000",
        address: "N/A",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hashData.hash,
      });
    } catch {
      setError("Network error while starting payment.");
    } finally {
      setPayingCourseId("");
    }
  }

  const totalSpent = courses.reduce((sum, course) => sum + parseFloat(course.paid_amount || 0), 0);
  const paidCourses = courses.filter((course) => course.payment_id);
  const pendingCourses = courses.filter((course) => !course.payment_id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={26} /> My Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">Enrolled courses with payment status and learning access.</p>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Enrolled Courses</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Paid Courses</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {paidCourses.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Pending Payment</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Total Paid</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">Rs. {totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <BookOpen size={48} className="mx-auto text-indigo-200 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">No enrolled courses yet</h2>
          <p className="text-sm text-gray-500 mt-2">
            Once you complete payment for a course, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.course_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-gray-300">{course.course_id}</p>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{course.title}</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-bold">
                  <CheckCircle size={12} /> Enrolled
                </span>
              </div>

              {course.description && (
                <p className="text-sm text-gray-500 leading-relaxed mt-3">{course.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <DollarSign size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Course Fee</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">Rs. {parseFloat(course.fee || 0).toLocaleString()}</p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <CreditCard size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Payment</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {course.payment_type ? (course.payment_type === "ONLINE" ? "Online" : "Cash") : "Pending"}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {course.payment_id ? (
                  <Link
                    href={`/student/courses/${course.course_id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    View Materials
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                      Payment required to access materials
                    </span>
                    <button
                      onClick={() => handlePayNow(course)}
                      disabled={payingCourseId === course.course_id}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {payingCourseId === course.course_id ? "Starting payment..." : "Pay Now"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
