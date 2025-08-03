import type { CreateTodoInput } from '@/lib/schemas/todo'

interface TodoFormProps {
  formData: CreateTodoInput
  onFieldChange: <K extends keyof CreateTodoInput>(key: K, value: CreateTodoInput[K]) => void
  onSubmit: () => void
  isSubmitting: boolean
  isValid: boolean
  error: Error | null
}

export default function TodoForm({ 
  formData, 
  onFieldChange, 
  onSubmit, 
  isSubmitting, 
  isValid, 
  error 
}: TodoFormProps) {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-4">Add New Todo</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter todo title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter detailed description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => onFieldChange('priority', e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => onFieldChange('category', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="learning">Learning</option>
            <option value="health">Health</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'POST Creating...' : 'POST Create'}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2">
          Creation failed: {error.message}
        </p>
      )}
    </div>
  )
}