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
    const projectsCollection = db.collection('projects');
    const meetingsCollection = db.collection('meetings');
    const questionsCollection = db.collection('questions');

    // Verify user is admin
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get total projects
    const totalProjects = await projectsCollection.countDocuments({ isActive: true });

    // Get total TBB staff
    const totalStaff = await usersCollection.countDocuments({ role: 'TBB_STAFF' });

    // Get total clients
    const totalClients = await usersCollection.countDocuments({ role: 'CLIENT' });

    // Get total meetings this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalMeetingsThisMonth = await meetingsCollection.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Get total questions
    const totalQuestions = await questionsCollection.countDocuments({});

    // Get recent projects (last 5)
    const recentProjects = await projectsCollection.find(
      { isActive: true },
      { 
        projection: { 
          name: 1, 
          description: 1, 
          tbbStaff: 1, 
          clients: 1, 
          createdAt: 1 
        } 
      }
    )
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

    // Get recent meetings (last 5)
    const recentMeetings = await meetingsCollection.find(
      {},
      { 
        projection: { 
          title: 1, 
          startTime: 1, 
          status: 1, 
          createdAt: 1 
        } 
      }
    )
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

    // Get recent questions (last 5) with populated client info
    const recentQuestions = await questionsCollection.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $unwind: '$clientInfo'
      },
      {
        $project: {
          title: 1,
          status: 1,
          createdAt: 1,
          'clientInfo.name': 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();

    // Format recent projects with staff and client counts
    const formattedRecentProjects = recentProjects.map(project => ({
      id: project._id,
      name: project.name,
      description: project.description,
      staffCount: project.tbbStaff?.length || 0,
      clientCount: project.clients?.length || 0,
      createdAt: project.createdAt
    }));

    // Format recent meetings
    const formattedRecentMeetings = recentMeetings.map(meeting => ({
      id: meeting._id,
      title: meeting.title,
      startTime: meeting.startTime,
      status: meeting.status,
      createdAt: meeting.createdAt
    }));

    // Format recent questions
    const formattedRecentQuestions = recentQuestions.map(question => ({
      id: question._id,
      title: question.title,
      status: question.status,
      clientName: question.clientInfo?.name || 'Unknown',
      createdAt: question.createdAt
    }));

    return NextResponse.json({
      stats: {
        totalProjects,
        totalStaff,
        totalClients,
        totalMeetingsThisMonth,
        totalQuestions
      },
      recentProjects: formattedRecentProjects,
      recentMeetings: formattedRecentMeetings,
      recentQuestions: formattedRecentQuestions
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}