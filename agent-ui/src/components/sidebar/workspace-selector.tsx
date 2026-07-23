"use client";

import React, { useState } from "react";
import { ChevronDown, Briefcase, Server, ShieldCheck, Box } from "lucide-react";
import { useChat } from "@/context/ChatContext";

export default function WorkspaceSelector() {
  const { activeWorkspace, setActiveWorkspace, addToast } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { name: "Personal Sandbox", desc: "Local sandbox, ephemeral memory", icon: Box, color: "text-blue-400" },
    { name: "Team Sandbox", desc: "Shared dev container with VPC", icon: Briefcase, color: "text-purple-400" },
    { name: "Production Env", desc: "GCP instances with read/write access", icon: ShieldCheck, color: "text-emerald-400" },
  ];

  const current = options.find((o) => o.name === activeWorkspace) || options[0];
  const CurrentIcon = current.icon;

  const handleSelect = (workspaceName: string) => {
    setActiveWorkspace(workspaceName);
    setIsOpen(false);
    addToast(
      "Workspace Switched",
      `Environment swapped to ${workspaceName}. Database paths updated.`,
      workspaceName.includes("Production") ? "warning" : "default"
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-card)] hover:bg-[var(--border-muted)] transition-colors text-left"
      >
        <div className={`mr-2.5 flex-shrink-0 ${current.color}`}>
          <CurrentIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-[var(--text-main)] truncate">
            {current.name}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] truncate">
            {current.desc}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-inactive)] ml-2 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-20 mt-1.5 p-1 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-lg glass-panel">
            {options.map((opt) => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.name}
                  onClick={() => handleSelect(opt.name)}
                  className={`flex items-center w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors hover:bg-[var(--border-muted)] ${
                    activeWorkspace === opt.name
                      ? "text-[var(--text-main)] bg-[var(--border-muted)]/50"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  <OptIcon className={`w-3.5 h-3.5 mr-2.5 flex-shrink-0 ${opt.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-[var(--text-main)]">{opt.name}</div>
                    <div className="text-[9px] text-[var(--text-inactive)] truncate">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
