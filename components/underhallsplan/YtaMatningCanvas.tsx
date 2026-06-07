"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  beraknaKvmFranMatning,
  type Punkt2D,
} from "@/components/underhallsplan/yta-matning";

type YtaMatningCanvasProps = {
  imageUrl: string | null;
  onKvmChange: (kvm: number | null) => void;
};

type Läge = "kalibrera" | "polygon";

export function YtaMatningCanvas({ imageUrl, onKvmChange }: YtaMatningCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [läge, setLäge] = useState<Läge>("kalibrera");
  const [kalibrering, setKalibrering] = useState<{
    punktA: Punkt2D;
    punktB: Punkt2D;
  } | null>(null);
  const [kalibreringsKlick, setKalibreringsKlick] = useState<Punkt2D[]>([]);
  const [referensMeter, setReferensMeter] = useState("10");
  const [polygon, setPolygon] = useState<Punkt2D[]>([]);
  const [lutningsfaktor, setLutningsfaktor] = useState("1");
  const [bildStorlek, setBildStorlek] = useState({ w: 0, h: 0 });

  const beraknadKvm = beraknaKvmFranMatning(
    polygon,
    kalibrering && Number.parseFloat(referensMeter) > 0
      ? {
          ...kalibrering,
          langdMeter: Number.parseFloat(referensMeter.replace(",", ".")),
        }
      : null,
    Number.parseFloat(lutningsfaktor.replace(",", ".")) || 1,
  );

  useEffect(() => {
    onKvmChange(beraknadKvm);
  }, [beraknadKvm, onKvmChange]);

  const rita = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageUrl || bildStorlek.w === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const cw = Math.floor(rect.width);
    const ch = Math.floor(Math.min(rect.width * 0.75, 420));
    canvas.width = cw;
    canvas.height = ch;

    const scale = Math.min(cw / bildStorlek.w, ch / bildStorlek.h);
    const dw = bildStorlek.w * scale;
    const dh = bildStorlek.h * scale;
    const ox = (cw - dw) / 2;
    const oy = (ch - dh) / 2;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = "#f4f6f4";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, ox, oy, dw, dh);

      const tillCanvas = (p: Punkt2D): Punkt2D => ({
        x: ox + (p.x / bildStorlek.w) * dw,
        y: oy + (p.y / bildStorlek.h) * dh,
      });

      const tillBild = (cx: number, cy: number): Punkt2D => ({
        x: ((cx - ox) / dw) * bildStorlek.w,
        y: ((cy - oy) / dh) * bildStorlek.h,
      });

      (canvas as HTMLCanvasElement & { __tillBild?: typeof tillBild }).__tillBild =
        tillBild;

      ctx.strokeStyle = "#2d6a4f";
      ctx.fillStyle = "rgba(45, 106, 79, 0.25)";
      ctx.lineWidth = 2;

      if (kalibrering) {
        const a = tillCanvas(kalibrering.punktA);
        const b = tillCanvas(kalibrering.punktB);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.fillStyle = "#2d6a4f";
        for (const p of [a, b]) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      kalibreringsKlick.forEach((p) => {
        const c = tillCanvas(p);
        ctx.fillStyle = "#c9a227";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (polygon.length >= 2) {
        ctx.beginPath();
        const first = tillCanvas(polygon[0]);
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < polygon.length; i++) {
          const c = tillCanvas(polygon[i]);
          ctx.lineTo(c.x, c.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      polygon.forEach((p) => {
        const c = tillCanvas(p);
        ctx.fillStyle = "#1b4332";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    img.src = imageUrl;
  }, [
    imageUrl,
    bildStorlek,
    kalibrering,
    kalibreringsKlick,
    polygon,
  ]);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBildStorlek({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    rita();
    const ro = new ResizeObserver(() => rita());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [rita]);

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!imageUrl || bildStorlek.w === 0) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.min(cw / bildStorlek.w, ch / bildStorlek.h);
    const dw = bildStorlek.w * scale;
    const dh = bildStorlek.h * scale;
    const ox = (cw - dw) / 2;
    const oy = (ch - dh) / 2;

    if (cx < ox || cy < oy || cx > ox + dw || cy > oy + dh) return;

    const punkt: Punkt2D = {
      x: ((cx - ox) / dw) * bildStorlek.w,
      y: ((cy - oy) / dh) * bildStorlek.h,
    };

    if (läge === "kalibrera") {
      const next = [...kalibreringsKlick, punkt].slice(-2);
      setKalibreringsKlick(next);
      if (next.length === 2) {
        setKalibrering({ punktA: next[0], punktB: next[1] });
      }
      return;
    }

    setPolygon((prev) => [...prev, punkt]);
  }

  if (!imageUrl) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-background px-3 py-4 text-xs text-muted">
        Ladda upp en skärmbild från Google Earth eller satellitbild ovan, sedan kan
        du mäta här.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setLäge("kalibrera");
            setKalibreringsKlick([]);
            setKalibrering(null);
          }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            läge === "kalibrera"
              ? "border-primary bg-[#e2f0e6] text-primary-dark"
              : "border-border"
          }`}
        >
          1. Kalibrera skala
        </button>
        <button
          type="button"
          onClick={() => setLäge("polygon")}
          disabled={!kalibrering}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
            läge === "polygon"
              ? "border-primary bg-[#e2f0e6] text-primary-dark"
              : "border-border"
          }`}
        >
          2. Rita yta
        </button>
        <button
          type="button"
          onClick={() => setPolygon([])}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
        >
          Rensa polygon
        </button>
      </div>

      <p className="text-xs text-muted">
        {läge === "kalibrera"
          ? "Klicka två punkter på en känd sträcka (t.ex. fasadbredd) och ange längden i meter."
          : "Klicka hörnen på taket eller fasaden. Minst tre punkter."}
      </p>

      <div ref={containerRef} className="w-full overflow-hidden rounded-lg border border-border">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="w-full cursor-crosshair"
          role="img"
          aria-label="Ytmätning på bild"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-xs font-medium text-muted">Referenslängd (m)</span>
          <input
            value={referensMeter}
            onChange={(e) => setReferensMeter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
          />
        </label>
        {läge === "polygon" && (
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted">Lutningsfaktor (tak)</span>
            <input
              value={lutningsfaktor}
              onChange={(e) => setLutningsfaktor(e.target.value)}
              placeholder="1,0"
              className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
            />
          </label>
        )}
        <div className="text-sm">
          <span className="text-xs font-medium text-muted">Beräknad yta</span>
          <p className="mt-1 text-lg font-semibold text-primary-dark tabular-nums">
            {beraknadKvm != null ? `${beraknadKvm.toLocaleString("sv-SE")} m²` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
