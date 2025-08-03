import { NextResponse } from 'next/server'
import { findTodoById, updateTodo, deleteTodo } from '@/lib/db/todos'
import { Todo } from '@/lib/schemas/todo'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id: paramId } = await params
  const id = parseInt(paramId)

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200))

  try {
    const todo = await findTodoById(id)

    if (!todo) {
      return NextResponse.json(
        {
          code: 404,
          error: '待办事项不存在',
          message: '未找到指定的待办事项',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 200,
      data: todo,
      message: '待办事项详情获取成功',
    })
  } catch (error) {
    console.error('Error fetching todo:', error)
    return NextResponse.json(
      {
        code: 500,
        error: '服务器错误',
        message: '获取待办事项详情失败',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: paramId } = await params
  const id = parseInt(paramId)
  const body = await request.json()

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))

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
    const updatedTodo = await updateTodo(id, {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      completed: Boolean(body.completed),
      priority: body.priority || 'medium',
      category: body.category || 'personal',
    })

    if (!updatedTodo) {
      return NextResponse.json(
        {
          code: 404,
          error: '待办事项不存在',
          message: '未找到指定的待办事项',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 200,
      data: updatedTodo,
      message: '待办事项更新成功',
    })
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json(
      {
        code: 500,
        error: '服务器错误',
        message: '更新待办事项失败',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: paramId } = await params
  const id = parseInt(paramId)
  const body = await request.json()

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200))

  // Validate title if provided
  if (body.title !== undefined && !body.title.trim()) {
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
    // Prepare updates object
    const updates: Partial<Todo> = {}
    
    if (body.title !== undefined) {
      updates.title = body.title.trim()
    }
    
    if (body.description !== undefined) {
      updates.description = body.description.trim()
    }
    
    if (body.completed !== undefined) {
      updates.completed = Boolean(body.completed)
    }
    
    if (body.priority !== undefined) {
      updates.priority = body.priority
    }
    
    if (body.category !== undefined) {
      updates.category = body.category
    }

    const updatedTodo = await updateTodo(id, updates)

    if (!updatedTodo) {
      return NextResponse.json(
        {
          code: 404,
          error: '待办事项不存在',
          message: '未找到指定的待办事项',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 200,
      data: updatedTodo,
      message: '待办事项部分更新成功',
    })
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json(
      {
        code: 500,
        error: '服务器错误',
        message: '更新待办事项失败',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id: paramId } = await params
  const id = parseInt(paramId)

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 250))

  try {
    const deletedTodo = await deleteTodo(id)

    if (!deletedTodo) {
      return NextResponse.json(
        {
          code: 404,
          error: '待办事项不存在',
          message: '未找到指定的待办事项',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 200,
      data: deletedTodo,
      message: '待办事项删除成功',
    })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json(
      {
        code: 500,
        error: '服务器错误',
        message: '删除待办事项失败',
      },
      { status: 500 }
    )
  }
}