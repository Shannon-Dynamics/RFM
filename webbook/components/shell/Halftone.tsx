"use client";
import { useEffect, useRef } from "react";

/** The Shannon halftone: a grid of dots on graphite whose size follows slowly drifting blobs.
 *  Static when the reader prefers reduced motion; paused when off screen. */
export function Halftone({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blobs = Array.from({ length: 7 }, (_, i) => ({
      x: (i * 0.37 + 0.11) % 1, y: (i * 0.53 + 0.23) % 1, r: 0.12 + ((i * 0.29) % 0.14),
      vx: (((i * 7) % 5) - 2) * 0.006, vy: (((i * 3) % 5) - 2) * 0.004,
    }));
    let w = 0, h = 0, frame = 0, visible = true, last = 0;
    const GAP = 7;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const s = Math.max(w, h);
      for (let gy = GAP / 2; gy < h; gy += GAP) {
        for (let gx = GAP / 2; gx < w; gx += GAP) {
          let v = 0.08;
          for (const b of blobs) {
            const bx = ((b.x + b.vx * t) % 1 + 1) % 1 * w, by = ((b.y + b.vy * t) % 1 + 1) % 1 * h;
            const d2 = ((gx - bx) ** 2 + (gy - by) ** 2) / (b.r * s) ** 2;
            v += Math.exp(-d2 * 1.6) * 0.9;
          }
          v = Math.min(1, v) * intensity;
          if (v < 0.06) continue;
          ctx.fillStyle = `rgba(169, 195, 255, ${0.1 + v * 0.42})`;
          ctx.beginPath();
          ctx.arc(gx, gy, 0.5 + v * 1.55, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible || now - last < 60) return;
      last = now;
      draw(now / 1000);
    };
    resize();
    draw(0);
    const ro = new ResizeObserver(() => { resize(); draw(last / 1000); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    if (!still) frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); ro.disconnect(); io.disconnect(); };
  }, [intensity]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
