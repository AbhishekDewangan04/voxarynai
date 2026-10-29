import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/20 bg-[#0b1020]/90 px-3 py-2 text-[11px] shadow-xl backdrop-blur-md">
      <p className="font-semibold text-white">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-0.5 text-white/65">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.dataKey === "calls" ? "Calls" : "Booked"} · {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function CallsChart({ data, height = 176, compact = false }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={height}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          {!compact && (
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
              axisLine={false}
              tickLine={false}
              interval={2}
              tickMargin={8}
            />
          )}
          <YAxis hide domain={[0, "dataMax + 12"]} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.18)" }} />
          <Area type="monotone" dataKey="calls" stroke="#a5b4fc" strokeWidth={2} fill="url(#callsFill)" />
          <Area
            type="monotone"
            dataKey="booked"
            stroke="#22d3ee"
            strokeWidth={1.5}
            fill="transparent"
            strokeDasharray="4 3"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}