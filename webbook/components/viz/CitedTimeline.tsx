"use client";
import { useEffect, useRef, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { nivoTheme, useTokens } from "./useTokens";

/** Single-series bar: papers cited per half-year. Ink, not a family colour: these span families. */
export function CitedTimeline({ data }: { data: { period: string; count: number }[] }) {
  const t = useTokens();
  // On narrow screens "2025 H1" no longer fits under its bar, so the year is shortened to "’25 H1".
  const box = useRef<HTMLDivElement>(null);
  const [short, setShort] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setShort(e.contentRect.width / Math.max(1, data.length) < 62));
    ro.observe(el);
    return () => ro.disconnect();
  }, [data.length]);
  return (
    <div ref={box} style={{ height: 130 }} role="img" aria-label={`Papers cited by half-year: ${data.map((d) => `${d.period} ${d.count}`).join(", ")}`}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="period"
        margin={{ top: 18, right: 4, bottom: 24, left: 4 }}
        padding={0.28}
        colors={[t["ink-2"]]}
        borderRadius={3}
        enableGridY={false}
        axisLeft={null}
        axisBottom={{ tickSize: 0, tickPadding: 6, format: (v: string) => (short ? v.replace(/^20(\d\d)/, "’$1") : v) }}
        label={(d) => `${d.value}`}
        labelPosition="end"
        labelOffset={10}
        labelSkipHeight={0}
        labelTextColor={t.ink}
        theme={nivoTheme(t)}
        tooltip={({ indexValue, value }) => (
          <div style={{ padding: "4px 8px" }}>{indexValue}: {value} papers</div>
        )}
        animate={false}
      />
    </div>
  );
}
