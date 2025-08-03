import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { useQuery, usePaginatedQuery, useMutation } from './index'
import { todoApi } from '../services/todo'
import { type PaginatedResponse } from '../api'
import {
    TodoSchema,
    TodoStatsSchema,
    CreateTodoSchema,
    type Todo,
    type TodoStats,
    type CreateTodoInput,
    type TodoFilters
} from '../schemas/todo'

// 使用待办事项列表的 hook
export function useTodos(page: number, filters: TodoFilters) {
    const queryUrl = todoApi.urls.list(page, 8, filters)

    return usePaginatedQuery<Todo>(queryUrl, page, 8, {
        schema: TodoSchema,
    })
}

// 使用统计数据的 hook
export function useTodoStats() {
    return useQuery<TodoStats>(todoApi.urls.stats(), {
        schema: TodoStatsSchema,
    })
}

// 使用单个待办事项的 hook
export function useTodo(id: number | null) {
    return useQuery<Todo>(
        id ? todoApi.urls.detail(id) : null,
        {
            schema: TodoSchema,
        }
    )
}

// 创建待办事项的 hook
export function useCreateTodo() {
    return useMutation<Todo, CreateTodoInput>('/todos', {
        method: 'post',
        schema: TodoSchema,
    })
}

// 更新待办事项的 hook
export function useUpdateTodo() {
    return useMutation<Todo, Todo>('', {
        method: 'put',
        schema: TodoSchema,
    })
}

// 部分更新待办事项的 hook
export function usePatchTodo() {
    return useMutation<Todo, Partial<Todo>>('', {
        method: 'patch',
        schema: TodoSchema,
    })
}

// 待办事项操作的综合 hook
export function useTodoActions(page: number, filters: TodoFilters) {
    const { mutate } = useSWRConfig()
    const cacheKey = todoApi.urls.list(page, 8, filters)

    // 切换完成状态（乐观更新）
    const toggleComplete = async (todo: Todo) => {
        try {
            // 乐观更新本地缓存
            await mutate(
                cacheKey,
                (currentData: PaginatedResponse<Todo> | undefined) => {
                    if (!currentData?.data?.items) return currentData

                    return {
                        ...currentData,
                        data: {
                            ...currentData.data,
                            items: currentData.data.items.map((item: Todo) =>
                                item.id === todo.id ? { ...item, completed: !item.completed } : item
                            ),
                        },
                    }
                },
                { revalidate: false }
            )

            // 执行 API 调用
            await todoApi.toggleComplete(todo.id, !todo.completed)

            // 重新验证缓存
            await mutate(cacheKey)
        } catch (error) {
            console.error('切换完成状态失败:', error)
            // 重新验证以恢复正确状态
            await mutate(cacheKey)
            throw error
        }
    }

    // 删除待办事项（乐观更新）
    const deleteTodo = async (todo: Todo) => {
        try {
            // 乐观更新本地缓存
            await mutate(
                cacheKey,
                (currentData: PaginatedResponse<Todo> | undefined) => {
                    if (!currentData?.data?.items) return currentData

                    return {
                        ...currentData,
                        data: {
                            ...currentData.data,
                            items: currentData.data.items.filter((item: Todo) => item.id !== todo.id),
                            total: currentData.data.total - 1,
                        },
                    }
                },
                { revalidate: false }
            )

            // 执行 API 调用
            await todoApi.delete(todo.id)

            // 重新验证缓存
            await mutate(cacheKey)
        } catch (error) {
            console.error('删除待办事项失败:', error)
            // 重新验证以恢复正确状态
            await mutate(cacheKey)
            throw error
        }
    }

    // 添加待办事项（乐观更新）
    const addTodo = async (newTodo: CreateTodoInput) => {
        try {
            // 生成临时 ID 用于乐观更新
            const tempTodo: Todo = {
                id: Date.now(), // 临时 ID
                ...newTodo,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            // 乐观更新本地缓存
            await mutate(
                cacheKey,
                (currentData: PaginatedResponse<Todo> | undefined) => {
                    if (!currentData?.data?.items) return currentData

                    return {
                        ...currentData,
                        data: {
                            ...currentData.data,
                            items: [tempTodo, ...currentData.data.items],
                            total: currentData.data.total + 1,
                        },
                    }
                },
                { revalidate: false }
            )

            // 执行 API 调用
            await todoApi.create(newTodo)

            // 重新验证缓存以获取真实数据
            await mutate(cacheKey)
        } catch (error) {
            console.error('添加待办事项失败:', error)
            // 重新验证以恢复正确状态
            await mutate(cacheKey)
            throw error
        }
    }

    return {
        toggleComplete,
        deleteTodo,
        addTodo,
    }
}

// 待办事项筛选器的 hook
export function useTodoFilters() {
    const [filters, setFilters] = useState<TodoFilters>({
        category: 'all',
        priority: 'all',
        completed: 'all',
    })

    const updateFilter = (key: keyof TodoFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const resetFilters = () => {
        setFilters({
            category: 'all',
            priority: 'all',
            completed: 'all',
        })
    }

    return {
        filters,
        updateFilter,
        resetFilters,
    }
}

// 待办事项表单的 hook
export function useTodoForm(initialData?: Partial<CreateTodoInput>) {
    const [formData, setFormData] = useState<CreateTodoInput>({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        ...initialData,
    })

    const updateField = <K extends keyof CreateTodoInput>(
        key: K,
        value: CreateTodoInput[K]
    ) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            category: 'personal',
            ...initialData,
        })
    }

    const validateForm = () => {
        try {
            CreateTodoSchema.parse(formData)
            return { isValid: true, errors: null }
        } catch (error) {
            return { isValid: false, errors: error }
        }
    }

    return {
        formData,
        updateField,
        resetForm,
        validateForm,
        isValid: formData.title.trim().length > 0,
    }
}