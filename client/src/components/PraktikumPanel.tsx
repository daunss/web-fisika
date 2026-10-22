import React, { useState } from "react";
import {
  Calculator,
  FlaskConical,
  PlusCircle,
  RotateCcw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { sound } from "../utils/audio";
import { num } from "../utils/format";
import { Card, CardHead, StateBlock, Spinner } from "./ui";

export interface ExperimentItem {
  id: number;
  test_no: number;
  distance_s: number;
  time_t1: number;
  time_t2: number;
  time_t3: number;
  time_avg: number;
  v_calc: number;
  v_theory: number;
  error_pct: number;
  notes: string;
}

interface PraktikumPanelProps {
  experiments: ExperimentItem[];
  onAddExperiment: (exp: {
    test_no: number;
    distance_s: number;
    time_t1: number;
    time_t2: number;
    time_t3: number;
    v_theory?: number;
    notes?: string;
  }) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onDeleteExperiment: (id: number) => Promise<void>;
  isLoading: boolean;
}

const V_THEORY = 0.25;

const SVG_W = 420;
const SVG_H = 180;
const PAD_L = 44;
const PAD_B = 26;
const PAD_T = 14;
const PAD_R = 18;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

const AXIS = "#3f4a6b";
const CORE = "#f6c453";
const SUPPORT = "#4fc4a8";
const INK_DIM = "#8ea3c9";

function fitQuality(r2: number): string {
  if (r2 >= 0.999) return "sangat kuat";
  if (r2 >= 0.99) return "kuat";
  if (r2 >= 0.9) return "cukup";
  return "lemah";
}

export const PraktikumPanel: React.FC<PraktikumPanelProps> = ({
  experiments,
  onAddExperiment,
  onResetDefaults,
  onDeleteExperiment,
  isLoading,
}) => {
  const [distance, setDistance] = useState<number>(1.2);
  const [t1, setT1] = useState<number>(4.85);
  const [t2, setT2] = useState<number>(4.82);
  const [t3, setT3] = useState<number>(4.88);
  const [notes, setNotes] = useState<string>("Lintasan tambahan 120 cm");
  const [submitting, setSubmitting] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const nextNo =
    experiments.reduce((max, item) => Math.max(max, item.test_no || 0), 0) + 1;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (distance <= 0 || t1 <= 0 || t2 <= 0 || t3 <= 0) return;

    setSubmitting(true);
    sound.playClick();
    try {
      await onAddExperiment({
        test_no: nextNo,
        distance_s: distance,
        time_t1: t1,
        time_t2: t2,
        time_t3: t3,
        v_theory: V_THEORY,
        notes,
      });
      sound.playSuccess();
      setNotes("");
    } catch {
      // Pesan kegagalan sudah ditampilkan lewat toast di App.
    } finally {
      setSubmitting(false);
    }
  };

  const n = experiments.length;

  // Regresi linear s terhadap t̄. Kemiringan garis adalah kecepatan hasil fit.
  let slope = 0;
  let intercept = 0;
  let rSquared = 0;
  let hasFit = false;

  if (n >= 2) {
    let sumT = 0;
    let sumS = 0;
    let sumTS = 0;
    let sumT2 = 0;
    let sumS2 = 0;

    experiments.forEach((point) => {
      sumT += point.time_avg;
      sumS += point.distance_s;
      sumTS += point.time_avg * point.distance_s;
      sumT2 += point.time_avg * point.time_avg;
      sumS2 += point.distance_s * point.distance_s;
    });

    const denom = n * sumT2 - sumT * sumT;
    if (denom !== 0) {
      slope = (n * sumTS - sumT * sumS) / denom;
      intercept = (sumS - slope * sumT) / n;

      const cov = n * sumTS - sumT * sumS;
      const spread = Math.sqrt((n * sumT2 - sumT * sumT) * (n * sumS2 - sumS * sumS));
      const r = spread !== 0 ? cov / spread : 0;
      rSquared = Math.min(1, Math.max(0, r * r));
      hasFit = true;
    }
  }

  const maxT = Math.max(...experiments.map((item) => item.time_avg), 1);
  const maxS = Math.max(...experiments.map((item) => item.distance_s), 0.5);
  const x = (t: number) => PAD_L + (t / maxT) * CHART_W;
  const y = (s: number) => SVG_H - PAD_B - (s / maxS) * CHART_H;

  return (
    <div className="stack">
      <div className="panel-lead" data-reveal>
        <div className="panel-lead-text">
          <h2>Praktikum: mengukur kecepatan dari data stopwatch</h2>
          <p>
            Catat jarak lintasan dan tiga kali waktu tempuh untuk setiap percobaan. Sistem
            menghitung rata-rata waktu, kecepatan hasil ukur, dan galat terhadap nilai teori
            {` ${num(V_THEORY, 2)} m/s`}, lalu mencocokkan semua titik dengan garis regresi.
          </p>
        </div>

        <div className="actions-row">
          <button
            type="button"
            className="btn btn-sm"
            disabled={isLoading}
            onClick={() => {
              sound.playClick();
              void onResetDefaults();
            }}
          >
            {isLoading ? <Spinner size={13} /> : <RotateCcw size={13} />}
            Kembalikan data awal
          </button>
        </div>
      </div>

      <div className="split">
        <Card accent="amber" data-reveal>
          <CardHead
            index="A"
            title="Rancangan percobaan"
            icon={<FlaskConical size={15} />}
            meta={<span>3 variabel</span>}
          />
          <div className="card-body">
            <div className="vars">
              <div className="var-block">
                <b>Variabel bebas</b>
                Jarak lintasan s diubah bertingkat: 20 cm, 40 cm, 60 cm, 80 cm, dan 100 cm.
              </div>
              <div className="var-block">
                <b>Variabel terikat</b>
                Waktu tempuh t diukur dengan stopwatch, diulang tiga kali pada setiap jarak.
              </div>
              <div className="var-block">
                <b>Variabel kontrol</b>
                Kecepatan mobil baterai, permukaan meja datar tanpa kemiringan, dan tegangan
                baterai awal.
              </div>
            </div>

            <div className="note" style={{ marginTop: "12px" }}>
              Setiap baris yang disimpan langsung tercatat di database. Tidak ada data yang
              hilang saat halaman dimuat ulang.
            </div>
          </div>
        </Card>

        <Card accent="mint" data-reveal>
          <CardHead
            index="B"
            title="Input hasil stopwatch"
            icon={<PlusCircle size={15} />}
            meta={<span>percobaan #{nextNo}</span>}
          />
          <div className="card-body">
            <form className="csv-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="pr-s">Jarak s (m)</label>
                  <input
                    id="pr-s"
                    className="input"
                    type="number"
                    inputMode="decimal"
                    step="0.05"
                    min="0.05"
                    required
                    value={distance}
                    onChange={(event) => setDistance(parseFloat(event.target.value) || 0)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pr-t1">Waktu t₁ (s)</label>
                  <input
                    id="pr-t1"
                    className="input"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    required
                    value={t1}
                    onChange={(event) => setT1(parseFloat(event.target.value) || 0)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pr-t2">Waktu t₂ (s)</label>
                  <input
                    id="pr-t2"
                    className="input"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    required
                    value={t2}
                    onChange={(event) => setT2(parseFloat(event.target.value) || 0)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pr-t3">Waktu t₃ (s)</label>
                  <input
                    id="pr-t3"
                    className="input"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    required
                    value={t3}
                    onChange={(event) => setT3(parseFloat(event.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="pr-notes">Catatan pengujian</label>
                <input
                  id="pr-notes"
                  className="input"
                  type="text"
                  value={notes}
                  placeholder="Contoh: pengujian lintasan 120 cm"
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-support btn-block"
                disabled={submitting || isLoading}
              >
                {submitting ? <Spinner size={14} /> : <PlusCircle size={14} />}
                {submitting ? "Menyimpan" : "Tambah hasil pengukuran"}
              </button>
            </form>
          </div>
        </Card>
      </div>

      <div className="split">
        <Card accent="mint" data-reveal>
          <CardHead
            index="C"
            title="Garis regresi data"
            icon={<TrendingUp size={15} />}
            meta={<span>s terhadap t̄</span>}
          />
          <div className="card-body">
            {n === 0 ? (
              <StateBlock
                kind="empty"
                title="Belum ada titik"
                text="Tambahkan minimal dua pengukuran agar garis regresi bisa dihitung."
              />
            ) : (
              <>
                <div className="chart-frame">
                  <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    role="img"
                    aria-label={`Sebaran ${n} titik pengukuran jarak terhadap waktu rata-rata.`}
                  >
                    <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={SVG_H - PAD_B} stroke={AXIS} strokeWidth="2" />
                    <line
                      x1={PAD_L}
                      y1={SVG_H - PAD_B}
                      x2={SVG_W - PAD_R}
                      y2={SVG_H - PAD_B}
                      stroke={AXIS}
                      strokeWidth="2"
                    />

                    <text x={PAD_L - 8} y={PAD_T + 9} fill={SUPPORT} fontSize="12" fontFamily="'VT323', monospace" textAnchor="end">
                      s (m)
                    </text>
                    <text x={SVG_W - PAD_R + 4} y={SVG_H - PAD_B + 4} fill={INK_DIM} fontSize="12" fontFamily="'VT323', monospace">
                      t (s)
                    </text>

                    {hasFit && (
                      <line
                        x1={x(0)}
                        y1={y(intercept)}
                        x2={x(maxT)}
                        y2={y(slope * maxT + intercept)}
                        stroke={CORE}
                        strokeWidth="2"
                        strokeDasharray="5 3"
                      />
                    )}

                    {experiments.map((point) => {
                      const cx = x(point.time_avg);
                      const cy = y(point.distance_s);
                      return (
                        <g key={point.id}>
                          <circle cx={cx} cy={cy} r="4" fill={SUPPORT} stroke="#0b0d17" strokeWidth="1.5" />
                          <text x={cx + 6} y={cy - 5} fill="#e8e3d3" fontSize="9" fontFamily="'VT323', monospace">
                            {num(point.distance_s, 2)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="chart-foot">
                  <span>
                    Titik data <strong style={{ color: SUPPORT }}>{n}</strong>
                  </span>
                  <span>
                    Garis fit <strong style={{ color: CORE }}>{hasFit ? `v = ${num(slope, 3)} m/s` : "—"}</strong>
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card accent="amber" data-reveal>
          <CardHead
            index="D"
            title="Parameter hasil fit"
            icon={<Calculator size={15} />}
            meta={<span>{hasFit ? "terhitung" : "belum cukup data"}</span>}
          />
          <div className="card-body">
            <div className="calc-list">
              <div className="calc-block">
                <span className="calc-label">Persamaan garis</span>
                <div className="calc-formula is-core">
                  {hasFit
                    ? `s = ${num(slope, 4)} · t ${intercept < 0 ? "−" : "+"} ${num(Math.abs(intercept), 4)}`
                    : "s = —"}
                </div>
                <div className="calc-note">
                  {hasFit
                    ? "Kemiringan garis setara kecepatan rata-rata kendaraan."
                    : "Butuh minimal dua titik dengan waktu berbeda."}
                </div>
              </div>

              <div className="calc-block">
                <span className="calc-label">Kecepatan hasil fit</span>
                <div className="calc-formula is-support">
                  {hasFit ? `${num(slope, 4)} m/s` : "—"}
                </div>
                <div className="calc-note">Nilai teori {num(V_THEORY, 4)} m/s</div>
              </div>

              <div className="calc-block">
                <span className="calc-label">Koefisien determinasi</span>
                <div className="calc-formula">
                  R² = {hasFit ? num(rSquared, 4) : "—"}
                </div>
                <div className="calc-note">
                  {hasFit
                    ? `${num(rSquared * 100, 2)}% variasi jarak dijelaskan oleh waktu · hubungan ${fitQuality(rSquared)}.`
                    : "Nilai R² muncul setelah dua titik atau lebih terkumpul."}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card data-reveal>
        <CardHead
          index="E"
          title="Tabel hasil praktikum"
          icon={<FlaskConical size={15} />}
          meta={<span>{n} titik ukur</span>}
        />
        {isLoading && n === 0 ? (
          <div className="card-body">
            <StateBlock kind="loading" title="Memuat data praktikum" text="Mengambil baris dari server." />
          </div>
        ) : n === 0 ? (
          <div className="card-body">
            <StateBlock
              kind="empty"
              title="Tabel masih kosong"
              text="Isi formulir di atas atau kembalikan data awal untuk melihat contoh."
            />
          </div>
        ) : (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <div className="table-hint">Geser tabel ke samping untuk melihat semua kolom</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">Jarak s</th>
                    <th scope="col">t₁</th>
                    <th scope="col">t₂</th>
                    <th scope="col">t₃</th>
                    <th scope="col">t̄ rata-rata</th>
                    <th scope="col">v terukur</th>
                    <th scope="col">Galat</th>
                    <th scope="col">Catatan</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((item) => (
                    <tr key={item.id}>
                      <td className="is-dim is-num">#{item.test_no}</td>
                      <td className="is-num">{num(item.distance_s, 2)} m</td>
                      <td className="is-num">{num(item.time_t1, 2)}</td>
                      <td className="is-num">{num(item.time_t2, 2)}</td>
                      <td className="is-num">{num(item.time_t3, 2)}</td>
                      <td className="is-num is-core">{num(item.time_avg, 3)} s</td>
                      <td className="is-num is-support">{num(item.v_calc, 4)} m/s</td>
                      <td className={`is-num ${item.error_pct > 10 ? "is-alert" : "is-dim"}`}>
                        {num(item.error_pct, 2)}%
                      </td>
                      <td className="is-dim">{item.notes || "—"}</td>
                      <td>
                        {confirmId === item.id ? (
                          <button
                            type="button"
                            className="btn-icon is-confirm"
                            onClick={() => {
                              sound.playClick();
                              setConfirmId(null);
                              void onDeleteExperiment(item.id);
                            }}
                          >
                            Hapus
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-icon is-danger"
                            aria-label={`Hapus baris ${item.test_no}`}
                            title="Hapus baris ini"
                            onClick={() => {
                              sound.playClick();
                              setConfirmId(item.id);
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

export default PraktikumPanel;
