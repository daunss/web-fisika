import React, { useEffect, useState } from "react";
import { History, Download, Trash2, RefreshCw, FileText } from "lucide-react";
import { sound } from "../utils/audio";
import { API_BASE } from "../utils/config";

interface SimulationHistoryItem {
  id: number;
  name: string;
  v: number;
  s0: number;
  t: number;
  s_final: number;
  delta_s: number;
  a_val: number;
  notes: string;
  created_at: string;
}

export const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/simulations`)
      .then((res) => res.json())
      .then((json) => {
        setHistory(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal load history:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    sound.playClick();
    if (!confirm(`Hapus data simulasi #${id}?`)) return;
    try {
      await fetch(`${API_BASE}/api/simulations/${id}`, { method: "DELETE" });
      fetchHistory();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportJSON = () => {
    sound.playClick();
    fetch(`${API_BASE}/api/export`)
      .then((res) => res.json())
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `data-fisika-glb-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        sound.playSuccess();
      });
  };

  const handleExportCSV = () => {
    sound.playClick();
    if (history.length === 0) {
      alert("Belum ada riwayat simulasi untuk diekspor.");
      return;
    }
    const headers = ["ID", "Nama Run", "Laju v (m/s)", "Posisi Awal s0 (m)", "Durasi t (s)", "Posisi Akhir s (m)", "Percepatan a (m/s²)", "Catatan", "Waktu Simpan"];
    const rows = history.map((row) => [
      row.id,
      `"${row.name.replace(/"/g, '""')}"`,
      row.v,
      row.s0,
      row.t,
      row.s_final,
      row.a_val,
      `"${(row.notes || "").replace(/"/g, '""')}"`,
      `"${row.created_at}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-simulasi-glb-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    sound.playSuccess();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div
        className="pixel-card"
        style={{
          padding: "16px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <History color="#f6c453" size={22} />
          <div>
            <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#fbf6e9", fontWeight: "bold" }}>
              RIWAYAT SIMULASI FISIKA (LOG PENGUJIAN)
            </h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "#8ea3c9" }}>
              Setiap kali Anda menekan tombol 'SIMPAN RUN', parameter dan hasil kalkulasi otomatis tercatat di log riwayat
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => { sound.playClick(); fetchHistory(); }} className="pixel-btn" style={{ fontSize: "0.6rem", padding: "6px 10px" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> REFRESH
          </button>
          <button onClick={handleExportCSV} className="pixel-btn pixel-btn-mint" style={{ fontSize: "0.6rem", padding: "6px 10px" }}>
            <FileText size={12} /> EKSPOR CSV
          </button>
          <button onClick={handleExportJSON} className="pixel-btn pixel-btn-amber" style={{ fontSize: "0.6rem", padding: "6px 10px" }}>
            <Download size={12} /> EKSPOR JSON
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="pixel-card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="pixel-table-wrapper">
          <table className="pixel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAMA RUN</th>
                <th>LAJU (v)</th>
                <th>s₀ (AWAL)</th>
                <th>WAKTU (t)</th>
                <th>POSISI AKHIR (s)</th>
                <th>PERCEPATAN (a)</th>
                <th>CATATAN KASUS</th>
                <th>WAKTU SIMPAN</th>
                <th style={{ textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "28px", color: "#8ea3c9", fontFamily: "var(--font-ui)", fontSize: "0.7rem" }}>
                    MEMUAT DATA RIWAYAT...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "36px", color: "#8ea3c9" }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", marginBottom: "6px", color: "#f6c453" }}>
                      BELUM ADA RIWAYAT SIMULASI
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>
                      Jalankan simulator di Tab 01 lalu tekan tombol 'SIMPAN RUN' untuk menyimpan data uji coba ke log riwayat.
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#f6c453" }}>#{row.id}</td>
                    <td style={{ fontWeight: "bold" }}>{row.name}</td>
                    <td style={{ color: "#4fc4a8", fontFamily: "var(--font-mono)" }}>{row.v.toFixed(1)} m/s</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{row.s0.toFixed(1)} m</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{row.t.toFixed(1)} s</td>
                    <td style={{ color: "#f6c453", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
                      {row.s_final.toFixed(2)} m
                    </td>
                    <td style={{ color: "#ef6f5e", fontFamily: "var(--font-mono)" }}>0.00 m/s²</td>
                    <td style={{ color: "#8ea3c9", fontSize: "0.85rem" }}>{row.notes || "-"}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#8ea3c9" }}>
                      {row.created_at.replace("T", " ").slice(0, 19)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="pixel-btn pixel-btn-coral"
                        style={{ padding: "3px 6px", fontSize: "0.55rem" }}
                        title="Hapus riwayat"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
