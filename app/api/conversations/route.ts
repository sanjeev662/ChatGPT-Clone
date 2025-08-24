import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { DBConversation } from '@/lib/models/conversation'

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    const collection = db.collection<DBConversation>('conversations')
    
    const conversations = await collection
      .find({})
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const conversation: DBConversation = await req.json()
    
    if (!conversation.id || !conversation.title) {
      return NextResponse.json(
        { error: 'Conversation ID and title are required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<DBConversation>('conversations')
    
    const newConversation: DBConversation = {
      ...conversation,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: conversation.messages || [],
    }

    await collection.insertOne(newConversation)
    
    return NextResponse.json(newConversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const conversation: DBConversation = await req.json()
    
    if (!conversation.id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<DBConversation>('conversations')
    
    // Remove _id field to avoid MongoDB error
    const { _id, ...conversationWithoutId } = conversation
    
    const result = await collection.updateOne(
      { id: conversation.id },
      {
        $set: {
          ...conversationWithoutId,
          updatedAt: new Date(),
        }
      },
      { upsert: true } // Create if doesn't exist
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('id')
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection<DBConversation>('conversations')
    
    const result = await collection.deleteOne({ id: conversationId })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
