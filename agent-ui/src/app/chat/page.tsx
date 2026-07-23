"use client";

import React from "react";
import Sidebar from "@/components/sidebar";
import Welcome from "@/components/chat/welcome";
import MessageList from "@/components/chat/message-list";
import Composer from "@/components/chat/composer";

import ToastContainer from "@/components/ui/toast";
import ThreeCanvas from "@/components/three-canvas";
import { useChat } from "@/context/ChatContext";
import { Menu, Sparkles, Activity } from "lucide-react";

export default function ChatPage() {
  const {
    activeSession,
    setSidebarCollapsed,
    sidebarCollapsed,
    setRightPanelOpen,
    rightPanelOpen
  } = useChat();

  const hasMessages = activeSession && activeSession.messages.length > 0;

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-app)] overflow-hidden font-sans grid-mesh transition-colors duration-300">
      
      {/* Persisted left sidebar */}
      <Sidebar />

      {/* Main chat workspace area */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        {/* Volumetric WebGL 3D Background Neural Core */}
        <ThreeCanvas />
        
        {/* Header Toolbar */}
        <header className="flex items-center justify-between border-b border-[var(--border-muted)] px-4 py-3 bg-[var(--bg-card)]/10 backdrop-blur-md min-h-[64px] z-10">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded hover:bg-[var(--border-muted)] text-[var(--text-inactive)] md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-[200px]">
                {activeSession?.title || "Agent Sandbox"}
              </span>
              <Sparkles className="w-3 h-3 text-brand-purple animate-pulse" />
            </div>
          </div>



        </header>

        {/* Scrollable conversation pane */}
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0 z-10">
          {hasMessages ? <MessageList /> : <Welcome />}
        </div>

        {/* Floating Composer widget */}
        <div className="z-10 w-full">
          <Composer />
        </div>

        {/* Global Floating Toasts */}
        <ToastContainer />

      </div>



    </div>
  );
}
