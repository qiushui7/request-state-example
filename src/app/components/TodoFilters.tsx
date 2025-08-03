import { CATEGORIES, PRIORITIES, COMPLETION_STATUS, type TodoFilters } from '@/lib/schemas/todo'

interface TodoFiltersProps {
  filters: TodoFilters
  onFilterChange: (key: keyof TodoFilters, value: string) => void
  showAddForm: boolean
  onToggleAddForm: () => void
}

export default function TodoFiltersPanel({ 
  filters, 
  onFilterChange, 
  showAddForm, 
  onToggleAddForm 
}: TodoFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PRIORITIES.map(pri => (
            <option key={pri.value} value={pri.value}>{pri.label}</option>
          ))}
        </select>

        <select
          value={filters.completed}
          onChange={(e) => onFilterChange('completed', e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {COMPLETION_STATUS.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={onToggleAddForm}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {showAddForm ? 'Cancel' : '+ Add Todo'}
      </button>
    </div>
  )
}