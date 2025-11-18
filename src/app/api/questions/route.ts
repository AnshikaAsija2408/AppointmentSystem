import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        console.log('POST /api/questions - Starting request processing');
        await connectDB();
        console.log('Database connection established');
        
        // Get user from JWT token
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        console.log('Token retrieved:', token ? 'Present' : 'Missing');
        
        if (!token) {
            console.log('Authentication failed: No token provided');
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const userId = decoded.userId;
        console.log('User authenticated, userId:', userId);
        
        const body = await request.json();
        const { title, message, category } = body;
        console.log('Request body parsed:', { title, category, messageLength: message?.length });

        if (!title || !message) {
            console.log('Validation failed: Missing title or message');
            return NextResponse.json(
                { error: 'Title and message are required' },
                { status: 400 }
            );
        }

        const db = mongoose.connection.db;
        const questionsCollection = db.collection('questions');
        const usersCollection = db.collection('users');
        const projectsCollection = db.collection('projects');
        console.log('Database collections initialized');

        // Get user details
        const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        console.log('User lookup result:', user ? `Found user: ${user.name}` : 'User not found');
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Find user's project (assuming client is part of a project)
        const project = await projectsCollection.findOne({ 
            clients: new mongoose.Types.ObjectId(userId) 
        });
        console.log('Project lookup result:', project ? `Found project: ${project._id}` : 'No project found');

        if (!project) {
            return NextResponse.json(
                { error: 'No project found for user' },
                { status: 404 }
            );
        }

        const newQuestion = {
            _id: new mongoose.Types.ObjectId(),
            title,
            category: category || 'general',
            status: 'OPEN',
            client: new mongoose.Types.ObjectId(userId),
            project: project._id,
            messages: [{
                content: message,
                sender: new mongoose.Types.ObjectId(userId),
                senderRole: 'CLIENT',
                createdAt: new Date()
            }],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log('New question object created with ID:', newQuestion._id);

        await questionsCollection.insertOne(newQuestion);
        console.log('Question successfully inserted into database');

        // Send notification to admin/staff (optional)
        try {
            console.log(`New question submitted: ${title} by ${user.name}`);
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
        }

        console.log('POST /api/questions - Request completed successfully');
        return NextResponse.json({
            message: 'Question submitted successfully',
            question: {
                id: newQuestion._id,
                title,
                status: 'OPEN',
                createdAt: newQuestion.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json(
            { error: 'Failed to submit question' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
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

    const db = mongoose.connection.db;
    const questionsCollection = db.collection('questions');

    // Get user's questions
    const questions = await questionsCollection.find({
      client: new mongoose.Types.ObjectId(userId)
    }).sort({ createdAt: -1 }).toArray();

    const formattedQuestions = questions.map(question => ({
      id: question._id,
      title: question.title,
      category: question.category,
      status: question.status,
      messages: question.messages || [],
      createdAt: question.createdAt,
      updatedAt: question.updatedAt
    }));

    return NextResponse.json(formattedQuestions);

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
