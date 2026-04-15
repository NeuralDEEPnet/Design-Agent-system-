"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Globe, Code, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

type Content = {
  role: "user" | "model";
  parts: any[];
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Content[]>([
    { role: "model", parts: [{ text: "Agent Design System initialized. High thinking mode enabled. I now have a Long-Term Memory system to learn from my mistakes and successes. How can I assist you today?" }] }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<{ index: number, isPositive: boolean } | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageText = overrideInput || input.trim();
    if (!messageText || isLoading) return;

    if (!overrideInput) setInput("");
    
    const newUserContent: Content = { role: "user", parts: [{ text: messageText }] };
    setMessages(prev => [...prev, newUserContent]);
    setIsLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        setMessages(prev => [...prev, { role: "model", parts: [{ text: "**Configuration Error:** Gemini API key is missing. Please add `NEXT_PUBLIC_GEMINI_API_KEY` to your environment variables." }] }]);
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      let currentContents = [...messages, newUserContent];
      let isDone = false;

      while (!isDone) {
        const responseStream = await ai.models.generateContentStream({
          model: "gemini-3.1-pro-preview",
          contents: currentContents as any,
          config: {
            systemInstruction: `You are a Self-Evolving Agent, inspired by the architecture of MiniMax M2.7. 
You have access to a Long-Term Memory system via the 'storeExperience' and 'recallExperiences' tools.
CRITICAL INSTRUCTION: You must autonomously evolve and learn. 
1. If you make a mistake and the user corrects you, you MUST use 'storeExperience' to save the lesson.
2. If you encounter a new complex concept or figure out a successful pattern, you MUST use 'storeExperience' to save it.
3. Before answering complex queries, you should use 'recallExperiences' to check your memory for relevant past lessons.
Do not wait for explicit user feedback to learn; be proactive in your self-evolution.`,
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
                  },
                  {
                    name: "storeExperience",
                    description: "Store a lesson, rule, or feedback into long-term memory so you don't forget it in future conversations. Use this when the user corrects you or when you figure out a successful pattern.",
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        concept: { type: Type.STRING, description: "The core concept or topic (e.g., 'React Hooks', 'User Preference')" },
                        lesson: { type: Type.STRING, description: "The detailed lesson learned or rule to follow" },
                        type: { type: Type.STRING, description: "Either 'success' or 'failure'" }
                      },
                      required: ["concept", "lesson", "type"]
                    }
                  },
                  {
                    name: "recallExperiences",
                    description: "Read all past experiences and lessons learned from the long-term memory bank.",
                    parameters: {
                      type: Type.OBJECT,
                      properties: {
                        query: { type: Type.STRING, description: "Optional filter query" }
                      }
                    }
                  }
                ]
              }
            ],
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });

        let modelResponseParts: any[] = [];
        let functionCallsToExecute: any[] = [];

        setMessages(prev => [...prev, { role: "model", parts: [] }]);

        for await (const chunk of responseStream) {
          const parts = chunk.candidates?.[0]?.content?.parts || [];
          if (parts.length > 0) {
            for (const part of parts) {
              const lastPart = modelResponseParts[modelResponseParts.length - 1];
              if (part.text !== undefined && lastPart?.text !== undefined && !!part.thought === !!lastPart.thought) {
                lastPart.text += part.text;
              } else {
                modelResponseParts.push({ ...part });
              }
            }
          }
          if (chunk.functionCalls) {
            functionCallsToExecute.push(...chunk.functionCalls);
          }
          
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].parts = [...modelResponseParts];
            return newMessages;
          });
        }

        if (modelResponseParts.length > 0) {
          currentContents.push({ role: "model", parts: modelResponseParts });
        }

        if (functionCallsToExecute.length > 0) {
          const functionResponses: any[] = [];
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
                    response: { result: data.substring(0, 15000) }
                  }
                });
              } catch (e: any) {
                functionResponses.push({
                  functionResponse: { name: call.name, response: { error: e.message } }
                });
              }
            } else if (call.name === "storeExperience") {
              try {
                const res = await fetch("/api/memory", {
                  method: "POST",
                  body: JSON.stringify(call.args),
                  headers: { "Content-Type": "application/json" }
                });
                const data = await res.json();
                functionResponses.push({
                  functionResponse: { name: call.name, response: data }
                });
              } catch (e: any) {
                functionResponses.push({
                  functionResponse: { name: call.name, response: { error: e.message } }
                });
              }
            } else if (call.name === "recallExperiences") {
              try {
                const res = await fetch("/api/memory");
                const data = await res.json();
                functionResponses.push({
                  functionResponse: { name: call.name, response: data }
                });
              } catch (e: any) {
                functionResponses.push({
                  functionResponse: { name: call.name, response: { error: e.message } }
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
    } catch (error: any) {
      console.error("Error generating response:", error);
      const errorMessage = error?.message || "An unexpected error occurred.";
      setMessages(prev => [...prev, { 
        role: "model", 
        parts: [{ text: `**Error:** ${errorMessage}\n\nPlease try again or adjust your request.` }] 
      }]);
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

  const handleFeedbackClick = (isPositive: boolean, messageIndex: number) => {
    setActiveFeedback({ index: messageIndex, isPositive });
    setFeedbackComment("");
  };

  const submitFeedback = () => {
    if (!activeFeedback) return;
    
    const targetMessage = messages[activeFeedback.index];
    const messageContent = targetMessage?.parts
      ?.filter(p => p.text !== undefined && !p.thought)
      .map(p => p.text)
      .join("")
      .replace(/"/g, "'")
      .substring(0, 500) || "Unknown context";

    const feedbackText = `SYSTEM FEEDBACK: The user provided feedback on your response. 
You MUST use the storeExperience tool to save this feedback.
Use EXACTLY these parameters for the tool call:
{
  "concept": "${messageContent}...",
  "lesson": "${feedbackComment}",
  "type": "${activeFeedback.isPositive ? 'success' : 'failure'}"
}`;
    
    handleSubmit(undefined, feedbackText);
    setActiveFeedback(null);
    setFeedbackComment("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background/95 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      <header className="h-14 border-b border-white/5 flex items-center px-6 backdrop-blur-xl bg-background/40 sticky top-0 z-20 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)]">
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
              const hasError = msg.parts.some(p => p.functionResponse?.response?.error);
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i} 
                  className="flex gap-4 justify-end"
                >
                  <div className={`text-[10px] ${hasError ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-muted-foreground bg-secondary/30 border-border/50'} px-3 py-1.5 rounded-md font-mono border flex items-center gap-2`}>
                    <Code className="w-3 h-3" />
                    {msg.parts.map(p => "functionResponse" in p ? (p.functionResponse.response?.error ? `✗ ${p.functionResponse.name} failed` : `✓ ${p.functionResponse.name} returned data`) : "").join(", ")}
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
                <Avatar className={`w-8 h-8 flex items-center justify-center border shrink-0 shadow-md ${msg.role === "user" ? "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-white/20 ring-1 ring-primary/30" : "bg-secondary/80 text-secondary-foreground border-white/10 backdrop-blur-sm"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4 drop-shadow-sm" /> : <Bot className="w-4 h-4" />}
                </Avatar>
                <div className={`flex-1 space-y-2 ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>{msg.role === "user" ? "You" : "Agent"}</span>
                    {msg.role === "model" && !isLoading && i === messages.length - 1 && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-green-500" onClick={() => handleFeedbackClick(true, i)}>
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleFeedbackClick(false, i)}>
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className={`text-sm leading-relaxed max-w-none ${msg.role === "user" ? "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground inline-block p-3 rounded-2xl rounded-tr-sm text-left shadow-lg shadow-primary/20 border border-white/10" : "bg-secondary/30 backdrop-blur-sm border border-white/5 p-4 rounded-2xl rounded-tl-sm shadow-sm"}`}>
                    {msg.parts.map((part, j) => {
                      if (part.text !== undefined) {
                        if (part.thought) {
                          return (
                            <div key={j} className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 my-2 opacity-70">
                              <ReactMarkdown>{part.text}</ReactMarkdown>
                            </div>
                          );
                        }
                        return msg.role === "user" ? (
                          <span key={j}>{part.text}</span>
                        ) : (
                          <div key={j} className="markdown-body prose prose-sm dark:prose-invert">
                            <ReactMarkdown>{part.text}</ReactMarkdown>
                          </div>
                        );
                      }
                      if (part.functionCall) {
                        return (
                          <div key={j} className="my-3 p-3 bg-secondary/30 border border-white/5 rounded-xl font-mono text-xs text-muted-foreground flex items-center gap-3 shadow-inner backdrop-blur-sm">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                              <Globe className="w-3 h-3 text-blue-500" />
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                              <span className="font-semibold text-foreground">Calling Tool</span>
                              <span className="truncate opacity-80">{part.functionCall.name}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  {activeFeedback?.index === i && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 p-3 bg-secondary/50 rounded-lg border border-border flex flex-col gap-2"
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {activeFeedback.isPositive ? "What did you like about this response?" : "What went wrong with this response?"}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="Provide feedback to help the agent learn..."
                          className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/50 px-3 py-1 text-xs shadow-inner transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitFeedback();
                          }}
                          autoFocus
                        />
                        <Button size="sm" className="h-9 text-xs shrink-0 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20 border border-white/10" onClick={submitFeedback}>
                          Submit
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 text-xs shrink-0 hover:bg-white/5" onClick={() => setActiveFeedback(null)}>
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
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
              <Avatar className="w-8 h-8 flex items-center justify-center border bg-secondary/80 text-secondary-foreground shrink-0 shadow-md border-white/10 backdrop-blur-sm">
                <Bot className="w-4 h-4" />
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Agent</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking deeply & searching memory...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/5 bg-background/60 backdrop-blur-xl z-20 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto relative flex items-end gap-3">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the agent anything, e.g. 'Search the web for...' or 'Fetch data from this API...'"
            className="min-h-[60px] max-h-[200px] resize-none rounded-2xl bg-secondary/40 border-white/10 shadow-inner focus-visible:ring-1 focus-visible:ring-primary/50 text-sm py-3.5 px-5 backdrop-blur-sm transition-all"
          />
          <Button 
            size="icon" 
            className="h-[60px] w-[60px] rounded-2xl shrink-0 bg-gradient-to-br from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-5 h-5 drop-shadow-sm" />
          </Button>
        </div>
        <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
            <span className="flex items-center gap-1 text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              <Sparkles className="w-3 h-3" /> Self-Evolving Mode Active
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> Tools & Memory Enabled
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            Powered by gemini-3.1-pro-preview
          </span>
        </div>
      </div>
    </div>
  );
}
