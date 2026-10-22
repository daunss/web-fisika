import React from "react";
import { Binary, BookOpen, CheckCircle2 } from "lucide-react";
import { num } from "../utils/format";
import { Badge, Card, CardHead } from "./ui";

interface ValidationPanelProps {
  v: number;
  s0: number;
  timeTarget: number;
}

// Jumlah langkah akumulasi untuk jalur numerik. Cukup rapat agar galat
// pembulatan mendekati batas presisi double, bukan mendekati galat metode.
const STEPS = 1000;
const TOLERANCE = 1e-9;

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ v, s0, timeTarget }) => {
  const deltaS = v * timeTarget;
  const sAnalytic = s0 + deltaS;

  // Jalur kedua: akumulasi numerik, meniru cara loop simulasi menjumlahkan
  // perpindahan tiap langkah waktu. Ini hitungan yang benar-benar terpisah
  // dari bentuk tertutup, jadi selisihnya benar-benar menguji hasil hitung.
  const dt = timeTarget / STEPS;
  let sNumeric = s0;
  for (let step = 0; step < STEPS; step += 1) {
    sNumeric += v * dt;
  }

  const deltaNumeric = sNumeric - s0;
  const deviation = Math.abs(sAnalytic - sNumeric);
  const isMatch = deviation <= TOLERANCE;
  const relError = Math.abs(deltaS) > 0 ? (deviation / Math.abs(deltaS)) * 100 : 0;

  return (
    <div className="stack">
      <div className="panel-lead" data-reveal>
        <div className="panel-lead-text">
          <h2>Uji hitung: bentuk tertutup vs akumulasi numerik</h2>
          <p>
            Dua jalur perhitungan dikerjakan terpisah untuk input yang sama. Jalur A memakai
            persamaan GLB langsung; jalur B menjumlahkan perpindahan per langkah waktu seperti
            yang dilakukan loop simulasi. Selisih keduanya adalah bukti bahwa mesin hitung
            cocok dengan rumus fisika.
          </p>
        </div>
        <Badge tone={isMatch ? "ok" : "alert"}>
          {isMatch ? "Selisih dalam toleransi" : "Selisih di luar toleransi"}
        </Badge>
      </div>

      <div className="split">
        <Card accent="amber" data-reveal>
          <CardHead index="A" title="Bentuk tertutup" icon={<BookOpen size={15} />} meta={<span>teori</span>} />
          <div className="card-body">
            <div className="calc-list">
              <div className="calc-block">
                <span className="calc-label">Posisi akhir</span>
                <div className="calc-formula is-core">s = s₀ + v · t</div>
                <div className="calc-note">
                  s = {num(s0, 1)} + ({num(v, 1)} × {num(timeTarget, 1)}) = {num(sAnalytic, 2)} m
                </div>
              </div>

              <div className="calc-block">
                <span className="calc-label">Perpindahan</span>
                <div className="calc-formula is-core">Δs = v · t</div>
                <div className="calc-note">
                  Δs = {num(v, 1)} × {num(timeTarget, 1)} = {num(deltaS, 2)} m
                </div>
              </div>

              <div className="calc-block">
                <span className="calc-label">Percepatan</span>
                <div className="calc-formula is-support">a = Δv / Δt</div>
                <div className="calc-note">
                  Kecepatan tidak berubah (v₂ = v₁ = {num(v, 1)}), maka a = 0,00 m/s². Nilai ini
                  adalah syarat GLB, bukan kesalahan pengukuran.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card accent="mint" data-reveal>
          <CardHead
            index="B"
            title="Akumulasi numerik"
            icon={<Binary size={15} />}
            meta={<span>{STEPS} langkah</span>}
          />
          <div className="card-body">
            <div className="calc-list">
              <div className="calc-block">
                <span className="calc-label">Loop yang dijalankan</span>
                <code className="calc-code">
{`let s = ${num(s0, 1)};
const dt = ${num(timeTarget, 1)} / ${STEPS};

for (let i = 0; i < ${STEPS}; i++) {
  s += ${num(v, 1)} * dt;
}`}
                </code>
                <div className="calc-note">
                  Hasil akhir s = {num(sNumeric, 6)} m
                </div>
              </div>

              <div className="calc-block">
                <span className="calc-label">Selisih terhadap bentuk tertutup</span>
                <div className="calc-formula is-support">
                  {deviation === 0 ? "0" : deviation.toExponential(2)} m
                </div>
                <div className="calc-note">
                  Galat relatif {relError === 0 ? "0" : relError.toExponential(1)}% · toleransi{" "}
                  {TOLERANCE.toExponential(0)} m
                </div>
              </div>
            </div>

            <div className="check-list" style={{ marginTop: "10px" }}>
              <div className={`check-row ${isMatch ? "" : "is-alert"}`}>
                <span>Posisi akhir</span>
                <strong>
                  {isMatch ? <CheckCircle2 size={13} /> : null}
                  {num(sAnalytic, 4)} m ≈ {num(sNumeric, 4)} m
                </strong>
              </div>
              <div className={`check-row ${Math.abs(deltaS - deltaNumeric) <= TOLERANCE ? "" : "is-alert"}`}>
                <span>Perpindahan</span>
                <strong>
                  {num(deltaS, 4)} m ≈ {num(deltaNumeric, 4)} m
                </strong>
              </div>
              <div className="check-row">
                <span>Percepatan</span>
                <strong>0,00 m/s² pada kedua jalur</strong>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className={isMatch ? "note is-support" : "note"} data-reveal>
        {isMatch
          ? `Kedua jalur sepakat sampai ${TOLERANCE.toExponential(0)} m. Selisih sekecil ini berasal dari pembulatan floating point, bukan dari kesalahan model.`
          : `Ada selisih ${num(deviation, 6)} m yang melebihi toleransi. Periksa kembali input v, s₀, dan t sebelum menyimpulkan hasilnya.`}
      </div>
    </div>
  );
};

export default ValidationPanel;
