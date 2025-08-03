'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTodoStats } from '@/lib/hooks'
import type { TodoStats } from '@/lib/schemas/todo'

// Chart data interface
interface ChartData {
  name: string
  value: number
  color: string
}

// Color configuration
const COLORS = {
  completed: '#10b981', // green-500
  pending: '#f59e0b',   // amber-500
  total: '#6b7280',     // gray-500
}

// Props interface for the combined component
interface TodoStatsProps {
  stats?: TodoStats
  isLoading?: boolean
}

// Custom Tooltip component
interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold">{data.value}</span>
        </p>
      </div>
    )
  }
  return null
}



// Combined statistics component with both cards and chart
export function TodoStatsChart({ stats: propStats, isLoading: propIsLoading }: TodoStatsProps = {}) {
  const { data: hookStats, isLoading: hookIsLoading, error } = useTodoStats()

  // Use props if provided, otherwise use hook data
  const stats = propStats || hookStats
  const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Task Statistics</h3>
        <div className="animate-pulse">
          {/* Stats loading */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-4 bg-gray-200 rounded mb-2 mx-auto"></div>
                <div className="w-8 h-8 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
          {/* Chart loading */}
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Task Statistics</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Failed to load statistics</p>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!stats) return null

  // Prepare chart data
  const chartData: ChartData[] = [
    {
      name: 'Completed',
      value: stats.completed,
      color: COLORS.completed,
    },
    {
      name: 'Pending',
      value: stats.pending,
      color: COLORS.pending,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Task Statistics</h3>

      {/* Statistics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Total</h4>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">All tasks</p>
        </div>
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Completed</h4>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-1">Finished</p>
        </div>
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Pending</h4>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Remaining</p>
        </div>
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Rate</h4>
          <p className="text-2xl font-bold text-purple-600">{(stats.completionRate).toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Progress</p>
        </div>
      </div>

      {/* Chart visualization */}
      {stats.total > 0 ? (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Chart */}
          <div className="relative flex-shrink-0">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center statistics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                <div className="text-sm text-gray-500 mb-2">Total Tasks</div>
                <div className="text-lg font-semibold text-blue-600">
                  {(stats.completionRate).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
          </div>

          {/* Legend with detailed stats */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-500">Completed Tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-amber-600">{stats.pending}</div>
                <div className="text-sm text-gray-500">Pending Tasks</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">No tasks available</p>
          </div>
        </div>
      )}
    </div>
  )
}