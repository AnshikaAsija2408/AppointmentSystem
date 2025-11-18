import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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
    const usersCollection = db.collection('users');
    const questionsCollection = db.collection('questions');
    const projectsCollection = db.collection('projects');

    // Verify user is staff
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user || user.role !== 'TBB_STAFF') {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      );
    }

    // Get staff's projects
    const staffProjects = await projectsCollection.find({
      tbbStaff: new mongoose.Types.ObjectId(userId)
    }).toArray();

    const projectIds = staffProjects.map(project => project._id);

    // Get questions for staff's projects
    const questions = await questionsCollection.aggregate([
      {
        $match: {
          project: { $in: projectIds }
        }
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
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    const formattedQuestions = questions.map(question => ({
      id: question._id,
      title: question.title,
      category: question.category,
      status: question.status,
      messages: question.messages || [],
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
    }));

    return NextResponse.json({
      questions: formattedQuestions,
      projects: staffProjects.map(project => ({
        id: project._id,
        name: project.name,
        description: project.description,
        isActive: project.isActive,
        clientCount: project.clients?.length || 0
      }))
    });

  } catch (error) {
    console.error('Error fetching staff questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
