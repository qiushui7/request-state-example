import { useSWRConfig } from 'swr'
import { useCallback } from 'react'
import { ApiResponse } from '../api'

/**
 * Hook for optimistic updates with automatic rollback on failure
 * Provides a way to immediately update UI while API call is in progress
 */
export function useOptimisticUpdate<T>() {
  const { mutate } = useSWRConfig()

  const optimisticUpdate = useCallback(
    async <TVariables>(
      key: string,
      updateFn: (currentData: ApiResponse<T> | undefined) => ApiResponse<T>,
      asyncUpdateFn: (variables: TVariables) => Promise<ApiResponse<T>>,
      variables: TVariables
    ) => {
      // Store original data for potential rollback
      const originalData = mutate(key, undefined, { revalidate: false })

      try {
        // 1. Apply optimistic update to local cache
        await mutate(
          key,
          updateFn,
          { revalidate: false }
        )

        // 2. Execute actual API call
        const result = await asyncUpdateFn(variables)

        // 3. Update cache with real API response
        await mutate(key, result, { revalidate: false })

        return result
      } catch (error) {
        // 4. Rollback to original data on failure
        await mutate(key, originalData, { revalidate: false })
        throw error
      }
    },
    [mutate]
  )

  return {
    optimisticUpdate,
  }
}

/**
 * Hook for batch optimistic updates across multiple cache keys
 * Useful for operations that affect multiple data sources simultaneously
 */
export function useBatchOptimistic<T>() {
  const { mutate } = useSWRConfig()

  const batchUpdate = useCallback(
    async (
      updates: Array<{
        key: string
        updateFn: (currentData: ApiResponse<T> | undefined) => ApiResponse<T>
      }>,
      asyncUpdateFn: () => Promise<void>
    ) => {
      // Store original data for all keys for potential rollback
      const originalDataMap = new Map<string, unknown>()
      
      for (const { key } of updates) {
        originalDataMap.set(key, mutate(key, undefined, { revalidate: false }))
      }

      try {
        // 1. Apply all optimistic updates simultaneously
        await Promise.all(
          updates.map(({ key, updateFn }) =>
            mutate(key, updateFn, { revalidate: false })
          )
        )

        // 2. Execute actual API call
        await asyncUpdateFn()

        // 3. Revalidate all affected keys to get fresh data
        await Promise.all(updates.map(({ key }) => mutate(key)))
      } catch (error) {
        // 4. Rollback all keys to their original state on failure
        await Promise.all(
          updates.map(({ key }) => 
            mutate(key, originalDataMap.get(key), { revalidate: false })
          )
        )
        throw error
      }
    },
    [mutate]
  )

  return { batchUpdate }
}

/**
 * Hook for optimistic list operations (add, remove, update items)
 * Provides common patterns for list manipulations with rollback support
 */
export function useOptimisticList<T>() {
  const { optimisticUpdate } = useOptimisticUpdate<T[]>()

  const addItem = useCallback(
    async (
      key: string,
      newItem: T,
      asyncAddFn: (item: T) => Promise<ApiResponse<T[]>>
    ) => {
      return optimisticUpdate(
        key,
        (currentData) => ({
          ...currentData,
          data: currentData?.data ? [...currentData.data, newItem] : [newItem],
        } as ApiResponse<T[]>),
        () => asyncAddFn(newItem),
        newItem
      )
    },
    [optimisticUpdate]
  )

  const removeItem = useCallback(
    async (
      key: string,
      itemId: string | number,
      asyncRemoveFn: (id: string | number) => Promise<ApiResponse<T[]>>,
      idField: keyof T = 'id' as keyof T
    ) => {
      return optimisticUpdate(
        key,
        (currentData) => ({
          ...currentData,
          data: currentData?.data?.filter(item => item[idField] !== itemId) || [],
        } as ApiResponse<T[]>),
        () => asyncRemoveFn(itemId),
        itemId
      )
    },
    [optimisticUpdate]
  )

  const updateItem = useCallback(
    async (
      key: string,
      itemId: string | number,
      updates: Partial<T>,
      asyncUpdateFn: (id: string | number, updates: Partial<T>) => Promise<ApiResponse<T[]>>,
      idField: keyof T = 'id' as keyof T
    ) => {
      return optimisticUpdate(
        key,
        (currentData) => ({
          ...currentData,
          data: currentData?.data?.map(item => 
            item[idField] === itemId ? { ...item, ...updates } : item
          ) || [],
        } as ApiResponse<T[]>),
        () => asyncUpdateFn(itemId, updates),
        { itemId, updates }
      )
    },
    [optimisticUpdate]
  )

  return {
    addItem,
    removeItem,
    updateItem,
  }
} 