"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw, MessageSquare, Home } from "lucide-react";
import { guardRoute } from "@/lib/auth";

export default function PaymentCancelPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const orderId      = searchParams.get("order_id");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) setUser(auth);
  }, [router]);

  // Parse course_id from order_id (course_id::student_id)
  const [courseId] = (orderId || "").split("::");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md p-8 text-center">

        {/* Icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mx-auto mb-5">
          <XCircle size={52} className="text-red-400" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment was <strong className="text-red-500">not completed</strong>. No money has been
          charged to your account. You can try again whenever you're ready.
        </p>

        {/* Reasons block */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-6 text-left text-sm text-gray-600 space-y-1.5">
          <p className="font-semibold text-gray-700 mb-2">Common reasons for cancellation:</p>
          <p>• You clicked "Cancel" or closed the payment window</p>
          <p>• Card details were incorrect or card was declined</p>
          <p>• Insufficient balance in your account</p>
          <p>• Bank rejected the transaction</p>
        </div>

        {orderId && (
          <div className="text-xs text-left bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-5">
            <span className="text-amber-600 font-semibold">Order reference: </span>
            <span className="font-mono text-amber-700 break-all">{orderId}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/student/payments")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            <RefreshCw size={16} /> Try Again
          </button>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
          >
            <Home size={16} /> Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/student/feedback")}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 text-sm py-2 transition-colors"
          >
            <MessageSquare size={14} /> Report a problem
          </button>
        </div>
      </div>
    </div>
  );
}
