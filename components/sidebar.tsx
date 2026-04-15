import { Settings, Cpu, Zap, Box, Layers, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Sidebar() {
  return (
    <div className="w-64 border-r border-white/5 bg-background/40 backdrop-blur-2xl h-full flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] relative z-20">
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 ring-1 ring-white/20">
          <Box className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight">Agent Design System</span>
      </div>
      
      <Separator />
      
      <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Configuration</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground shadow-sm">Model Name</label>
              <Input defaultValue="gemini-3.1-pro-preview" className="h-8 text-xs bg-secondary/50 border-white/5 shadow-inner focus-visible:ring-primary/50 transition-all rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground shadow-sm">Thinking Level</label>
              <Input defaultValue="HIGH" className="h-8 text-xs bg-secondary/50 border-white/5 shadow-inner focus-visible:ring-primary/50 transition-all rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground shadow-sm">System Prompt</label>
              <Textarea 
                defaultValue="You are a helpful AI assistant." 
                className="min-h-[80px] text-xs resize-none bg-secondary/50 border-white/5 shadow-inner focus-visible:ring-primary/50 transition-all rounded-lg" 
              />
            </div>
            <Button className="w-full h-8 text-xs bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-lg border border-white/10">Save Configuration</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Persona</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground shadow-sm">Name</label>
              <Input defaultValue="Neural DEEP net" className="h-8 text-xs bg-secondary/50 border-white/5 shadow-inner focus-visible:ring-primary/50 transition-all rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground shadow-sm">Role</label>
              <Input defaultValue="Lead AI Assistant" className="h-8 text-xs bg-secondary/50 border-white/5 shadow-inner focus-visible:ring-primary/50 transition-all rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground shadow-sm">Brief Description</label>
              <Textarea 
                defaultValue="A highly capable, Goose-inspired assistant that can interact with the internet and link to custom APIs." 
                className="min-h-[60px] text-xs resize-none bg-secondary/50 border-white/5 shadow-inner focus-visible:ring-primary/50 transition-all rounded-lg" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Knowledge Base</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Learning Logs
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</h3>
          <div className="p-3 rounded-lg border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Model</span>
              <Badge variant="outline" className="text-[10px] font-mono bg-secondary/50 border-white/10 shadow-sm backdrop-blur-sm">gemini-3.1-pro</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Thinking</span>
              <Badge className="text-[10px] bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 hover:from-blue-500/30 hover:to-indigo-500/30 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)] backdrop-blur-sm">HIGH</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Local Env</span>
              <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 shadow-[0_0_10px_rgba(34,197,94,0.1)] backdrop-blur-sm">Ready</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full text-xs h-8">
          <Zap className="w-3 h-3 mr-2" />
          Deploy to GitHub
        </Button>
      </div>
    </div>
  );
}
