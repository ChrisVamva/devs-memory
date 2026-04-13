'use client'

import { LayoutDashboard, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ToolId, type WorkflowId, TOOL_INFO, WORKFLOW_INFO } from '@/lib/shortcuts-data'
import { useShortcutsStore } from '@/lib/shortcuts-store'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DashboardSidebar() {
  const { selectedTool, setSelectedTool, selectedWorkflow, setSelectedWorkflow, shortcuts } = useShortcutsStore()
  
  const toolCounts = (Object.keys(TOOL_INFO) as ToolId[]).reduce((acc, tool) => {
    acc[tool] = shortcuts.filter(s => s.toolId === tool).length
    return acc
  }, {} as Record<ToolId, number>)

  const workflowCounts = (Object.keys(WORKFLOW_INFO) as WorkflowId[]).reduce((acc, workflow) => {
    acc[workflow] = shortcuts.filter(s => s.workflowIds.includes(workflow)).length
    return acc
  }, {} as Record<WorkflowId, number>)
  
  return (
    <aside className="hidden md:flex w-56 border-r border-sidebar-border bg-sidebar flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-lg">⌘</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm text-sidebar-foreground">Keybinds</h1>
            <p className="text-[10px] text-muted-foreground">Command Center</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {/* Dashboard */}
          <div>
            <button
              onClick={() => {
                setSelectedTool('all')
                setSelectedWorkflow('all')
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                selectedTool === 'all' && selectedWorkflow === 'all'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
              )}
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </button>
          </div>
          
          {/* Tools */}
          <div>
            <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-3">Tools</h2>
            <div className="space-y-0.5">
              {(Object.keys(TOOL_INFO) as ToolId[]).map((tool) => {
                const info = TOOL_INFO[tool]
                return (
                  <button
                    key={tool}
                    onClick={() => {
                      setSelectedTool(tool)
                      setSelectedWorkflow('all')
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                      selectedTool === tool
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                    )}
                  >
                    <span style={{ color: info.color }}>{info.icon}</span>
                    <span className="flex-1 text-left truncate">{info.name}</span>
                    <span className="text-[10px] text-muted-foreground">{toolCounts[tool]}</span>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Workflows */}
          <div>
            <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-3 flex items-center gap-1">
              <Workflow className="size-3" />
              Workflows
            </h2>
            <div className="space-y-0.5">
              {(Object.keys(WORKFLOW_INFO) as WorkflowId[]).map((workflow) => {
                const info = WORKFLOW_INFO[workflow]
                return (
                  <button
                    key={workflow}
                    onClick={() => {
                      setSelectedWorkflow(workflow)
                      setSelectedTool('all')
                    }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                      selectedWorkflow === workflow
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                    )}
                  >
                    <span className="truncate">{info.name}</span>
                    <span className="text-[10px] text-muted-foreground">{workflowCounts[workflow]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1.5">
        <div className="text-[10px] text-muted-foreground flex items-center justify-between px-1">
          <span>Search</span>
          <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-[10px]">⌘K</kbd>
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-between px-1">
          <span>Dashboard</span>
          <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-[10px]">D</kbd>
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center justify-between px-1">
          <span>Refresh</span>
          <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-[10px]">R</kbd>
        </div>
      </div>
    </aside>
  )
}
