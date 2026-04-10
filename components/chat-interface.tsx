"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Globe, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

type Part = 
  | { text: string }
  | { functionCall: { name?: string; args?: any } }
  | { functionResponse: { name: string; response: any } };

type Content = {
  role: "user" | "model";
  parts: Part[];
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Content[]>([
    { role: "model", parts: [{ text: "Agent Design System initialized. High thinking mode enabled. I can now search the web and fetch data from custom APIs. How can I assist you today?" }] }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newUserContent: Content = { role: "user", parts: [{ text: userMessage }] };
    setMessages(prev => [...prev, newUserContent]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      let currentContents = [...messages, newUserContent];
      let isDone = false;

      while (!isDone) {
        const responseStream = await ai.models.generateContentStream({
          model: "gemini-3.1-pro-preview",
          contents: currentContents as any,
          config: {
            tools: [
              { googleSearch: {} },
              { 
                functionDeclarations: [
                  {
                    name: "fetchApi",
                    description: "Fetch data from an external API or URL. Use this to interact with the internet or custom APIs.",
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        url: { type: Type.STRING, description: "The URL to fetch" },
                        method: { type: Type.STRING, description: "HTTP method (GET, POST, etc.). Defaults to GET." },
                        body: { type: Type.STRING, description: "Optional JSON body for POST/PUT requests" },
                      },
                      required: ["url"]
                    }
                  }
                ]
              }
            ],
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });

        let textContent = "";
        let functionCallsToExecute: any[] = [];

        setMessages(prev => [...prev, { role: "model", parts: [] }]);

        for await (const chunk of responseStream) {
          if (chunk.text) {
            textContent += chunk.text;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              const textPartIndex = lastMsg.parts.findIndex(p => "text" in p);
              if (textPartIndex >= 0) {
                lastMsg.parts[textPartIndex] = { text: textContent };
              } else {
                lastMsg.parts.push({ text: textContent });
              }
              return newMessages;
            });
          }
          if (chunk.functionCalls) {
            functionCallsToExecute.push(...chunk.functionCalls);
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              for (const fc of chunk.functionCalls!) {
                lastMsg.parts.push({ functionCall: fc });
              }
              return newMessages;
            });
          }
        }

        const modelResponseParts: Part[] = [];
        if (textContent) modelResponseParts.push({ text: textContent });
        for (const fc of functionCallsToExecute) {
          modelResponseParts.push({ functionCall: fc });
        }
        
        if (modelResponseParts.length > 0) {
          currentContents.push({ role: "model", parts: modelResponseParts });
        }

        if (functionCallsToExecute.length > 0) {
          const functionResponses: Part[] = [];
          for (const call of functionCallsToExecute) {
            if (call.name === "fetchApi") {
              try {
                const args = call.args;
                const res = await fetch(args.url, {
                  method: args.method || "GET",
                  body: args.body ? args.body : undefined,
                  headers: args.body ? { "Content-Type": "application/json" } : undefined
                });
                const data = await res.text();
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { result: data.substring(0, 15000) } // limit size to avoid token overflow
                  }
                });
              } catch (e: any) {
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { error: e.message }
                  }
                });
              }
            }
          }
          
          const userFuncResponseContent: Content = { role: "user", parts: functionResponses };
          currentContents.push(userFuncResponseContent);
          setMessages(prev => [...prev, userFuncResponseContent]);
        } else {
          isDone = true;
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { role: "model", parts: [{ text: "An error occurred while processing your request." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <header className="h-14 border-b border-border flex items-center px-6 backdrop-blur-md bg-background/80 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h1 className="text-sm font-medium">Agent Workspace</h1>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          {messages.map((msg, i) => {
            const isOnlyFuncResponses = msg.role === "user" && msg.parts.every(p => "functionResponse" in p);
            
            if (isOnlyFuncResponses) {
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i} 
                  className="flex gap-4 justify-end"
                >
                  <div className="text-[10px] text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-md font-mono border border-border/50 flex items-center gap-2">
                    <Code className="w-3 h-3" />
                    {msg.parts.map(p => "functionResponse" in p ? `✓ ${p.functionResponse.name} returned data` : "").join(", ")}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={i} 
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className={`w-8 h-8 flex items-center justify-center border shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </Avatar>
                <div className={`flex-1 space-y-2 ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className="text-xs font-medium text-muted-foreground">
                    {msg.role === "user" ? "You" : "Agent"}
                  </div>
                  <div className={`text-sm leading-relaxed max-w-none ${msg.role === "user" ? "bg-primary text-primary-foreground inline-block p-3 rounded-2xl rounded-tr-sm text-left" : ""}`}>
                    {msg.parts.map((part, j) => {
                      if ("text" in part) {
                        return msg.role === "user" ? (
                          <span key={j}>{part.text}</span>
                        ) : (
                          <div key={j} className="markdown-body prose prose-sm dark:prose-invert">
                            <ReactMarkdown>{part.text}</ReactMarkdown>
                          </div>
                        );
                      }
                      if ("functionCall" in part) {
                        return (
                          <div key={j} className="my-3 p-3 bg-secondary/40 border border-border rounded-lg font-mono text-xs text-muted-foreground flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Globe className="w-3 h-3 text-blue-500" />
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                              <span className="font-semibold text-foreground">Calling API</span>
                              <span className="truncate opacity-80">{part.functionCall.args?.url || part.functionCall.name}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Avatar className="w-8 h-8 flex items-center justify-center border bg-secondary text-secondary-foreground shrink-0">
                <Bot className="w-4 h-4" />
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Agent</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking deeply...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the agent anything, e.g. 'Search the web for...' or 'Fetch data from this API...'"
            className="min-h-[60px] max-h-[200px] resize-none rounded-xl bg-secondary/50 border-border focus-visible:ring-1 focus-visible:ring-primary/30 text-sm py-3 px-4"
          />
          <Button 
            size="icon" 
            className="h-[60px] w-[60px] rounded-xl shrink-0"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <Globe className="w-3 h-3" /> Web Search & API Fetch Enabled
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            Powered by gemini-3.1-pro-preview
          </span>
        </div>
      </div>
    </div>
  );
}
