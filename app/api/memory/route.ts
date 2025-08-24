import { NextRequest, NextResponse } from 'next/server'
import { memoryService } from '@/lib/memory'

export async function POST(req: NextRequest) {
  try {
    const { action, conversationId, messages, userId, query } = await req.json()

    switch (action) {
      case 'create':
        if (!conversationId || !messages) {
          return NextResponse.json(
            { error: 'conversationId and messages are required' },
            { status: 400 }
          )
        }
        const memory = await memoryService.createMemory(conversationId, messages, userId)
        return NextResponse.json(memory)

      case 'update':
        if (!conversationId || !messages) {
          return NextResponse.json(
            { error: 'conversationId and messages are required' },
            { status: 400 }
          )
        }
        await memoryService.updateMemory(conversationId, messages)
        return NextResponse.json({ success: true })

      case 'search':
        if (!query) {
          return NextResponse.json(
            { error: 'query is required for search' },
            { status: 400 }
          )
        }
        const results = await memoryService.searchMemories(query, userId)
        return NextResponse.json(results)

      case 'getRelevant':
        if (!query) {
          return NextResponse.json(
            { error: 'query is required' },
            { status: 400 }
          )
        }
        const relevantMemories = await memoryService.getRelevantContext(query, userId)
        return NextResponse.json(relevantMemories)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Memory API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    const memory = await memoryService.getMemory(conversationId)
    return NextResponse.json(memory)
  } catch (error) {
    console.error('Memory GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    await memoryService.deleteMemory(conversationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Memory DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
