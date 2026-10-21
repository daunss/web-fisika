/**
 * Konfigurasi URL Base Backend API diambil langsung dari Environment Variable (.env).
 * Ubah VITE_API_BASE_URL di file .env untuk menghubungkan ke backend tujuan.
 * Nilai default adalah nilai dari VITE_API_BASE_URL di .env (misal: http://localhost:3000),
 * atau string kosong "" (relative path) jika di-host satu origin di server produksi.
 */
const envApiUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE = (typeof envApiUrl === "string" ? envApiUrl : "").trim();

