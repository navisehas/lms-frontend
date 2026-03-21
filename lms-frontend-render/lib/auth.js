const TOKEN_KEY = "token";
const USER_KEY  = "user";

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export async function authFetch(url, options = {}) {
  const token = getToken();

  // When sending FormData (file uploads / multipart), do NOT set Content-Type.
  // The browser will set it automatically with the correct multipart boundary.
  // Forcing "application/json" here breaks multer's multipart parsing so
  // req.body ends up empty and req.files is never populated.
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}

export function guardRoute(requiredRole, router) {
  if (typeof window === "undefined") return null;

  const user = getUser();

  if (!user || !isLoggedIn()) {
    router.replace("/login");
    return null;
  }

  if (user.role !== requiredRole) {
    const roleRoutes = {
      ADMIN:   "/admin/dashboard",
      MANAGER: "/manager/dashboard",
      TEACHER: "/teacher/dashboard",
      STUDENT: "/student/dashboard",
    };
    router.replace(roleRoutes[user.role] || "/login");
    return null;
  }

  return user;
}

export function logout(router) {
  clearSession();
  router.push("/login");
}