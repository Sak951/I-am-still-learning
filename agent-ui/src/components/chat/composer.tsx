"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Mic,
  Send,
  Globe,
  BrainCircuit,
  SlidersHorizontal,
  Bot,
  Terminal,
  FileSpreadsheet,
  FileImage,
  FileCode,
  FileText
} from "lucide-react";
import { useChat, FileItem } from "@/context/ChatContext";

export default function Composer() {
  const {
    sendMessage,
    selectedModel,
    setSelectedModel,
    temperature,
    setTemperature,
    deepThink,
    setDeepThink,
    webSearch,
    setWebSearch,
    uploadedFiles,
    addUploadedFile,
    knowledgeFiles,
    isAgentRunning,
    addToast
  } = useChat();

  const [input, setInput] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    // Mentions detection
    const lastWord = val.split(/\s/).pop() || "";
    if (lastWord.startsWith("@")) {
      setShowMentions(true);
      setShowSlash(false);
    } else if (lastWord.startsWith("/")) {
      setShowSlash(true);
      setShowMentions(false);
    } else {
      setShowMentions(false);
      setShowSlash(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    sendMessage(input, uploadedFiles);
    setInput("");
    setShowMentions(false);
    setShowSlash(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectMentionFile = (fileName: string) => {
    const words = input.split(/\s/);
    words.pop(); // remove the partial '@' word
    setInput(words.join(" ") + (words.length > 0 ? " " : "") + `@${fileName} `);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const selectSlashCommand = (cmd: string) => {
    const words = input.split(/\s/);
    words.pop(); // remove the partial '/' word
    setInput(words.join(" ") + (words.length > 0 ? " " : "") + `${cmd} `);
    setShowSlash(false);
    textareaRef.current?.focus();
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newFile: FileItem = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type.includes("pdf") ? "pdf" : file.type.includes("image") ? "image" : "code",
      dateAdded: new Date().toISOString().split("T")[0]
    };
    addUploadedFile(newFile);
  };

  const slashCommands = [
    { cmd: "/explain", desc: "Explain the selected code context", icon: BrainCircuit },
    { cmd: "/debug", desc: "Scan workspace execution logs for errors", icon: Terminal },
    { cmd: "/chart", desc: "Create a visual flowchart from database", icon: FileSpreadsheet }
  ];

  const getFileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-3.5 h-3.5 text-rose-400" />;
    if (type === "image") return <FileImage className="w-3.5 h-3.5 text-blue-400" />;
    return <FileCode className="w-3.5 h-3.5 text-purple-400" />;
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pb-6">
      
      {/* Mentions Dropdown Overlay */}
      {showMentions && (
        <div className="absolute bottom-full left-4 right-4 z-20 mb-2 p-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-xl glass-panel text-xs max-h-[160px] overflow-y-auto">
          <div className="px-2 py-1 text-[10px] text-[var(--text-inactive)] uppercase tracking-wider font-semibold">
            Attach Workspace File Context
          </div>
          {knowledgeFiles.map(f => (
            <button
              key={f.id}
              onClick={() => selectMentionFile(f.name)}
              className="flex items-center w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] text-[var(--text-muted)] hover:bg-[var(--border-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              {getFileIcon(f.type)}
              <span className="ml-2 font-medium truncate">{f.name}</span>
              <span className="ml-auto text-[9px] text-[var(--text-inactive)]">{f.size}</span>
            </button>
          ))}
        </div>
      )}

      {/* Slash Commands Dropdown Overlay */}
      {showSlash && (
        <div className="absolute bottom-full left-4 right-4 z-20 mb-2 p-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-xl glass-panel text-xs">
          <div className="px-2 py-1 text-[10px] text-[var(--text-inactive)] uppercase tracking-wider font-semibold">
            Agent Slash Workflows
          </div>
          {slashCommands.map(sc => {
            const CmdIcon = sc.icon;
            return (
              <button
                key={sc.cmd}
                onClick={() => selectSlashCommand(sc.cmd)}
                className="flex items-center w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] text-[var(--text-muted)] hover:bg-[var(--border-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                <CmdIcon className="w-3.5 h-3.5 mr-2 text-brand-purple" />
                <span className="font-semibold text-brand-purple mr-2">{sc.cmd}</span>
                <span className="text-[var(--text-inactive)] truncate">{sc.desc}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl border border-[var(--border-muted)] glass-composer shadow-lg transition-all focus-within:border-[var(--border-active)]">
        
        {/* File attachment preview row */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border-b border-[var(--border-muted)] bg-[var(--bg-app)]/30 rounded-t-2xl">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-card)] text-[10px] font-medium"
              >
                {getFileIcon(file.type)}
                <span className="truncate max-w-[120px]">{file.name}</span>
                <span className="text-[9px] text-[var(--text-inactive)]">({file.size})</span>
              </div>
            ))}
          </div>
        )}

        {/* Input Text Area */}
        <div className="flex items-start p-3 min-h-[52px]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, mention files with @ or slash commands /..."
            disabled={isAgentRunning}
            className="flex-1 w-full bg-transparent border-none outline-none resize-none text-xs text-[var(--text-main)] placeholder-[var(--text-inactive)] py-1.5 px-1 min-h-[24px]"
          />
        </div>

        {/* Bottom Toolbelt Control Row */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border-muted)] bg-[var(--bg-app)]/20 rounded-b-2xl">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Attachment input hidden */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <button
              onClick={triggerFileUpload}
              className="p-1.5 rounded-lg hover:bg-[var(--border-muted)] text-[var(--text-inactive)] hover:text-[var(--text-main)] transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Models selection toggle wrapper */}
            <div className="relative">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-card)] hover:bg-[var(--border-muted)] text-[10px] font-semibold transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <Bot className="w-3 h-3 text-brand-purple" />
                <span>{selectedModel}</span>
              </button>

              {showConfig && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowConfig(false)} />
                  <div className="absolute bottom-full left-0 z-20 mb-1.5 p-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-xl glass-panel text-xs w-[240px]">
                    <div className="px-2 py-1 text-[10px] text-[var(--text-inactive)] font-semibold uppercase tracking-wider">
                      Model Hyperparameters
                    </div>
                    <div className="px-1 mt-1 space-y-1">
                      {["i-still-learning"].map(m => (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedModel(m);
                            setShowConfig(false);
                            addToast("Model Selected", `Core engine: ${m}`, "default");
                          }}
                          className={`flex items-center w-full px-2 py-1.5 rounded-lg text-left text-xs font-semibold hover:bg-[var(--border-muted)] transition-colors ${selectedModel === m ? "bg-[var(--border-muted)] text-brand-purple" : "text-[var(--text-muted)]"}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    {/* Temperature bar */}
                    <div className="p-2 border-t border-[var(--border-muted)] mt-2">
                      <div className="flex justify-between text-[10px] text-[var(--text-inactive)] mb-1 font-medium">
                        <span>Temperature</span>
                        <span>{temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[var(--border-muted)] rounded-lg appearance-none cursor-pointer accent-brand-purple"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Deep Think toggle indicator */}
            <button
              onClick={() => {
                setDeepThink(!deepThink);
                addToast("Thought Mode Switch", `Deep Think execution is now ${!deepThink ? "ON" : "OFF"}.`, "default");
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-[10px] font-semibold ${
                deepThink
                  ? "bg-brand-purple/10 border-brand-purple/30 text-brand-purple shadow-sm shadow-brand-purple/5"
                  : "border-[var(--border-muted)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--border-muted)]"
              }`}
            >
              <BrainCircuit className="w-3 h-3" />
              <span>Deep Think</span>
            </button>

            {/* Web Search toggle indicator */}
            <button
              onClick={() => {
                setWebSearch(!webSearch);
                addToast("Crawler Mode Switch", `Web Search querying is now ${!webSearch ? "ON" : "OFF"}.`, "default");
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-[10px] font-semibold ${
                webSearch
                  ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue shadow-sm shadow-brand-blue/5"
                  : "border-[var(--border-muted)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--border-muted)]"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Web Search</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Voice mode trigger */}
            <button
              onClick={() => addToast("Voice Mode", "Voice capturing mode initialized (Simulation).", "default")}
              className="p-1.5 rounded-lg hover:bg-[var(--border-muted)] text-[var(--text-inactive)] hover:text-brand-emerald transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Send submit button */}
            <button
              onClick={handleSend}
              disabled={isAgentRunning || (!input.trim() && uploadedFiles.length === 0)}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                input.trim() || uploadedFiles.length > 0
                  ? "bg-brand-purple text-white hover:scale-105 shadow-md shadow-brand-purple/15 active:scale-95"
                  : "bg-[var(--border-muted)] text-[var(--text-inactive)] cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
