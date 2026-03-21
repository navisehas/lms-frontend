(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeacherCoursesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as ImageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/loader.js [app-client] (ecmascript) <export default as Loader>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$lib$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/lib/auth.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const API = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL;
function TeacherCoursesPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [courses, setCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TeacherCoursesPage.useEffect": ()=>{
            const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$lib$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["guardRoute"])("TEACHER", router);
            if (auth) {
                setUser(auth);
                fetchCourses(auth.user_id);
            }
        }
    }["TeacherCoursesPage.useEffect"], [
        router
    ]);
    async function fetchCourses(teacherId) {
        setLoading(true);
        setError("");
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$lib$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authFetch"])(`${API}/courses`);
            const data = await res.json();
            if (!res.ok || !Array.isArray(data)) {
                setError(data?.error || "Failed to load assigned courses.");
                setCourses([]);
                return;
            }
            setCourses(data.filter((course)=>course.teacher_id === teacherId));
        } catch  {
            setError("Network error. Please try again.");
            setCourses([]);
        } finally{
            setLoading(false);
        }
    }
    const stats = {
        total: courses.length,
        enrolled: courses.reduce((sum, course)=>sum + (course.enrolled_count || 0), 0),
        value: courses.reduce((sum, course)=>sum + parseFloat(course.fee || 0), 0)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-gray-800 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                        className: "text-indigo-600",
                                        size: 26
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 69,
                                        columnNumber: 13
                                    }, this),
                                    " My Assigned Courses"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500 mt-1",
                                children: [
                                    "Courses currently assigned to ",
                                    user?.name || "you",
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>user && fetchCourses(user.user_id),
                        className: "flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            " Refresh"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this),
                    " ",
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                lineNumber: 84,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-xl bg-indigo-50 text-indigo-600",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                    lineNumber: 92,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400",
                                        children: "Assigned Courses"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: stats.total
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 96,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-xl bg-emerald-50 text-emerald-600",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400",
                                        children: "Total Enrolled Students"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 105,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: stats.enrolled
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 106,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-xl bg-blue-50 text-blue-600",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400",
                                        children: "Combined Course Value"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl font-bold text-gray-800",
                                        children: [
                                            "Rs. ",
                                            stats.value.toLocaleString()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 116,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center py-24 text-gray-400 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader$3e$__["Loader"], {
                        size: 20,
                        className: "animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this),
                    " Loading courses..."
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                lineNumber: 122,
                columnNumber: 9
            }, this) : courses.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                        size: 48,
                        className: "mx-auto text-indigo-200 mb-4"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold text-gray-800",
                        children: "No courses assigned yet"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 128,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-500 mt-2",
                        children: "Once an admin assigns courses to your teacher account, they will appear here."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 129,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                lineNumber: 126,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
                children: courses.map((course)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-44 bg-gradient-to-br from-indigo-50 to-blue-100",
                                children: course.thumbnail_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: course.thumbnail_url,
                                    alt: course.title,
                                    className: "w-full h-full object-cover"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                    lineNumber: 142,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full h-full flex flex-col items-center justify-center text-indigo-200 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImageIcon$3e$__["ImageIcon"], {
                                            size: 34
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                            lineNumber: 149,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs",
                                            children: "No course image"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                            lineNumber: 150,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                    lineNumber: 148,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 140,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-5 flex flex-col flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-bold text-gray-800 line-clamp-2",
                                                children: course.title
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                lineNumber: 157,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-mono text-gray-300 mt-1",
                                                children: course.course_id
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                lineNumber: 158,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 156,
                                        columnNumber: 17
                                    }, this),
                                    course.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4",
                                        children: course.description
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 162,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 text-sm text-gray-500 mt-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                                                        size: 14,
                                                        className: "text-indigo-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 169,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: course.teacher_name || user?.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 170,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                lineNumber: 168,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        size: 14,
                                                        className: "text-emerald-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 173,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            course.enrolled_count,
                                                            " enrolled students"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 174,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                        size: 14,
                                                        className: "text-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 177,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: course.duration || "Duration not set"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 178,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                lineNumber: 176,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                        size: 14,
                                                        className: "text-orange-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 181,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            "Rs. ",
                                                            parseFloat(course.fee || 0).toLocaleString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                        lineNumber: 182,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                lineNumber: 180,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 167,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/teacher/courses/${course.course_id}`,
                                        className: "mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-3 hover:bg-indigo-700 transition-colors",
                                        children: [
                                            "Open Lessons ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                                lineNumber: 190,
                                                columnNumber: 32
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                        lineNumber: 186,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                                lineNumber: 155,
                                columnNumber: 15
                            }, this)
                        ]
                    }, course.course_id, true, {
                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                        lineNumber: 136,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/app/(dashboard)/teacher/courses/page.jsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(TeacherCoursesPage, "hRLe5d2zbu5e8eNCuoDb5Yjwin0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = TeacherCoursesPage;
var _c;
__turbopack_context__.k.register(_c, "TeacherCoursesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>CircleAlert
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "line",
        {
            x1: "12",
            x2: "12",
            y1: "8",
            y2: "12",
            key: "1pkeuh"
        }
    ],
    [
        "line",
        {
            x1: "12",
            x2: "12.01",
            y1: "16",
            y2: "16",
            key: "4dfq90"
        }
    ]
];
const CircleAlert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("circle-alert", __iconNode);
;
 //# sourceMappingURL=circle-alert.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlertCircle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript)");
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChevronRight
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m9 18 6-6-6-6",
            key: "mthhwq"
        }
    ]
];
const ChevronRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("chevron-right", __iconNode);
;
 //# sourceMappingURL=chevron-right.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChevronRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript)");
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Clock
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 6v6l4 2",
            key: "mmk7yg"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ]
];
const Clock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("clock", __iconNode);
;
 //# sourceMappingURL=clock.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Clock",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript)");
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>DollarSign
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "line",
        {
            x1: "12",
            x2: "12",
            y1: "2",
            y2: "22",
            key: "7eqyqh"
        }
    ],
    [
        "path",
        {
            d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
            key: "1b0p4s"
        }
    ]
];
const DollarSign = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("dollar-sign", __iconNode);
;
 //# sourceMappingURL=dollar-sign.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DollarSign",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript)");
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Image
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "18",
            height: "18",
            x: "3",
            y: "3",
            rx: "2",
            ry: "2",
            key: "1m3agn"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "9",
            r: "2",
            key: "af1f0g"
        }
    ],
    [
        "path",
        {
            d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
            key: "1xmnt7"
        }
    ]
];
const Image = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("image", __iconNode);
;
 //# sourceMappingURL=image.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as ImageIcon>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImageIcon",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript)");
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/loader.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Loader
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 2v4",
            key: "3427ic"
        }
    ],
    [
        "path",
        {
            d: "m16.2 7.8 2.9-2.9",
            key: "r700ao"
        }
    ],
    [
        "path",
        {
            d: "M18 12h4",
            key: "wj9ykh"
        }
    ],
    [
        "path",
        {
            d: "m16.2 16.2 2.9 2.9",
            key: "1bxg5t"
        }
    ],
    [
        "path",
        {
            d: "M12 18v4",
            key: "jadmvz"
        }
    ],
    [
        "path",
        {
            d: "m4.9 19.1 2.9-2.9",
            key: "bwix9q"
        }
    ],
    [
        "path",
        {
            d: "M2 12h4",
            key: "j09sii"
        }
    ],
    [
        "path",
        {
            d: "m4.9 4.9 2.9 2.9",
            key: "giyufr"
        }
    ]
];
const Loader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("loader", __iconNode);
;
 //# sourceMappingURL=loader.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/loader.js [app-client] (ecmascript) <export default as Loader>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Loader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/loader.js [app-client] (ecmascript)");
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>RefreshCw
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
            key: "v9h5vc"
        }
    ],
    [
        "path",
        {
            d: "M21 3v5h-5",
            key: "1q7to0"
        }
    ],
    [
        "path",
        {
            d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
            key: "3uifl3"
        }
    ],
    [
        "path",
        {
            d: "M8 16H3v5",
            key: "1cv678"
        }
    ]
];
const RefreshCw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("refresh-cw", __iconNode);
;
 //# sourceMappingURL=refresh-cw.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RefreshCw",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript)");
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Users
]);
/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
            key: "1yyitq"
        }
    ],
    [
        "path",
        {
            d: "M16 3.128a4 4 0 0 1 0 7.744",
            key: "16gr8j"
        }
    ],
    [
        "path",
        {
            d: "M22 21v-2a4 4 0 0 0-3-3.87",
            key: "kshegd"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "7",
            r: "4",
            key: "nufk8"
        }
    ]
];
const Users = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("users", __iconNode);
;
 //# sourceMappingURL=users.js.map
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Users",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=Desktop_IMS_lms-frontend_lms-frontend-render_e51d75b6._.js.map