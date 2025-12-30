'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow, isToday, isPast, isTomorrow, isThisWeek } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Heart,
  Sparkles,
  Trash2,
  Search,
  Phone,
  Mail,
  CheckSquare,
  UserPlus,
  Users,
  Flag,
  Bell,
  RefreshCw,
  Pencil,
  ListFilter,
  X,
  AlertCircle,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTasks } from '@/hooks/useTasks'
import { TaskDialog } from '@/features/missionary/components/task-dialog'
import type { Task, TaskType, TaskStatus, TaskPriority } from '@/lib/missionary/types'

const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
}

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

const TASK_TYPE_CONFIG: Record<TaskType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  call: { label: 'Call', icon: Phone, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  email: { label: 'Email', icon: Mail, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  to_do: { label: 'To-do', icon: CheckSquare, color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
  follow_up: { label: 'Follow Up', icon: UserPlus, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  thank_you: { label: 'Thank You', icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  meeting: { label: 'Meeting', icon: Users, color: 'text-teal-600', bgColor: 'bg-teal-50' },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; badgeColor: string }> = {
  none: { label: 'None', color: 'text-zinc-400', badgeColor: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
  low: { label: 'Low', color: 'text-sky-500', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
  medium: { label: 'Medium', color: 'text-amber-500', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High', color: 'text-rose-500', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  in_progress: { label: 'In Progress', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  waiting: { label: 'Waiting', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  deferred: { label: 'Deferred', color: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}

function getDueDateStatus(dueDate: string | null | undefined) {
  if (!dueDate) return null
  const date = new Date(dueDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  if (isPast(date) && !isToday(date)) {
    return { label: 'Overdue', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  }
  if (isToday(date)) {
    return { label: 'Due Today', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  if (isTomorrow(date)) {
    return { label: 'Tomorrow', color: 'bg-sky-50 text-sky-700 border-sky-200' }
  }
  if (isThisWeek(date)) {
    return { label: format(date, 'EEEE'), color: 'bg-zinc-100 text-zinc-700 border-zinc-200' }
  }
  return { label: format(date, 'MMM d'), color: 'bg-zinc-100 text-zinc-700 border-zinc-200' }
}

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-4 p-5 border border-zinc-200 rounded-2xl bg-white"
        >
          <Skeleton className="h-5 w-5 rounded-md mt-1" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function EmptyState({ 
  filter, 
  onCreateTask 
}: { 
  filter: string
  onCreateTask: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={smoothTransition}
    >
      <Card className="border-dashed border-2 border-zinc-200 bg-zinc-50/50 rounded-2xl">
        <CardContent className="p-12 sm:p-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...smoothTransition, delay: 0.1 }}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white shadow-sm border border-zinc-200 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-300" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-black text-xl sm:text-2xl text-zinc-900 tracking-tight"
          >
            {filter === 'all' ? 'No tasks yet' : 'All caught up!'}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-sm font-medium text-zinc-500 max-w-[300px] mx-auto"
          >
            {filter === 'all'
              ? 'Create your first task to start tracking follow-ups with your partners.'
              : `No ${filter} tasks remaining. Great job staying on top of things!`}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onCreateTask}
              className="mt-8 h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-900 hover:bg-zinc-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-200"
      >
        <AlertCircle className="h-7 w-7 text-rose-600" />
      </motion.div>
      <p className="text-sm font-bold text-zinc-900 mb-1">Something went wrong</p>
      <p className="text-xs text-zinc-500 mb-4 max-w-[300px]">{message}</p>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-9 rounded-xl border-zinc-200 hover:bg-zinc-50"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  color,
  onClick,
  isActive,
}: {
  label: string
  value: number
  color: string
  onClick?: () => void
  isActive?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={springTransition}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer text-left shadow-sm',
        color,
        isActive && 'ring-2 ring-offset-2 ring-zinc-900'
      )}
    >
      <motion.span
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-2xl font-black tabular-nums"
      >
        {value}
      </motion.span>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
    </motion.button>
  )
}

function TaskRow({
  task,
  onComplete,
  onEdit,
  onDelete,
  index,
}: {
  task: Task
  onComplete: () => void
  onEdit: () => void
  onDelete: () => void
  index: number
}) {
  const typeConfig = TASK_TYPE_CONFIG[task.task_type]
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const statusConfig = STATUS_CONFIG[task.status]
  const dueDateStatus = getDueDateStatus(task.due_date)
  const isCompleted = task.status === 'completed'
  const Icon = typeConfig.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ ...smoothTransition, delay: index * 0.03 }}
      className={cn(
        'relative group flex items-start gap-4 p-5 border rounded-xl transition-all',
        isCompleted
          ? 'bg-zinc-50/50 border-zinc-100'
          : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md'
      )}
    >
      <motion.div className="mt-1 relative" whileTap={{ scale: 0.9 }}>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onComplete}
          className="h-5 w-5 rounded-md border-zinc-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
        />
      </motion.div>

      <motion.div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
          isCompleted ? 'opacity-50' : '',
          typeConfig.bgColor,
          typeConfig.color
        )}
        whileHover={{ scale: 1.05 }}
        transition={springTransition}
      >
        <Icon className="h-4 w-4" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <motion.p
                className={cn(
                  'font-bold text-sm tracking-tight',
                  isCompleted ? 'line-through text-zinc-400' : 'text-zinc-900'
                )}
              >
                {task.title}
              </motion.p>
              {task.priority !== 'none' && !isCompleted && (
                <Badge className={cn('border text-[9px] font-black uppercase tracking-widest px-1.5 h-4', priorityConfig.badgeColor)}>
                  {priorityConfig.label}
                </Badge>
              )}
              {task.is_auto_generated && !isCompleted && (
                <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-[9px] font-black uppercase tracking-widest px-1.5 h-4 gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Auto
                </Badge>
              )}
            </div>
            {task.description && !isCompleted && (
              <p className="text-xs font-medium text-zinc-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {task.donor && (
            <Link href={`/missionary-dashboard/donors?selected=${task.donor.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-100 border border-zinc-200 hover:border-zinc-300 transition-colors cursor-pointer"
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={task.donor.avatar_url || undefined} />
                  <AvatarFallback className="text-[8px] font-bold bg-zinc-200 text-zinc-600">
                    {task.donor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                  {task.donor.name}
                </span>
              </motion.div>
            </Link>
          )}
          {dueDateStatus && !isCompleted && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider',
                dueDateStatus.color
              )}
            >
              <Clock className="h-3 w-3" />
              {dueDateStatus.label}
            </motion.div>
          )}
          {task.reminder_date && !isCompleted && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-bold uppercase tracking-wider"
            >
              <Bell className="h-3 w-3" />
              {format(new Date(task.reminder_date), 'MMM d')}
            </motion.div>
          )}
          <Badge className={cn('border text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', statusConfig.color)}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl border-zinc-200 p-1.5 shadow-xl min-w-[160px]">
          <DropdownMenuItem onClick={onEdit} className="rounded-lg text-xs font-medium py-2 cursor-pointer">
            <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onComplete} className="rounded-lg text-xs font-medium py-2 cursor-pointer">
            <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-zinc-400" />
            {isCompleted ? 'Reopen Task' : 'Mark Complete'}
          </DropdownMenuItem>
          {task.donor && (
            <DropdownMenuItem asChild className="rounded-lg text-xs font-medium py-2 cursor-pointer">
              <Link href={`/missionary-dashboard/donors?selected=${task.donor.id}`}>
                <User className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                View Partner
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="my-1 bg-zinc-100" />
          <DropdownMenuItem
            onClick={onDelete}
            className="rounded-lg text-xs font-medium py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

type ViewFilter = 'all' | 'active' | 'completed' | 'overdue' | 'today'

export default function TasksPage() {
  const {
    tasks,
    loading,
    error,
    filters,
    setFilters,
    filteredTasks,
    stats,
    completeTask,
    reopenTask,
    deleteTask,
    refresh,
  } = useTasks()

  const [viewFilter, setViewFilter] = useState<ViewFilter>('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')

  const displayedTasks = useMemo(() => {
    let result = [...filteredTasks]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.donor?.name.toLowerCase().includes(search)
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.task_type === typeFilter)
    }

    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter)
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    switch (viewFilter) {
      case 'active':
        result = result.filter(t => t.status !== 'completed' && t.status !== 'deferred')
        break
      case 'completed':
        result = result.filter(t => t.status === 'completed')
        break
      case 'overdue':
        result = result.filter(t => {
          if (t.status === 'completed' || t.status === 'deferred') return false
          if (!t.due_date) return false
          return isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
        })
        break
      case 'today':
        result = result.filter(t => {
          if (t.status === 'completed') return false
          if (!t.due_date) return false
          return isToday(new Date(t.due_date))
        })
        break
    }

    result.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1
      
      const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      if (a.due_date) return -1
      if (b.due_date) return 1
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return result
  }, [filteredTasks, viewFilter, searchTerm, typeFilter, priorityFilter])

  const handleComplete = async (task: Task) => {
    if (task.status === 'completed') {
      await reopenTask(task.id)
    } else {
      await completeTask(task.id)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id)
      setTaskToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleTaskSuccess = () => {
    refresh()
    setEditingTask(null)
    setTaskDialogOpen(false)
  }

  const handleCreateNew = () => {
    setEditingTask(null)
    setTaskDialogOpen(true)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setPriorityFilter('all')
    setViewFilter('active')
  }

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || priorityFilter !== 'all'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      <PageHeader
        title="Tasks"
        description="Manage follow-ups, calls, and partner communications."
      >
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="h-9 px-3 text-xs font-medium border-zinc-200 hover:bg-zinc-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </motion.div>
          <TaskDialog
            task={editingTask}
            open={taskDialogOpen}
            onOpenChange={(open) => {
              setTaskDialogOpen(open)
              if (!open) setEditingTask(null)
            }}
            onSuccess={handleTaskSuccess}
            trigger={
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="sm" className="h-9 px-4 text-xs font-medium bg-zinc-900 hover:bg-zinc-800">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </motion.div>
            }
          />
        </motion.div>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        <StatCard
          label="Active"
          value={stats.notStarted + stats.inProgress}
          color="bg-sky-50 border-sky-200 text-sky-700"
          onClick={() => setViewFilter('active')}
          isActive={viewFilter === 'active'}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          color="bg-emerald-50 border-emerald-200 text-emerald-700"
          onClick={() => setViewFilter('completed')}
          isActive={viewFilter === 'completed'}
        />
        {stats.overdue > 0 && (
          <StatCard
            label="Overdue"
            value={stats.overdue}
            color="bg-rose-50 border-rose-200 text-rose-700"
            onClick={() => setViewFilter('overdue')}
            isActive={viewFilter === 'overdue'}
          />
        )}
        {stats.dueToday > 0 && (
          <StatCard
            label="Due Today"
            value={stats.dueToday}
            color="bg-amber-50 border-amber-200 text-amber-700"
            onClick={() => setViewFilter('today')}
            isActive={viewFilter === 'today'}
          />
        )}
        {stats.highPriority > 0 && (
          <StatCard
            label="High Priority"
            value={stats.highPriority}
            color="bg-violet-50 border-violet-200 text-violet-700"
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 bg-white border-zinc-200 rounded-xl focus:border-zinc-300 focus:ring-zinc-200"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-zinc-100"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Tabs
            value={viewFilter}
            onValueChange={(v) => setViewFilter(v as ViewFilter)}
            className="hidden sm:block"
          >
            <TabsList className="bg-zinc-100 border border-zinc-200 p-1 h-auto rounded-xl">
              {(['all', 'active', 'completed'] as const).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 data-[state=active]:text-zinc-900"
                >
                  {tab === 'all' ? 'All' : tab === 'active' ? 'Active' : 'Done'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-11 rounded-xl border-zinc-200 hover:bg-zinc-50',
                  hasActiveFilters && 'border-zinc-900 bg-zinc-900/5'
                )}
              >
                <ListFilter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 h-5 px-1.5 bg-zinc-900 text-white border-0">
                    {[typeFilter !== 'all', priorityFilter !== 'all', !!searchTerm].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-zinc-200">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Task Type
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-100" />
              <DropdownMenuCheckboxItem
                checked={typeFilter === 'all'}
                onCheckedChange={() => setTypeFilter('all')}
              >
                All Types
              </DropdownMenuCheckboxItem>
              {Object.entries(TASK_TYPE_CONFIG).map(([value, config]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={typeFilter === value}
                  onCheckedChange={() => setTypeFilter(value as TaskType)}
                >
                  <config.icon className={cn('h-3.5 w-3.5 mr-2', config.color)} />
                  {config.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator className="bg-zinc-100" />
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Priority
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-100" />
              <DropdownMenuCheckboxItem
                checked={priorityFilter === 'all'}
                onCheckedChange={() => setPriorityFilter('all')}
              >
                All Priorities
              </DropdownMenuCheckboxItem>
              {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={priorityFilter === value}
                  onCheckedChange={() => setPriorityFilter(value as TaskPriority)}
                >
                  <Flag className={cn('h-3.5 w-3.5 mr-2', config.color)} />
                  {config.label}
                </DropdownMenuCheckboxItem>
              ))}

              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuItem
                    onClick={clearFilters}
                    className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <X className="h-3.5 w-3.5 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {typeFilter !== 'all' && (
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                onClick={() => setTypeFilter('all')}
              >
                {TASK_TYPE_CONFIG[typeFilter].label}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {priorityFilter !== 'all' && (
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                onClick={() => setPriorityFilter('all')}
              >
                {PRIORITY_CONFIG[priorityFilter].label} Priority
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {searchTerm && (
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                onClick={() => setSearchTerm('')}
              >
                Search: "{searchTerm}"
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : loading ? (
          <TaskListSkeleton />
        ) : displayedTasks.length > 0 ? (
          <motion.div
            key={`task-list-${viewFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {displayedTasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task)}
                onEdit={() => handleEdit(task)}
                onDelete={() => handleDeleteClick(task)}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState filter={viewFilter} onCreateTask={handleCreateNew} />
        )}
      </AnimatePresence>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-zinc-200 hover:bg-zinc-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
