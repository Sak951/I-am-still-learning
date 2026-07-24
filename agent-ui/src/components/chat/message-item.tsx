"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Check,
  Edit2,
  RotateCcw,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Download,
  Bot,
  User,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  FileText,
  Video,
  Network
} from "lucide-react";
import { Message, useChat } from "@/context/ChatContext";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { regenerateMessage, addToast } = useChat();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(30);

  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    addToast("Copied to clipboard", "Message text copied successfully.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    addToast("Share Link Generated", "Workspace reference link copied to clipboard.", "success");
  };

  const handleExport = () => {
    const blob = new Blob([message.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-response-${message.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Markdown Exported", "Message downloaded as MD file.", "success");
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    addToast(isPlaying ? "Audio Paused" : "Audio Playing", "Simulating playback draft.", "default");
  };

  // Custom Mermaid SVG Graph Renderer
  const renderMermaidAuthFlow = () => {
    return (
      <div className="my-4 p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-app)]/55 shadow-inner">
        <div className="flex items-center gap-2 mb-3">
          <Network className="w-4 h-4 text-brand-purple" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--text-inactive)]">
            Auth Token Exchange Flowchart
          </span>
        </div>
        
        {/* Responsive Flowchart SVG */}
        <div className="w-full overflow-x-auto flex justify-center py-2">
          <svg width="480" height="200" viewBox="0 0 480 200" className="max-w-full">
            {/* Arrows */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-inactive)" opacity="0.6" />
              </marker>
            </defs>
            
            {/* Node 1: Client App */}
            <rect x="10" y="70" width="90" height="40" rx="8" fill="var(--bg-card)" stroke="var(--border-muted)" strokeWidth="1" />
            <text x="55" y="94" textAnchor="middle" fill="var(--text-main)" fontSize="10" fontWeight="bold">Client App</text>
            
            {/* Arrow Client -> Auth */}
            <path d="M 100 90 L 140 90" fill="none" stroke="var(--text-inactive)" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="3 3" />
            <text x="120" y="82" textAnchor="middle" fill="var(--text-inactive)" fontSize="7">1. POST Credentials</text>
            
            {/* Node 2: Auth Server */}
            <rect x="150" y="70" width="100" height="40" rx="8" fill="#7C3AED" stroke="#7C3AED" strokeWidth="1" />
            <text x="200" y="94" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Auth Server</text>
            
            {/* Arrow Auth -> Decision */}
            <path d="M 250 90 L 290 90" fill="none" stroke="var(--text-inactive)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="270" y="82" textAnchor="middle" fill="var(--text-inactive)" fontSize="7">2. Validate & Sign</text>
            
            {/* Node 3: Verification */}
            <polygon points="340,55 385,90 340,125 295,90" fill="var(--bg-card)" stroke="var(--border-muted)" strokeWidth="1" />
            <text x="340" y="93" textAnchor="middle" fill="var(--text-main)" fontSize="9">Valid token?</text>
            
            {/* Arrow Yes -> Return */}
            <path d="M 385 90 L 415 90" fill="none" stroke="var(--text-inactive)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="400" y="82" textAnchor="middle" fill="var(--text-inactive)" fontSize="7">Yes</text>
            
            {/* Node 4: Return */}
            <rect x="420" y="70" width="50" height="40" rx="8" fill="#10B981" stroke="#10B981" strokeWidth="1" />
            <text x="445" y="94" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Tokens</text>
            
            {/* Arrow No -> Error */}
            <path d="M 340 125 L 340 160" fill="none" stroke="var(--text-inactive)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="352" y="145" textAnchor="start" fill="var(--text-inactive)" fontSize="7">No: 401 Error</text>
            <rect x="295" y="160" width="90" height="30" rx="6" fill="var(--bg-card)" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" />
            <text x="340" y="178" textAnchor="middle" fill="rgba(239, 68, 68, 0.9)" fontSize="9" fontWeight="medium">Unauthorized</text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
      className={`flex w-full gap-4 ${isUser ? "justify-end" : "justify-start"}`}
      style={{ transformOrigin: isUser ? "bottom right" : "bottom left" }}
    >
      
      {/* Bot Icon Indicator */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white flex-shrink-0 shadow-md">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Main Body Bubble */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        
        {/* User / Agent Header tag */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">
            {isUser ? "You" : message.modelUsed || "I-am-still-learning"}
          </span>
          <span className="text-[9px] text-[var(--text-inactive)]">{message.timestamp}</span>
          {!isUser && message.thinkingTime && (
            <span className="text-[9px] text-brand-purple font-medium bg-brand-purple/10 px-1.5 py-0.5 rounded-md">
              thought for {message.thinkingTime}
            </span>
          )}
        </div>

        {/* Message Content Area */}
        <div
          className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm transition-colors ${
            isUser
              ? "bg-brand-purple text-white rounded-tr-none font-medium"
              : "bg-[var(--bg-card)] text-[var(--text-main)] rounded-tl-none border border-[var(--border-muted)]"
          }`}
        >
          {/* Render standard markdown content */}
          <div className={`markdown-body ${isUser ? "text-white" : ""}`}>
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <div className="my-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-app)]/85 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-card)] border-b border-[var(--border-muted)] text-[10px] text-[var(--text-inactive)]">
                        <span>{match[1].toUpperCase()}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(children));
                            addToast("Code Copied", "Syntax block saved to clipboard.", "success");
                          }}
                          className="flex items-center gap-1 hover:text-[var(--text-main)] transition-colors font-medium"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="p-3.5 overflow-x-auto text-[11px] font-mono text-[var(--text-main)] leading-relaxed">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="code-highlight font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-3 rounded-xl border border-[var(--border-muted)]">
                      <table className="min-w-full divide-y divide-[var(--border-muted)] text-[11px]">
                        {children}
                      </table>
                    </div>
                  );
                },
                thead({ children }) {
                  return <thead className="bg-[var(--bg-app)]/60 text-left font-semibold">{children}</thead>;
                },
                tbody({ children }) {
                  return <tbody className="divide-y divide-[var(--border-muted)] bg-transparent">{children}</tbody>;
                },
                th({ children }) {
                  return <th className="px-3 py-2 text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-3 py-2 text-[var(--text-main)] font-medium whitespace-nowrap">{children}</td>;
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Custom SVG flowcharts injection if prompt triggers it */}
          {!isUser && message.hasMermaid && renderMermaidAuthFlow()}

          {/* Custom Media Attachment Previews */}
          {!isUser && message.files && message.files.map((file, fIdx) => {
            if (file.type === "pdf") {
              return (
                <div key={fIdx} className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-app)]/50">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-[var(--text-main)] truncate">{file.name}</div>
                    <div className="text-[10px] text-[var(--text-inactive)]">PDF Document • 2.3 MB</div>
                  </div>
                  <button
                    onClick={() => addToast("Downloading File", `Fetching ${file.name} context.`, "success")}
                    className="p-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-card)] text-[var(--text-inactive)] hover:text-[var(--text-main)] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }
            if (file.type === "audio") {
              return (
                <div key={fIdx} className="mt-3 p-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-app)]/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                    >
                      {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-[var(--text-main)] truncate">{file.name}</div>
                      {/* Scrub bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-[var(--border-muted)] rounded-full overflow-hidden">
                          <div className="h-full bg-brand-purple rounded-full" style={{ width: `${audioProgress}%` }} />
                        </div>
                        <span className="text-[9px] text-[var(--text-inactive)] font-mono">0:42 / 2:15</span>
                      </div>
                    </div>
                    <Volume2 className="w-3.5 h-3.5 text-[var(--text-inactive)]" />
                  </div>
                </div>
              );
            }
            if (file.type === "video") {
              return (
                <div key={fIdx} className="mt-3 rounded-xl border border-[var(--border-muted)] bg-black overflow-hidden relative group aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-95 group-hover:scale-100 transition-all cursor-pointer">
                      <Video className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between text-[10px] text-white/80 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <span>{file.name}</span>
                    <span>10s Loop</span>
                  </div>
                  {/* Visual Video loop mockup */}
                  <div className="w-full h-full bg-gradient-to-tr from-brand-purple/20 via-zinc-900 to-brand-blue/20 flex items-center justify-center text-[var(--text-inactive)]">
                    [Premium workspace_demo_loop.mp4 playing]
                  </div>
                </div>
              );
            }
            return null;
          })}

          {/* Citations display */}
          {!isUser && message.citations && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-[var(--border-muted)] w-full">
              <span className="text-[9px] text-[var(--text-inactive)] font-semibold uppercase tracking-wider mr-1">
                Context Sources:
              </span>
              {message.citations.map((cite, cIdx) => (
                <a
                  key={cIdx}
                  href={cite.url}
                  onClick={(e) => {
                    e.preventDefault();
                    addToast("Source Document", `Referenced from database: ${cite.label}`, "default");
                  }}
                  className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded bg-[var(--border-muted)] border border-[var(--border-muted)] text-[var(--text-muted)] hover:text-brand-purple hover:border-brand-purple/20 transition-all"
                >
                  <span>{cite.label}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          )}

        </div>

        {/* Action Button Strip */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity ml-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-[var(--text-inactive)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-all"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => regenerateMessage(message.id)}
              className="p-1.5 rounded-lg text-[var(--text-inactive)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-all"
              title="Retry / Regenerate"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-[var(--text-inactive)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-all"
              title="Share response"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExport}
              className="p-1.5 rounded-lg text-[var(--text-inactive)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-all"
              title="Export Markdown"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-[var(--border-muted)] mx-1" />
            
            {/* Like/Dislike trigger keys */}
            <button
              onClick={() => {
                setLiked(true);
                addToast("Thank you!", "Feedback saved. Agent learning weights updated.", "success");
              }}
              className={`p-1.5 rounded-lg transition-all ${liked === true ? "text-emerald-500 bg-emerald-500/10" : "text-[var(--text-inactive)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]"}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setLiked(false);
                addToast("Feedback Recorded", "Feedback logged to improve generations.", "warning");
              }}
              className={`p-1.5 rounded-lg transition-all ${liked === false ? "text-rose-500 bg-rose-500/10" : "text-[var(--text-inactive)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]"}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* User Icon Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-[var(--border-muted)] border border-[var(--border-muted)] flex items-center justify-center text-[var(--text-main)] flex-shrink-0 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}

    </motion.div>
  );
}
