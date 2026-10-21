import React from "react";
import { C, F } from "../theme";

interface RetroGaugeProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  label?: string;
  unit?: string;
  color?: string;
  trackColor?: string;
}

export const RetroGauge: React.FC<RetroGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  size = 110,
  label = "SPEED",
  unit = "m/s",
  color = C.amber,
  trackColor = C.steel,
}) => {
  const r = size / 2;
  const c = r;
  const startAngle = 135;
  const sweepAngle = 270;
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const needleAngle = startAngle + sweepAngle * ratio;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const ticks = 11;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
      >
        {/* Background Bezel */}
        <circle
          cx={c}
          cy={c}
          r={r - 4}
          fill="rgba(11, 13, 23, 0.95)"
          stroke={C.slate}
          strokeWidth={2}
        />
        <circle
          cx={c}
          cy={c}
          r={r - 6}
          fill="none"
          stroke="rgba(43, 51, 80, 0.4)"
          strokeWidth={1}
        />

        {/* Dial Ticks */}
        {Array.from({ length: ticks }).map((_, i) => {
          const a = startAngle + (sweepAngle * i) / (ticks - 1);
          const isMajor = i % 2 === 0;
          const tickLen = isMajor ? 8 : 4;
          const x1 = c + Math.cos(toRad(a)) * (r - 10);
          const y1 = c + Math.sin(toRad(a)) * (r - 10);
          const x2 = c + Math.cos(toRad(a)) * (r - 10 - tickLen);
          const y2 = c + Math.sin(toRad(a)) * (r - 10 - tickLen);
          const isPassed = a <= needleAngle;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isPassed ? color : trackColor}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}

        {/* Needle Line */}
        <line
          x1={c}
          y1={c}
          x2={c + Math.cos(toRad(needleAngle)) * (r - 16)}
          y2={c + Math.sin(toRad(needleAngle)) * (r - 16)}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Center Hub */}
        <circle cx={c} cy={c} r={5} fill={C.deep} stroke={color} strokeWidth={1.5} />
        <rect x={c - 2} y={c - 2} width={4} height={4} fill={C.paper} />
      </svg>

      {/* Digital Readout in Lower Area */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(size * 0.16),
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: `${Math.round(size * 0.22)}px`,
            color: C.paper,
            lineHeight: 1,
            fontWeight: "bold",
            textShadow: "0 1px 2px #000",
          }}
        >
          {value.toFixed(1)}
        </div>
        <div
          style={{
            fontFamily: F.ui,
            fontSize: `${Math.max(8, Math.round(size * 0.08))}px`,
            color: color,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginTop: "1px",
          }}
        >
          {label} ({unit})
        </div>
      </div>
    </div>
  );
};
