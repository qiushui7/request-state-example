import { z } from 'zod'

// Todo 数据类型定义
export const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Todo 统计数据类型定义
export const TodoStatsSchema = z.object({
  total: z.number(),
  completed: z.number(),
  pending: z.number(),
  completionRate: z.number(),
  categoryStats: z.record(z.string(), z.number()),
  priorityStats: z.record(z.string(), z.number()),
})

// 创建 Todo 的输入类型
export const CreateTodoSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().default('personal'),
})

// 更新 Todo 的输入类型
export const UpdateTodoSchema = TodoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

// 部分更新 Todo 的输入类型
export const PatchTodoSchema = UpdateTodoSchema.partial()

// TypeScript 类型导出
export type Todo = z.infer<typeof TodoSchema>
export type TodoStats = z.infer<typeof TodoStatsSchema>
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>
export type PatchTodoInput = z.infer<typeof PatchTodoSchema>

// 常量定义
export const CATEGORIES = [
  { value: 'all', label: '全部分类' },
  { value: 'work', label: '工作' },
  { value: 'personal', label: '个人' },
  { value: 'learning', label: '学习' },
  { value: 'health', label: '健康' },
] as const

export const PRIORITIES = [
  { value: 'all', label: '全部优先级' },
  { value: 'high', label: '高优先级', color: 'text-red-600 bg-red-50' },
  { value: 'medium', label: '中优先级', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'low', label: '低优先级', color: 'text-green-600 bg-green-50' },
] as const

export const COMPLETION_STATUS = [
  { value: 'all', label: '全部状态' },
  { value: 'false', label: '未完成' },
  { value: 'true', label: '已完成' },
] as const

// 筛选器类型
export type TodoFilters = {
  category: string
  priority: string
  completed: string
}