import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { produce } from 'immer'
import { type Todo } from '../schemas/todo'

// Simplified store state interface - only Todo data
interface TodoState {
  // Core data
  todos: Todo[]
  
  // Actions
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: number, updates: Partial<Todo>) => void
  deleteTodo: (id: number) => void
  toggleTodoComplete: (id: number) => void
  
  // Computed getters
  getCompletedCount: () => number
  getPendingCount: () => number
  getCompletionRate: () => number
  getTodosByCategory: () => Record<string, Todo[]>
  getTodosByPriority: () => Record<string, Todo[]>
}



// Create the simplified store
export const useTodoStore = create<TodoState>()(
  devtools(
    (set, get) => ({
      // Initial state
      todos: [],
      
      // Data actions
      setTodos: (todos) =>
        set(
          produce((state) => {
            state.todos = todos
          })
        ),
        
      addTodo: (todo) =>
        set(
          produce((state) => {
            state.todos.unshift(todo)
          })
        ),
        
      updateTodo: (id, updates) =>
        set(
          produce((state) => {
            const index = state.todos.findIndex((todo: Todo) => todo.id === id)
            if (index !== -1) {
              state.todos[index] = { ...state.todos[index], ...updates }
            }
          })
        ),
        
      deleteTodo: (id) =>
        set(
          produce((state) => {
            state.todos = state.todos.filter((todo: Todo) => todo.id !== id)
          })
        ),
        
      toggleTodoComplete: (id) =>
        set(
          produce((state) => {
            const index = state.todos.findIndex((todo: Todo) => todo.id === id)
            if (index !== -1) {
              state.todos[index].completed = !state.todos[index].completed
              state.todos[index].updatedAt = new Date().toISOString()
            }
          })
        ),
        
      // Computed getters
      getCompletedCount: () => {
        const { todos } = get()
        return todos.filter((todo) => todo.completed).length
      },
      
      getPendingCount: () => {
        const { todos } = get()
        return todos.filter((todo) => !todo.completed).length
      },
      
      getCompletionRate: () => {
        const { todos } = get()
        if (todos.length === 0) return 0
        const completed = todos.filter((todo) => todo.completed).length
        return Math.round((completed / todos.length) * 100)
      },
      
      getTodosByCategory: () => {
        const { todos } = get()
        return todos.reduce((acc, todo) => {
          if (!acc[todo.category]) {
            acc[todo.category] = []
          }
          acc[todo.category].push(todo)
          return acc
        }, {} as Record<string, Todo[]>)
      },
      
      getTodosByPriority: () => {
        const { todos } = get()
        return todos.reduce((acc, todo) => {
          if (!acc[todo.priority]) {
            acc[todo.priority] = []
          }
          acc[todo.priority].push(todo)
          return acc
        }, {} as Record<string, Todo[]>)
      },
    }),
    {
      name: 'todo-store',
    }
  )
)

// Individual selector hooks for better performance
export const useTodos = () => useTodoStore((state) => state.todos)
export const useCompletedCount = () => useTodoStore((state) => state.getCompletedCount())
export const usePendingCount = () => useTodoStore((state) => state.getPendingCount())
export const useCompletionRate = () => useTodoStore((state) => state.getCompletionRate())
export const useTodosByCategory = () => useTodoStore((state) => state.getTodosByCategory())
export const useTodosByPriority = () => useTodoStore((state) => state.getTodosByPriority())

// Actions selectors with proper caching
export const useTodoActions = () => {
  const setTodos = useTodoStore((state) => state.setTodos)
  const addTodo = useTodoStore((state) => state.addTodo)
  const updateTodo = useTodoStore((state) => state.updateTodo)
  const deleteTodo = useTodoStore((state) => state.deleteTodo)
  const toggleTodoComplete = useTodoStore((state) => state.toggleTodoComplete)
  
  return {
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
  }
}