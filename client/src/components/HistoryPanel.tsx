import React, { useCallback, useEffect, useState } from "react";
import { Download, FileText, RefreshCw, Sheet, Trash2 } from "lucide-react";
import { sound } from "../utils/audio";
import { apiGet, apiSend } from "../utils/api";
import { num, stamp } from "../utils/format";
import { toast } from "./Toast";
import { Card, CardHead, Spinner, StateBlock } from "./ui";

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

interface HistoryResponse {
  success: boolean;
  count: number;
  data: SimulationHistoryItem[];
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiGet<HistoryResponse>("/api/simulations");
      setHistory(Array.isArray(json.data) ? json.data : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat riwayat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: number) => {
    sound.playClick();
    setDeleting(id);
    try {
      await apiSend(`/api/simulations/${id}`, "DELETE");
      setConfirmId(null);
      toast(`Riwayat #${id} dihapus.`, "info");
      await fetchHistory();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus riwayat.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleExportJSON = () => {
    sound.playClick();
    if (history.length === 0) {
      toast("Belum ada riwayat untuk diekspor.", "info");
      return;
    }
    download(`riwayat-glb-${today()}.json`, JSON.stringify(history, null, 2), "application/json");
    sound.playSuccess();
  };

  const handleExportCSV = () => {
    sound.playClick();
    if (history.length === 0) {
      toast("Belum ada riwayat untuk diekspor.", "info");
      return;
    }

    const headers = [
      "id",
      "nama",
      "v_mps",
      "s0_m",
      "t_s",
      "s_final_m",
      "delta_s_m",
      "a_mps2",
      "catatan",
      "disimpan_pada",
    ];

    const rows = history.map((row) => [
      row.id,
      csvCell(row.name),
      row.v,
      row.s0,
      row.t,
      row.s_final,
      row.delta_s,
      row.a_val,
      csvCell(row.notes || ""),
      csvCell(row.created_at),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    download(`riwayat-glb-${today()}.csv`, csv, "text/csv;charset=utf-8;");
    sound.playSuccess();
  };

  return (
    <div className="stack">
      <div className="panel-lead" data-reveal>
        <div className="panel-lead-text">
          <h2>Riwayat pengujian tersimpan</h2>
          <p>
            Setiap kali tombol simpan ditekan di panel kontrol, parameter dan hasil hitungnya
            masuk ke log ini. Data bisa diunduh sebagai JSON untuk diolah lanjut atau CSV untuk
            dibuka di spreadsheet.
          </p>
        </div>

        <div className="actions-row">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              sound.playClick();
              void fetchHistory();
            }}
            disabled={loading}
          >
            {loading ? <Spinner size={13} /> : <RefreshCw size={13} />}
            Muat ulang
          </button>
          <button type="button" className="btn btn-sm" onClick={handleExportCSV}>
            <FileText size={13} /> CSV
          </button>
          <button type="button" className="btn btn-sm btn-support" onClick={handleExportJSON}>
            <Download size={13} /> JSON
          </button>
        </div>
      </div>

      <Card data-reveal>
        <CardHead
          index="01"
          title="Log simulasi"
          icon={<Sheet size={15} />}
          meta={<span>{history.length} baris</span>}
        />

        {loading && history.length === 0 ? (
          <div className="card-body">
            <StateBlock kind="loading" title="Memuat riwayat" text="Mengambil log dari database." />
          </div>
        ) : error ? (
          <div className="card-body">
            <StateBlock
              kind="error"
              title="Riwayat tidak bisa dimuat"
              text={error}
              action={
                <button type="button" className="btn btn-sm" onClick={() => void fetchHistory()}>
                  Coba lagi
                </button>
              }
            />
          </div>
        ) : history.length === 0 ? (
          <div className="card-body">
            <StateBlock
              kind="empty"
              title="Belum ada riwayat"
              text="Jalankan simulasi di tab Simulator lalu tekan Simpan untuk mencatat hasil pertama."
            />
          </div>
        ) : (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <div className="table-hint">Geser tabel ke samping untuk melihat semua kolom</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nama run</th>
                    <th scope="col">v</th>
                    <th scope="col">s₀</th>
                    <th scope="col">t</th>
                    <th scope="col">s akhir</th>
                    <th scope="col">a</th>
                    <th scope="col">Catatan</th>
                    <th scope="col">Disimpan</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td className="is-num is-core">#{row.id}</td>
                      <td>{row.name}</td>
                      <td className="is-num is-support">{num(row.v, 1)} m/s</td>
                      <td className="is-num">{num(row.s0, 1)} m</td>
                      <td className="is-num">{num(row.t, 1)} s</td>
                      <td className="is-num is-core">{num(row.s_final, 2)} m</td>
                      <td className="is-num is-dim">{num(row.a_val, 2)} m/s²</td>
                      <td className="is-dim">{row.notes || "—"}</td>
                      <td className="is-dim is-num">{stamp(row.created_at)}</td>
                      <td>
                        {confirmId === row.id ? (
                          <button
                            type="button"
                            className="btn-icon is-confirm"
                            disabled={deleting === row.id}
                            onClick={() => void handleDelete(row.id)}
                          >
                            Hapus
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-icon is-danger"
                            aria-label={`Hapus riwayat ${row.id}`}
                            title="Hapus riwayat ini"
                            onClick={() => {
                              sound.playClick();
                              setConfirmId(row.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HistoryPanel;
