"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DuesChartPoint } from "@/types/dashboard";

type DuesLineChartProps = {
  data: DuesChartPoint[];
};

export function DuesLineChart({ data }: DuesLineChartProps) {
  if (data.length === 0) {
    return <div className="empty-chart">표시할 회비 납부 데이터가 없습니다.</div>;
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#EEF2F6" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#667085", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#667085", fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
          <Tooltip
            formatter={(value, name) => [`${value}%`, name === "cumulativeRate" ? "당월" : name === "previousMonthRate" ? "전월" : "전년도"]}
            labelFormatter={(label) => `기준일 ${label}`}
          />
          <Line type="monotone" dataKey="cumulativeRate" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} name="당월" />
          <Line type="monotone" dataKey="previousMonthRate" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" dot={false} name="전월" />
          <Line type="monotone" dataKey="previousYearRate" stroke="#98A2B3" strokeWidth={2} strokeDasharray="2 5" dot={false} name="전년도" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
