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

    // Verify user is admin or staff
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TBB_STAFF')) {
      return NextResponse.json(
        { error: 'Admin or staff access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message, status } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
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

    // For staff, verify they have access to this question's project
    if (user.role === 'TBB_STAFF') {
      const projectsCollection = db.collection('projects');
      const project = await projectsCollection.findOne({
        _id: question.project,
        tbbStaff: new mongoose.Types.ObjectId(userId)
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Access denied to this question' },
          { status: 403 }
        );
      }
    }

    // Add response message
    const newMessage = {
      content: message,
      sender: new mongoose.Types.ObjectId(userId),
      senderRole: user.role === 'ADMIN' ? 'ADMIN' : 'STAFF',
      createdAt: new Date()
    };

    const updateData: any = {
      $push: { messages: newMessage },
      $set: { updatedAt: new Date() }
    };
    if (status && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      updateData.$set.status = status;
    }

    await questionsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(questionId) },
      updateData
    );

    return NextResponse.json({
      message: 'Response added successfully',
      newMessage,
      status: status || question.status
    });

  } catch (error) {
    console.error('Error adding question response:', error);
    return NextResponse.json(
      { error: 'Failed to add response' },
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

    // Verify user is admin or staff
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TBB_STAFF')) {
      return NextResponse.json(
        { error: 'Admin or staff access required' },
        { status: 403 }
      );
    }

    // Get question with full details
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
      },
      {
        $lookup: {
          from: 'users',
          localField: 'messages.sender',
          foreignField: '_id',
          as: 'messageUsers'
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

    // For staff, verify they have access to this question's project
    if (user.role === 'TBB_STAFF') {
      const projectsCollection = db.collection('projects');
      const project = await projectsCollection.findOne({
        _id: question.project,
        tbbStaff: new mongoose.Types.ObjectId(userId)
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Access denied to this question' },
          { status: 403 }
        );
      }
    }

    // Format messages with sender details
    const messagesWithUsers = question.messages.map((message: any) => {
      const sender = question.messageUsers.find((user: any) => 
        user._id.toString() === message.sender.toString()
      );
      return {
        ...message,
        senderName: sender ? sender.name : 'Unknown User',
        senderEmail: sender ? sender.email : null
      };
    });

    const formattedQuestion = {
      id: question._id,
      title: question.title,
      category: question.category,
      status: question.status,
      messages: messagesWithUsers,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      client: question.clientDetails[0] ? {
        id: question.clientDetails[0]._id,
        name: question.clientDetails[0].name,
        email: question.clientDetails[0].email
      } : null,
      project: question.projectDetails[0] ? {
        id: question.projectDetails[0]._id,
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Only admins and staff can update question status
    if (user.role === 'CLIENT') {
      return NextResponse.json(
        { error: 'Access denied. Only admin and staff can update question status.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED' },
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

    // Check if staff user has access to this question (via project assignment)
    if (user.role === 'TBB_STAFF') {
      const projectsCollection = db.collection('projects');
      const project = await projectsCollection.findOne({
        _id: question.project,
        tbbStaff: new mongoose.Types.ObjectId(userId)
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Access denied to this question' },
          { status: 403 }
        );
      }
    }

    // Update question status
    await questionsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(questionId) },
      {
        $set: { 
          status: status.toUpperCase(),
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'Question status updated successfully',
      questionId,
      newStatus: status.toUpperCase()
    });

  } catch (error) {
    console.error('Error updating question status:', error);
    return NextResponse.json(
      { error: 'Failed to update question status' },
      { status: 500 }
    );
  }
}
