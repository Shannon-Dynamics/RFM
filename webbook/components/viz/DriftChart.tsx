"use client";
import { ResponsiveLine, type LineCustomSvgLayerProps } from "@nivo/line";
import { useMemo } from "react";
import { driftCurve } from "@/lib/sim/puck";
import { nivoTheme, useTokens } from "./useTokens";

const ERRORS = [-0.01, -0.03, -0.05];

/** How far imagination drifts from reality, computed live from the chapter's toy world model. */
export function DriftChart() {
  const t = useTokens();
  // Magnitude of model error is ordered, so a one-hue ramp in ink (colour is reserved for families).
  const ramp = [t["ink-3"], t["ink-2"], t.ink];
  const data = useMemo(() => ERRORS.map((e) => ({
    id: `friction error ${e.toFixed(2)}`,
    data: driftCurve(e, 40).map((y, i) => ({ x: i + 1, y })),
  })), []);

  const Labels = ({ series }: LineCustomSvgLayerProps<(typeof data)[number]>) => (
    <g>
      {series.map((s) => {
        const end = s.data[s.data.length - 1].position;
        return <text key={s.id} x={end.x - 4} y={end.y - 7} textAnchor="end" fontSize={12.5} fill={t["ink-2"]}
          fontFamily="var(--font-ui)">{String(s.id).replace("friction error ", "error ")}</text>;
      })}
    </g>
  );

  return (
    <div style={{ height: 280 }} role="img"
      aria-label={`Distance between imagined and real puck after 40 imagined steps: ${data.map((d) => `${d.id}: ${d.data[39].y.toFixed(2)}`).join("; ")}. The goal is 0.4 units in radius.`}>
      <ResponsiveLine
        data={data}
        margin={{ top: 16, right: 16, bottom: 46, left: 56 }}
        xScale={{ type: "linear", min: 1, max: 40 }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        axisBottom={{ legend: "Steps imagined ahead", legendOffset: 36, legendPosition: "middle", tickValues: [1, 10, 20, 30, 40] }}
        axisLeft={{ legend: "Imagined vs. real (table units)", legendOffset: -46, legendPosition: "middle", tickValues: 5 }}
        enableGridX={false}
        colors={ramp}
        lineWidth={2}
        enablePoints={false}
        enableSlices="x"
        markers={[{ axis: "y", value: 0.4, lineStyle: { stroke: t["rule-strong"], strokeDasharray: "4 4", strokeWidth: 1 },
          legend: "goal radius", legendPosition: "top-left", textStyle: { fill: t["ink-3"], fontSize: 12, fontFamily: "var(--font-ui)" } }]}
        sliceTooltip={({ slice }) => (
          <div style={{ padding: "6px 10px" }}>
            <div style={{ fontWeight: 600 }}>{slice.points[0].data.xFormatted} steps ahead</div>
            {slice.points.map((p) => <div key={p.id}>{p.seriesId}: {Number(p.data.y).toFixed(2)}</div>)}
          </div>
        )}
        layers={["grid", "markers", "axes", "lines", Labels, "slices", "crosshair"]}
        theme={nivoTheme(t)}
        animate={false}
      />
    </div>
  );
}
