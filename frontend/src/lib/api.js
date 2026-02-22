const USER_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL;

if (!USER_BACKEND_URL) {
  console.error("❌ BACKEND URL NOT SET");
}

// Remove trailing slash if present (robustly)
const BACKEND_URL = USER_BACKEND_URL ? USER_BACKEND_URL.trim().replace(/\/+$/, "") : "";

export const API_BASE = `${BACKEND_URL}/api`;
