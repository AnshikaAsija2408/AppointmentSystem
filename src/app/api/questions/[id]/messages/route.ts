import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // Get user from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    const { id: questionId } = await params;

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const questionsCollection = db.collection('questions');

    // Get user details
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Get the question
    const question = await questionsCollection.findOne({
      _id: new mongoose.Types.ObjectId(questionId)
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this question
    if (user.role === 'CLIENT') {
      // Clients can only add messages to their own questions
      if (question.client.toString() !== userId) {
        return NextResponse.json(
          { error: 'Access denied to this question' },
          { status: 403 }
        );
      }
    } else if (user.role === 'TBB_STAFF') {
      // Staff can only add messages to questions from their assigned projects
      const projectsCollection = db.collection('projects');
      const project = await projectsCollection.findOne({
        _id: question.project,
        staff: new mongoose.Types.ObjectId(userId)
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Access denied to this question' },
          { status: 403 }
        );
      }
    }
    // Admins can access all questions (no additional check needed)

    // Create new message
    const newMessage = {
      content: message.trim(),
      sender: new mongoose.Types.ObjectId(userId),
      senderRole: user.role.toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add message to question
    await questionsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(questionId) },
      {
        $push: { messages: newMessage } as any,
        $set: { updatedAt: new Date() }
      }
    );

    // Return the new message with sender details
    return NextResponse.json({
      message: 'Message added successfully',
      newMessage: {
        ...newMessage,
        senderName: user.name,
        senderEmail: user.email
      }
    });

  } catch (error) {
    console.error('Error adding message to question:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // Get user from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;
    const { id: questionId } = await params;

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const questionsCollection = db.collection('questions');

    // Get user details
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get question with full details including populated message senders
    const questions = await questionsCollection.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(questionId) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          as: 'clientDetails'
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectDetails'
        }
      }
    ]).toArray();

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const question = questions[0];

    // Check if user has access to this question
    if (user.role === 'CLIENT') {
      if (question.client.toString() !== userId) {
        return NextResponse.json(
          { error: 'Access denied to this question' },
          { status: 403 }
        );
      }
    } else if (user.role === 'TBB_STAFF') {
      const projectsCollection = db.collection('projects');
      const project = await projectsCollection.findOne({
        _id: question.project,
        staff: new mongoose.Types.ObjectId(userId)
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Access denied to this question' },
          { status: 403 }
        );
      }
    }

    // Get all message senders to populate names
    const senderIds = question.messages.map((msg: any) => msg.sender);
    const senders = await usersCollection.find({
      _id: { $in: senderIds }
    }).toArray();

    // Create sender lookup map
    const senderMap = new Map();
    senders.forEach(sender => {
      senderMap.set(sender._id.toString(), {
        name: sender.name,
        email: sender.email
      });
    });

    // Format messages with sender details
    const messagesWithSenders = question.messages.map((message: any) => {
      const sender = senderMap.get(message.sender.toString());
      return {
        content: message.content,
        sender: message.sender.toString(),
        senderRole: message.senderRole.toUpperCase(), // Normalize to uppercase
        senderName: sender ? sender.name : 'Unknown User',
        senderEmail: sender ? sender.email : null,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      };
    });

    // Format the response
    const formattedQuestion = {
      id: question._id.toString(),
      title: question.title,
      category: question.category,
      status: question.status,
      messages: messagesWithSenders,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      client: question.clientDetails[0] ? {
        id: question.clientDetails[0]._id.toString(),
        name: question.clientDetails[0].name,
        email: question.clientDetails[0].email
      } : null,
      project: question.projectDetails[0] ? {
        id: question.projectDetails[0]._id.toString(),
        name: question.projectDetails[0].name,
        description: question.projectDetails[0].description
      } : null
    };

    return NextResponse.json(formattedQuestion);

  } catch (error) {
    console.error('Error fetching question details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question details' },
      { status: 500 }
    );
  }
}
