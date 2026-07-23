"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import MessageItem from "./message-item";

export default function MessageList() {
  const { activeSession, isAgentRunning } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages?.length, isAgentRunning]);

  if (!activeSession || activeSession.messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" style={{ perspective: "1000px" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {activeSession.messages.map((message) => (
          <div key={message.id} className="group">
            <MessageItem message={message} />
          </div>
        ))}

        {/* Live typing skeleton for streaming transitions */}
        {isAgentRunning &&
          activeSession.messages[activeSession.messages.length - 1]?.role !== "assistant" && (
            <div className="flex w-full gap-4 items-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple/50 to-brand-blue/50 flex items-center justify-center text-white flex-shrink-0">
                <div className="w-4 h-4 rounded bg-white/20 animate-spin" />
              </div>
              <div className="flex flex-col max-w-[85%] items-start">
                <span className="text-[10px] text-[var(--text-inactive)] mb-1 font-medium">
                  Hermes Agent is preparing analysis...
                </span>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none border border-[var(--border-muted)] bg-[var(--bg-card)]/50 text-xs">
                  <div className="typing-dots flex items-center gap-1 py-1">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
