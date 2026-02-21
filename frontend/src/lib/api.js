const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL;

if (!BACKEND_URL) {
  console.error("❌ BACKEND URL NOT SET");
}

export const API_BASE = `${BACKEND_URL}/api`;
