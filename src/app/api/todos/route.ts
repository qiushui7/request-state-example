import { NextResponse } from 'next/server'
import { getTodos, createTodo } from '@/lib/db/todos'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category') || undefined
  const completed = searchParams.get('completed') || undefined
  const priority = searchParams.get('priority') || undefined

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))

  try {
    const result = await getTodos({
      category,
      completed,
      priority,
      page,
      limit,
    })

    return NextResponse.json({
      code: 200,
      data: {
        items: result.todos,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.page < result.totalPages,
      },
      message: '待办事项列表获取成功',
    })
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      {
        code: 500,
        error: '服务器错误',
        message: '获取待办事项列表失败',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400))

  // Validate required fields
  if (!body.title?.trim()) {
    return NextResponse.json(
      {
        code: 400,
        error: '标题不能为空',
        message: '请输入待办事项标题',
      },
      { status: 400 }
    )
  }

  try {
    const newTodo = await createTodo({
      title: body.title.trim(),
      description: body.description?.trim() || '',
      completed: false,
      priority: body.priority || 'medium',
      category: body.category || 'personal',
    })

    return NextResponse.json({
      code: 200,
      data: newTodo,
      message: '待办事项创建成功',
    })
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json(
      {
        code: 500,
        error: '服务器错误',
        message: '创建待办事项失败',
      },
      { status: 500 }
    )
  }
}