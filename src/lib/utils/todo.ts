import { PRIORITIES } from '../schemas/todo'
import type { Todo } from '../schemas/todo'

// 获取优先级样式
export function getPriorityStyle(priority: string): string {
  // 过滤掉 'all' 选项，只查找实际的优先级
  const priorityConfig = PRIORITIES.find(p => p.value === priority && p.value !== 'all')
  return (priorityConfig && 'color' in priorityConfig) ? priorityConfig.color : 'text-gray-600 bg-gray-50'
}

// 获取优先级标签
export function getPriorityLabel(priority: string): string {
  const priorityConfig = PRIORITIES.find(p => p.value === priority)
  return priorityConfig?.label || priority
}

// 格式化日期
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// 格式化日期时间
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取分类标签
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    work: '工作',
    personal: '个人',
    learning: '学习',
    health: '健康',
  }
  return categoryMap[category] || category
}

// 计算完成率
export function calculateCompletionRate(todos: Todo[]): number {
  if (todos.length === 0) return 0
  const completed = todos.filter(todo => todo.completed).length
  return Math.round((completed / todos.length) * 100)
}

// 按优先级排序
export function sortByPriority(todos: Todo[]): Todo[] {
  const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
  return [...todos].sort((a, b) => {
    const aPriority = priorityOrder[a.priority] || 0
    const bPriority = priorityOrder[b.priority] || 0
    return bPriority - aPriority
  })
}

// 按创建时间排序
export function sortByCreatedAt(todos: Todo[], desc: boolean = true): Todo[] {
  return [...todos].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return desc ? bTime - aTime : aTime - bTime
  })
}

// 筛选待办事项
export function filterTodos(
  todos: Todo[],
  filters: { category?: string; priority?: string; completed?: boolean }
): Todo[] {
  return todos.filter(todo => {
    if (filters.category && filters.category !== 'all' && todo.category !== filters.category) {
      return false
    }
    if (filters.priority && filters.priority !== 'all' && todo.priority !== filters.priority) {
      return false
    }
    if (filters.completed !== undefined && todo.completed !== filters.completed) {
      return false
    }
    return true
  })
}

// 搜索待办事项
export function searchTodos(todos: Todo[], query: string): Todo[] {
  if (!query.trim()) return todos

  const lowerQuery = query.toLowerCase()
  return todos.filter(todo =>
    todo.title.toLowerCase().includes(lowerQuery) ||
    todo.description.toLowerCase().includes(lowerQuery)
  )
}

// 获取待办事项统计
export function getTodoStats(todos: Todo[]) {
  const total = todos.length
  const completed = todos.filter(todo => todo.completed).length
  const pending = total - completed
  const completionRate = calculateCompletionRate(todos)

  // 按分类统计
  const categoryStats = todos.reduce((acc, todo) => {
    acc[todo.category] = (acc[todo.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 按优先级统计
  const priorityStats = todos.reduce((acc, todo) => {
    acc[todo.priority] = (acc[todo.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    completed,
    pending,
    completionRate,
    categoryStats,
    priorityStats,
  }
}