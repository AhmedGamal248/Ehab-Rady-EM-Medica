import axios from "axios";
import i18n from "../i18n";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ehab-rady-em-medica-hnku.vercel.app/api",
  timeout: 15000, // 15s — prevent hanging requests
});

/* ── Request interceptor ── */
api.interceptors.request.use((config) => {
  const token    = localStorage.getItem("token");
  const language = i18n.resolvedLanguage === "ar" ? "ar" : "en";

  config.headers["Accept-Language"] = language;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
}, (error) => Promise.reject(error));

/* ── Response interceptor ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized — token expired or invalid
    // Clear auth and redirect so the user isn't stuck on a blank protected page
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if we're on a protected page (not login/register)
      const path = window.location.pathname;
      if (!["/login", "/register", "/", "/products"].includes(path) && !path.startsWith("/products/")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;