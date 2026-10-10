"use client";
import { ResponsiveBar } from "@nivo/bar";
import { nivoTheme, useTokens } from "./useTokens";

/** One series, values labelled on the bars. Ink, not a family colour, unless a family is given. */
export function SimpleBars({ data, unit, family, height = 220, label }: {
  data: { label: string; value: number }[]; unit: string; family?: string; height?: number; label: string;
}) {
  const t = useTokens();
  const color = family ? t[`fam-${family}` as keyof typeof t] : t["ink-2"];
  return (
    <div style={{ height }} role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value} ${unit}`).join(", ")}`}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="label"
        margin={{ top: 22, right: 8, bottom: 30, left: 8 }}
        padding={0.35}
        colors={[color]}
        borderRadius={3}
        enableGridY={false}
        axisLeft={null}
        axisBottom={{ tickSize: 0, tickPadding: 8 }}
        label={(d) => `${d.value} ${unit}`}
        labelPosition="end"
        labelOffset={10}
        labelSkipHeight={0}
        labelTextColor={t.ink}
        theme={nivoTheme(t)}
        tooltip={({ indexValue, value }) => <div style={{ padding: "4px 8px" }}>{indexValue}: {value} {unit}</div>}
        animate={false}
      />
    </div>
  );
}
