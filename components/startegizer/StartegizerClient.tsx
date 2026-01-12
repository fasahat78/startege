"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import PromptLibrary from "./PromptLibrary";
import UseCaseBuilder from "./UseCaseBuilder";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{ 
    title: string; 
    source: string; 
    url?: string;
    type?: string;
    date?: string;
  }>;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  persona: string | null;
  knowledgeLevel: string | null;
  interests: string[];
  goals: string[];
}

interface StartegizerClientProps {
  userId: string;
  userProfile: UserProfile;
  initialConversations: Conversation[];
}

export default function StartegizerClient({
  userId,
  userProfile,
  initialConversations,
}: StartegizerClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showUseCaseBuilder, setShowUseCaseBuilder] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [creditError, setCreditError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch initial credit balance
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/user/credits");
        if (response.ok) {
          const data = await response.json();
          setCreditBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      }
    };
    fetchCredits();
  }, []);

  // Get current conversation messages
  const currentMessages = currentConversationId
    ? conversations.find((c) => c.id === currentConversationId)?.messages || []
    : messages;

  // Scroll to bottom when messages change
  useEffect(() => {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  }, [currentMessages, loading]);

  const handleSendMessage = async (content: string, promptTemplateId?: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Add user message immediately
    const newMessages = [...currentMessages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/startegizer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationId: currentConversationId,
          promptTemplateId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 402) {
          // Payment Required - Insufficient credits
          const errorMsg = errorData.message || "Insufficient credits";
          setCreditError(errorMsg);
          toast(errorMsg, "warning");
          setLoading(false);
          return;
        }
        const errorMsg = errorData.error || "Failed to get response";
        toast(errorMsg, "error");
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Always update credit balance from API response
      console.log("[CLIENT] API Response:", data);
      if (data.credits && typeof data.credits.balance === 'number') {
        console.log("[CLIENT] Updating credit balance:", data.credits.balance, "deducted:", data.credits.deducted);
        setCreditBalance(data.credits.balance);
        setCreditError(null);
        if (data.credits.deducted > 0) {
          toast(`Used ${data.credits.deducted} credits`, "info", 3000);
        }
      } else {
        console.warn("[CLIENT] No credits object in response, refreshing balance:", data);
        // Refresh balance manually if not in response
        try {
          const creditsResponse = await fetch("/api/user/credits");
          if (creditsResponse.ok) {
            const creditsData = await creditsResponse.json();
            console.log("[CLIENT] Refreshed balance:", creditsData.balance);
            setCreditBalance(creditsData.balance);
          }
        } catch (err) {
          console.error("[CLIENT] Failed to refresh balance:", err);
        }
      }
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        sources: data.sources,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update or create conversation
      if (currentConversationId) {
        // Update existing conversation
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConversationId
              ? { ...c, messages: updatedMessages, updatedAt: new Date() }
              : c
          )
        );
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: data.conversationId || `conv-${Date.now()}`,
          title: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          messages: updatedMessages,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Handle insufficient credits error
      if (error.message?.includes("Insufficient credits") || creditError) {
        const errorMsg = creditError || "You don't have enough credits to use this feature. Please purchase more credits to continue.";
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: errorMsg,
          timestamp: new Date(),
        };
        setMessages([...newMessages, errorMessage]);
        toast(errorMsg, "warning");
      } else {
        const errorMsg = "Sorry, I encountered an error. Please try again.";
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: errorMsg,
          timestamp: new Date(),
        };
        setMessages([...newMessages, errorMessage]);
        toast(errorMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking delete
    
    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/startegizer/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      // Remove from local state
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      
      // If deleted conversation was current, clear it
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }

      toast("Conversation deleted", "success");
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      toast("Failed to delete conversation", "error");
    }
  };

  const handleSelectPrompt = (promptId: string, promptText: string) => {
    setShowPromptLibrary(false);
    handleSendMessage(promptText, promptId);
  };

  const handleUseCaseBuilt = (useCase: any) => {
    setShowUseCaseBuilder(false);
    
    // Format the use case into a structured prompt
    const useCasePrompt = formatUseCaseToPrompt(useCase);
    handleSendMessage(useCasePrompt);
  };

  const formatUseCaseToPrompt = (useCase: any): string => {
    // Import building blocks to get labels
    const BUILDING_BLOCKS = require("@/lib/use-case-blocks");
    
    // Helper to get label from value
    const getLabel = (blockId: string, value: string): string => {
      const block = BUILDING_BLOCKS.find((b: any) => b.id === blockId);
      if (!block || !block.options) return value;
      const option = block.options.find((o: any) => o.value === value);
      return option ? option.label : value;
    };
    
    let prompt = "I need help with the following AI governance use case:\n\n";
    
    // Always include description (required field)
    prompt += "**Use Case Description:**\n";
    prompt += `${useCase.description}\n\n`;
    
    // Only include fields that are actually set by the user
    // Check if systemType exists and is not empty
    if (useCase.systemType && useCase.systemType.trim()) {
      const label = getLabel("system-type", useCase.systemType);
      prompt += `**AI System Type:** ${label}\n`;
    }
    
    // Check if dataTypes array exists and has items
    if (useCase.dataTypes && Array.isArray(useCase.dataTypes) && useCase.dataTypes.length > 0) {
      const labels = useCase.dataTypes.map((dt: string) => getLabel("data-type", dt));
      prompt += `**Data Types:** ${labels.join(", ")}\n`;
    }
    
    // Check if deploymentContext exists and is not empty
    if (useCase.deploymentContext && useCase.deploymentContext.trim()) {
      const label = getLabel("deployment", useCase.deploymentContext);
      prompt += `**Deployment Context:** ${label}\n`;
    }
    
    // Check if riskLevel exists and is not empty
    if (useCase.riskLevel && useCase.riskLevel.trim()) {
      const label = getLabel("risk", useCase.riskLevel);
      prompt += `**Risk Level:** ${label}\n`;
    }
    
    // Check if frameworks array exists and has items
    if (useCase.frameworks && Array.isArray(useCase.frameworks) && useCase.frameworks.length > 0) {
      const labels = useCase.frameworks.map((f: string) => getLabel("framework", f));
      prompt += `**Regulatory Frameworks:** ${labels.join(", ")}\n`;
    }
    
    // Check if stakeholders array exists and has items
    if (useCase.stakeholders && Array.isArray(useCase.stakeholders) && useCase.stakeholders.length > 0) {
      const labels = useCase.stakeholders.map((s: string) => getLabel("stakeholder", s));
      prompt += `**Stakeholders:** ${labels.join(", ")}\n`;
    }
    
    // Check if decisionImpact exists and is not empty
    if (useCase.decisionImpact && useCase.decisionImpact.trim()) {
      const label = getLabel("impact", useCase.decisionImpact);
      prompt += `**Decision Impact:** ${label}\n`;
    }
    
    prompt += "\nPlease provide comprehensive AI governance guidance for this use case.";
    
    return prompt;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-muted relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Conversation History */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 bg-card border-r border-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-3 sm:p-4 border-b border-border space-y-2">
          <button
            onClick={handleNewConversation}
            className="w-full px-4 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition text-sm sm:text-base min-h-[44px]"
          >
            + New Conversation
          </button>
          <button
            onClick={() => setShowUseCaseBuilder(!showUseCaseBuilder)}
            className="w-full px-4 py-2.5 sm:py-3 bg-accent/10 text-accent border border-accent/20 rounded-lg font-medium hover:bg-accent/20 transition flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Use Case Builder
          </button>
          <button
            onClick={() => setShowPromptLibrary(!showPromptLibrary)}
            className="w-full px-4 py-2.5 sm:py-3 border border-border rounded-lg font-medium hover:bg-muted transition text-sm sm:text-base min-h-[44px]"
          >
            {showPromptLibrary ? "Hide" : "Show"} Prompt Library
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">
            Conversations
          </h3>
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2">
              No conversations yet. Start a new one!
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative w-full px-3 py-2 rounded-lg text-sm transition ${
                    currentConversationId === conv.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-card-foreground"
                  }`}
                >
                  <button
                    onClick={() => {
                      handleSelectConversation(conv.id);
                      setShowSidebar(false); // Close sidebar on mobile after selection
                    }}
                    className="w-full text-left"
                  >
                    <div className="truncate pr-6">{conv.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden p-3 sm:p-4 border-b border-border bg-card flex items-center justify-between">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 hover:bg-muted rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-card-foreground">Startegizer</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Use Case Builder Overlay */}
        {showUseCaseBuilder && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8 overflow-y-auto">
            <div className="w-full max-w-5xl my-8">
              <UseCaseBuilder
                onUseCaseBuilt={handleUseCaseBuilt}
                onClose={() => setShowUseCaseBuilder(false)}
                persona={userProfile.persona}
              />
            </div>
          </div>
        )}

        {/* Prompt Library Overlay */}
        {showPromptLibrary && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-card rounded-lg shadow-lg border border-border w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-2xl font-bold text-card-foreground">Prompt Library</h2>
                <button
                  onClick={() => setShowPromptLibrary(false)}
                  className="text-muted-foreground hover:text-card-foreground transition"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <PromptLibrary
                  userProfile={userProfile}
                  onSelectPrompt={handleSelectPrompt}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chat Header - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Startegizer</h1>
              <p className="text-sm text-muted-foreground">
                AI Governance Expert Assistant
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Credit Balance Display */}
              {creditBalance !== null && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-sm font-semibold ${
                    creditBalance === 0 
                      ? "text-status-error" 
                      : creditBalance < 100 
                      ? "text-status-warning" 
                      : "text-card-foreground"
                  }`}>
                    {creditBalance.toLocaleString()} credits
                  </span>
                </div>
              )}
              {creditError && (
                <div className="px-3 py-1.5 bg-status-error/10 text-status-error rounded-lg border border-status-error/20">
                  <span className="text-xs font-medium">{creditError}</span>
                </div>
              )}
              <span className="text-xs px-2 py-1 bg-status-success/20 text-status-success rounded-full">
                {userProfile.persona || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessages messages={currentMessages} loading={loading} />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-card border-t border-border p-3 sm:p-4">
          <ChatInput
            onSend={handleSendMessage}
            loading={loading}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

