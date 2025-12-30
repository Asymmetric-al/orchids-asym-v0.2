'use client'

import React, { useState, useMemo } from 'react'
import { 
  CheckCircle2, Plus, Search, MoreHorizontal, Phone, Mail, 
  Users, Calendar, Trash2, Edit2, Clock,
  RefreshCw, Send, X, CornerUpRight, Briefcase,
  AlertCircle, ArrowUpRight, Filter, SortAsc, Circle, CheckSquare,
  Sparkles, Loader2, Activity, ShieldCheck, Zap
} from 'lucide-react'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem 
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

// --- Mock Data ---

type TaskPriority = 'high' | 'medium' | 'low'
type TaskStatus = 'open' | 'completed'
type TaskType = 'call' | 'email' | 'meeting' | 'todo'

interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  type: TaskType
  dueDate: string
  donorId?: string
  assignedTo?: string
}

const MOCK_ADMIN_TASKS: Task[] = [
  { id: '1', title: 'Review Annual Financial Report', priority: 'high', status: 'open', type: 'todo', dueDate: '2024-12-20' },
  { id: '2', title: 'Call with Major Donor: Sarah Connor', priority: 'high', status: 'open', type: 'call', dueDate: '2024-12-20', donorId: 'd1' },
  { id: '3', title: 'Onboarding Meeting: New Missionary Team', priority: 'medium', status: 'open', type: 'meeting', dueDate: '2024-12-21' },
  { id: '4', title: 'Update Organization Compliance Docs', priority: 'low', status: 'open', type: 'todo', dueDate: '2024-12-24' },
  { id: '5', title: 'Send Year-End Tax Statements', priority: 'high', status: 'open', type: 'email', dueDate: '2024-12-30' }
]

const MOCK_ADMIN_DONORS = [
  { id: 'd1', name: 'Sarah Connor', avatar: '', initials: 'SC' },
  { id: 'd2', name: 'John Doe', avatar: '', initials: 'JD' }
]

// --- Utility Functions ---

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  if (date < nextWeek && date > today) {
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
  }

  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

const getRelativeDateGroup = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  if (d < today) return 'Overdue'
  if (d.getTime() === today.getTime()) return 'Today'
  
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow'
  
  return 'Upcoming'
}

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'high': return 'text-red-700 bg-red-50 border-red-200/60'
    case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200/60'
    case 'low': return 'text-slate-600 bg-slate-100 border-slate-200/60'
    default: return 'text-slate-600 bg-slate-100'
  }
}

const getTypeIcon = (type: TaskType) => {
  switch (type) {
    case 'call': return <Phone className="h-3.5 w-3.5" />
    case 'email': return <Mail className="h-3.5 w-3.5" />
    case 'meeting': return <Users className="h-3.5 w-3.5" />
    case 'todo': return <CheckSquare className="h-3.5 w-3.5" />
    default: return <Briefcase className="h-3.5 w-3.5" />
  }
}

// --- Sub-Components ---

const TaskItem = ({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  onReschedule, 
  onFollowUp 
}: {
    task: Task
    onToggle: (id: string) => void
    onEdit: (task: Task) => void
    onDelete: (id: string) => void
    onReschedule: (id: string, days: number) => void
    onFollowUp: (task: Task) => void
}) => {
  const donor = MOCK_ADMIN_DONORS.find(d => d.id === task.donorId)
  const isCompleted = task.status === 'completed'
  const isOverdue = getRelativeDateGroup(task.dueDate) === 'Overdue' && !isCompleted

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8 bg-white border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-all relative",
        isCompleted && "bg-zinc-50/30"
      )}
    >
      <button 
        onClick={() => onToggle(task.id)}
        className={cn(
            "mt-1 sm:mt-0 flex-shrink-0 size-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
            isCompleted 
                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200" 
                : isOverdue 
                    ? "border-rose-200 hover:border-rose-400 bg-white"
                    : "border-zinc-200 hover:border-zinc-900 bg-white"
        )}
      >
        {isCompleted && <CheckCircle2 className="h-4 w-4" />}
        {!isCompleted && isOverdue && <AlertCircle className="h-4 w-4 text-rose-500 animate-pulse" />}
      </button>

      <div className="flex-1 min-w-0 space-y-2 w-full">
        <div className="flex items-center gap-4 flex-wrap">
           <span className={cn(
              "font-black text-lg text-zinc-900 leading-tight cursor-pointer tracking-tighter uppercase",
              isCompleted && "line-through text-zinc-300"
           )} onClick={() => onEdit(task)}>
             {task.title}
           </span>
           {!isCompleted && (
               <Badge className={cn("text-[9px] px-3 h-6 font-black uppercase tracking-widest border-0 shadow-none rounded-full", getPriorityColor(task.priority).replace('slate', 'zinc').replace('red', 'rose').replace('amber', 'orange'))}>
                 {task.priority}
               </Badge>
           )}
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2">
              {getTypeIcon(task.type)}
              <span>{task.type}</span>
           </div>
           
           {donor && (
                <div className="flex items-center gap-2 text-zinc-400">
                   <Avatar className="h-5 w-5 border border-zinc-100 shadow-sm">
                      <AvatarImage src={donor.avatar} />
                      <AvatarFallback className="text-[8px] font-black bg-zinc-900 text-white">{donor.initials}</AvatarFallback>
                   </Avatar>
                   {donor.name}
                </div>
           )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pl-0 sm:pl-6 mt-4 sm:mt-0">
         <div className={cn(
            "flex items-center gap-3 text-[10px] font-black px-4 py-2 rounded-2xl transition-all uppercase tracking-[0.2em] shadow-sm",
            isOverdue ? "text-rose-600 bg-rose-50 border border-rose-100 shadow-rose-100" : 
            isCompleted ? "text-zinc-300 bg-zinc-50 border border-zinc-100 shadow-none" : "text-zinc-500 bg-white border border-zinc-100"
         )}>
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(task.dueDate)}
         </div>

         <div className="flex items-center gap-2">
            {!isCompleted && (
                <>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all">
                            <Clock className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-zinc-100 p-2 shadow-2xl">
                        <DropdownMenuItem onClick={() => onReschedule(task.id, 1)} className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] p-3">Tomorrow</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReschedule(task.id, 7)} className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] p-3">Next Week</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-11 w-11 text-zinc-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                        onClick={() => onFollowUp(task)}
                    >
                        <CornerUpRight className="h-5 w-5" />
                    </Button>
                </>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl border-zinc-100 p-2 shadow-2xl">
                <DropdownMenuItem onClick={() => onEdit(task)} className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] p-3">Edit Details</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-50" />
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 p-3">Delete Task</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </div>
    </motion.div>
  )
}

export default function MissionControlTasks() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_ADMIN_TASKS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Partial<Task>>({})

  const filteredTasks = useMemo(() => {
    let filtered = tasks
    if (!showCompleted) filtered = filtered.filter(t => t.status === 'open')
    if (activeTab !== 'all') filtered = filtered.filter(t => t.type === activeTab.slice(0, -1))
    if (searchQuery) {
       const lowerQ = searchQuery.toLowerCase()
       filtered = filtered.filter(t => t.title.toLowerCase().includes(lowerQ))
    }
    return filtered
  }, [tasks, activeTab, showCompleted, searchQuery])

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = { 'Overdue': [], 'Today': [], 'Tomorrow': [], 'Upcoming': [] }
    filteredTasks.forEach(task => {
       if (task.status === 'completed') {
          if (!groups['Completed']) groups['Completed'] = []
          groups['Completed'].push(task)
       } else {
          const group = getRelativeDateGroup(task.dueDate)
          groups[group]?.push(task)
       }
    })
    return groups
  }, [filteredTasks])

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'open' ? 'completed' : 'open' } : t))
  }

  const openModal = (task?: Task) => {
     setEditingTask(task || { title: '', type: 'todo', priority: 'medium', dueDate: new Date().toISOString().split('T')[0] })
     setIsModalOpen(true)
  }

  const saveTask = () => {
     if (editingTask.id) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...editingTask } as Task : t))
     } else {
        setTasks(prev => [...prev, { ...editingTask, id: `task-${Date.now()}`, status: 'open' } as Task])
     }
     setIsModalOpen(false)
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-zinc-100 pb-8">
         <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Operations Hub</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl uppercase">Operational Tasks</h1>
            <p className="text-zinc-400 mt-3 text-sm font-bold uppercase tracking-widest leading-relaxed">Global mission orchestration and field logistics coordination.</p>
         </div>
         <Button onClick={() => openModal()} className="h-14 px-10 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xl shadow-zinc-200 transition-all">
            <Plus className="mr-3 h-4 w-4" /> Create Task
         </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
         <div className="p-6 border-b border-zinc-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList className="bg-zinc-50 p-1.5 h-12 rounded-2xl border border-zinc-100">
                    <TabsTrigger value="all" className="text-[9px] font-black tracking-widest px-8 rounded-xl uppercase">ALL</TabsTrigger>
                    <TabsTrigger value="calls" className="text-[9px] font-black tracking-widest px-8 rounded-xl uppercase">CALLS</TabsTrigger>
                    <TabsTrigger value="emails" className="text-[9px] font-black tracking-widest px-8 rounded-xl uppercase">EMAILS</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center gap-4 w-full lg:w-auto">
               <div className="relative flex-1 lg:w-96">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                  <Input 
                     placeholder="FILTER OPERATIONS..." 
                     className="pl-12 h-12 text-[10px] font-black tracking-[0.1em] uppercase rounded-2xl bg-zinc-50 border-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="h-12 px-6 gap-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all">
                        <Filter className="h-3.5 w-3.5 text-zinc-400" /> View
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-zinc-100 p-2 shadow-2xl">
                     <DropdownMenuCheckboxItem 
                        checked={showCompleted} 
                        onCheckedChange={(c) => setShowCompleted(!!c)}
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                     >
                        Include Finalized
                     </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto bg-zinc-50/10">
            {filteredTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-32 text-center space-y-8 min-h-[500px]">
                  <div className="size-24 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-zinc-100">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 opacity-20" />
                  </div>
                  <div className="space-y-3">
                    <p className="font-black text-zinc-900 text-3xl tracking-tighter uppercase">Cycle Complete</p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">No active tasks match current protocol.</p>
                  </div>
               </div>
            ) : (
               <div className="pb-12">
                   {Object.keys(groupedTasks).map(group => {
                      const tasksInGroup = groupedTasks[group]
                      if (tasksInGroup.length === 0) return null
                      return (
                         <div key={group}>
                            <div className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 bg-zinc-50/50 border-y border-zinc-100 flex items-center gap-4">
                               <span className={cn(
                                 "h-2 w-2 rounded-full",
                                 group === 'Overdue' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
                                 group === 'Today' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-300"
                               )} />
                               {group}
                            </div>
                            {tasksInGroup.map(task => (
                               <TaskItem 
                                  key={task.id} 
                                  task={task} 
                                  onToggle={handleToggleStatus}
                                  onEdit={openModal}
                                  onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
                                  onReschedule={(id, d) => {
                                      const date = new Date()
                                      date.setDate(date.getDate() + d)
                                      setTasks(prev => prev.map(t => t.id === id ? { ...t, dueDate: date.toISOString().split('T')[0] } : t))
                                  }}
                                  onFollowUp={() => {}}
                               />
                            ))}
                         </div>
                      )
                   })}
               </div>
            )}
         </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-[2.5rem] overflow-hidden border-none shadow-3xl">
            <DialogHeader className="px-8 py-6 border-b bg-slate-50/50">
               <DialogTitle className="text-2xl font-bold font-syne tracking-tight">Manage Protocol.</DialogTitle>
               <DialogDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">Task ID: {editingTask.id || 'NEW_SEQ_01'}</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Operation Title</label>
                  <Input value={editingTask.title} onChange={(e) => setEditingTask(prev => ({ ...prev, title: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all px-6" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Focus Type</label>
                     <Select value={editingTask.type} onValueChange={(v) => setEditingTask(prev => ({ ...prev, type: v as any }))}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                            <SelectItem value="todo" className="font-bold text-[10px] uppercase tracking-widest">To-Do</SelectItem>
                            <SelectItem value="call" className="font-bold text-[10px] uppercase tracking-widest">Call</SelectItem>
                            <SelectItem value="email" className="font-bold text-[10px] uppercase tracking-widest">Email</SelectItem>
                            <SelectItem value="meeting" className="font-bold text-[10px] uppercase tracking-widest">Meeting</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Response Level</label>
                     <Select value={editingTask.priority} onValueChange={(v) => setEditingTask(prev => ({ ...prev, priority: v as any }))}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                            <SelectItem value="high" className="font-bold text-[10px] uppercase tracking-widest text-red-600">High Impact</SelectItem>
                            <SelectItem value="medium" className="font-bold text-[10px] uppercase tracking-widest text-amber-600">Standard</SelectItem>
                            <SelectItem value="low" className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Low Priority</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Date</label>
                  <Input type="date" value={editingTask.dueDate} onChange={(e) => setEditingTask(prev => ({ ...prev, dueDate: e.target.value }))} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all px-6" />
               </div>
            </div>
            <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 gap-4">
               <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-12 px-8 rounded-full border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[9px] hover:bg-white hover:text-slate-950">Abort</Button>
               <Button onClick={saveTask} className="h-12 px-8 rounded-full bg-slate-950 text-white font-black uppercase tracking-widest text-[9px] shadow-xl shadow-slate-950/10 hover:bg-emerald-600 transition-all">Save Protocol</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
