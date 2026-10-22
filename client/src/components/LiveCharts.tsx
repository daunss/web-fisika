import React from "react";
import { Activity, TrendingUp } from "lucide-react";
import { num } from "../utils/format";
import { Card, CardHead } from "./ui";

interface LiveChartsProps {
  v: number;
  s0: number;
  timeTarget: number;
  timeCurrent: number;
}

const SVG_W = 400;
const SVG_H = 180;
const PAD_L = 46;
const PAD_B = 32;
const PAD_T = 20;
const PAD_R = 26;

const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

const AXIS = "#3f4a6b";
const GRID = "#2b3350";
const INK_DIM = "#8ea3c9";
const CORE = "#f6c453";
const SUPPORT = "#4fc4a8";
const SUPPORT_DEEP = "#2f8f7a";

export const LiveCharts: React.FC<LiveChartsProps> = ({
  v,
  s0,
  timeTarget,
  timeCurrent,
}) => {
  const sMax = Math.max(10, s0 + v * timeTarget);
  const sNow = s0 + v * timeCurrent;
  const progress = Math.min(1, Math.max(0, timeCurrent / (timeTarget || 1)));

  const pointX = PAD_L + CHART_W * progress;
  const pointY = SVG_H - PAD_B - (sNow / sMax) * CHART_H;

  const startY = SVG_H - PAD_B - (s0 / sMax) * CHART_H;
  const endY = SVG_H - PAD_B - ((s0 + v * timeTarget) / sMax) * CHART_H;

  const vMax = Math.max(10, v * 1.5);
  const lineY = SVG_H - PAD_B - (v / vMax) * CHART_H;
  const areaH = SVG_H - PAD_B - lineY;

  return (
    <div className="charts">
      <Card accent="mint">
        <CardHead
          index="01"
          title="Posisi terhadap waktu"
          icon={<TrendingUp size={15} />}
          meta={<span>gradien = v</span>}
        />
        <div className="card-body">
          <div className="chart-frame">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              role="img"
              aria-label={`Grafik posisi terhadap waktu. Saat t ${num(timeCurrent, 1)} sekon, posisi ${num(sNow, 1)} meter.`}
            >
              {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                  key={ratio}
                  x1={PAD_L}
                  y1={PAD_T + CHART_H * ratio}
                  x2={SVG_W - PAD_R}
                  y2={PAD_T + CHART_H * ratio}
                  stroke={GRID}
                  strokeDasharray="3 4"
                />
              ))}

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
              <text
                x={SVG_W - PAD_R + 4}
                y={SVG_H - PAD_B + 4}
                fill={INK_DIM}
                fontSize="12"
                fontFamily="'VT323', monospace"
              >
                t (s)
              </text>

              <text x={PAD_L - 8} y={PAD_T + 12} fill={INK_DIM} fontSize="11" fontFamily="'VT323', monospace" textAnchor="end">
                {num(sMax, 0)}
              </text>
              <text
                x={PAD_L - 8}
                y={SVG_H - PAD_B + 2}
                fill={INK_DIM}
                fontSize="11"
                fontFamily="'VT323', monospace"
                textAnchor="end"
              >
                {num(s0, 0)}
              </text>
              <text
                x={SVG_W - PAD_R}
                y={SVG_H - PAD_B + 16}
                fill={INK_DIM}
                fontSize="11"
                fontFamily="'VT323', monospace"
                textAnchor="middle"
              >
                {num(timeTarget, 0)}
              </text>

              <line
                x1={PAD_L}
                y1={startY}
                x2={PAD_L + CHART_W}
                y2={endY}
                stroke={SUPPORT_DEEP}
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line x1={PAD_L} y1={startY} x2={pointX} y2={pointY} stroke={SUPPORT} strokeWidth="3" />
              <circle cx={pointX} cy={pointY} r="5" fill={CORE} stroke="#0b0d17" strokeWidth="2" />
            </svg>
          </div>

          <div className="chart-foot">
            <span>
              s(t) <strong style={{ color: SUPPORT }}>{num(sNow, 1)} m</strong>
            </span>
            <span>
              t <strong style={{ color: CORE }}>{num(timeCurrent, 1)} s</strong>
            </span>
          </div>

          <div className="legend">
            <span className="legend-item">
              <span className="legend-swatch" />
              Garis berjalan
            </span>
            <span className="legend-item">
              <span className="legend-swatch is-dashed" />
              Lintasan teori penuh
            </span>
          </div>
        </div>
      </Card>

      <Card accent="amber">
        <CardHead
          index="02"
          title="Kecepatan terhadap waktu"
          icon={<Activity size={15} />}
          meta={<span>a = 0</span>}
        />
        <div className="card-body">
          <div className="chart-frame">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              role="img"
              aria-label={`Grafik kecepatan terhadap waktu. Kecepatan tetap ${num(v, 1)} meter per sekon.`}
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

              <text x={PAD_L - 8} y={PAD_T + 9} fill={CORE} fontSize="12" fontFamily="'VT323', monospace" textAnchor="end">
                v (m/s)
              </text>
              <text
                x={SVG_W - PAD_R + 4}
                y={SVG_H - PAD_B + 4}
                fill={INK_DIM}
                fontSize="12"
                fontFamily="'VT323', monospace"
              >
                t (s)
              </text>

              <text x={PAD_L - 8} y={lineY + 4} fill={CORE} fontSize="12" fontFamily="'VT323', monospace" textAnchor="end">
                {num(v, 0)}
              </text>
              <text
                x={PAD_L - 8}
                y={SVG_H - PAD_B + 2}
                fill={INK_DIM}
                fontSize="11"
                fontFamily="'VT323', monospace"
                textAnchor="end"
              >
                0
              </text>

              <polygon
                points={`${PAD_L},${SVG_H - PAD_B} ${PAD_L},${lineY} ${pointX},${lineY} ${pointX},${SVG_H - PAD_B}`}
                fill="rgba(246, 196, 83, 0.16)"
              />

              <line
                x1={PAD_L}
                y1={lineY}
                x2={PAD_L + CHART_W}
                y2={lineY}
                stroke={SUPPORT_DEEP}
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line x1={PAD_L} y1={lineY} x2={pointX} y2={lineY} stroke={CORE} strokeWidth="3" />
              <circle cx={pointX} cy={lineY} r="5" fill={SUPPORT} stroke="#0b0d17" strokeWidth="2" />

              {progress > 0.18 && areaH > 18 ? (
                <text
                  x={PAD_L + (pointX - PAD_L) * 0.5}
                  y={lineY + areaH * 0.55}
                  fill="#e8e3d3"
                  fontSize="11"
                  fontFamily="'Silkscreen', monospace"
                  textAnchor="middle"
                >
                  LUAS = Δs {num(sNow - s0, 1)} m
                </text>
              ) : null}
            </svg>
          </div>

          <div className="chart-foot">
            <span>
              v <strong style={{ color: CORE }}>{num(v, 1)} m/s</strong>
            </span>
            <span>
              Δs <strong style={{ color: SUPPORT }}>{num(sNow - s0, 1)} m</strong>
            </span>
          </div>

          <div className="legend">
            <span className="legend-item">
              <span className="legend-swatch" style={{ background: CORE }} />
              Kecepatan tetap
            </span>
            <span className="legend-item">
              <span className="legend-swatch is-dashed" />
              Tanpa perubahan
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LiveCharts;
