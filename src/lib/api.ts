import ky from 'ky'
import { z } from 'zod'

// API客户端配置
export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retry: {
    limit: 3,
    methods: ['get'],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // 可以在这里添加认证token等
        const token = localStorage.getItem('auth-token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // 全局响应处理
        if (!response.ok) {
          const error = await response.json().catch(() => ({})) as { message?: string }
          throw new Error(error.message || `HTTP ${response.status}`)
        }
      },
    ],
  },
})

// 通用响应类型
export const ApiResponseSchema = z.object({
  data: z.unknown(),
  message: z.string().optional(),
  code: z.number().optional(),
})

export type ApiResponse<T = unknown> = {
  data: T
  message?: string
  code?: number
}

// 分页响应类型
export const PaginatedResponseSchema = z.object({
  data: z.object({
    items: z.array(z.unknown()),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
  }),
  message: z.string().optional(),
})

export type PaginatedResponse<T = unknown> = {
  data: {
    items: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
  message?: string
}

// 错误类型
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
} 