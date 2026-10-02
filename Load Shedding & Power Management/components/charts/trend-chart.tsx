"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface Series {
  key: string;
  label: string;
  /** A --chart-N token, assigned in fixed order. */
  color: string;
}

export type ChartRow = Record<string, string | number>;

interface TrendChartProps {
  data: ChartRow[];
  xKey: string;
  series: Series[];
  formatX?: (value: string) => string;
  formatValue?: (value: number) => string;
  height?: number;
}

/**
 * Change over time: 2px lines, recessive hairline grid, crosshair tooltip
 * listing every series at the hovered X. A legend appears only for 2+
 * series (a single series is named by the card title).
 */
export function TrendChart({
  data,
  xKey,
  series,
  formatX = (value) => value,
  formatValue = (value) => value.toLocaleString(),
  height = 260,
}: TrendChartProps) {
  const config = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="w-full" style={{ height }}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} strokeWidth={1} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatX} minTickGap={16} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(value: number) => formatValue(value)} allowDecimals={false} />
        <ChartTooltip
          cursor={{ strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) => formatX(String(value))}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{config[String(name)]?.label ?? name}</span>
                  <span className="font-medium text-foreground tabular-nums">{formatValue(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={data.length <= 12 ? { r: 4, strokeWidth: 2, stroke: "var(--card)", fill: `var(--color-${s.key})` } : false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
