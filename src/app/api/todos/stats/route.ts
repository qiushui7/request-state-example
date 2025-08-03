import { NextResponse } from 'next/server'
import { getTodoStats } from '@/lib/db/todos'

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150))

  try {
    const stats = await getTodoStats()

    return NextResponse.json({
      code: 200,
      data: stats,
      message: '统计数据获取成功',
    })
  } catch (error) {
    console.error('Error fetching todo stats:', error)
    return NextResponse.json(
      {
        code: 500,
        error: '服务器错误',
        message: '获取统计数据失败',
      },
      { status: 500 }
    )
  }
}