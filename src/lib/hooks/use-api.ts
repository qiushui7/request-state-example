import useSWR, { SWRConfiguration, preload } from 'swr'
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite'
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation'
import { z, ZodError } from 'zod'
import { withQuery, withoutLeadingSlash } from 'ufo'
import { api, ApiResponse, PaginatedResponse, ApiError } from '../api'

// Shared fetcher function to ensure useQuery and preloadData use identical logic
const createFetcher = <T>(schema?: z.ZodType<T>) => {
  return async (url: string): Promise<ApiResponse<T>> => {
    const fullUrl = withoutLeadingSlash(url)
    const response = await api.get(fullUrl).json<ApiResponse<T>>()

    if (schema && response.data !== undefined && response.data !== null) {
      try {
        // Validate response data using zod
        const validatedData = schema.parse(response.data)
        return { ...response, data: validatedData }
      } catch (validationError) {
        // Handle schema validation errors with clear error messages
        if (validationError instanceof ZodError) {
          const errorMessages = validationError.issues.map((issue) =>
            `${issue.path.join('.')}: ${issue.message}`
          ).join('; ')
          throw new Error(`Schema validation failed for ${url}: ${errorMessages}`)
        }
        throw new Error(`Schema validation failed for ${url}: ${validationError}`)
      }
    }

    return response
  }
}

// Basic query hook
export function useQuery<T>(
  key: string | null,
  options?: SWRConfiguration & {
    schema?: z.ZodType<T>
  }
) {
  const { schema, ...swrOptions } = options || {}

  const result = useSWR(
    key,
    createFetcher<T>(schema),
    swrOptions
  )

  return {
    ...result,
    data: result.data?.data,
    message: result.data?.message,
  }
}

// Paginated query hook
export function usePaginatedQuery<T>(
  key: string | null,
  page: number = 1,
  limit: number = 10,
  options?: SWRConfiguration & {
    schema?: z.ZodType<T>
  }
) {
  const { schema, ...swrOptions } = options || {}

  const swrKey = key ? withQuery(key, { page, limit }) : null

  const result = useSWR(
    swrKey,
    async (url: string) => {
      const fullUrl = withoutLeadingSlash(url)
      const response = await api.get(fullUrl).json<PaginatedResponse<T>>()

      if (schema && response.data.items && response.data.items.length > 0) {
        try {
          // Validate each item in the array
          const validatedItems = response.data.items.map((item, index) => {
            try {
              return schema.parse(item)
            } catch (itemError) {
              if (itemError instanceof ZodError) {
                const errorMessages = itemError.issues.map((issue) =>
                  `${issue.path.join('.')}: ${issue.message}`
                ).join('; ')
                throw new Error(`Schema validation failed for item ${index} in ${url}: ${errorMessages}`)
              }
              throw new Error(`Schema validation failed for item ${index} in ${url}: ${itemError}`)
            }
          })
          return {
            ...response,
            data: {
              ...response.data,
              items: validatedItems,
            },
          }
        } catch (validationError) {
          throw validationError
        }
      }

      return response
    },
    swrOptions
  )

  return {
    ...result,
    data: result.data?.data,
    items: result.data?.data?.items || [],
    total: result.data?.data?.total || 0,
    hasMore: result.data?.data?.hasMore || false,
    message: result.data?.message,
  }
}

// Infinite scroll hook
export function useInfiniteQuery<T>(
  getKey: (index: number, previousPageData: PaginatedResponse<T> | null) => string | null,
  options?: SWRInfiniteConfiguration & {
    schema?: z.ZodType<T>
  }
) {
  const { schema, ...swrOptions } = options || {}

  const result = useSWRInfinite(
    getKey,
    async (url: string) => {
      const fullUrl = withoutLeadingSlash(url)
      const response = await api.get(fullUrl).json<PaginatedResponse<T>>()

      if (schema && response.data.items && response.data.items.length > 0) {
        try {
          const validatedItems = response.data.items.map((item, index) => {
            try {
              return schema.parse(item)
            } catch (itemError) {
              if (itemError instanceof ZodError) {
                const errorMessages = itemError.issues.map((issue) =>
                  `${issue.path.join('.')}: ${issue.message}`
                ).join('; ')
                throw new Error(`Schema validation failed for item ${index} in ${url}: ${errorMessages}`)
              }
              throw new Error(`Schema validation failed for item ${index} in ${url}: ${itemError}`)
            }
          })
          return {
            ...response,
            data: {
              ...response.data,
              items: validatedItems,
            },
          }
        } catch (validationError) {
          throw validationError
        }
      }

      return response
    },
    swrOptions
  )

  // Flatten data from all pages
  const flatData = result.data?.reduce<T[]>((acc, page) => {
    return acc.concat(page.data.items)
  }, []) || []

  const hasMore = result.data?.[result.data.length - 1]?.data.hasMore || false

  return {
    ...result,
    data: flatData,
    hasMore,
    loadMore: () => result.setSize(result.size + 1),
    refresh: () => result.mutate(),
  }
}

// Mutation hook (POST, PUT, DELETE, etc.)
export function useMutation<TData = unknown, TVariables = unknown>(
  key: string,
  options?: SWRMutationConfiguration<ApiResponse<TData>, ApiError, string, TVariables> & {
    method?: 'post' | 'put' | 'patch' | 'delete'
    schema?: z.ZodType<TData>
  }
) {
  const { method = 'post', schema, ...swrOptions } = options || {}

  const result = useSWRMutation(
    key,
    async (url: string, { arg }: { arg: TVariables }) => {
      let response: ApiResponse<TData>
      const fullUrl = withoutLeadingSlash(url)
      switch (method) {
        case 'post':
          response = await api.post(fullUrl, { json: arg }).json()
          break
        case 'put':
          response = await api.put(fullUrl, { json: arg }).json()
          break
        case 'patch':
          response = await api.patch(fullUrl, { json: arg }).json()
          break
        case 'delete':
          response = await api.delete(fullUrl, { json: arg }).json()
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      if (schema && response.data !== undefined && response.data !== null) {
        try {
          const validatedData = schema.parse(response.data)
          return { ...response, data: validatedData }
        } catch (validationError) {
          if (validationError instanceof ZodError) {
            const errorMessages = validationError.issues.map((issue) =>
              `${issue.path.join('.')}: ${issue.message}`
            ).join('; ')
            throw new Error(`Schema validation failed for ${url}: ${errorMessages}`)
          }
          throw new Error(`Schema validation failed for ${url}: ${validationError}`)
        }
      }

      return response
    },
    swrOptions
  )

  return result
}

export function preloadData<T>(
  key: string,
  schema?: z.ZodType<T>
): Promise<ApiResponse<T>> {
  // Use the exact same fetcher function as useQuery to ensure cache key compatibility
  return preload(key, createFetcher<T>(schema))
} 