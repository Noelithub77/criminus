'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import React from 'react'

interface Task {
  id: number
  title: string
  description: string | null
  is_completed: boolean
  created_at: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  
  // Moved createClient inside the component
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
  }, [supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: newTask.title,
          description: newTask.description || null,
        },
      ])
      .select()

    if (error) {
      console.error('Error adding task:', error)
      return
    }

    setNewTask({ title: '', description: '' })
    fetchTasks()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Task Manager</h1>
      
      {/* Add Task Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Task
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border rounded-md p-4 hover:bg-gray-50"
          >
            <h3 className="font-medium">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 mt-1">{task.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Created: {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 