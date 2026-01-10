"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-brand-teal/10 rounded-full p-4 mb-3">
          <svg
            className="h-10 w-10 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-card-foreground mb-1">
          Welcome to Startegizer
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Your AI Governance Expert Assistant. Ask questions about AI governance, get
          personalized guidance, or browse the prompt library to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4 max-w-4xl mx-auto w-full pb-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex-shrink-0 mt-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
          )}

          <div
            className={`flex flex-col gap-1.5 max-w-[85%] ${
              message.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`group rounded-xl px-4 py-2.5 shadow-sm transition-shadow hover:shadow-md ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/50 text-card-foreground"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm sm:prose-base prose-headings:font-semibold prose-headings:text-card-foreground prose-p:text-card-foreground prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-strong:text-card-foreground prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0 text-sm sm:text-base leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 my-3 text-sm sm:text-base">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 my-3 text-sm sm:text-base">{children}</ol>,
                      li: ({ children }) => <li className="ml-2">{children}</li>,
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <code className={`${className} block`} {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono text-primary" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-muted/50 border border-border rounded-lg p-3 sm:p-4 overflow-x-auto my-3 text-xs sm:text-sm">
                          {children}
                        </pre>
                      ),
                      h1: ({ children }) => <h1 className="text-xl sm:text-2xl font-semibold mt-4 mb-3 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg sm:text-xl font-semibold mt-4 mb-3 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base sm:text-lg font-semibold mt-3 mb-2 first:mt-0">{children}</h3>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic text-muted-foreground text-sm sm:text-base">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}

              {/* Copy button for assistant messages */}
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="text-xs text-muted-foreground hover:text-card-foreground transition flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted/50"
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-card-foreground">Sources & Citations</span>
                </div>
                <div className="space-y-1.5">
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-primary font-semibold mt-0.5">[{idx + 1}]</span>
                      <div className="flex-1">
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                          >
                            {source.title}
                          </a>
                        ) : (
                          <span className="text-card-foreground font-medium">{source.title}</span>
                        )}
                        <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                          <span>{source.source}</span>
                          {source.type && (
                            <>
                              <span>•</span>
                              <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                                {source.type}
                              </span>
                            </>
                          )}
                          {source.date && (
                            <>
                              <span>•</span>
                              <span>{source.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground px-1">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {message.role === "user" && (
            <div className="flex-shrink-0 mt-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 mt-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-primary animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
