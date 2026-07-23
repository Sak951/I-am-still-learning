"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { animate, stagger } from "animejs";
import { useSprings, animated } from "react-spring";
import Mascot from "./mascot";
import { Sparkles, Terminal, FileCode, Search, HelpCircle, ArrowUpRight } from "lucide-react";
import { useChat } from "@/context/ChatContext";

export default function Welcome() {
  const { sendMessage, activeAgent } = useChat();

  const suggestions = [
    {
      title: "Generate system diagram",
      subtitle: "Render authToken handshake flow",
      prompt: "Create a mermaid diagram mapping out security auth handshake token exchange.",
      icon: FileCode,
      color: "text-purple-400 border-purple-500/10 hover:border-purple-500/30"
    },
    {
      title: "Analyze database costs",
      subtitle: "Render SaaS performance logs",
      prompt: "Show a cost and metrics comparison table for standard agent models.",
      icon: Search,
      color: "text-blue-400 border-blue-500/10 hover:border-blue-500/30"
    },
    {
      title: "Write an async worker",
      subtitle: "High-throughput loop in python",
      prompt: "Write a high-performance Python server class running an async worker queue.",
      icon: Terminal,
      color: "text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30"
    },
    {
      title: "Inspect security documents",
      subtitle: "PDF checklist summaries",
      prompt: "Inspect the audit report and show pdf summaries from security_audit_v2.pdf.",
      icon: HelpCircle,
      color: "text-amber-400 border-amber-500/10 hover:border-amber-500/30"
    }
  ];

  // react-spring stagger springs for suggestion buttons
  const springs = useSprings(
    suggestions.length,
    suggestions.map((_, idx) => ({
      from: { opacity: 0, transform: "scale(0.9) translateY(20px)" },
      to: { opacity: 1, transform: "scale(1) translateY(0px)" },
      config: { tension: 280, friction: 18 },
      delay: 350 + idx * 80
    }))
  );

  useEffect(() => {
    // anime.js stagger animation for title characters
    animate(".welcome-letter", {
      opacity: [0, 1],
      scale: [0.8, 1],
      translateY: [15, 0],
      delay: stagger(20, { start: 100 }),
      duration: 600,
      ease: "outBack"
    });
  }, [activeAgent]);

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-12 flex-1 w-full text-center">
      {/* Title block */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 -m-4 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 blur-xl rounded-full opacity-60 animate-pulse-slow" />
        <Mascot />
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)] sm:text-4xl bg-gradient-to-r from-[var(--text-main)] via-[var(--text-main)] to-[var(--text-muted)] bg-clip-text text-transparent">
          {`Construct with ${activeAgent}`.split("").map((char, index) => (
            <span key={index} className="inline-block welcome-letter opacity-0">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">
          Sandbox environment connected. Mention <kbd className="font-mono text-[9px] border border-[var(--border-muted)] px-1 py-0.5 rounded bg-[var(--bg-card)]">@files</kbd> or trigger <kbd className="font-mono text-[9px] border border-[var(--border-muted)] px-1 py-0.5 rounded bg-[var(--bg-card)]">/</kbd> slash commands.
        </p>
      </div>

      {/* Grid items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4" style={{ perspective: "1000px" }}>
        {springs.map((springStyle, idx) => {
          const s = suggestions[idx];
          const Icon = s.icon;
          return (
            <animated.div key={idx} style={springStyle} className="w-full">
              <motion.button
                onClick={() => sendMessage(s.prompt)}
                whileHover={{ rotateX: 6, rotateY: -6, translateZ: 12, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={`group flex items-start p-3.5 rounded-2xl border text-left bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/90 transition-all duration-300 shadow-sm hover:shadow-md w-full h-full ${s.color}`}
              >
                <div className="p-2 rounded-xl bg-[var(--border-muted)]/50 mr-3 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-xs font-semibold text-[var(--text-main)] group-hover:text-brand-purple transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-normal truncate">
                    {s.subtitle}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-inactive)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 align-self-start mt-0.5" />
              </motion.button>
            </animated.div>
          );
        })}
      </div>
    </div>
  );
}

