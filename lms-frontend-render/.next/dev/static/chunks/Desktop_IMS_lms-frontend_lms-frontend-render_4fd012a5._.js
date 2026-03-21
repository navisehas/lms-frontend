(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/lib/auth.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authFetch",
    ()=>authFetch,
    "clearSession",
    ()=>clearSession,
    "getToken",
    ()=>getToken,
    "getUser",
    ()=>getUser,
    "guardRoute",
    ()=>guardRoute,
    "isLoggedIn",
    ()=>isLoggedIn,
    "logout",
    ()=>logout,
    "saveSession",
    ()=>saveSession
]);
const TOKEN_KEY = "token";
const USER_KEY = "user";
function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch  {
        return null;
    }
}
function isLoggedIn() {
    return Boolean(getToken());
}
async function authFetch(url, options = {}) {
    const token = getToken();
    // When sending FormData (file uploads / multipart), do NOT set Content-Type.
    // The browser will set it automatically with the correct multipart boundary.
    // Forcing "application/json" here breaks multer's multipart parsing so
    // req.body ends up empty and req.files is never populated.
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...isFormData ? {} : {
            "Content-Type": "application/json"
        },
        ...options.headers || {},
        ...token ? {
            Authorization: `Bearer ${token}`
        } : {}
    };
    const response = await fetch(url, {
        ...options,
        headers
    });
    if (response.status === 401) {
        clearSession();
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
    }
    return response;
}
function guardRoute(requiredRole, router) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const user = getUser();
    if (!user || !isLoggedIn()) {
        router.replace("/login");
        return null;
    }
    if (user.role !== requiredRole) {
        const roleRoutes = {
            ADMIN: "/admin/dashboard",
            MANAGER: "/manager/dashboard",
            TEACHER: "/teacher/dashboard",
            STUDENT: "/student/dashboard"
        };
        router.replace(roleRoutes[user.role] || "/login");
        return null;
    }
    return user;
}
function logout(router) {
    clearSession();
    router.push("/login");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$lib$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/lib/auth.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// All roles use the same blue pill style
const ROLE_COLORS = {
    ADMIN: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        badge: "bg-blue-600"
    },
    MANAGER: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        badge: "bg-blue-600"
    },
    TEACHER: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        badge: "bg-blue-600"
    },
    STUDENT: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        badge: "bg-blue-600"
    }
};
const ROLE_DASHBOARD = {
    ADMIN: "/admin/dashboard",
    MANAGER: "/manager/dashboard",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/student/dashboard"
};
const ROLE_PROFILE = {
    ADMIN: "/admin/users",
    MANAGER: "/manager/students",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/student/profile"
};
function Navbar() {
    _s();
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dropdownOpen, setDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loggedIn, setLoggedIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const dropRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            const u = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$lib$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUser"])();
            const ok = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$lib$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLoggedIn"])();
            setUser(u);
            setLoggedIn(ok);
        }
    }["Navbar.useEffect"], [
        pathname
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            function handleClick(e) {
                if (dropRef.current && !dropRef.current.contains(e.target)) {
                    setDropdown(false);
                }
            }
            document.addEventListener("mousedown", handleClick);
            return ({
                "Navbar.useEffect": ()=>document.removeEventListener("mousedown", handleClick)
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    const handleLogout = ()=>{
        setDropdown(false);
        setIsOpen(false);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$lib$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])(router);
    };
    const navLinks = [
        {
            name: "Home",
            href: "/"
        },
        {
            name: "About",
            href: "/about"
        },
        {
            name: "Courses",
            href: "/courses"
        },
        {
            name: "Gallery",
            href: "/gallery"
        },
        {
            name: "Contact",
            href: "/contact"
        }
    ];
    const colors = user ? ROLE_COLORS[user.role] || ROLE_COLORS.STUDENT : null;
    const initials = user ? user.name ? user.name.split(" ").map((w)=>w[0]).join("").toUpperCase().slice(0, 2) : (user.user_id || "?").slice(0, 2).toUpperCase() : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "bg-white shadow-md sticky top-0 z-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full px-4 lg:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between h-16",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "flex items-center gap-2 flex-shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: "/logo.png",
                                    alt: "English Gate Logo",
                                    width: 40,
                                    height: 40,
                                    className: "object-contain"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                    lineNumber: 85,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "whitespace-nowrap font-extrabold text-xl tracking-tight",
                                    style: {
                                        fontFamily: "'Poppins', 'Nunito', 'Segoe UI', sans-serif",
                                        background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        letterSpacing: "-0.3px"
                                    },
                                    children: [
                                        "English Gate ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 400,
                                                WebkitTextFillColor: "transparent"
                                            },
                                            children: "LMS"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                            lineNumber: 97,
                                            columnNumber: 28
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden md:flex items-center gap-6",
                            children: [
                                navLinks.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: link.href,
                                        className: "whitespace-nowrap transition-all duration-200",
                                        style: {
                                            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
                                            fontSize: "0.9rem",
                                            fontWeight: pathname === link.href ? "700" : "500",
                                            color: pathname === link.href ? "#2563eb" : "#1e3a8a",
                                            borderBottom: pathname === link.href ? "2px solid #2563eb" : "2px solid transparent",
                                            paddingBottom: "2px",
                                            letterSpacing: "0.01em"
                                        },
                                        children: link.name
                                    }, link.name, false, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                        lineNumber: 105,
                                        columnNumber: 15
                                    }, this)),
                                loggedIn && user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    ref: dropRef,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setDropdown((v)=>!v),
                                            className: `flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${colors.bg} ${colors.text} border-current hover:opacity-90`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `w-7 h-7 rounded-full ${colors.badge} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`,
                                                    children: initials
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                    lineNumber: 129,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-semibold max-w-[120px] truncate",
                                                    children: user.name || user.user_id
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                    lineNumber: 132,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    size: 14,
                                                    className: `transition-transform ${dropdownOpen ? "rotate-180" : ""}`
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                    lineNumber: 135,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                            lineNumber: 125,
                                            columnNumber: 17
                                        }, this),
                                        dropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `px-4 py-3 ${colors.bg}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: `text-xs font-bold uppercase tracking-wide ${colors.text}`,
                                                            children: user.role
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                            lineNumber: 141,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-semibold text-gray-800 truncate mt-0.5",
                                                            children: user.name || user.user_id
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                            lineNumber: 142,
                                                            columnNumber: 23
                                                        }, this),
                                                        user.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-500 truncate",
                                                            children: user.user_id
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                            lineNumber: 143,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                    lineNumber: 140,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "py-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: ROLE_DASHBOARD[user.role] || "/",
                                                            onClick: ()=>setDropdown(false),
                                                            className: "flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
                                                                    size: 16,
                                                                    className: "text-gray-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                                    lineNumber: 148,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " Dashboard"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                            lineNumber: 146,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: ROLE_PROFILE[user.role] || "/",
                                                            onClick: ()=>setDropdown(false),
                                                            className: "flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                    size: 16,
                                                                    className: "text-gray-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                                    lineNumber: 152,
                                                                    columnNumber: 25
                                                                }, this),
                                                                " My Profile"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                            lineNumber: 150,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                    lineNumber: 145,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "border-t border-gray-100 py-1",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleLogout,
                                                        className: "flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                                size: 16
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                                lineNumber: 158,
                                                                columnNumber: 25
                                                            }, this),
                                                            " Logout"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                        lineNumber: 156,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                    lineNumber: 155,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                            lineNumber: 139,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                    lineNumber: 124,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login",
                                    className: "bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap",
                                    children: "Login"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                    lineNumber: 165,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setIsOpen(!isOpen),
                            className: "md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg",
                            children: isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                lineNumber: 174,
                                columnNumber: 23
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                lineNumber: 174,
                                columnNumber: 41
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden bg-white border-t shadow-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 pt-3 pb-4 space-y-1",
                    children: [
                        navLinks.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: link.href,
                                onClick: ()=>setIsOpen(false),
                                className: `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`,
                                children: link.name
                            }, link.name, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                lineNumber: 184,
                                columnNumber: 15
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pt-2",
                            children: loggedIn && user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex items-center gap-3 px-3 py-3 rounded-lg mb-2 ${colors.bg}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `w-9 h-9 rounded-full ${colors.badge} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`,
                                                children: initials
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                lineNumber: 198,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-sm font-semibold truncate ${colors.text}`,
                                                        children: user.name || user.user_id
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                        lineNumber: 202,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: `text-xs font-bold ${colors.text} opacity-70`,
                                                        children: user.role
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                        lineNumber: 203,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                lineNumber: 201,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                        lineNumber: 197,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: ROLE_DASHBOARD[user.role] || "/",
                                        onClick: ()=>setIsOpen(false),
                                        className: "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                lineNumber: 208,
                                                columnNumber: 21
                                            }, this),
                                            " Dashboard"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                        lineNumber: 206,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: ROLE_PROFILE[user.role] || "/",
                                        onClick: ()=>setIsOpen(false),
                                        className: "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                lineNumber: 212,
                                                columnNumber: 21
                                            }, this),
                                            " My Profile"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                        lineNumber: 210,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleLogout,
                                        className: "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                                lineNumber: 216,
                                                columnNumber: 21
                                            }, this),
                                            " Logout"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                        lineNumber: 214,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/login",
                                onClick: ()=>setIsOpen(false),
                                className: "block w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition",
                                children: "Login"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                                lineNumber: 220,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                            lineNumber: 194,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                    lineNumber: 182,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
                lineNumber: 181,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Navbar.jsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_s(Navbar, "Hl1bbogLlVfwza70/F168/1PPik=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/IMS/lms-frontend/lms-frontend-render/components/Chatbot.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Chatbot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/IMS/lms-frontend/lms-frontend-render/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client"; // This directive is crucial
;
function Chatbot() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$IMS$2f$lms$2d$frontend$2f$lms$2d$frontend$2d$render$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Chatbot.useEffect": ()=>{
            if (document.getElementById("jotform-agent-script")) return;
            const script = document.createElement("script");
            script.src = "https://cdn.jotfor.ms/agent/embedjs/019c3da4a45d7897a9cacca2348d12ec1793/embed.js";
            script.id = "jotform-agent-script";
            script.async = true;
            document.body.appendChild(script);
            return ({
                "Chatbot.useEffect": ()=>{}
            })["Chatbot.useEffect"];
        }
    }["Chatbot.useEffect"], []);
    return null;
}
_s(Chatbot, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Chatbot;
var _c;
__turbopack_context__.k.register(_c, "Chatbot");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_IMS_lms-frontend_lms-frontend-render_4fd012a5._.js.map