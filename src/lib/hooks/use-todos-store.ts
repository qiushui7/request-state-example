import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { useQuery, usePaginatedQuery, useMutation } from './use-api'
import { todoApi } from '../services/todo'
import { useTodos, useTodoActions } from '../stores/todo-store'
import {
  TodoSchema,
  TodoStatsSchema,
  type Todo,
  type TodoStats,
  type CreateTodoInput,
  type TodoFilters
} from '../schemas/todo'

// Hook for managing todo data with Zustand store
export function useTodosStore(page: number, filters: TodoFilters) {
  const todos = useTodos()
  const actions = useTodoActions()

  const queryUrl = todoApi.urls.list(page, 8, filters)

  // Fetch data using SWR
  const { data, error, isLoading, mutate } = usePaginatedQuery<Todo>(
    queryUrl,
    page,
    8,
    {
      schema: TodoSchema,
    }
  )

  // Sync data to Zustand store
  useEffect(() => {
    if (data?.items) {
      actions.setTodos(data.items)
    }
  }, [data?.items, actions])

  // Apply client-side filtering
  const filteredTodos = todos.filter((todo) => {
    // Category filter
    if (filters.category !== 'all' && todo.category !== filters.category) {
      return false
    }

    // Priority filter
    if (filters.priority !== 'all' && todo.priority !== filters.priority) {
      return false
    }

    // Completion status filter
    if (filters.completed !== 'all') {
      const isCompleted = filters.completed === 'true'
      if (todo.completed !== isCompleted) {
        return false
      }
    }

    return true
  })

  return {
    // Filtered data
    todos: filteredTodos,

    // SWR state
    isLoading,
    error,
    mutate,

    // Pagination info
    totalCount: data?.total || 0,
    hasMore: data?.hasMore || false,

    // Store actions
    ...actions,
  }
}

// Hook for todo statistics
export function useTodoStatsStore() {
  const { data, error, isLoading } = useQuery<TodoStats>(todoApi.urls.stats(), {
    schema: TodoStatsSchema,
  })

  return {
    stats: data,
    isLoading,
    error,
  }
}

// Hook for creating todos with optimistic updates
export function useCreateTodoStore() {
  const actions = useTodoActions()
  const { mutate } = useSWRConfig()

  const { trigger, isMutating, error } = useMutation<Todo, CreateTodoInput>('/todos', {
    method: 'post',
    schema: TodoSchema,
  })

  const createTodo = async (newTodo: CreateTodoInput) => {
    try {
      // Optimistic update to store
      const tempTodo: Todo = {
        id: Date.now(), // Temporary ID
        ...newTodo,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      actions.addTodo(tempTodo)

      // Execute API call
      const result = await trigger(newTodo)

      if (result?.data) {
        // Replace temporary data with real data
        actions.deleteTodo(tempTodo.id)
        actions.addTodo(result.data)
      }

      // Revalidate all related SWR caches
      await mutate(() => true)

      return result
    } catch (error) {
      console.error('Failed to create todo:', error)
      // Rollback optimistic update
      actions.deleteTodo(Date.now())
      throw error
    }
  }

  return {
    createTodo,
    isMutating,
    error,
  }
}

// Hook for updating todos with optimistic updates
export function useUpdateTodoStore() {
  const actions = useTodoActions()
  const { mutate } = useSWRConfig()

  const updateTodo = async (todo: Todo) => {
    const originalTodo = { ...todo }

    try {
      // Optimistic update to store
      actions.updateTodo(todo.id, todo)

      // Execute API call directly using todoApi
      const result = await todoApi.update(todo.id, todo)

      if (result) {
        // Update store with API response data
        actions.updateTodo(todo.id, result)
      }

      // Revalidate all related SWR caches
      await mutate(() => true)

      return result
    } catch (error) {
      console.error('Failed to update todo:', error)
      // Rollback optimistic update
      actions.updateTodo(todo.id, originalTodo)
      throw error
    }
  }

  return {
    updateTodo,
  }
}

// Hook for deleting todos with optimistic updates
export function useDeleteTodoStore() {
  const actions = useTodoActions()
  const { mutate } = useSWRConfig()

  const deleteTodo = async (todo: Todo) => {
    try {
      // Optimistic update to store
      actions.deleteTodo(todo.id)

      // Execute API call directly using todoApi
      await todoApi.delete(todo.id)

      // Revalidate all related SWR caches
      await mutate(() => true)
    } catch (error) {
      console.error('Failed to delete todo:', error)
      // Rollback optimistic update
      actions.addTodo(todo)
      throw error
    }
  }

  return {
    deleteTodo,
  }
}

// Hook for toggling todo completion with optimistic updates
export function useToggleTodoStore() {
  const actions = useTodoActions()
  const { mutate } = useSWRConfig()

  const toggleComplete = async (todo: Todo) => {
    try {
      // Optimistic update to store
      actions.toggleTodoComplete(todo.id)

      // Execute API call directly using todoApi
      const result = await todoApi.toggleComplete(todo.id, !todo.completed)

      if (result) {
        // Update store with API response data
        actions.updateTodo(todo.id, result)
      }

      // Revalidate all related SWR caches
      await mutate(() => true)

      return result
    } catch (error) {
      console.error('Failed to toggle completion status:', error)
      // Rollback optimistic update
      actions.toggleTodoComplete(todo.id)
      throw error
    }
  }

  return {
    toggleComplete,
  }
}