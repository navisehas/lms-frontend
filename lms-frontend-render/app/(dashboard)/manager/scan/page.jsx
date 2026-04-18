"use client";
import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { 
  Camera, CheckCircle, XCircle, RefreshCw, 
  User, Keyboard, QrCode, Search, BookOpen, Clock, AlertTriangle, CreditCard, DollarSign, X
} from "lucide-react";
import { authFetch } from "@/lib/auth";
const API = process.env.NEXT_PUBLIC_API_URL;


export default function QRScannerPage() {
  
  const [scanResult, setScanResult] = useState(null);
  const [activeTab, setActiveTab] = useState("scan");
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);

  // --- PAY NOW MODAL STATE ---
  const [payModal, setPayModal] = useState(null); // { course_id, title, fee }
  const [payAmount, setPayAmount] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState(null); // { type: 'success'|'error', message }
  
  const scannerRef = useRef(null);

  useEffect(() => {
    if (activeTab === "scan" && !scanResult) {
      const initScanner = setTimeout(() => {
        const readerElement = document.getElementById("reader");
        
        if (readerElement && !scannerRef.current) {
          try {
            scannerRef.current = new Html5QrcodeScanner(
              "reader",
              { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
              false
            );
            
            scannerRef.current.render(
              (decodedText) => {
                if (scannerRef.current) {
                  scannerRef.current.pause(true); 
                }
                processAttendance(decodedText);
              },
              (err) => { /* Ignore regular scan errors */ }
            );
          } catch (err) {
            console.error("Scanner Initialization Error:", err);
          }
        }
      }, 100);

      return () => {
        clearTimeout(initScanner);
      };
    }
  }, [activeTab, scanResult]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const handleTabChange = (tab) => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setActiveTab(tab);
  };

  async function processAttendance(studentId) {
    setLoading(true);
    setAttendanceStatus(null);
    try {
      const res = await authFetch(`${API}/attendance/student/${studentId}`);
      const data = await res.json();
      
      if (scannerRef.current) {
        await scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }

      if (res.ok) {
        setScanResult({ success: true, data: data, method: activeTab });
      } else {
        setScanResult({ success: false, message: data.error || `ID '${studentId}' not found.` });
      }
    } catch (error) {
      setScanResult({ success: false, message: "Network error. Make sure the server is running." });
      if (scannerRef.current) scannerRef.current.resume(); 
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAttendance(courseId, courseTitle) {
    setAttendanceStatus({ loading: true, courseId });
    try {
      const res = await authFetch(`${API}/attendance/mark`, {
        method: "POST",
        body: JSON.stringify({ 
          student_id: scanResult.data.user_id, 
          course_id: courseId 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAttendanceStatus({ type: "success", message: `Marked Present for ${courseTitle}` });
      } else {
        setAttendanceStatus({ type: "error", message: data.error });
      }
    } catch (error) {
      setAttendanceStatus({ type: "error", message: "Failed to connect to server." });
    }
  }

  // --- OPEN PAY MODAL ---
  function openPayModal(course) {
    setPayModal({ course_id: course.course_id, title: course.title, fee: course.fee });
    setPayAmount(course.fee ? String(course.fee) : "");
    setPayResult(null);
  }

  function closePayModal() {
    setPayModal(null);
    setPayAmount("");
    setPayResult(null);
    setPayLoading(false);
  }

  // --- SUBMIT CASH PAYMENT ---
  async function handlePayNow() {
    if (!payAmount || isNaN(payAmount) || parseFloat(payAmount) <= 0) {
      setPayResult({ type: "error", message: "Please enter a valid amount." });
      return;
    }
    setPayLoading(true);
    setPayResult(null);
    try {
      const res = await authFetch(`${API}/payments/physical`, {
        method: "POST",
        body: JSON.stringify({
          student_id: scanResult.data.user_id,
          course_id: payModal.course_id,
          amount: parseFloat(payAmount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayResult({ type: "success", message: `Payment of Rs. ${payAmount} recorded for "${payModal.title}".` });
        // Update the course list locally to show PAID
        setScanResult(prev => ({
          ...prev,
          data: {
            ...prev.data,
            courses: prev.data.courses.map(c =>
              c.course_id === payModal.course_id
                ? { ...c, payment_status: "PAID", is_paid: true }
                : c
            )
          }
        }));
      } else {
        setPayResult({ type: "error", message: data.error || "Payment failed." });
      }
    } catch (err) {
      setPayResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setPayLoading(false);
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualId.trim()) return;
    processAttendance(manualId.trim());
  }

  const handleReset = () => {
    setScanResult(null);
    setManualId("");
    setAttendanceStatus(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {activeTab === 'scan' ? <Camera className="text-indigo-600" /> : <Keyboard className="text-indigo-600" />} 
          Mark Attendance
        </h1>
        
        {!scanResult && (
          <div className="bg-white p-1 rounded-lg border flex shadow-sm">
            <button onClick={() => handleTabChange("scan")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === "scan" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}>
              <QrCode size={16} /> Scan QR
            </button>
            <button onClick={() => handleTabChange("manual")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === "manual" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}>
              <Keyboard size={16} /> Manual Entry
            </button>
          </div>
        )}

        {scanResult && (
          <button onClick={handleReset} className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-md">
            <RefreshCw size={18} /> Next Student
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[400px]">
          
          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="animate-spin mb-4" size={32} />
              <p>Fetching student details...</p>
            </div>
          )}

          {activeTab === "scan" && !scanResult && !loading && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl bg-black border-4 border-gray-100">
                <div id="reader" className="w-full"></div>
              </div>
              <p className="text-center text-sm text-gray-500">Position the QR code within the frame.</p>
            </div>
          )}

          {activeTab === "manual" && !scanResult && !loading && (
            <div className="h-full flex flex-col justify-center space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Keyboard size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Enter Student ID</h3>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="relative text-gray-700">
                  <Search className="absolute left-4 top-3.5 text-gray-900 w-5 h-5" />
                  <input 
                    type="text" autoFocus placeholder="e.g. STD-2026-0001"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-900 rounded-xl text-lg font-mono text-black focus:border-indigo-500 outline-none transition"
                    value={manualId} onChange={(e) => setManualId(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition">
                  Find Student
                </button>
              </form>
            </div>
          )}

          {scanResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Student Found</h3>
              <p className="text-gray-500 mb-8">Select a course on the right panel to mark attendance.</p>
              <img 
                src={scanResult.data?.profile_picture_url || "https://via.placeholder.com/150"} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              />
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="relative">
          
          {!scanResult && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <User size={48} className="mb-4 text-gray-300" />
              <p className="font-medium">Waiting for input...</p>
              <p className="text-sm mt-2">Scan a QR code to view enrolled courses.</p>
            </div>
          )}

          {scanResult && !scanResult.success && (
            <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-xl shadow-sm min-h-[200px] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="text-red-600 w-10 h-10" />
                <h2 className="text-2xl font-bold text-red-700">Not Found</h2>
              </div>
              <p className="text-red-800 text-lg">{scanResult.message}</p>
            </div>
          )}

          {scanResult && scanResult.success && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold">{scanResult.data.name}</h2>
                <p className="text-indigo-200 font-mono mt-1">{scanResult.data.user_id}</p>
              </div>

              {attendanceStatus && (
                <div className={`p-4 font-bold flex items-center gap-2 ${attendanceStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {attendanceStatus.type === 'success' ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                  {attendanceStatus.message}
                </div>
              )}

              <div className="p-6 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <BookOpen size={16} /> Enrolled Courses
                </h3>

                {scanResult.data.courses?.length === 0 ? (
                  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                    This student is not enrolled in any courses.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scanResult.data.courses.map((course) => {
                      const isPaid = course.payment_status === 'PAID' || course.is_paid;
                      return (
                        <div key={course.course_id} className={`bg-white p-4 rounded-xl border shadow-sm transition ${isPaid ? 'border-gray-200 hover:border-indigo-300' : 'border-red-200 bg-red-50/30'}`}>
                          
                          {/* Course title row */}
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900">{course.title}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              isPaid
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {isPaid ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono mb-3">{course.course_id}</p>

                          {/* Action buttons row */}
                          <div className="flex items-center gap-2">

                            {/* Pay Now button — only for UNPAID */}
                            {!isPaid && (
                              <button
                                onClick={() => openPayModal(course)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg font-bold text-sm transition shadow-sm"
                              >
                                <CreditCard size={14} /> Pay Now
                              </button>
                            )}

                            {/* Mark Present button */}
                            <button 
                              onClick={() => handleMarkAttendance(course.course_id, course.title)}
                              disabled={attendanceStatus?.loading}
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-bold transition ml-auto"
                            >
                              <Clock size={16} /> Mark Present
                            </button>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== PAY NOW MODAL ===== */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-amber-500 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Record Cash Payment</h3>
                  <p className="text-amber-100 text-sm">{scanResult?.data?.name}</p>
                </div>
              </div>
              <button onClick={closePayModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Course info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Course</p>
                <p className="font-bold text-gray-900">{payModal.title}</p>
                <p className="text-xs text-gray-500 font-mono">{payModal.course_id}</p>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Amount (Rs.)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder={payModal.fee ? `Course fee: Rs. ${payModal.fee}` : "Enter amount"}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-mono text-gray-900 focus:border-amber-500 outline-none transition"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    autoFocus
                    disabled={payLoading || payResult?.type === 'success'}
                  />
                </div>
                {payModal.fee && (
                  <p className="text-xs text-gray-400 mt-1">Standard course fee: Rs. {payModal.fee}</p>
                )}
              </div>

              {/* Result message */}
              {payResult && (
                <div className={`flex items-center gap-2 p-3 rounded-lg font-semibold text-sm ${
                  payResult.type === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {payResult.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  {payResult.message}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              {payResult?.type === 'success' ? (
                <button
                  onClick={closePayModal}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                >
                  Done ✓
                </button>
              ) : (
                <>
                  <button
                    onClick={closePayModal}
                    disabled={payLoading}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayNow}
                    disabled={payLoading || !payAmount}
                    className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {payLoading ? (
                      <><RefreshCw size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard size={18} /> Confirm Payment</>
                    )}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
