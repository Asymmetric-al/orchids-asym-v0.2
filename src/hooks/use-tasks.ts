'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks'
import type { Task, TaskFormData, TaskFilters, TaskStatus } from '@/lib/missionary/types'
import { toast } from 'sonner'

interface UseTasksOptions {
  donorId?: string | null
  autoFetch?: boolean
}

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  filters: TaskFilters
  setFilters: (filters: TaskFilters) => void
  filteredTasks: Task[]
  stats: {
    total: number
    notStarted: number
    inProgress: number
    completed: number
    overdue: number
    dueToday: number
    highPriority: number
  }
  createTask: (data: TaskFormData) => Promise<Task | null>
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  completeTask: (id: string) => Promise<boolean>
  reopenTask: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { donorId, autoFetch = true } = options
  const { profile } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const mountedRef = useRef(true)
  const initialFetchDone = useRef(false)

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    task_type: 'all',
    donor_id: donorId || null,
    search: '',
  })

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('missionary_tasks')
        .select(`
          *,
          donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
        `)
        .eq('missionary_id', profile.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (donorId) {
        query = query.eq('donor_id', donorId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const formattedTasks: Task[] = (data || []).map(task => ({
        ...task,
        donor: task.donor || null,
      }))

      if (mountedRef.current) {
        setTasks(formattedTasks)
        initialFetchDone.current = true
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks'
      if (mountedRef.current) {
        setError(message)
      }
      console.error('Tasks fetch error:', err)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [profile?.id, supabase, donorId])

  useEffect(() => {
    if (autoFetch && profile?.id && !initialFetchDone.current) {
      fetchTasks()
    } else if (!profile?.id && !initialFetchDone.current) {
      setLoading(false)
    }
  }, [fetchTasks, autoFetch, profile?.id])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
        return false
      }
      if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
        return false
      }
      if (filters.task_type && filters.task_type !== 'all' && task.task_type !== filters.task_type) {
        return false
      }
      if (filters.donor_id && task.donor_id !== filters.donor_id) {
        return false
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(searchLower)
        const matchesDescription = task.description?.toLowerCase().includes(searchLower)
        const matchesDonor = task.donor?.name.toLowerCase().includes(searchLower)
        if (!matchesTitle && !matchesDescription && !matchesDonor) {
          return false
        }
      }
      if (filters.due_date_range) {
        if (task.due_date) {
          const dueDate = new Date(task.due_date)
          if (filters.due_date_range.start && dueDate < filters.due_date_range.start) {
            return false
          }
          if (filters.due_date_range.end && dueDate > filters.due_date_range.end) {
            return false
          }
        }
      }
      return true
    })
  }, [tasks, filters])

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return {
      total: tasks.length,
      notStarted: tasks.filter(t => t.status === 'not_started').length,
      inProgress: tasks.filter(t => t.status === 'in_progress' || t.status === 'waiting').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => {
        if (t.status === 'completed' || t.status === 'deferred') return false
        if (!t.due_date) return false
        return new Date(t.due_date) < today
      }).length,
      dueToday: tasks.filter(t => {
        if (t.status === 'completed' || t.status === 'deferred') return false
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        return dueDate >= today && dueDate < tomorrow
      }).length,
      highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
    }
  }, [tasks])

  const createTask = useCallback(async (data: TaskFormData): Promise<Task | null> => {
    if (!profile?.id) {
      toast.error('Not authenticated')
      return null
    }

    try {
      const insertData = {
        missionary_id: profile.id,
        title: data.title,
        description: data.description || null,
        notes: data.notes || null,
        task_type: data.task_type,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date?.toISOString() || null,
        reminder_date: data.reminder_date?.toISOString() || null,
        donor_id: data.donor_id || null,
        is_auto_generated: false,
      }

      const { data: newTask, error: insertError } = await supabase
        .from('missionary_tasks')
        .insert(insertData)
        .select(`
          *,
          donor:donors!missionary_tasks_donor_id_fkey(id, name, email, avatar_url)
        `)
        .single()

      if (insertError) throw insertError

      const formattedTask: Task = {
        ...newTask,
        donor: newTask.donor || null,
      }

      if (mountedRef.current) {
        setTasks(prev => [formattedTask, ...prev])
      }
      toast.success('Task created successfully')
      return formattedTask
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      toast.error(message)
      console.error('Task create error:', err)
      return null
    }
  }, [profile?.id, supabase])

  const updateTask = useCallback(async (id: string, data: Partial<TaskFormData>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description || null
      if (data.notes !== undefined) updateData.notes = data.notes || null
      if (data.task_type !== undefined) updateData.task_type = data.task_type
      if (data.status !== undefined) updateData.status = data.status
      if (data.priority !== undefined) updateData.priority = data.priority
      if (data.due_date !== undefined) updateData.due_date = data.due_date?.toISOString() || null
      if (data.reminder_date !== undefined) updateData.reminder_date = data.reminder_date?.toISOString() || null
      if (data.donor_id !== undefined) updateData.donor_id = data.donor_id || null

      const { error: updateError } = await supabase
        .from('missionary_tasks')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      await fetchTasks()
      toast.success('Task updated successfully')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      toast.error(message)
      console.error('Task update error:', err)
      return false
    }
  }, [supabase, fetchTasks])

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('missionary_tasks')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      if (mountedRef.current) {
        setTasks(prev => prev.filter(t => t.id !== id))
      }
      toast.success('Task deleted')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      toast.error(message)
      console.error('Task delete error:', err)
      return false
    }
  }, [supabase])

  const completeTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('missionary_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      if (mountedRef.current) {
        setTasks(prev => prev.map(t =>
          t.id === id
            ? { ...t, status: 'completed' as TaskStatus, completed_at: new Date().toISOString() }
            : t
        ))
      }
      toast.success('Task completed')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete task'
      toast.error(message)
      console.error('Task complete error:', err)
      return false
    }
  }, [supabase])

  const reopenTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('missionary_tasks')
        .update({
          status: 'not_started',
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      if (mountedRef.current) {
        setTasks(prev => prev.map(t =>
          t.id === id
            ? { ...t, status: 'not_started' as TaskStatus, completed_at: null }
            : t
        ))
      }
      toast.success('Task reopened')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reopen task'
      toast.error(message)
      console.error('Task reopen error:', err)
      return false
    }
  }, [supabase])

  return {
    tasks,
    loading,
    error,
    filters,
    setFilters,
    filteredTasks,
    stats,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    reopenTask,
    refresh: fetchTasks,
  }
}
