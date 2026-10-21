// Dynamic API base URL: defaults to relative path in production, and localhost:3000 during Vite dev on port 5173
export const API_BASE =
  typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:3000"
    : "";
