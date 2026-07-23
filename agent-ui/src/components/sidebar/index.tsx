"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import CommandPalette from "../ui/command-palette";
import Mascot from "../chat/mascot";

export default function Sidebar() {
  const pathname = usePathname();
  const {
    sessions,
    activeSessionId,
    selectSession,
    deleteSession,
    createNewChat,
    activeAgent,
    setActiveAgent,
    sidebarCollapsed,
    setSidebarCollapsed,
    addToast
  } = useChat();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const agents = ["Hermes Core", "Developer Agent", "Research Agent", "SEO Optimizer"];

  const navLinks = [
    { label: "Console Chat", href: "/chat", icon: MessageSquare },
  ];

  return (
    <>
      <motion.div
        animate={{ width: sidebarCollapsed ? 68 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="h-screen flex flex-col border-r border-[var(--border-muted)] bg-[var(--bg-sidebar)] text-[var(--text-main)] z-30 select-none flex-shrink-0"
      >
        {/* Top App Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-muted)] min-h-[64px]">
          {!sidebarCollapsed ? (
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-sm select-none">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white font-mono text-xs shadow-md">
                L
              </div>
              <span className="bg-gradient-to-r from-[var(--text-main)] to-[var(--text-muted)] bg-clip-text text-transparent">
                Learn <span className="text-[10px] text-brand-purple font-mono font-normal">v1.1</span>
              </span>
            </Link>
          ) : (
            <Link href="/" className="mx-auto w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white font-mono text-xs shadow-md">
              L
            </Link>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-[var(--text-inactive)] hover:bg-[var(--border-muted)] hover:text-[var(--text-main)] transition-colors hidden md:block"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* Active Mascot */}
          <Mascot collapsed={sidebarCollapsed} />



          {/* New Chat & Search Actions */}
          <div className="space-y-1.5">
            {!sidebarCollapsed ? (
              <>
                <button
                  onClick={createNewChat}
                  className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-semibold shadow-lg shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
                <button
                  onClick={() => setPaletteOpen(true)}
                  className="flex items-center w-full px-3 py-2 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)]/50 text-left text-xs text-[var(--text-inactive)] hover:bg-[var(--border-muted)] transition-colors"
                >
                  <Search className="w-3.5 h-3.5 mr-2.5" />
                  Search...
                  <kbd className="ml-auto font-mono text-[9px] scale-90 border border-[var(--border-muted)] px-1 rounded bg-[var(--bg-app)]">
                    ⌘K
                  </kbd>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <button
                  onClick={createNewChat}
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPaletteOpen(true)}
                  className="w-9 h-9 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-inactive)] hover:bg-[var(--border-muted)] transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "text-[var(--text-main)] bg-[var(--border-muted)] shadow-sm font-semibold"
                      : "text-[var(--text-muted)] hover:bg-[var(--border-muted)]/50 hover:text-[var(--text-main)]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-purple" : "text-[var(--text-inactive)] group-hover:text-brand-purple"} transition-colors ${sidebarCollapsed ? "mx-auto" : "mr-3"}`} />
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </div>



          {/* Conversation History */}
          <div className="space-y-1.5 pt-2">
            {!sidebarCollapsed && (
              <div className="text-[10px] font-semibold text-[var(--text-inactive)] uppercase tracking-wider mb-2 px-1">
                Recent Chats
              </div>
            )}
            <div className="space-y-1">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? "text-[var(--text-main)] bg-[var(--border-muted)]/75 border border-[var(--border-muted)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--border-muted)]/40 hover:text-[var(--text-main)]"
                    }`}
                    onClick={() => selectSession(sess.id)}
                  >
                    {!sidebarCollapsed ? (
                      <>
                        <MessageSquare className={`w-3.5 h-3.5 mr-2.5 flex-shrink-0 ${isActive ? "text-brand-blue" : "text-[var(--text-inactive)]"}`} />
                        <span className="flex-1 truncate pr-2 font-medium">{sess.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(sess.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--text-inactive)] hover:bg-[var(--bg-app)] hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <MessageSquare className={`w-4 h-4 mx-auto ${isActive ? "text-brand-blue" : "text-[var(--text-inactive)]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>


      </motion.div>

      {/* Commands Palette trigger layer */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
