import { SWRConfiguration } from 'swr'
import { api, ApiError } from './api'

// SWR全局配置
export const swrConfig: SWRConfiguration = {
  // 全局fetcher函数
  fetcher: async (url: string) => {
    try {
      const response = await api.get(url).json()
      return response
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(error.message)
      }
      throw new ApiError('Unknown error occurred')
    }
  },

  // 缓存策略
  revalidateOnFocus: false, // 聚焦时不重新验证
  revalidateOnReconnect: true, // 重连时重新验证
  revalidateIfStale: true, // 数据过期时重新验证
  dedupingInterval: 2000, // 2秒内的相同请求去重

  // 错误重试配置
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: (error) => {
    // 只对5xx错误重试
    return error instanceof ApiError && 
           error.status !== undefined && 
           error.status >= 500
  },

  // 加载状态配置
  loadingTimeout: 3000,

  // 全局错误处理
  onError: (error, key) => {
    console.error('SWR Error:', { error, key })
    
    // 可以在这里添加全局错误处理逻辑
    // 比如显示toast通知、记录错误日志等
    if (error instanceof ApiError && error.status === 401) {
      // 处理认证错误，比如重定向到登录页
      window.location.href = '/login'
    }
  },

  // 成功回调
  onSuccess: (data, key, config) => {
    // 可以在这里添加成功处理逻辑
  },
}

// 条件渲染配置
export const createConditionalConfig = (
  condition: boolean,
  baseConfig?: SWRConfiguration
): SWRConfiguration => ({
  ...swrConfig,
  ...baseConfig,
  // 如果条件为false，暂停请求
  isPaused: () => !condition,
})

// 轮询配置
export const createPollingConfig = (
  interval: number,
  baseConfig?: SWRConfiguration
): SWRConfiguration => ({
  ...swrConfig,
  ...baseConfig,
  refreshInterval: interval,
  // 聚焦时继续轮询
  revalidateOnFocus: true,
})

// 无限加载配置
export const infiniteConfig = {
  ...swrConfig,
  revalidateFirstPage: false,
  persistSize: true,
} 