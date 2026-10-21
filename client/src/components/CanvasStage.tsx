import React, { useEffect, useRef, useState } from "react";
import { C, F } from "../theme";
import { sound } from "../utils/audio";

export type VehicleType = "car" | "train" | "probe" | "lab";

interface CanvasStageProps {
  v: number; // m/s
  s0: number; // m
  timeCurrent: number; // s
  timeTarget: number; // s
  isRunning: boolean;
  isNightMode: boolean;
  vehicleType: VehicleType;
  onSelectVehicle: (type: VehicleType) => void;
  onReset: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  color: string;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  v,
  s0,
  timeCurrent,
  timeTarget,
  isRunning,
  isNightMode,
  vehicleType,
  onSelectVehicle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Asset image cache
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Realtime physics calculation
  const sCurrent = s0 + v * timeCurrent;
  const sTarget = s0 + v * timeTarget;

  // Preload authentic pixel art assets
  useEffect(() => {
    const assetList = [
      { key: "bg_highway", src: "/assets/bg_highway.png" },
      { key: "bg_road", src: "/assets/bg_road.png" },
      { key: "bg_city", src: "/assets/bg_city.png" },
      { key: "bg_space", src: "/assets/bg_space.png" },
      { key: "bg_lab", src: "/assets/bg_lab.png" },
      { key: "spr_car", src: "/assets/spr_car.png" },
      { key: "spr_train", src: "/assets/spr_train.png" },
      { key: "spr_probe", src: "/assets/spr_probe.png" },
      { key: "spr_mascot", src: "/assets/spr_mascot.png" },
      { key: "spr_crate", src: "/assets/spr_crate.png" },
    ];

    let loadedCount = 0;
    assetList.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key] = img;
        loadedCount++;
        if (loadedCount === assetList.length) {
          setAssetsLoaded(true);
        }
      };
      img.onerror = () => {
        // Fallback gracefully
        loadedCount++;
        if (loadedCount === assetList.length) {
          setAssetsLoaded(true);
        }
      };
    });
  }, []);

  // Continuous Engine Hum synchronization
  useEffect(() => {
    if (isRunning && v > 0) {
      sound.startEngineHum(v);
    } else {
      sound.stopEngineHum();
    }
    return () => {
      sound.stopEngineHum();
    };
  }, [isRunning, v]);

  // Main 60 FPS Canvas Physics Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Ensure crisp pixel art rendering (Anti-Aliasing disabled)
      ctx.imageSmoothingEnabled = false;

      // Select active background image and vehicle sprite based on vehicleType
      let bgKey = "bg_highway";
      let sprKey = "spr_car";
      let trackY = height * 0.72;
      let spriteW = 120;
      let spriteH = 60;

      if (vehicleType === "car") {
        bgKey = isNightMode ? "bg_highway" : "bg_road";
        sprKey = "spr_car";
        trackY = height * 0.72;
        spriteW = 60 * 2.2;
        spriteH = 30 * 2.2;
      } else if (vehicleType === "train") {
        bgKey = "bg_city";
        sprKey = "spr_train";
        trackY = height * 0.68;
        spriteW = 220 * 1.5;
        spriteH = 42 * 1.5;
      } else if (vehicleType === "probe") {
        bgKey = "bg_space";
        sprKey = "spr_probe";
        trackY = height * 0.52;
        spriteW = 34 * 2.6;
        spriteH = 22 * 2.6;
      } else if (vehicleType === "lab") {
        bgKey = "bg_lab";
        sprKey = "spr_mascot";
        trackY = height * 0.74;
        spriteW = 48 * 2.0;
        spriteH = 24 * 2.0;
      }

      const bgImg = imagesRef.current[bgKey];
      const sprImg = imagesRef.current[sprKey];

      // --- 1. PARALLAX SEAMLESS BACKGROUND SCROLLING ---
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const bgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
        const targetBgW = height * bgAspect;

        // Background scroll speed is proportional to velocity
        const scrollFactor = vehicleType === "probe" ? 0.25 : 0.8;
        const bgOffset = ((sCurrent * 18 * scrollFactor) % targetBgW + targetBgW) % targetBgW;

        // Draw 3 seamless tiles so canvas is completely covered
        for (let tile = -1; tile <= 2; tile++) {
          const drawX = tile * targetBgW - bgOffset;
          ctx.drawImage(bgImg, drawX, 0, targetBgW + 1, height);
        }
      } else {
        // High-aesthetic solid retro sky fallback
        ctx.fillStyle = isNightMode ? "#0b0d17" : "#1d2338";
        ctx.fillRect(0, 0, width, height);
      }

      // --- 2. RETRO DITHERING / NIGHT AMBIENT TINT ---
      if (isNightMode && vehicleType !== "probe") {
        ctx.fillStyle = "rgba(11, 13, 23, 0.4)";
        ctx.fillRect(0, 0, width, height);
      }

      // --- 3. GROUND / TRACK / GUIDE RAIL ---
      if (vehicleType !== "probe") {
        ctx.fillStyle = "rgba(11, 13, 23, 0.85)";
        ctx.fillRect(0, trackY + 8, width, height - (trackY + 8));

        // Top curb highlight
        ctx.fillStyle = vehicleType === "train" ? C.blue : vehicleType === "lab" ? C.mint : C.steel;
        ctx.fillRect(0, trackY + 6, width, 3);

        // Track Measurement Metre Markers
        const metrePixelDist = 18;
        const screenCarX = width * 0.32;
        const baseMark = Math.floor((sCurrent - 40) / 10) * 10;

        for (let m = baseMark; m <= baseMark + 120; m += 10) {
          if (m < 0) continue;
          const markerX = screenCarX + (m - sCurrent) * metrePixelDist;
          if (markerX >= -40 && markerX <= width + 40) {
            const isTargetFlag = Math.abs(m - sTarget) < 5;

            // Metre tick line
            ctx.fillStyle = isTargetFlag ? C.mint : C.slate;
            ctx.fillRect(markerX, trackY + 9, 2, 8);

            // Metre label text
            ctx.font = `8px ${F.mono}`;
            ctx.fillStyle = isTargetFlag ? C.mint : C.mist;
            ctx.fillText(`${m}m`, markerX - 8, trackY + 28);

            // Checkered Finish Banner at target
            if (isTargetFlag) {
              drawFinishGate(ctx, markerX, trackY, m);
            }
          }
        }

        // Ticker Tape Dots (Physics Laboratory Simulation Feature)
        // In GLB, constant velocity creates strictly equidistant dots!
        if (vehicleType === "lab" || vehicleType === "car") {
          ctx.fillStyle = "rgba(232, 227, 211, 0.9)";
          const baseDot = Math.floor((sCurrent - 20) / 2) * 2;
          for (let d = baseDot; d <= baseDot + 60; d += 2) {
            const dotX = screenCarX + (d - sCurrent) * metrePixelDist;
            if (dotX >= 0 && dotX <= width) {
              ctx.fillRect(dotX, trackY + 36, 3, 3);
            }
          }
        }
      }

      // --- 4. EXHAUST PARTICLES & THRUSTER DYNAMICS ---
      const screenCarX = width * 0.32;
      const screenCarY = trackY - spriteH * 0.85;

      if (isRunning && v > 0) {
        if (Math.random() < 0.65) {
          let pColor: string = C.paper;
          let pX = screenCarX;
          let pY = screenCarY + spriteH * 0.6;
          let pVx = -(1.5 + Math.random() * 2.5);
          let pVy = (Math.random() - 0.5) * 1.2;

          if (vehicleType === "probe") {
            pColor = Math.random() > 0.4 ? C.blue : C.mint;
            pX = screenCarX - 4;
            pY = screenCarY + spriteH * 0.5;
            pVx = -(3 + Math.random() * 3);
          } else if (vehicleType === "train") {
            pColor = C.blue;
            pX = screenCarX + 8;
            pY = trackY + 5;
            pVx = -(2 + Math.random() * 2);
          } else if (vehicleType === "car") {
            pColor = "rgba(232, 227, 211, 0.8)";
            pX = screenCarX - 8;
            pY = screenCarY + spriteH * 0.75;
          }

          particlesRef.current.push({
            x: pX,
            y: pY,
            size: 2 + Math.random() * 3,
            opacity: 0.85,
            vx: pVx,
            vy: pVy,
            color: pColor,
          });
        }
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.08;
        p.opacity -= 0.035;

        if (p.opacity <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
          ctx.globalAlpha = 1.0;
        }
      }

      // --- 5. VEHICLE SPRITE RENDERING ---
      if (sprImg && sprImg.complete && sprImg.naturalWidth > 0) {
        ctx.save();
        ctx.drawImage(sprImg, screenCarX, screenCarY, spriteW, spriteH);

        // Headlight Beam / Forward Sensor Ray
        if (vehicleType === "car" || vehicleType === "train") {
          const beamW = 160;
          const beamGrad = ctx.createLinearGradient(
            screenCarX + spriteW,
            screenCarY + spriteH * 0.5,
            screenCarX + spriteW + beamW,
            screenCarY + spriteH * 0.5
          );
          beamGrad.addColorStop(0, "rgba(255, 248, 179, 0.45)");
          beamGrad.addColorStop(1, "rgba(255, 248, 179, 0)");

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(screenCarX + spriteW, screenCarY + spriteH * 0.45);
          ctx.lineTo(screenCarX + spriteW + beamW, screenCarY - 10);
          ctx.lineTo(screenCarX + spriteW + beamW, screenCarY + spriteH + 20);
          ctx.lineTo(screenCarX + spriteW, screenCarY + spriteH * 0.7);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      } else {
        // Fallback procedural retro car
        ctx.fillStyle = C.amber;
        ctx.fillRect(screenCarX, screenCarY, spriteW, spriteH);
      }

      // --- 6. VELOCITY VECTOR ARROW (v) ---
      drawVelocityArrow(ctx, screenCarX + spriteW * 0.5, screenCarY - 18, v);

      // --- 7. TELEMETRY BADGE OVERLAY ON CANVAS ---
      drawCanvasTelemetry(ctx, width, height, v, sCurrent, timeCurrent, vehicleType);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [v, s0, timeCurrent, timeTarget, isRunning, isNightMode, vehicleType, sCurrent, sTarget, assetsLoaded]);

  return (
    <div className="canvas-stage-wrapper" ref={containerRef}>
      <canvas ref={canvasRef} width={960} height={420} />

      {/* Vehicle / Environment Quick Switcher Bar */}
      <div className="canvas-vehicle-bar">
        <span className="vehicle-bar-label">WAHANA & LINTASAN:</span>
        <button
          onClick={() => {
            sound.playClick();
            onSelectVehicle("car");
          }}
          className={`vehicle-btn ${vehicleType === "car" ? "vehicle-btn-active" : ""}`}
        >
          🚗 Mobil GLB (Highway)
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onSelectVehicle("train");
          }}
          className={`vehicle-btn ${vehicleType === "train" ? "vehicle-btn-active" : ""}`}
        >
          🚄 Maglev Train (Metropolis)
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onSelectVehicle("probe");
          }}
          className={`vehicle-btn ${vehicleType === "probe" ? "vehicle-btn-active" : ""}`}
        >
          🛰️ Voyager Probe (Deep Space)
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onSelectVehicle("lab");
          }}
          className={`vehicle-btn ${vehicleType === "lab" ? "vehicle-btn-active" : ""}`}
        >
          🤖 Trolley Lab (Praktikum)
        </button>
      </div>
    </div>
  );
};

// Helper: Velocity vector arrow showing direction and magnitude
function drawVelocityArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  velocity: number
) {
  const arrowLen = Math.min(100, Math.max(30, velocity * 2.2));

  ctx.save();
  ctx.strokeStyle = C.mint;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + arrowLen, y);
  ctx.stroke();

  // Arrowhead
  ctx.fillStyle = C.mint;
  ctx.beginPath();
  ctx.moveTo(x + arrowLen + 6, y);
  ctx.lineTo(x + arrowLen - 4, y - 5);
  ctx.lineTo(x + arrowLen - 4, y + 5);
  ctx.closePath();
  ctx.fill();

  // Label: v = konstan
  ctx.font = `bold 10px ${F.ui}`;
  ctx.fillStyle = C.paper;
  ctx.fillText(`v = ${velocity} m/s [a = 0]`, x + 4, y - 6);
  ctx.restore();
}

// Helper: Finish gate banner at target distance
function drawFinishGate(
  ctx: CanvasRenderingContext2D,
  x: number,
  trackY: number,
  targetM: number
) {
  ctx.save();
  // Vertical Gate Post
  ctx.fillStyle = C.amber;
  ctx.fillRect(x - 2, trackY - 90, 4, 98);

  // Checkered Finish Flag
  const flagW = 28;
  const flagH = 18;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, trackY - 90, flagW, flagH);

  ctx.fillStyle = "#0b0d17";
  const sq = 6;
  for (let r = 0; r < flagH; r += sq) {
    for (let c = 0; c < flagW; c += sq) {
      if ((r / sq + c / sq) % 2 === 0) {
        ctx.fillRect(x + 2 + c, trackY - 90 + r, sq, sq);
      }
    }
  }

  // Label
  ctx.font = `9px ${F.ui}`;
  ctx.fillStyle = C.amber;
  ctx.fillText(`FINISH: ${targetM}m`, x - 18, trackY - 96);
  ctx.restore();
}

// Helper: Overlay Telemetry on Canvas
function drawCanvasTelemetry(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  v: number,
  s: number,
  t: number,
  _mode: VehicleType
) {
  ctx.save();
  const boxW = 240;
  const boxH = 58;
  const boxX = 14;
  const boxY = 14;

  ctx.fillStyle = "rgba(11, 13, 23, 0.88)";
  ctx.strokeStyle = C.slate;
  ctx.lineWidth = 1;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Accent line
  ctx.fillStyle = C.amber;
  ctx.fillRect(boxX, boxY, boxW, 2);

  ctx.font = `bold 9px ${F.ui}`;
  ctx.fillStyle = C.mint;
  ctx.fillText("■ TELEMETRI KINEMATIKA GLB", boxX + 8, boxY + 16);

  ctx.font = `14px ${F.mono}`;
  ctx.fillStyle = C.paper;
  ctx.fillText(`s = ${s.toFixed(2)} m`, boxX + 8, boxY + 34);
  ctx.fillText(`t = ${t.toFixed(2)} s`, boxX + 130, boxY + 34);

  ctx.font = `11px ${F.mono}`;
  ctx.fillStyle = C.mist;
  ctx.fillText(`v = ${v.toFixed(1)} m/s (konstan) | a = 0`, boxX + 8, boxY + 50);

  ctx.restore();
}
