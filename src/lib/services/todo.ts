import { api } from '../api'
import { withQuery } from 'ufo'
import type {
    Todo,
    CreateTodoInput,
    UpdateTodoInput,
    PatchTodoInput,
    TodoFilters
} from '../schemas/todo'

function buildQueryParams(
    page: number,
    limit: number = 8,
    filters: TodoFilters
): string {
    const params: Record<string, string | number> = {
        page,
        limit,
    }

    if (filters.category !== 'all') params.category = filters.category
    if (filters.priority !== 'all') params.priority = filters.priority
    if (filters.completed !== 'all') params.completed = filters.completed

    return withQuery('/todos', params)
}

export function getTodosUrl(page: number, limit: number = 8, filters: TodoFilters): string {
    return buildQueryParams(page, limit, filters)
}

export function getStatsUrl(): string {
    return '/todos/stats'
}

export function getTodoUrl(id: number): string {
    return `/todos/${id}`
}


export async function createTodo(data: CreateTodoInput): Promise<Todo> {
    const response = await api.post('todos', { json: data }).json<{ data: Todo }>()
    return response.data
}

export async function updateTodo(id: number, data: UpdateTodoInput): Promise<Todo> {
    const response = await api.put(`todos/${id}`, { json: data }).json<{ data: Todo }>()
    return response.data
}

export async function patchTodo(id: number, data: PatchTodoInput): Promise<Todo> {
    const response = await api.patch(`todos/${id}`, { json: data }).json<{ data: Todo }>()
    return response.data
}

export async function deleteTodo(id: number): Promise<Todo> {
    const response = await api.delete(`todos/${id}`).json<{ data: Todo }>()
    return response.data
}

export async function toggleComplete(id: number, completed: boolean): Promise<Todo> {
    return patchTodo(id, { completed })
}

export const todoApi = {
    urls: {
        list: getTodosUrl,
        stats: getStatsUrl,
        detail: getTodoUrl,
    },

    create: createTodo,
    update: updateTodo,
    patch: patchTodo,
    delete: deleteTodo,
    toggleComplete,
}