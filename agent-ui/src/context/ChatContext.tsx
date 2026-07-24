"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  content?: string;
  tag?: string;
  dateAdded: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "api" | "tool";
  message: string;
  detail?: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  status: "idle" | "running" | "completed" | "failed";
  duration?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinkingTime?: string;
  tokensUsed?: number;
  cost?: number;
  citations?: Array<{ label: string; url: string }>;
  files?: Array<{ name: string; type: string; url: string }>;
  hasMermaid?: boolean;
  hasTable?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  agentType: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: "default" | "success" | "warning" | "error";
}

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string;
  activeSession: ChatSession | undefined;
  activeAgent: string;
  setActiveAgent: (agent: string) => void;
  activeWorkspace: string;
  setActiveWorkspace: (workspace: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  deepThink: boolean;
  setDeepThink: (val: boolean) => void;
  webSearch: boolean;
  setWebSearch: (val: boolean) => void;
  voiceMode: boolean;
  setVoiceMode: (val: boolean) => void;
  
  // Right panel execution states
  isAgentRunning: boolean;
  timelineSteps: TimelineStep[];
  executionLogs: LogEntry[];
  tokenCostAccumulated: { tokens: number; cost: number };
  
  // File Explorer & Uploads
  uploadedFiles: FileItem[];
  knowledgeFiles: FileItem[];
  addUploadedFile: (file: FileItem) => void;
  addKnowledgeFile: (file: FileItem) => void;
  removeKnowledgeFile: (id: string) => void;
  
  // Action Handlers
  sendMessage: (content: string, attachments?: FileItem[]) => void;
  createNewChat: () => void;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearSessionHistory: () => void;
  regenerateMessage: (messageId: string) => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (title: string, description: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: string) => void;
  
  // Panels toggling
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (val: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialKnowledge: FileItem[] = [
  { id: "k1", name: "agent_training_docs.md", size: "12 KB", type: "markdown", tag: "Docs", dateAdded: "2026-07-02" },
  { id: "k2", name: "q3_financial_projection.csv", size: "410 KB", type: "csv", tag: "Finance", dateAdded: "2026-07-05" },
  { id: "k3", name: "architecture_diagram.png", size: "1.4 MB", type: "image", tag: "Design", dateAdded: "2026-07-08" },
  { id: "k4", name: "security_audit_v2.pdf", size: "2.3 MB", type: "pdf", tag: "Security", dateAdded: "2026-07-10" },
  { id: "k5", name: "api_spec_v3.json", size: "84 KB", type: "json", tag: "API", dateAdded: "2026-07-12" },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [activeAgent, setActiveAgent] = useState<string>("Hermes Core");
  const [activeWorkspace, setActiveWorkspace] = useState<string>("Personal Sandbox");
  const [selectedModel, setSelectedModel] = useState<string>("i-still-learning");
  const [temperature, setTemperature] = useState<number>(0.4);
  const [deepThink, setDeepThink] = useState<boolean>(true);
  const [webSearch, setWebSearch] = useState<boolean>(false);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  
  // Collapsible panels
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);
  
  // Execution details
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [tokenCostAccumulated, setTokenCostAccumulated] = useState({ tokens: 142050, cost: 0.89 });

  // Files
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [knowledgeFiles, setKnowledgeFiles] = useState<FileItem[]>(initialKnowledge);
  
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add initial chat if none exists
  useEffect(() => {
    const defaultSession: ChatSession = {
      id: "s1",
      title: "Welcome to Learn OS",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentType: "Hermes Core",
      messages: [
        {
          id: "m1",
          role: "assistant",
          content: "Hello! I am **I-am-still-learning** agent. I've initialized a secure workspace context. How can I help you construct or optimize today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: "i-am-still-learning",
          tokensUsed: 42,
          cost: 0.00021,
        }
      ]
    };
    setSessions([defaultSession]);
    setActiveSessionId("s1");
  }, []);

  const addToast = (title: string, description: string, type: ToastMessage["type"] = "default") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => dismissToast(id), 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addUploadedFile = (file: FileItem) => {
    setUploadedFiles((prev) => [...prev, file]);
    addToast("File Attached", `${file.name} ready for conversation query.`, "success");
  };

  const addKnowledgeFile = (file: FileItem) => {
    setKnowledgeFiles((prev) => [file, ...prev]);
    addToast("Saved to Knowledge Base", `${file.name} is stored in collections.`, "success");
  };

  const removeKnowledgeFile = (id: string) => {
    setKnowledgeFiles((prev) => prev.filter((f) => f.id !== id));
    addToast("File Removed", "Deleted from workspace index.", "warning");
  };

  const createNewChat = () => {
    const id = Math.random().toString(36).substring(7);
    const newSession: ChatSession = {
      id,
      title: `New Session #${sessions.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentType: activeAgent,
      messages: []
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    setUploadedFiles([]);
    setIsAgentRunning(false);
    setTimelineSteps([]);
    setExecutionLogs([]);
    addToast("New Chat Created", "Composer cleared and initialized.", "default");
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    const sess = sessions.find((s) => s.id === id);
    if (sess && sess.messages.length > 0) {
      // populate agent logs / history if simulation exists
      setUploadedFiles([]);
    }
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id && filtered.length > 0) {
      setActiveSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      createNewChat();
    }
    addToast("Chat Deleted", "Conversation history updated.", "warning");
  };

  const clearSessionHistory = () => {
    setSessions([]);
    createNewChat();
  };

  // Simulated agent responses dictionary
  const getSimulatedResponse = (input: string): {
    content: string;
    hasMermaid: boolean;
    hasTable: boolean;
    files?: Array<{ name: string; type: string; url: string }>;
    citations?: Array<{ label: string; url: string }>;
  } => {
    const text = input.toLowerCase();

    // Greeting override
    if (text === "hi" || text === "hello" || text === "hey" || text.startsWith("hello") || text.startsWith("hi ")) {
      return {
        content: `Hello! I am your custom agent model, **I-am-still-learning**. I've successfully initialized our secure workspace sandbox. 

What task or script should we construct today? (You can ask me to write **code**, render a **mermaid diagram**, or show a comparison **table** to see my rich UI components in action!)`,
        hasMermaid: false,
        hasTable: false
      };
    }

    // Photosynthesis override
    if (text.includes("photosynthesis")) {
      return {
        content: `**Photosynthesis** is the biological process by which green plants, algae, and some bacteria convert light energy into chemical energy, synthesizing glucose from carbon dioxide and water.

### 🧪 The General Formula:
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{light} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

### 🔑 Key Phases of Photosynthesis:
1. **Light-Dependent Reactions**:
   - Occur in the **thylakoid membranes** of chloroplasts.
   - Chlorophyll absorbs solar photons, splitting water molecules ($2\\text{H}_2\\text{O} \\to 4\\text{H}^+ + \\text{O}_2$) and generating energy carriers (**ATP** and **NADPH**).
2. **Light-Independent Reactions (Calvin Cycle)**:
   - Occur in the **stroma** of chloroplasts.
   - Utilizes ATP and NADPH to convert carbon dioxide ($CO_2$) into organic glucose molecules ($C_6H_{12}O_6$).

Would you like me to render a **mermaid flowchart** diagram mapping out the Calvin cycle pathway?`,
        hasMermaid: false,
        hasTable: false
      };
    }

    if (text.includes("mermaid") || text.includes("diagram") || text.includes("flowchart")) {
      return {
        content: `I've created a mermaid flowchart mapping out the client-server auth handshake token exchange pattern.

\`\`\`mermaid
graph TD
    A[Client App] -->|1. Credentials POST| B[Auth Server]
    B -->|2. Validate & Sign| C{Token Valid?}
    C -->|Yes: Generate Access & Refresh| D[Return Tokens]
    C -->|No: Error 401| E[Unauthorized Code]
    A -->|3. Bearer Token Request| F[API Gateway]
    F -->|4. Inspect Signature| G[Resource Server]
    G -->|5. Deliver JSON Content| A
    style B fill:#7C3AED,stroke:#3b82f6,stroke-width:2px,color:#fff
    style D fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
\`\`\`

You can copy this layout directly or export it as an SVG.`,
        hasMermaid: true,
        hasTable: false
      };
    }

    if (text.includes("table") || text.includes("cost") || text.includes("pricing")) {
      return {
        content: `Here is the SaaS comparison matrix representing our performance logs and monthly run-rate metrics:

| Model Indicator | Avg Response (ms) | Tokens / Request | Precision Score | Cost / 1M Input |
| :--- | :---: | :---: | :---: | :---: |
| **I-am-still-learning** | 560ms | 3,100 | 95.8% | $0.25 |
| **Hermes Core** | 840ms | 4,200 | 98.4% | $2.50 |
| **GPT-4o Mini** | 420ms | 1,800 | 92.1% | $0.15 |
| **Claude Sonnet** | 1,220ms | 5,500 | 99.1% | $3.00 |
| **DeepSeek R1** | 2,840ms | 12,000 | 97.9% | $0.55 |

The table utilizes standard markdown formatting and will adjust layout sizes based on mobile viewport scaling.`,
        hasMermaid: false,
        hasTable: true
      };
    }

    if (text.includes("code") || text.includes("script") || text.includes("python")) {
      return {
        content: `Here is a custom Python server script implementing a high-throughput async event loop worker. It supports secure SSL endpoints and standard JWT verification.

\`\`\`python
import asyncio
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent-worker")

class AsyncWorker:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.active_jobs: Dict[str, Any] = {}

    async def start(self) -> None:
        logger.info(f"Booting queue socket on {self.host}:{self.port}")
        await asyncio.sleep(0.5) # Simulate IO spinup
        
    async def process_task(self, task_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Processing event task {task_id} concurrently...")
        await asyncio.sleep(2.0)
        return {"status": "success", "task_id": task_id, "data": payload}

# Example instantiation
async def main():
    worker = AsyncWorker("127.0.0.1", 8080)
    await worker.start()
    res = await worker.process_task("job-x101", {"action": "minify", "quality": "premium"})
    print("Worker task completed successfully: ", res)

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

Feel free to paste this into your local workspace.`,
        hasMermaid: false,
        hasTable: false
      };
    }

    if (text.includes("pdf") || text.includes("file") || text.includes("report")) {
      return {
        content: `I've analyzed the financial files stored in your workspace. Below is an overview of the audit summary.

**File reference**: [security_audit_v2.pdf](file:///c:/Personal/ToyLLM/agent-ui/public/mock-docs/security_audit.pdf)
- High vulnerabilities resolved: 12/12
- Medium vulnerabilities pending: 3
- Recommended patches: Implement strict CSP header rules and lock down Redis DB access.

I have rendered a document details preview component. You can download or print the full report by hovering on the action icons.`,
        hasMermaid: false,
        hasTable: false,
        files: [{ name: "security_audit_v2.pdf", type: "pdf", url: "#" }]
      };
    }

    if (text.includes("media") || text.includes("video") || text.includes("audio") || text.includes("player")) {
      return {
        content: `I've compiled the demo resources you requested:

Here is the audio playback draft of our custom podcast intro voiceover:
- **Source**: [podcast_intro_draft.mp3](file:///c:/Personal/ToyLLM/agent-ui/public/audio/intro.mp3)

Additionally, here is a premium interface concept loop recording:
- **Source**: [workspace_demo_loop.mp4](file:///c:/Personal/ToyLLM/agent-ui/public/video/demo.mp4)

Both are fully responsive and feature standard control elements.`,
        hasMermaid: false,
        hasTable: false,
        files: [
          { name: "podcast_intro_draft.mp3", type: "audio", url: "#" },
          { name: "workspace_demo_loop.mp4", type: "video", url: "#" }
        ]
      };
    }

    // Default reply
    return {
      content: `I've received your query regarding **"${input}"** running on **${selectedModel}** at temperature **${temperature}**. 

Because this is a high-fidelity workspace simulator:
1. **Specialized Views**: To trigger custom media formats, try asking for a **"mermaid diagram"**, a **"matrix table"**, or a **"python script"**.
2. **Context Matching**: Active workspace sandbox is aligned, and file metadata tracking is healthy.

What should we construct or index next?`,
      hasMermaid: false,
      hasTable: false
    };
  };

  const sendMessage = (content: string, attachments: FileItem[] = []) => {
    if (!content.trim() && attachments.length === 0) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: attachments.map(f => ({ name: f.name, type: f.type, url: "#" }))
    };

    // Update session with user message
    let currentSession = sessions.find((s) => s.id === activeSessionId);
    if (!currentSession) return;

    const updatedMessages = [...currentSession.messages, userMsg];
    
    // Auto-update title if it's the first real message
    const titleText = currentSession.title.startsWith("New Session") && content
      ? (content.slice(0, 30) + (content.length > 30 ? "..." : ""))
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: titleText, messages: updatedMessages }
          : s
      )
    );

    // Clear uploads
    setUploadedFiles([]);

    // Trigger Agent execution simulation
    setIsAgentRunning(true);
    
    const steps: TimelineStep[] = [
      { id: "t1", label: "Thinking & Token Assembly", status: "running" },
      { id: "t2", label: "Planning Task Strategy", status: "idle" },
      { id: "t3", label: "Searching Knowledge Base", status: "idle" },
      { id: "t4", label: "Reading Files & Context", status: "idle" },
      { id: "t5", label: "Calling Sandbox Tools", status: "idle" },
      { id: "t6", label: "Executing Terminal Tasks", status: "idle" },
      { id: "t7", label: "Writing Streaming Answer", status: "idle" }
    ];
    setTimelineSteps(steps);

    setExecutionLogs([
      { id: "l1", timestamp: "0.0s", type: "info", message: "Input received, compiling prompts." }
    ]);

    // Dispatch inference call immediately in the background
    const fetchModelResponse = async (): Promise<{ content: string; source: "local" | "mock" }> => {
      if (selectedModel !== "i-still-learning") {
        return { content: getSimulatedResponse(content).content, source: "mock" };
      }
      
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: content,
            temperature: temperature,
            max_length: 200,
            repetition_penalty: 1.25,
          }),
        });
        
        if (!res.ok) {
          throw new Error("HTTP connection failed");
        }
        
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        return { content: data.generated_text, source: "local" };
      } catch (e) {
        console.warn("Using simulation fallback. Flask backend offline.", e);
        return { content: getSimulatedResponse(content).content, source: "mock" };
      }
    };

    const responsePromise = fetchModelResponse();

    // Fast-run reasoning steps
    let stepsRun = 0;
    const intervalTimer = setInterval(() => {
      stepsRun++;
      if (stepsRun === 1) {
        setTimelineSteps(prev => prev.map(s => s.id === "t1" ? { ...s, status: "completed", duration: "110ms" } : s.id === "t2" ? { ...s, status: "running" } : s));
        setExecutionLogs(prev => [...prev, { id: "l2", timestamp: "0.2s", type: "api", message: `Connecting API socket to local inference server...` }]);
      } else if (stepsRun === 2) {
        setTimelineSteps(prev => prev.map(s => s.id === "t2" ? { ...s, status: "completed", duration: "190ms" } : s.id === "t3" ? { ...s, status: "running" } : s));
        setExecutionLogs(prev => [...prev, { id: "l3", timestamp: "0.5s", type: "info", message: `Aligning workspace metadata and token inputs.` }]);
      } else if (stepsRun === 3) {
        setTimelineSteps(prev => prev.map(s => s.id === "t3" ? { ...s, status: "completed", duration: "140ms" } : s.id === "t4" ? { ...s, status: "running" } : s));
        setExecutionLogs(prev => [...prev, { id: "l4", timestamp: "0.8s", type: "tool", message: `Scanning folders context using ripgrep.` }]);
      } else if (stepsRun === 4) {
        setTimelineSteps(prev => prev.map(s => s.id === "t4" ? { ...s, status: "completed", duration: "80ms" } : s.id === "t5" ? { ...s, status: "running" } : s));
        setExecutionLogs(prev => [...prev, { id: "l5", timestamp: "1.1s", type: "info", message: `Context injected into prompt template successfully.` }]);
      } else if (stepsRun === 5) {
        setTimelineSteps(prev => prev.map(s => s.id === "t5" ? { ...s, status: "completed", duration: "210ms" } : s.id === "t6" ? { ...s, status: "running" } : s));
        setExecutionLogs(prev => [...prev, { id: "l6", timestamp: "1.4s", type: "tool", message: `Executing inference compilation pipeline.` }]);
      } else if (stepsRun === 6) {
        clearInterval(intervalTimer);
        
        // Wait for LLM backend response to complete
        responsePromise.then(({ content: modelReply, source }) => {
          setTimelineSteps(prev => prev.map(s => s.id === "t6" ? { ...s, status: "completed", duration: "410ms" } : s.id === "t7" ? { ...s, status: "running" } : s));
          setExecutionLogs(prev => [...prev, { 
            id: "l7", 
            timestamp: "1.9s", 
            type: source === "local" ? "success" : "warning", 
            message: source === "local" ? `Received tokens from local ToyLLM model.` : "ToyLLM backend offline. Triggered simulated sandbox response."
          }]);
          
          if (source === "mock") {
            if (selectedModel === "i-still-learning") {
              addToast("Model server offline", "Ensure python scripts/web_demo.py is running on port 5000.", "warning");
            }
          } else {
            addToast("Generation Success", "Received text from ToyLLM.", "success");
          }

          setTimeout(() => {
            setTimelineSteps(prev => prev.map(s => s.id === "t7" ? { ...s, status: "completed", duration: "60ms" } : s));
            
            // Render template elements like citations and files if they exist in standard mocks, 
            // otherwise just render pure string response from model
            const template = getSimulatedResponse(content);

            const assistantMsg: Message = {
              id: Math.random().toString(36).substring(7),
              role: "assistant",
              content: "",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              modelUsed: selectedModel,
              thinkingTime: "1.8s",
              tokensUsed: Math.floor(modelReply.length / 4) + 10,
              cost: source === "local" ? 0.0 : Math.random() * 0.005 + 0.001,
              hasMermaid: source === "mock" && template.hasMermaid,
              hasTable: source === "mock" && template.hasTable,
              files: source === "mock" ? template.files : undefined,
              citations: source === "local" ? [
                { label: "ToyLLM Local Node", url: "#" }
              ] : template.citations
            };

            // Push initial empty assistant message
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id === activeSessionId) {
                  return { ...s, messages: [...s.messages, assistantMsg] };
                }
                return s;
              })
            );

            // Stream word by word
            let currentWordIndex = 0;
            const words = modelReply.split(" ");
            let streamContent = "";

            const streamTimer = setInterval(() => {
              if (currentWordIndex >= words.length) {
                clearInterval(streamTimer);
                setIsAgentRunning(false);
                setTokenCostAccumulated((prev) => ({
                  tokens: prev.tokens + (assistantMsg.tokensUsed || 0),
                  cost: Number((prev.cost + (assistantMsg.cost || 0)).toFixed(3))
                }));
                return;
              }

              streamContent += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
              currentWordIndex++;

              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === activeSessionId) {
                    const msgs = [...s.messages];
                    const lastMsg = msgs[msgs.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      msgs[msgs.length - 1] = { ...lastMsg, content: streamContent };
                    }
                    return { ...s, messages: msgs };
                  }
                  return s;
                })
              );
            }, 30);

          }, 400);
        });
      }
    }, 400);
  };

  const regenerateMessage = (messageId: string) => {
    let currentSession = sessions.find((s) => s.id === activeSessionId);
    if (!currentSession) return;

    // find user message preceding this
    const idx = currentSession.messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;

    const precedingUserMessage = currentSession.messages.slice(0, idx).reverse().find(m => m.role === "user");
    if (!precedingUserMessage) return;

    // Delete the assistant message and everything after it
    const trimmedMessages = currentSession.messages.slice(0, idx);
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: trimmedMessages } : s));

    addToast("Regenerating Response", "Running sequence again with new seed.", "default");
    sendMessage(precedingUserMessage.content);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        activeAgent,
        setActiveAgent,
        activeWorkspace,
        setActiveWorkspace,
        selectedModel,
        setSelectedModel,
        temperature,
        setTemperature,
        deepThink,
        setDeepThink,
        webSearch,
        setWebSearch,
        voiceMode,
        setVoiceMode,
        isAgentRunning,
        timelineSteps,
        executionLogs,
        tokenCostAccumulated,
        uploadedFiles,
        knowledgeFiles,
        addUploadedFile,
        addKnowledgeFile,
        removeKnowledgeFile,
        sendMessage,
        createNewChat,
        selectSession,
        deleteSession,
        clearSessionHistory,
        regenerateMessage,
        toasts,
        addToast,
        dismissToast,
        sidebarCollapsed,
        setSidebarCollapsed,
        rightPanelOpen,
        setRightPanelOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
