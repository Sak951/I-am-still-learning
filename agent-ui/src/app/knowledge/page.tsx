"use client";

import React, { useState } from "react";
import Sidebar from "@/components/sidebar";
import ToastContainer from "@/components/ui/toast";
import { useChat, FileItem } from "@/context/ChatContext";
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FolderPlus,
  Plus,
  Search,
  Trash2,
  Tag,
  Upload,
  Info
} from "lucide-react";

export default function KnowledgePage() {
  const { knowledgeFiles, addKnowledgeFile, removeKnowledgeFile, addToast } = useChat();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  
  // New File State
  const [newFileName, setNewFileName] = useState("");
  const [newFileTag, setNewFileTag] = useState("Docs");
  const [newFileType, setNewFileType] = useState("markdown");
  const [showAddForm, setShowAddForm] = useState(false);

  const tags = ["All", "Docs", "Finance", "Design", "Security", "API"];

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const file: FileItem = {
      id: Math.random().toString(36).substring(7),
      name: newFileName.endsWith(`.${newFileType === "markdown" ? "md" : newFileType === "csv" ? "csv" : newFileType === "pdf" ? "pdf" : "json"}`)
        ? newFileName
        : `${newFileName}.${newFileType === "markdown" ? "md" : newFileType === "csv" ? "csv" : newFileType === "pdf" ? "pdf" : "json"}`,
      size: `${Math.floor(Math.random() * 80) + 5} KB`,
      type: newFileType,
      tag: newFileTag,
      dateAdded: new Date().toISOString().split("T")[0]
    };

    addKnowledgeFile(file);
    setNewFileName("");
    setShowAddForm(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-400" />;
      case "csv":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case "image":
        return <FileImage className="w-5 h-5 text-blue-400" />;
      default:
        return <FileCode className="w-5 h-5 text-brand-purple" />;
    }
  };

  const filteredFiles = knowledgeFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === "All" || file.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex h-screen bg-[var(--bg-app)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header toolbar */}
        <header className="flex items-center justify-between border-b border-[var(--border-muted)] px-6 py-4 bg-[var(--bg-card)]/30 min-h-[64px]">
          <h1 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
            Knowledge Base Files
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-purple text-white text-xs font-semibold shadow-md shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add File
          </button>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          
          {/* File Add Dialog overlay Form if active */}
          {showAddForm && (
            <form onSubmit={handleAddFile} className="p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-card)] shadow-md space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-muted)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-brand-purple" />
                  Index new resource file
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-[var(--text-inactive)] hover:text-[var(--text-main)]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. marketing_brief"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="p-2 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Resource Type</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                    className="p-2 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] outline-none"
                  >
                    <option value="markdown">Markdown (.md)</option>
                    <option value="csv">CSV Sheet (.csv)</option>
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="json">JSON Spec (.json)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Category Tag</label>
                  <select
                    value={newFileTag}
                    onChange={(e) => setNewFileTag(e.target.value)}
                    className="p-2 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-app)] text-xs text-[var(--text-main)] outline-none"
                  >
                    {tags.filter(t => t !== "All").map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-semibold rounded-xl"
              >
                Insert document index
              </button>
            </form>
          )}

          {/* Search and Tags row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="flex items-center w-full sm:max-w-xs px-3 py-1.5 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)]/50">
              <Search className="w-3.5 h-3.5 text-[var(--text-inactive)] mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs outline-none text-[var(--text-main)] border-none placeholder-[var(--text-inactive)]"
              />
            </div>

            {/* Tags strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all border ${
                    selectedTag === tag
                      ? "bg-brand-purple/10 border-brand-purple/30 text-brand-purple shadow-sm"
                      : "border-[var(--border-muted)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--border-muted)]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Files Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFiles.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-[var(--text-inactive)] text-center">
                <Upload className="w-10 h-10 mb-2 opacity-35 animate-bounce" />
                <span className="text-xs font-semibold">No resource catalog files found</span>
                <span className="text-[10px] text-[var(--text-muted)] mt-1">Try resetting tags or index a custom document model.</span>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-card)]/75 hover:bg-[var(--bg-card)] transition-all group flex flex-col justify-between shadow-sm hover:shadow-md hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="p-2 bg-[var(--bg-app)] rounded-xl border border-[var(--border-muted)] flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <button
                      onClick={() => removeKnowledgeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-[var(--bg-app)] hover:text-rose-500 transition-all text-[var(--text-inactive)]"
                      title="Delete from knowledge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)] truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-[var(--text-inactive)] font-mono">{file.size}</span>
                      <span className="text-[9px] text-[var(--text-inactive)] font-mono">•</span>
                      <span className="text-[9px] text-[var(--text-inactive)] font-mono">{file.dateAdded}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border-muted)] mt-3.5 pt-2.5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Tag className="w-2.5 h-2.5" />
                      {file.tag}
                    </span>
                    <button
                      onClick={() => addToast("Context loaded", `Pre-prompt references attached for ${file.name}`, "success")}
                      className="text-[10px] text-brand-blue font-semibold hover:underline"
                    >
                      Use as prompt context
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Info Card */}
          <div className="p-4 rounded-2xl border border-brand-purple/15 bg-brand-purple/5 flex gap-3 text-xs text-[var(--text-muted)] leading-relaxed shadow-sm">
            <Info className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-main)] block mb-0.5">Vector database syncing</span>
              Indexed workspace resources are automatically tokenized and stored in the background memory context. When you converse, local agents recall vector matching coordinates dynamically to generate higher accuracy answers.
            </div>
          </div>

        </main>

        <ToastContainer />
      </div>
    </div>
  );
}
