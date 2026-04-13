import { Settings, Cpu, Zap, Box, Layers, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Sidebar() {
  return (
    <div className="w-64 border-r border-border bg-background h-full flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center">
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
              <label className="text-xs text-muted-foreground">Model Name</label>
              <Input defaultValue="gemini-3.1-pro-preview" className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Thinking Level</label>
              <Input defaultValue="HIGH" className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">System Prompt</label>
              <Textarea 
                defaultValue="You are a helpful AI assistant." 
                className="min-h-[80px] text-xs resize-none" 
              />
            </div>
            <Button className="w-full h-8 text-xs">Save Configuration</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Persona</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input defaultValue="Neural DEEP net" className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Role</label>
              <Input defaultValue="Lead AI Assistant" className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Brief Description</label>
              <Textarea 
                defaultValue="A highly capable, Goose-inspired assistant that can interact with the internet and link to custom APIs." 
                className="min-h-[60px] text-xs resize-none" 
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
              <Badge variant="outline" className="text-[10px] font-mono">gemini-3.1-pro</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Thinking</span>
              <Badge className="text-[10px] bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">HIGH</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Local Env</span>
              <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/20 bg-green-500/10">Ready</Badge>
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
