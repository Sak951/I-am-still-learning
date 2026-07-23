"use client";

import React from "react";
import Sidebar from "@/components/sidebar";
import ToastContainer from "@/components/ui/toast";
import MetricsCharts from "@/components/dashboard/metrics-charts";
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Cpu,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
  Percent
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Total Sessions", val: "1,420", change: "+12% MoM", icon: MessageSquare, color: "text-purple-400" },
    { label: "Execution Latency", val: "840ms", change: "-80ms optimization", icon: Clock, color: "text-blue-400" },
    { label: "Accuracy Index", val: "99.8%", change: "+0.1% increase", icon: Percent, color: "text-emerald-400" },
    { label: "Total GPU Spend", val: "$142.85", change: "Budget cap: $250.00", icon: TrendingUp, color: "text-purple-400" },
  ];

  const recentEvents = [
    { event: "Docker sandbox spin-up", status: "Completed", time: "10m ago", color: "bg-emerald-500/10 text-emerald-500" },
    { event: "Fine-tune weights checkpoints", status: "Saved", time: "24m ago", color: "bg-purple-500/10 text-brand-purple" },
    { event: "Web scraper task #12", status: "Success", time: "1h ago", color: "bg-emerald-500/10 text-emerald-500" },
    { event: "Auth token API refresh", status: "Completed", time: "3h ago", color: "bg-blue-500/10 text-blue-500" },
    { event: "GCP Storage bucket sync", status: "Failed", time: "5h ago", color: "bg-rose-500/10 text-rose-500" }
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-app)] overflow-hidden">
      {/* Persisted app shell sidebar */}
      <Sidebar />

      {/* Main dashboard content scroll box */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header toolbar */}
        <header className="flex items-center justify-between border-b border-[var(--border-muted)] px-6 py-4 bg-[var(--bg-card)]/30 min-h-[64px]">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
              Workspace Telemetries
            </h1>
            <span className="text-[9px] bg-brand-emerald/10 text-brand-emerald font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1 h-1 bg-brand-emerald rounded-full animate-ping" />
              Agent Telemetry Online
            </span>
          </div>
        </header>

        {/* Dash Content Area */}
        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          
          {/* Card Scorecard grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-inactive)]">
                      {stat.label}
                    </span>
                    <StatIcon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
                      {stat.val}
                    </h2>
                    <span className="text-[9px] text-[var(--text-muted)] font-medium mt-1 block">
                      {stat.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Embed telemetry Recharts */}
          <MetricsCharts />

          {/* Split Log grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Recent execution events */}
            <div className="md:col-span-2 p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-sm">
              <h3 className="text-xs font-semibold text-[var(--text-main)] mb-4 tracking-wider uppercase">
                Activity Logs
              </h3>
              <div className="space-y-2.5">
                {recentEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-[var(--border-muted)]/50 bg-[var(--bg-app)]/30 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-3.5 h-3.5 text-[var(--text-inactive)]" />
                      <span className="font-semibold text-[var(--text-main)]">{evt.event}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-[var(--text-inactive)]">{evt.time}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${evt.color}`}>
                        {evt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick agent specifications */}
            <div className="p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-main)] mb-4 tracking-wider uppercase">
                  Workspace Health
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--border-muted)]">
                    <span className="text-[var(--text-muted)]">Container status</span>
                    <span className="font-bold text-brand-emerald flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Healthy
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--border-muted)]">
                    <span className="text-[var(--text-muted)]">VPC Gateway</span>
                    <span className="font-semibold text-[var(--text-main)]">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Active Model Weight</span>
                    <span className="font-semibold text-brand-purple">FP16 Quantized</span>
                  </div>
                </div>
              </div>
              
              <button className="flex items-center justify-center gap-1.5 w-full mt-4 py-2 px-3 bg-[var(--border-muted)] hover:bg-[var(--border-muted)]/80 text-[11px] font-semibold rounded-xl text-[var(--text-main)] transition-colors">
                <span>View Full Spec Sheets</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

          </div>

        </main>

        <ToastContainer />
      </div>
    </div>
  );
}
