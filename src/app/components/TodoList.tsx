import type { Todo } from '@/lib/schemas/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  total: number
  page: number
  hasMore: boolean
  isLoading: boolean
  error: Error | null
  onToggleComplete: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  onUpdate: (todo: Todo) => void
  onPageChange: (page: number) => void
}

export default function TodoList({
  todos,
  total,
  page,
  hasMore,
  isLoading,
  error,
  onToggleComplete,
  onDelete,
  onUpdate,
  onPageChange,
}: TodoListProps) {
  if (isLoading) {
    return (
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Todo List</h2>
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4">
              <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
              <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Todo List</h2>
        <div className="text-sm text-gray-600">
          Total {total} items, Page {page}
        </div>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded mb-4">
          Loading failed: {error.message}
        </div>
      )}

      {todos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No todos yet</p>
          <p className="text-sm">Click the &quot;Add Todo&quot; button above to create your first todo</p>
        </div>
      )}

      {/* Pagination controls */}
      {total > 8 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || isLoading}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore || isLoading}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}