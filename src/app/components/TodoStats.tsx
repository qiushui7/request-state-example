import type { TodoStats } from '@/lib/schemas/todo'

interface TodoStatsProps {
  stats: TodoStats | undefined
  isLoading: boolean
}

export default function TodoStatsPanel({ stats, isLoading }: TodoStatsProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="w-16 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </section>
    )
  }

  if (!stats) return null

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        <p className="text-xs text-gray-500 mt-1">From Zustand Store</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Completed</h3>
        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        <p className="text-xs text-gray-500 mt-1">Real-time computed</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Pending</h3>
        <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        <p className="text-xs text-gray-500 mt-1">Real-time computed</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Completion Rate</h3>
        <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
        <p className="text-xs text-gray-500 mt-1">Real-time computed</p>
      </div>
    </section>
  )
}