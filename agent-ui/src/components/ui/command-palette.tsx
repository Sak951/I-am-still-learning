"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Terminal, FileCode, Cpu, User, Settings, FolderClosed, Zap, HelpCircle } from "lucide-react";
import { useChat } from "@/context/ChatContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const {
    setActiveAgent,
    setActiveWorkspace,
    createNewChat,
    addToast,
    knowledgeFiles
  } = useChat();

  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const items = [
    { category: "Navigation", label: "New Conversation", icon: Zap, action: () => { createNewChat(); onClose(); } },
    { category: "Navigation", label: "Settings Panel", icon: Settings, action: () => { addToast("Settings", "Settings dashboard is coming soon.", "default"); onClose(); } },
    
    { category: "Agents", label: "Hermes Core Agent", icon: Cpu, action: () => { setActiveAgent("Hermes Core"); addToast("Agent Selected", "Hermes Core set as default assistant.", "success"); onClose(); } },
    { category: "Agents", label: "Developer Agent", icon: FileCode, action: () => { setActiveAgent("Developer Agent"); addToast("Agent Selected", "Developer worker activated.", "success"); onClose(); } },
    { category: "Agents", label: "Research Agent", icon: Search, action: () => { setActiveAgent("Research Agent"); addToast("Agent Selected", "Workspace crawler active.", "success"); onClose(); } },
    
    { category: "Workspaces", label: "Switch to Personal Sandbox", icon: User, action: () => { setActiveWorkspace("Personal Sandbox"); addToast("Workspace Switched", "Entered Personal Sandbox container.", "default"); onClose(); } },
    { category: "Workspaces", label: "Switch to Production Environment", icon: Terminal, action: () => { setActiveWorkspace("Production Env"); addToast("Workspace Switched", "Entered secure Production container.", "warning"); onClose(); } },
  ];

  // Include dynamic knowledge base files
  const fileItems = knowledgeFiles.map(f => ({
    category: "Files",
    label: f.name,
    icon: FolderClosed,
    action: () => {
      addToast("File Context Loaded", `Loaded references from ${f.name}`, "success");
      onClose();
    }
  }));

  const allItems = [...items, ...fileItems];

  const filtered = allItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[6px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel shadow-2xl border border-[var(--border-muted)] bg-[var(--bg-card)]/90"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-[var(--border-muted)] bg-transparent">
              <Search className="w-4 h-4 text-[var(--text-inactive)] mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search command actions, agents, workflows... (Esc)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-[var(--text-main)] outline-none border-none placeholder-[var(--text-inactive)]"
              />
            </div>

            {/* Results Grid */}
            <div className="max-h-[340px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-[var(--text-inactive)]">
                  <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs">No command recommendations matched</span>
                </div>
              ) : (
                Object.entries(
                  filtered.reduce((groups, item) => {
                    if (!groups[item.category]) groups[item.category] = [];
                    groups[item.category].push(item);
                    return groups;
                  }, {} as Record<string, typeof filtered>)
                ).map(([category, catItems]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <div className="px-4 py-1 text-[10px] font-medium tracking-wider uppercase text-[var(--text-inactive)]">
                      {category}
                    </div>
                    <div className="px-1 mt-1 space-y-0.5">
                      {catItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            onClick={item.action}
                            className="flex items-center w-full px-3 py-2 text-left rounded-lg text-xs hover:bg-[var(--border-muted)] transition-colors group text-[var(--text-main)]"
                          >
                            <Icon className="w-3.5 h-3.5 mr-3 text-[var(--text-inactive)] group-hover:text-[var(--color-brand-purple)] transition-colors" />
                            <span className="flex-1 font-medium">{item.label}</span>
                            <span className="text-[10px] text-[var(--text-inactive)] uppercase border border-[var(--border-muted)] px-1.5 py-0.5 rounded-md scale-95 opacity-60">
                              run
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer status bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-muted)] bg-[var(--bg-app)]/50 text-[10px] text-[var(--text-inactive)]">
              <span>Use <kbd className="font-mono">↑↓</kbd> to select and <kbd className="font-mono">Enter</kbd> to execute</span>
              <span>Learn CLI v1.1.2</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
