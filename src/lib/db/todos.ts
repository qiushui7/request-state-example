import { promises as fs } from 'fs'
import path from 'path'
import type { Todo } from '@/lib/schemas/todo'

const DB_PATH = path.join(process.cwd(), 'data', 'todos.json')

// Read todos from JSON file
export async function readTodos(): Promise<Todo[]> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error reading todos:', error)
        return []
    }
}

// Write todos to JSON file
export async function writeTodos(todos: Todo[]): Promise<void> {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(todos, null, 2), 'utf8')
    } catch (error) {
        console.error('Error writing todos:', error)
        throw new Error('Failed to save todos')
    }
}

// Get next available ID
export async function getNextId(): Promise<number> {
    const todos = await readTodos()
    if (todos.length === 0) return 1
    return Math.max(...todos.map(todo => todo.id)) + 1
}

// Find todo by ID
export async function findTodoById(id: number): Promise<Todo | undefined> {
    const todos = await readTodos()
    return todos.find(todo => todo.id === id)
}

// Create new todo
export async function createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const todos = await readTodos()
    const id = await getNextId()
    const now = new Date().toISOString()

    const newTodo: Todo = {
        id,
        ...todoData,
        createdAt: now,
        updatedAt: now,
    }

    todos.push(newTodo)
    await writeTodos(todos)
    return newTodo
}

// Update todo by ID
export async function updateTodo(id: number, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo | null> {
    const todos = await readTodos()
    const todoIndex = todos.findIndex(todo => todo.id === id)

    if (todoIndex === -1) return null

    const updatedTodo = {
        ...todos[todoIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
    }

    todos[todoIndex] = updatedTodo
    await writeTodos(todos)
    return updatedTodo
}

// Delete todo by ID
export async function deleteTodo(id: number): Promise<Todo | null> {
    const todos = await readTodos()
    const todoIndex = todos.findIndex(todo => todo.id === id)

    if (todoIndex === -1) return null

    const deletedTodo = todos[todoIndex]
    todos.splice(todoIndex, 1)
    await writeTodos(todos)
    return deletedTodo
}

// Get todos with filtering and pagination
export async function getTodos(options: {
    category?: string
    priority?: string
    completed?: string
    page?: number
    limit?: number
} = {}): Promise<{
    todos: Todo[]
    total: number
    page: number
    limit: number
    totalPages: number
}> {
    let todos = await readTodos()

    // Apply filters
    if (options.category && options.category !== 'all') {
        todos = todos.filter(todo => todo.category === options.category)
    }

    if (options.priority && options.priority !== 'all') {
        todos = todos.filter(todo => todo.priority === options.priority)
    }

    if (options.completed && options.completed !== 'all') {
        const isCompleted = options.completed === 'true'
        todos = todos.filter(todo => todo.completed === isCompleted)
    }

    // Sort by updatedAt desc
    todos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = todos.length
    const page = options.page || 1
    const limit = options.limit || 10
    const totalPages = Math.ceil(total / limit)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedTodos = todos.slice(startIndex, startIndex + limit)

    return {
        todos: paginatedTodos,
        total,
        page,
        limit,
        totalPages,
    }
}

// Get todo statistics
export async function getTodoStats() {
    const todos = await readTodos()
    const total = todos.length
    const completed = todos.filter(todo => todo.completed).length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Category statistics
    const categoryStats: Record<string, number> = {}
    todos.forEach(todo => {
        categoryStats[todo.category] = (categoryStats[todo.category] || 0) + 1
    })

    // Priority statistics
    const priorityStats: Record<string, number> = {}
    todos.forEach(todo => {
        priorityStats[todo.priority] = (priorityStats[todo.priority] || 0) + 1
    })

    return {
        total,
        completed,
        pending,
        completionRate,
        categoryStats,
        priorityStats,
    }
}