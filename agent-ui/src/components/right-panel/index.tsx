"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Coins,
  Cpu,
  FileCode,
  Layers,
  Terminal,
  ChevronRight,
  Database,
  ChevronDown,
  Info
} from "lucide-react";
import { useChat } from "@/context/ChatContext";

export default function RightPanel() {
  const {
    rightPanelOpen,
    setRightPanelOpen,
    timelineSteps,
    executionLogs,
    isAgentRunning,
    tokenCostAccumulated,
    knowledgeFiles,
    activeSession
  } = useChat();

  const [expandedSection, setExpandedSection] = useState<string>("timeline");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-brand-emerald bg-brand-emerald/10 border-brand-emerald/30";
      case "running":
        return "text-brand-purple bg-brand-purple/10 border-brand-purple/40 animate-pulse";
      case "failed":
        return "text-rose-500 bg-rose-500/10 border-rose-500/30";
      default:
        return "text-[var(--text-inactive)] bg-[var(--bg-app)] border-[var(--border-muted)]";
    }
  };

  return (
    <div className="flex z-20">
      {/* Mini Toggle tab when closed */}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 bg-[var(--bg-card)] border-y border-l border-[var(--border-muted)] px-1.5 py-4 rounded-l-xl hover:bg-[var(--border-muted)] text-[var(--text-inactive)] hover:text-[var(--text-main)] transition-colors flex flex-col items-center gap-1 shadow-md"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          <span className="text-[8px] font-bold uppercase tracking-wider vertical-text py-1">Context</span>
        </button>
      )}

      {/* Main Drawer container */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="h-screen border-l border-[var(--border-muted)] bg-[var(--bg-sidebar)] flex flex-col select-none flex-shrink-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-muted)] min-h-[64px]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-purple animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  Live Agent Context
                </span>
              </div>
              <button
                onClick={() => setRightPanelOpen(false)}
                className="p-1 rounded-md text-[var(--text-inactive)] hover:bg-[var(--border-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Inner Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
              
              {/* Section 1: Agent Reasoning Timeline */}
              <div className="border border-[var(--border-muted)] rounded-xl bg-[var(--bg-card)]/40 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection("timeline")}
                  className="flex items-center justify-between w-full px-3 py-2 bg-[var(--bg-app)]/55 text-left border-b border-[var(--border-muted)]"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-brand-purple" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-main)]">Reasoning Engine</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-inactive)] transition-transform ${expandedSection === "timeline" ? "rotate-0" : "-rotate-90"}`} />
                </button>

                {expandedSection === "timeline" && (
                  <div className="p-3 space-y-3">
                    {timelineSteps.length === 0 ? (
                      <div className="flex flex-col items-center py-4 text-center text-[var(--text-inactive)]">
                        <Info className="w-6 h-6 mb-1.5 opacity-40" />
                        <span className="text-[10px]">Awaiting query tasks...</span>
                      </div>
                    ) : (
                      <div className="relative border-l border-[var(--border-muted)] ml-2.5 pl-3.5 space-y-3">
                        {timelineSteps.map((step) => (
                          <div key={step.id} className="relative group text-xs">
                            {/* Dot overlay */}
                            <span className={`absolute -left-[20.5px] top-0.5 w-3 h-3 rounded-full border flex items-center justify-center text-[7px] font-bold ${getStepColor(step.status)}`}>
                              {step.status === "completed" ? "✓" : step.status === "running" ? "●" : ""}
                            </span>
                            <div className="flex items-center justify-between">
                              <span className={`font-semibold ${step.status === "completed" ? "text-[var(--text-main)]" : step.status === "running" ? "text-brand-purple font-bold" : "text-[var(--text-inactive)]"}`}>
                                {step.label}
                              </span>
                              {step.duration && (
                                <span className="text-[9px] font-mono text-[var(--text-inactive)] bg-[var(--border-muted)] px-1 rounded">
                                  {step.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Token and Cost Stats */}
              <div className="border border-[var(--border-muted)] rounded-xl bg-[var(--bg-card)]/40 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection("tokens")}
                  className="flex items-center justify-between w-full px-3 py-2 bg-[var(--bg-app)]/55 text-left border-b border-[var(--border-muted)]"
                >
                  <div className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-brand-blue" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-main)]">Billing & API Cost</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-inactive)] transition-transform ${expandedSection === "tokens" ? "rotate-0" : "-rotate-90"}`} />
                </button>

                {expandedSection === "tokens" && (
                  <div className="p-3 space-y-2 text-[10px]">
                    <div className="flex justify-between border-b border-[var(--border-muted)] pb-1.5">
                      <span className="text-[var(--text-muted)] font-medium">Accumulated Tokens</span>
                      <span className="font-bold text-[var(--text-main)]">{tokenCostAccumulated.tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border-muted)] pb-1.5">
                      <span className="text-[var(--text-muted)] font-medium">Estimated Cost</span>
                      <span className="font-bold text-brand-emerald">${tokenCostAccumulated.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)] font-medium">Pricing Profile</span>
                      <span className="font-semibold text-brand-purple">Hermes Sandbox v3</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Live API Call Tracing */}
              <div className="border border-[var(--border-muted)] rounded-xl bg-[var(--bg-card)]/40 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection("api")}
                  className="flex items-center justify-between w-full px-3 py-2 bg-[var(--bg-app)]/55 text-left border-b border-[var(--border-muted)]"
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-brand-emerald" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-main)]">API Call Tracing</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-inactive)] transition-transform ${expandedSection === "api" ? "rotate-0" : "-rotate-90"}`} />
                </button>

                {expandedSection === "api" && (
                  <div className="p-3 space-y-2 text-[9px] font-mono">
                    <div className="border-b border-[var(--border-muted)] pb-1.5">
                      <div className="flex items-center justify-between text-brand-purple font-semibold">
                        <span>POST /chat/completions</span>
                        <span className="text-brand-emerald bg-brand-emerald/10 px-1 rounded">200 OK</span>
                      </div>
                      <div className="text-[var(--text-inactive)] mt-0.5">{"{ \"model\": \"hermes-3-70b\", \"temp\": 0.4 }"}</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-brand-blue font-semibold">
                        <span>GET /workspace/files</span>
                        <span className="text-brand-emerald bg-brand-emerald/10 px-1 rounded">200 OK</span>
                      </div>
                      <div className="text-[var(--text-inactive)] mt-0.5">Retrieved {knowledgeFiles.length} catalog nodes</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Shell Execution Logs */}
              <div className="border border-[var(--border-muted)] rounded-xl bg-[var(--bg-card)]/40 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection("logs")}
                  className="flex items-center justify-between w-full px-3 py-2 bg-[var(--bg-app)]/55 text-left border-b border-[var(--border-muted)]"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-main)]">Sandbox terminal</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-inactive)] transition-transform ${expandedSection === "logs" ? "rotate-0" : "-rotate-90"}`} />
                </button>

                {expandedSection === "logs" && (
                  <div className="p-3 bg-black/40 rounded-b-xl border-t border-[var(--border-muted)] text-[9px] font-mono max-h-[160px] overflow-y-auto space-y-1.5 leading-relaxed text-[var(--text-muted)]">
                    {executionLogs.length === 0 ? (
                      <div className="text-center py-2 opacity-50">Terminal socket idle...</div>
                    ) : (
                      executionLogs.map((log) => (
                        <div key={log.id} className="flex items-start">
                          <span className="text-brand-purple mr-1.5 flex-shrink-0">[{log.timestamp}]</span>
                          <span className={`${
                            log.type === "success" ? "text-brand-emerald" :
                            log.type === "warning" ? "text-amber-400" :
                            log.type === "error" ? "text-rose-500" :
                            log.type === "tool" ? "text-brand-blue" : "text-[var(--text-main)]"
                          }`}>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Section 5: Memory Indicators */}
              <div className="border border-[var(--border-muted)] rounded-xl bg-[var(--bg-card)]/40 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection("memory")}
                  className="flex items-center justify-between w-full px-3 py-2 bg-[var(--bg-app)]/55 text-left border-b border(--border-muted)"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-brand-purple" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-main)]">Recalled Memory</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-inactive)] transition-transform ${expandedSection === "memory" ? "rotate-0" : "-rotate-90"}`} />
                </button>

                {expandedSection === "memory" && (
                  <div className="p-3 text-[10px] space-y-2">
                    <div className="p-2 rounded bg-[var(--bg-app)] border border-[var(--border-muted)]">
                      <div className="font-semibold text-brand-purple mb-0.5">USER_PREF: theme</div>
                      <div className="text-[var(--text-muted)] text-[9px]">Value: dark_theme_priority = true</div>
                    </div>
                    <div className="p-2 rounded bg-[var(--bg-app)] border border-[var(--border-muted)]">
                      <div className="font-semibold text-brand-blue mb-0.5">DEV_TARGET: main_framework</div>
                      <div className="text-[var(--text-muted)] text-[9px]">Value: nextjs_15_router</div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
