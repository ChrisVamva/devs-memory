'use client'

import { Star, ChevronDown, Sparkles, BookOpen, Check, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Shortcut, type LearningState, TOOL_INFO } from '@/lib/shortcuts-data'
import { useShortcutsStore } from '@/lib/shortcuts-store'
import { KeyCombo } from './keycap'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface ShortcutCardProps {
  shortcut: Shortcut
  compact?: boolean
  showTool?: boolean
}

const STATE_CONFIG: Record<LearningState, { label: string; icon: React.ReactNode; className: string }> = {
  new: { 
    label: 'New', 
    icon: <Sparkles className="size-3" />, 
    className: 'bg-new/10 text-new border-new/20' 
  },
  learning: { 
    label: 'Learning', 
    icon: <BookOpen className="size-3" />, 
    className: 'bg-learning/10 text-learning border-learning/20' 
  },
  known: { 
    label: 'Known', 
    icon: <Check className="size-3" />, 
    className: 'bg-known/10 text-known border-known/20' 
  },
  mastered: { 
    label: 'Mastered', 
    icon: <Trophy className="size-3" />, 
    className: 'bg-mastered/10 text-mastered border-mastered/20' 
  },
}

export function ShortcutCard({ shortcut, compact = false, showTool = true }: ShortcutCardProps) {
  const { toggleFavorite, updateLearningState } = useShortcutsStore()
  const toolInfo = TOOL_INFO[shortcut.toolId]
  const stateConfig = STATE_CONFIG[shortcut.state]
  
  if (compact) {
    return (
      <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
        <KeyCombo keys={shortcut.keys} size="sm" />
        <span className="text-sm text-foreground flex-1 truncate">{shortcut.action}</span>
        {showTool && (
          <span 
            className="text-xs opacity-50"
            style={{ color: toolInfo.color }}
          >
            {toolInfo.icon}
          </span>
        )}
        <button
          onClick={() => toggleFavorite(shortcut.id)}
          className={cn(
            'opacity-0 group-hover:opacity-100 transition-opacity',
            shortcut.favorite && 'opacity-100'
          )}
        >
          <Star 
            className={cn(
              'size-3.5',
              shortcut.favorite ? 'fill-warning text-warning' : 'text-muted-foreground'
            )} 
          />
        </button>
      </div>
    )
  }
  
  return (
    <div className="group relative rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-card hover:border-border transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <KeyCombo keys={shortcut.keys} size="md" />
            {shortcut.leverage === 'high' && (
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-1.5 py-0">
                High Impact
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-foreground mb-1">{shortcut.action}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{shortcut.description}</p>
          
          {showTool && (
            <div className="flex items-center gap-1.5 mt-3">
              <span style={{ color: toolInfo.color }}>{toolInfo.icon}</span>
              <span className="text-xs text-muted-foreground">{toolInfo.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => toggleFavorite(shortcut.id)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <Star 
              className={cn(
                'size-4',
                shortcut.favorite ? 'fill-warning text-warning' : 'text-muted-foreground'
              )} 
            />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  'h-6 gap-1 text-[10px] border',
                  stateConfig.className
                )}
              >
                {stateConfig.icon}
                {stateConfig.label}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {(Object.keys(STATE_CONFIG) as LearningState[]).map((state) => (
                <DropdownMenuItem
                  key={state}
                  onClick={() => updateLearningState(shortcut.id, state)}
                  className="gap-2 text-xs"
                >
                  {STATE_CONFIG[state].icon}
                  {STATE_CONFIG[state].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
