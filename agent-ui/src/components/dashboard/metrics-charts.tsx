"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const dailyData = [
  { day: "Mon", chats: 12, tokens: 32000, cost: 0.16 },
  { day: "Tue", chats: 19, tokens: 45000, cost: 0.28 },
  { day: "Wed", chats: 15, tokens: 38000, cost: 0.21 },
  { day: "Thu", chats: 28, tokens: 78000, cost: 0.52 },
  { day: "Fri", chats: 22, tokens: 59000, cost: 0.38 },
  { day: "Sat", chats: 8, tokens: 19000, cost: 0.09 },
  { day: "Sun", chats: 14, tokens: 31000, cost: 0.18 },
];

const modelSplit = [
  { name: "I Still Learning", percentage: 50, fill: "#7C3AED" },
  { name: "Hermes Core", percentage: 25, fill: "#3B82F6" },
  { name: "GPT-4o Mini", percentage: 15, fill: "#10B981" },
  { name: "Claude Sonnet", percentage: 8, fill: "#F59E0B" },
  { name: "DeepSeek R1", percentage: 2, fill: "#EF4444" },
];

export default function MetricsCharts() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[var(--text-inactive)]">
        Spinning telemetry charts...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Area Chart */}
      <div className="lg:col-span-2 p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-sm">
        <h3 className="text-xs font-semibold text-[var(--text-main)] mb-4 tracking-wider uppercase">
          Token Load History (7D)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-inactive)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--text-inactive)" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-muted)",
                  borderRadius: "12px",
                  fontSize: "10px",
                  color: "var(--text-main)"
                }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#purpleGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-sm">
        <h3 className="text-xs font-semibold text-[var(--text-main)] mb-4 tracking-wider uppercase">
          Model Deployment Allocation
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelSplit} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-inactive)" fontSize={10} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="var(--text-inactive)" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-muted)",
                  borderRadius: "12px",
                  fontSize: "10px",
                  color: "var(--text-main)"
                }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={12}>
                {modelSplit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
