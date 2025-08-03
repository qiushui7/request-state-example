'use client'

import { useState } from 'react'
import {
  useTodosStore,
  useTodoStatsStore,
  useCreateTodoStore,
  useDeleteTodoStore,
  useToggleTodoStore,
  useUpdateTodoStore,
} from '@/lib/hooks'
import { useCompletedCount, usePendingCount, useCompletionRate } from '@/lib/stores/todo-store'
import type { Todo, TodoFilters, CreateTodoInput } from '@/lib/schemas/todo'

// Import components
import {
  TodoFiltersPanel,
  TodoForm,
  TodoList,
  TodoStatsChart,
} from './components'

export default function HomePage() {
  // Component internal state management
  const [page, setPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filters, setFilters] = useState<TodoFilters>({
    category: 'all',
    priority: 'all',
    completed: 'all',
  })
  const [formData, setFormData] = useState<CreateTodoInput>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
  })

  // Zustand store hooks
  const { todos, isLoading: todosLoading, error: todosError, totalCount, hasMore } = useTodosStore(page, filters)
  const { stats, isLoading: statsLoading } = useTodoStatsStore()
  const { createTodo, isMutating: isCreating, error: createError } = useCreateTodoStore()
  const { deleteTodo } = useDeleteTodoStore()
  const { toggleComplete } = useToggleTodoStore()
  const { updateTodo } = useUpdateTodoStore()

  // Get computed statistics from store
  const completedCount = useCompletedCount()
  const pendingCount = usePendingCount()
  const completionRate = useCompletionRate()

  // Handle todo creation
  const handleCreateTodo = async () => {
    if (!formData.title.trim()) return

    try {
      await createTodo(formData)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  // Handle toggle completion status
  const handleToggleComplete = async (todo: Todo) => {
    try {
      await toggleComplete(todo)
    } catch (error) {
      console.error('Failed to toggle completion status:', error)
    }
  }

  // Handle todo deletion
  const handleDeleteTodo = async (todo: Todo) => {
    if (!confirm('Are you sure you want to delete this todo?')) return

    try {
      await deleteTodo(todo)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof TodoFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page
  }

  // Handle todo updates
  const handleUpdateTodo = async (updatedTodo: Todo) => {
    try {
      await updateTodo(updatedTodo)
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  // Handle form field changes
  const handleFieldChange = <K extends keyof CreateTodoInput>(key: K, value: CreateTodoInput[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Use store computed statistics if API stats are not available
  const displayStats = stats || {
    total: todos.length,
    completed: completedCount,
    pending: pendingCount,
    completionRate,
    categoryStats: {},
    priorityStats: {},
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Statistics section */}
        <TodoStatsChart stats={displayStats} isLoading={statsLoading} />

        {/* Filters and add form section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <TodoFiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            showAddForm={showAddForm}
            onToggleAddForm={() => setShowAddForm(!showAddForm)}
          />

          {/* Add form */}
          {showAddForm && (
            <TodoForm
              formData={formData}
              onFieldChange={handleFieldChange}
              onSubmit={handleCreateTodo}
              isSubmitting={isCreating}
              isValid={formData.title.trim().length > 0}
              error={createError as Error}
            />
          )}
        </section>

        {/* Todo list */}
        <TodoList
          todos={todos}
          total={totalCount}
          page={page}
          hasMore={hasMore}
          isLoading={todosLoading}
          error={todosError}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
          onUpdate={handleUpdateTodo}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}