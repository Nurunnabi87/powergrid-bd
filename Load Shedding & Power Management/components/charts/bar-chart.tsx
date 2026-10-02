"use client";

import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import type { ChartRow } from "@/components/charts/trend-chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface BarChartProps {
  data: ChartRow[];
  categoryKey: string;
  valueKey: string;
  label: string;
  /** A --chart-N token. One series → one colour; categories are not recoloured. */
  color?: string;
  /** "horizontal" bars suit long category names (areas, feeders). */
  orientation?: "vertical" | "horizontal";
  formatValue?: (value: number) => string;
  height?: number;
}

/**
 * Magnitude by category. Bars are ≤ 24px thick with a 4px rounded data end
 * (square at the baseline) and the value printed at the bar's end, so the
 * number never depends on colour or hovering.
 */
export function BarChart({
  data,
  categoryKey,
  valueKey,
  label,
  color = "var(--chart-2)",
  orientation = "vertical",
  formatValue = (value) => value.toLocaleString(),
  height,
}: BarChartProps) {
  const config = { [valueKey]: { label, color } } satisfies ChartConfig;
  const horizontal = orientation === "horizontal";
  const computedHeight = height ?? (horizontal ? Math.max(160, data.length * 40 + 24) : 260);

  return (
    <ChartContainer config={config} className="w-full" style={{ height: computedHeight }}>
      <RechartsBarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 20, right: horizontal ? 48 : 8, bottom: 0, left: 0 }}
        barCategoryGap={horizontal ? 10 : "24%"}
        accessibilityLayer
      >
        <CartesianGrid vertical={horizontal} horizontal={!horizontal} strokeWidth={1} />
        {horizontal ? (
          <>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey={categoryKey}
              tickLine={false}
              axisLine={false}
              width={120}
              tickFormatter={(value: string) => (value.length > 16 ? `${value.slice(0, 15)}…` : value)}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tickMargin={8} interval={0} />
            <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} tickFormatter={(value: number) => formatValue(value)} />
          </>
        )}
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={
            <ChartTooltipContent
              hideIndicator={false}
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground tabular-nums">{formatValue(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey={valueKey}
          fill={`var(--color-${valueKey})`}
          maxBarSize={24}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        >
          <LabelList
            dataKey={valueKey}
            position={horizontal ? "right" : "top"}
            offset={6}
            className="fill-foreground text-xs tabular-nums"
            formatter={(value: unknown) => formatValue(Number(value))}
          />
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}
