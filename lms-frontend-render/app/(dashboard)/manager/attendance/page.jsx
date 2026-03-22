"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Calendar, Search, Edit2, Trash2, 
  CheckCircle, XCircle, X, Loader, BookOpen, AlertTriangle, UserMinus, AlertCircle, FileText, DownloadCloud, FileDown, Clock
} from "lucide-react";
import { authFetch } from "@/lib/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AttendanceLog() {
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("ALL");
  
  const [updateModal, setUpdateModal] = useState({ isOpen: false, record: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, record: null });
  const [absentModal, setAbsentModal] = useState({ isOpen: false, courseId: "", date: new Date().toISOString().split('T')[0] });
  
  // Report Modal State
  const [reportModal, setReportModal] = useState({ isOpen: false, type: "STUDENT" });

  const [alertPopup, setAlertPopup] = useState({ isOpen: false, type: "success", message: "" });
  
  const [editCourseId, setEditCourseId] = useState(""); 
  const [studentCourses, setStudentCourses] = useState([]); 
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAbsents, setIsMarkingAbsents] = useState(false);

  const showAlert = (type, message) => {
    setAlertPopup({ isOpen: true, type, message });
    setTimeout(() => setAlertPopup({ isOpen: false, type: "success", message: "" }), 3500);
  };

  useEffect(() => {
    fetchAttendance();
    fetchAllCourses();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await authFetch("http://localhost:5000/attendance/all");
      if (res.ok) setAttendanceData(await res.json());
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const res = await authFetch("http://localhost:5000/courses");
      if (res.ok) setAllCourses(await res.json());
    } catch (error) {
      console.error("Failed to fetch courses");
    }
  };

  const uniqueCoursesFilter = [...new Set(attendanceData.map(item => item.course))];

  const openUpdateModal = async (record) => {
    setUpdateModal({ isOpen: true, record });
    setEditCourseId(record.course_id); 
    setFetchingCourses(true);
    try {
      const res = await authFetch(`http://localhost:5000/student/${record.studentId}/courses`);
      setStudentCourses(await res.json());
    } catch (error) {
      showAlert("error", "Failed to load student courses");
      setUpdateModal({ isOpen: false, record: null });
    } finally {
      setFetchingCourses(false);
    }
  };

  const submitUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await authFetch(`http://localhost:5000/attendance/${updateModal.record.id}`, {
        method: "PUT",
        body: JSON.stringify({ course_id: editCourseId })
      });
      const data = await res.json();
      if (res.ok) {
        const selectedCourse = studentCourses.find(c => c.course_id === editCourseId);
        setAttendanceData(attendanceData.map(item => 
          item.id === updateModal.record.id ? { ...item, course_id: editCourseId, course: selectedCourse.title } : item
        ));
        setUpdateModal({ isOpen: false, record: null });
        showAlert("success", "Course updated successfully!");
      } else {
        showAlert("error", data.error || "Failed to update course");
      }
    } catch (error) {
      showAlert("error", "Server connection failed");
    } finally {
      setIsSaving(false);
    }
  };

  const submitDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await authFetch(`http://localhost:5000/attendance/${deleteModal.record.id}`, { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        setAttendanceData(attendanceData.filter(item => item.id !== deleteModal.record.id));
        setDeleteModal({ isOpen: false, record: null });
        showAlert("success", "Record deleted successfully!");
      } else {
        const data = await res.json();
        showAlert("error", data.error || "Failed to delete record.");
      }
    } catch (error) {
      showAlert("error", "Server connection failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const submitBulkAbsents = async () => {
    if (!absentModal.courseId) return showAlert("error", "Please select a course first.");
    setIsMarkingAbsents(true);
    try {
      const res = await authFetch("http://localhost:5000/attendance/mark-absents", {
        method: "POST",
        body: JSON.stringify({ course_id: absentModal.courseId, date: absentModal.date })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("success", data.message);
        setAbsentModal({ isOpen: false, courseId: "", date: new Date().toISOString().split('T')[0] });
        fetchAttendance();
      } else {
        showAlert("error", data.error || "Failed to mark absents");
      }
    } catch (error) {
      showAlert("error", "Server connection failed");
    } finally {
      setIsMarkingAbsents(false);
    }
  };

  // ==================== FILTER & STATISTICS LOGIC ====================
  const filteredData = attendanceData.filter(item => {
    const d = new Date(item.date);
    const recordDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const matchesDate = !filterDate || recordDate === filterDate;
    const matchesCourse = filterCourse === "ALL" || item.course === filterCourse;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || item.studentId.toLowerCase().includes(searchLower);
    return matchesDate && matchesCourse && matchesSearch;
  });

  const totalClasses = filteredData.length;
  const attendedClasses = filteredData.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
  const absentClasses = filteredData.filter(r => r.status === "ABSENT" || r.status === "EXCUSED").length;
  const attendancePercentage = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ==================== LIVE REPORT GENERATION LOGIC ====================
  const reportData = useMemo(() => {
    if (!reportModal.isOpen) return [];
    
    let grouped = {};
    const type = reportModal.type;

    filteredData.forEach(record => {
      let groupKey = "";
      const d = new Date(record.date);
      
      switch (type) {
        case "STUDENT":
          groupKey = `${record.name} (${record.studentId})`;
          break;
        case "CLASS":
          groupKey = record.course;
          break;
        case "DATE":
          groupKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          break;
        case "WEEK":
          const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
          const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
          const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          groupKey = `${d.getFullYear()} - Week ${weekNum}`;
          break;
        case "MONTH":
          groupKey = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
          break;
        case "YEAR":
          groupKey = `${d.getFullYear()}`;
          break;
        default:
          groupKey = "All";
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = { key: groupKey, total: 0, attended: 0, absent: 0 };
      }

      grouped[groupKey].total += 1;
      
      if (record.status === "PRESENT" || record.status === "LATE") {
        grouped[groupKey].attended += 1;
      } else {
        grouped[groupKey].absent += 1;
      }
    });

    return Object.values(grouped).map(stats => {
      stats.rate = stats.total === 0 ? 0 : Math.round((stats.attended / stats.total) * 100);
      return stats;
    }).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredData, reportModal.isOpen, reportModal.type]);


  // Helper to get active filters string
  const getActiveFiltersString = () => {
    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Student: "${searchTerm}"`);
    if (filterDate) activeFilters.push(`Date: ${filterDate}`);
    if (filterCourse !== "ALL") activeFilters.push(`Course: ${filterCourse}`);
    
    return activeFilters.length > 0 ? activeFilters.join("  |  ") : "None (All Records)";
  };


  // ==================== DOWNLOAD HANDLERS (REPORT MODAL) ====================
  const downloadReportCSV = () => {
    if (reportData.length === 0) return showAlert("error", "No data to download.");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `ENGLISH GATE - Attendance Report (${reportModal.type}-WISE)\n`;
    csvContent += `Generated On: ${new Date().toLocaleString()}\n\n`;
    csvContent += "Group/Entity,Total Records,Attended,Absent,Attendance Rate (%)\n";

    reportData.forEach(row => {
      const safeKey = `"${row.key.replace(/"/g, '""')}"`;
      csvContent += `${safeKey},${row.total},${row.attended},${row.absent},${row.rate}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `English_Gate_Report_${reportModal.type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert("success", "CSV Report downloaded successfully!");
  };

  // --- UPDATED PDF EXPORT FOR REPORT MODAL ---
  const downloadReportPDF = async () => {
    if (reportData.length === 0) return showAlert("error", "No data to download.");

    const doc = new jsPDF();
    
    // 1. Attempt to Load Logo Image
    let logoDataUrl = null;
    try {
      const img = new Image();
      img.src = '/logo.png'; 
      
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          logoDataUrl = canvas.toDataURL("image/png");
          resolve();
        };
        img.onerror = resolve; 
      });
    } catch (e) {
      console.warn("Could not load logo for PDF");
    }

    // 2. Draw Header (Logo + Title)
    let textStartX = 14;
    let startYOffset = 34;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 12, 16, 16); // Logo at top left
      textStartX = 34; 
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Indigo / Dark Blue
    doc.setFont("helvetica", "bold");
    doc.text("ENGLISH GATE", textStartX, 22);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text("Attendance Summary Report", textStartX, 28);

    // 3. Draw Metadata & Group By Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, startYOffset + 6);
    doc.text(`Total Filtered Records: ${filteredData.length}`, 14, startYOffset + 12);
    
    const groupByText = reportModal.type.charAt(0) + reportModal.type.slice(1).toLowerCase();
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229); 
    doc.text(`Grouped By: ${groupByText}`, 14, startYOffset + 18);

    // Prepare Table Data
    const tableColumn = [
      groupByText, 
      "Total Classes", "Attended", "Absent", "Rate (%)"
    ];
    
    const tableRows = reportData.map(row => [row.key, row.total, row.attended, row.absent, `${row.rate}%`]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startYOffset + 24,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, 
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`English_Gate_Report_${reportModal.type}_${new Date().toISOString().split('T')[0]}.pdf`);
    showAlert("success", "PDF Report downloaded successfully!");
  };

  // ==================== DOWNLOAD HANDLERS (FILTERED TABLE) ====================
  
  const downloadTableCSV = () => {
    if (filteredData.length === 0) return showAlert("error", "No records found to download.");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `ENGLISH GATE - Filtered Attendance Log\n`;
    csvContent += `Generated On: ${new Date().toLocaleString()}\n`;
    csvContent += `Filters Applied: ${getActiveFiltersString()}\n\n`;
    csvContent += "Date,Time,Student ID,Student Name,Course,Status\n";

    filteredData.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      const time = item.status === "ABSENT" || item.status === "EXCUSED" ? "--:--" : (item.arrival_time || formatTime(item.date));
      const safeName = `"${item.name.replace(/"/g, '""')}"`;
      const safeCourse = `"${item.course.replace(/"/g, '""')}"`;
      
      csvContent += `${date},${time},${item.studentId},${safeName},${safeCourse},${item.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `English_Gate_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert("success", "Table CSV downloaded successfully!");
  };

  const downloadTablePDF = async () => {
    if (filteredData.length === 0) return showAlert("error", "No records found to download.");

    const doc = new jsPDF();
    
    // 1. Attempt to Load Logo Image
    let logoDataUrl = null;
    try {
      const img = new Image();
      img.src = '/logo.png'; 
      
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          logoDataUrl = canvas.toDataURL("image/png");
          resolve();
        };
        img.onerror = resolve; 
      });
    } catch (e) {
      console.warn("Could not load logo for PDF");
    }

    // 2. Draw Header (Logo + Title)
    let textStartX = 14;
    let startYOffset = 34;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 12, 16, 16); 
      textStartX = 34; 
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); 
    doc.setFont("helvetica", "bold");
    doc.text("ENGLISH GATE", textStartX, 22);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text("Filtered Attendance Log", textStartX, 28);

    // 3. Draw Metadata & Filters
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, startYOffset + 6);
    doc.text(`Total Records: ${filteredData.length}`, 14, startYOffset + 12);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229); 
    doc.text(`Filters Applied: ${getActiveFiltersString()}`, 14, startYOffset + 18);

    // 4. Generate Table
    const tableColumn = ["Date", "Time", "Student ID", "Student Name", "Course", "Status"];
    const tableRows = filteredData.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.status === "ABSENT" || item.status === "EXCUSED" ? "--:--" : (item.arrival_time || formatTime(item.date)),
      item.studentId,
      item.name,
      item.course,
      item.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startYOffset + 24, 
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, 
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 8 }
    });

    doc.save(`English_Gate_Attendance_${new Date().toISOString().split('T')[0]}.pdf`);
    showAlert("success", "Table PDF downloaded successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* TOAST NOTIFICATION */}
      {alertPopup.isOpen && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center justify-between px-4 py-3 min-w-[300px] rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
          alertPopup.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <div className="flex items-center gap-3">
            {alertPopup.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="font-bold text-sm">{alertPopup.message}</span>
          </div>
          <button onClick={() => setAlertPopup({ ...alertPopup, isOpen: false })} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Log</h1>
          <p className="text-gray-500 text-sm mt-1">Manage, filter, and view reports on student attendance.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={() => setReportModal({ isOpen: true, type: "STUDENT" })}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition w-full sm:w-auto"
          >
            <FileText size={18} /> View Detailed Report
          </button>
          <button 
            onClick={() => setAbsentModal({ ...absentModal, isOpen: true })}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition w-full sm:w-auto"
          >
            <UserMinus size={18} /> Finalize Absents
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-gray-700">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Filter by Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
              className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate("")} 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition"
                title="Clear date"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Filter by Course</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <select 
              value={filterCourse} 
              onChange={(e) => setFilterCourse(e.target.value)} 
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white transition"
            >
              <option value="ALL">All Courses</option>
              {uniqueCoursesFilter.map(course => <option key={course} value={course}>{course}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        {/* --- LIVE SUMMARY STATISTICS BAR & EXPORT BUTTONS --- */}
        {!loading && (
          <div className="bg-gray-50 border-b border-gray-200 p-4 md:p-5 flex flex-col xl:flex-row justify-between gap-6 shrink-0">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 md:divide-x divide-gray-200 w-full xl:w-auto">
              <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Filtered Records</span>
                <span className="text-2xl font-black text-gray-900">{totalClasses}</span>
              </div>
              <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Attended</span>
                <span className="text-2xl font-black text-green-600">{attendedClasses}</span>
              </div>
              <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Absent</span>
                <span className="text-2xl font-black text-red-600">{absentClasses}</span>
              </div>
              <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Avg. Attendance</span>
                <span className={`text-2xl font-black ${
                  attendancePercentage >= 80 ? 'text-green-600' : 
                  attendancePercentage >= 50 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {attendancePercentage}%
                </span>
              </div>
            </div>

            {/* Export Results Buttons */}
            <div className="flex items-center gap-2 xl:border-l border-gray-200 xl:pl-6 shrink-0">
               <button 
                  onClick={downloadTableCSV} 
                  title="Download Current Table as CSV"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-bold shadow-sm transition w-full sm:w-auto justify-center"
                >
                 <DownloadCloud size={16} /> Export CSV
               </button>
               <button 
                  onClick={downloadTablePDF} 
                  title="Download Current Table as PDF"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-bold shadow-sm transition w-full sm:w-auto justify-center"
                >
                 <FileDown size={16} /> Export PDF
               </button>
            </div>

          </div>
        )}

        {/* FIXED HEIGHT SCROLLABLE DATA TABLE */}
        <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
          {loading ? (
            <div className="flex justify-center items-center p-16"><Loader className="animate-spin text-indigo-600 w-8 h-8"/></div>
          ) : (
            <table className="w-full text-left border-collapse relative">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm ring-1 ring-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold bg-gray-50">Student Details</th>
                  <th className="px-6 py-4 font-bold bg-gray-50">Date & Time</th>
                  <th className="px-6 py-4 font-bold bg-gray-50">Status</th>
                  <th className="px-6 py-4 font-bold text-right bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredData.length > 0 ? filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs font-mono text-gray-500">{item.studentId}</div>
                      <div className="text-xs font-bold text-indigo-600 mt-1">{item.course}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{new Date(item.date).toLocaleDateString()}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">
                        {item.status === "ABSENT" || item.status === "EXCUSED" ? "--:--" : (item.arrival_time ? item.arrival_time : formatTime(item.date))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        item.status === "PRESENT" ? "bg-green-50 text-green-700 border-green-200" : 
                        item.status === "LATE" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {item.status === "PRESENT" ? <CheckCircle size={14} /> : 
                         item.status === "LATE" ? <Clock size={14} /> : <XCircle size={14} />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openUpdateModal(item)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDeleteModal({ isOpen: true, record: item })} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-gray-400 bg-white">
                      <div className="flex flex-col items-center">
                        <Search className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="font-medium text-gray-500">No attendance records found.</p>
                        <p className="text-xs mt-1">Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* DETAILED REPORT MODAL - FIXED COLUMN ALIGNMENTS */}
      {reportModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 mar">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-gray-100 shrink-0 ">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <FileText size={20} />
                </div>
                Detailed Attendance Report
              </h2>
              <button onClick={() => setReportModal({ ...reportModal, isOpen: false })} className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition"><X size={20} /></button>
            </div>

            {/* Toolbar Area */}
            <div className="p-5 md:p-6 bg-gray-50 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Summarizing the <strong className="text-gray-900">{filteredData.length}</strong> records currently filtered on the main page.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Group By:</label>
                <select 
                  value={reportModal.type}
                  onChange={(e) => setReportModal({ ...reportModal, type: e.target.value })}
                  className="w-full lg:w-48 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-gray-900 bg-white shadow-sm transition"
                >
                  <option value="STUDENT">Student</option>
                  <option value="CLASS">Course / Class</option>
                  <option value="DATE">Daily</option>
                  <option value="WEEK">Weekly</option>
                  <option value="MONTH">Monthly</option>
                  <option value="YEAR">Yearly</option>
                </select>
              </div>
            </div>

            {/* Display Table */}
            <div className="overflow-y-auto flex-1 p-4 md:p-6 bg-white">
              {reportData.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-bold text-gray-500">No data available to display.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">{reportModal.type.charAt(0) + reportModal.type.slice(1).toLowerCase()}</th>
                        <th className="px-4 py-4 text-center whitespace-nowrap">Total Records</th>
                        <th className="px-4 py-4 text-center text-green-700 whitespace-nowrap">Attended</th>
                        <th className="px-4 py-4 text-center text-red-700 whitespace-nowrap">Absent</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-bold text-gray-900 min-w-[200px]">{row.key}</td>
                          <td className="px-4 py-4 text-center font-medium text-gray-600 whitespace-nowrap">{row.total}</td>
                          <td className="px-4 py-4 text-center font-bold text-green-600 bg-green-50/30 whitespace-nowrap">{row.attended}</td>
                          <td className="px-4 py-4 text-center font-bold text-red-600 bg-red-50/30 whitespace-nowrap">{row.absent}</td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center min-w-[3.5rem] px-2.5 py-1 rounded-md text-xs font-extrabold border ${
                              row.rate >= 80 ? 'bg-green-50 text-green-700 border-green-200' : 
                              row.rate >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {row.rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mobile Responsive Modal Footer with Download Buttons */}
            <div className="p-5 md:p-6 bg-gray-50 border-t border-gray-100 shrink-0">
               <div className="flex flex-col sm:flex-row justify-end gap-3">
                 <button onClick={() => setReportModal({ ...reportModal, isOpen: false })} className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-bold transition shadow-sm order-3 sm:order-1">
                   Close
                 </button>
                 <button onClick={downloadReportCSV} className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-sm order-2">
                   <DownloadCloud size={18} /> CSV Export
                 </button>
                 <button onClick={downloadReportPDF} className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-sm order-1 sm:order-3">
                   <FileDown size={18} /> PDF Export
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ABSENT MODAL - FIXED SCROLLING & FORM SUBMISSION */}
      {absentModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Mark Remaining Absents</h2>
              <button onClick={() => setAbsentModal({...absentModal, isOpen: false})} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); submitBulkAbsents(); }} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="bg-amber-50 text-red-700 p-4 rounded-lg text-sm border border-amber-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <p>This will find all students enrolled in the selected course who <strong>do not</strong> have an attendance record for this date, and mark them as <strong>ABSENT</strong>.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Course</label>
                  <select 
                    value={absentModal.courseId}
                    onChange={(e) => setAbsentModal({...absentModal, courseId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-gray-700 transition"
                  >
                    <option value="" disabled>-- Select a Course --</option>
                    {allCourses.map(course => <option key={course.course_id} value={course.course_id}>{course.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
                  <input 
                    type="date" 
                    value={absentModal.date}
                    onChange={(e) => setAbsentModal({...absentModal, date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700 transition"
                  />
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                <button type="button" onClick={() => setAbsentModal({...absentModal, isOpen: false})} className="flex-1 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition shadow-sm">Cancel</button>
                <button type="submit" disabled={isMarkingAbsents} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 font-bold transition flex items-center justify-center gap-2 shadow-sm">
                  {isMarkingAbsents ? <><Loader size={16} className="animate-spin"/> Processing...</> : "Mark Absents"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE MODAL - FIXED SCROLLING & FORM SUBMISSION */}
      {updateModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Edit Attendance Course</h2>
              <button onClick={() => setUpdateModal({ isOpen: false, record: null })} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); submitUpdate(); }} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Student</p>
                  <p className="font-bold text-gray-900">{updateModal.record.name} <span className="font-mono text-xs text-gray-500 font-normal ml-1">({updateModal.record.studentId})</span></p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Change Course to:</label>
                  {fetchingCourses ? (
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg flex items-center gap-2 text-sm font-medium border border-indigo-100"><Loader size={16} className="animate-spin" /> Fetching enrolled courses...</div>
                  ) : (
                    <select value={editCourseId} onChange={(e) => setEditCourseId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-900 bg-white transition">
                      {studentCourses.length === 0 && <option value="">No courses enrolled</option>}
                      {studentCourses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                <button type="button" onClick={() => setUpdateModal({ isOpen: false, record: null })} className="flex-1 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition shadow-sm">Cancel</button>
                <button type="submit" disabled={fetchingCourses || studentCourses.length === 0 || isSaving} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 font-bold transition flex items-center justify-center gap-2 shadow-sm">
                  {isSaving ? <><Loader size={16} className="animate-spin"/> Saving...</> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL - FIXED STRUCTURE */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 text-center p-6">
            <div className="overflow-y-auto">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"><AlertTriangle size={32} /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Record?</h2>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete the attendance record for <span className="font-bold text-gray-700">{deleteModal.record?.name}</span> on <span className="font-bold text-gray-700">{deleteModal.record?.course}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ isOpen: false, record: null })} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition shadow-sm">Cancel</button>
                <button onClick={submitDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-red-400 font-bold transition flex items-center justify-center gap-2 shadow-sm">
                  {isDeleting ? <><Loader size={16} className="animate-spin"/> Deleting...</> : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
