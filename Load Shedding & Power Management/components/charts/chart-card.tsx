"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export interface ChartTable {
  columns: string[];
  rows: (string | number)[][];
}

interface ChartCardProps {
  title: string;
  description?: string;
  /** Same data as the chart, as a table: the accessible / exact-value view. */
  table: ChartTable;
  children: ReactNode;
  empty?: ReactNode;
  className?: string;
}

/**
 * Card wrapper for every chart, with a Chart ⇄ Table switch so every value
 * is reachable without hovering or relying on colour.
 */
export function ChartCard({ title, description, table, children, empty, className }: ChartCardProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const hasData = table.rows.length > 0;

  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {hasData && (
          <CardAction>
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={view}
              onValueChange={(next) => next && setView(next as "chart" | "table")}
              aria-label={`${title} view`}
            >
              <ToggleGroupItem value="chart" aria-label="Chart view">
                <BarChart3 />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table2 />
              </ToggleGroupItem>
            </ToggleGroup>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {!hasData ? (
          empty
        ) : view === "chart" ? (
          children
        ) : (
          <div className="max-h-80 overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {table.columns.map((column, index) => (
                    <TableHead key={column} className={cn(index > 0 && "text-right")}>
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className={cn(cellIndex > 0 && "text-right tabular-nums")}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
