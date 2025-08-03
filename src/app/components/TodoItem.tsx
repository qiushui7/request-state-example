import { useState } from 'react'
import type { Todo } from '@/lib/schemas/todo'
import { getPriorityStyle, formatDate } from '@/lib/utils/todo'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  onUpdate: (todo: Todo) => void
}

export default function TodoItem({ todo, onToggleComplete, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(todo)

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(todo)
    setIsEditing(false)
  }

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      todo.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      {isEditing ? (
        // 编辑模式
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              PUT Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Display mode
        <>
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {todo.title}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityStyle(todo.priority)}`}>
              {todo.priority}
            </span>
          </div>

          {todo.description && (
            <p className={`text-sm mb-3 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {todo.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="px-2 py-1 bg-gray-100 rounded">{todo.category}</span>
            <span>{formatDate(todo.createdAt)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onToggleComplete(todo)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                todo.completed
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {todo.completed ? 'PATCH Undo' : 'PATCH Complete'}
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(todo)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              DELETE
            </button>
          </div>
        </>
      )}
    </div>
  )
}