"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { DailyPoint } from "@/types/creator";

type Metric = "downloads" | "sales";

const METRICS: Record<Metric, { label: string; unit: [string, string] }> = {
  downloads: { label: "Descargas", unit: ["descarga", "descargas"] },
  sales: { label: "Ventas", unit: ["venta", "ventas"] },
};

const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 40 };
const GAP = 2;

const dayLabel = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", timeZone: "UTC" });
const fullDate = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const fmt = (n: number) => n.toLocaleString("es");

/** Bar path with 4px rounded top, square base anchored to the baseline. */
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

/** Rounds up to 1, 2 or 5 × 10ⁿ so the axis reads cleanly. */
export function niceCeil(n: number) {
  if (n <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(n));
  return [1, 2, 5, 10].map((m) => m * p).find((v) => v >= n)!;
}

/**
 * One metric per day. Downloads and sales live on very different scales, so they are
 * never drawn together: a toggle switches the single series (and its axis).
 */
export function DailyChart({ data, title }: { data: DailyPoint[]; title: string }) {
  const [metric, setMetric] = useState<Metric>("downloads");
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const value = (d: DailyPoint) => d[metric];
  const niceMax = niceCeil(Math.max(...data.map(value)));
  const total = data.reduce((n, d) => n + value(d), 0);
  const { label, unit } = METRICS[metric];
  const ticks = [0, niceMax / 2, niceMax];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const step = plotW / data.length;
  const barW = Math.max(1, step - GAP);
  const y = (v: number) => PAD.top + plotH - (v / niceMax) * plotH;
  const active = hover !== null ? data[hover] : null;

  return (
    <figure>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <figcaption className="font-semibold">
          {title}
          <span className="ml-2 font-mono text-xs font-normal text-ash">Total {fmt(total)}</span>
        </figcaption>
        <div role="group" aria-label="Métrica" className="flex rounded-[3px] border border-concrete p-0.5">
          {(Object.keys(METRICS) as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={metric === m}
              onClick={() => setMetric(m)}
              className={cn(
                "rounded-[2px] px-3 py-1 text-xs font-semibold transition-colors",
                metric === m ? "bg-concrete text-bone" : "text-ash hover:text-bone",
              )}
            >
              {METRICS[m].label}
            </button>
          ))}
        </div>
      </div>
      <div ref={wrap} className="relative" onMouseLeave={() => setHover(null)}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="img" aria-label={`${label} por día: ${title}`} className="block">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--concrete)" strokeDasharray={t === 0 ? undefined : "2 4"} />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ash font-mono text-[10px]">
                  {t >= 1000 ? `${t / 1000}k` : t}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = PAD.left + i * step + GAP / 2;
              const h = (value(d) / niceMax) * plotH;
              return (
                <g key={d.date}>
                  <motion.path
                    key={metric}
                    d={barPath(x, y(value(d)), barW, h)}
                    fill="var(--flare)"
                    opacity={hover === null || hover === i ? 1 : 0.35}
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    style={{ transformOrigin: `0px ${PAD.top + plotH}px`, transformBox: "view-box" }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.012, 0.4), ease: [0.22, 1, 0.36, 1] }}
                  />
                  {/* Hit target: full column height, wider than the bar */}
                  <rect
                    x={PAD.left + i * step}
                    y={PAD.top}
                    width={step}
                    height={plotH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                  />
                  {i % Math.ceil(data.length / 5) === 1 && (
                    <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-ash font-mono text-[10px]">
                      {dayLabel.format(new Date(d.date))}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
        {active && hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-[3px] border border-concrete-2 bg-asphalt px-3 py-2 shadow-xl"
            style={{ left: Math.min(Math.max(PAD.left + hover * step + step / 2, 70), width - 70) }}
          >
            <p className="whitespace-nowrap text-[11px] capitalize text-ash">{fullDate.format(new Date(active.date))}</p>
            <p className="font-mono text-sm font-semibold text-bone">
              {fmt(value(active))} {unit[value(active) === 1 ? 0 : 1]}
            </p>
          </div>
        )}
        {width === 0 && <div style={{ height: HEIGHT }} />}
      </div>

      <details className="mt-3 text-xs text-ash">
        <summary className="cursor-pointer hover:text-bone">Ver como tabla</summary>
        <div className="mt-2 max-h-56 overflow-y-auto rounded-[3px] border border-concrete">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-soot-2">
              <tr>
                <th className="px-3 py-1.5 font-medium">Fecha</th>
                <th className="px-3 py-1.5 text-right font-medium">Descargas</th>
                <th className="px-3 py-1.5 text-right font-medium">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date} className="border-t border-concrete">
                  <td className="px-3 py-1.5">{dayLabel.format(new Date(d.date))}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-bone">{fmt(d.downloads)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-bone">{fmt(d.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
