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

    // Get user details
    const user = await usersCollection.findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find user's project
    let project = null;
    
    // Check if user is a client in any project
    const clientProject = await projectsCollection.findOne({ 
      clients: new mongoose.Types.ObjectId(userId) 
    });
    
    // Check if user is staff in any project
    const staffProject = await projectsCollection.findOne({ 
      tbbStaff: new mongoose.Types.ObjectId(userId) 
    });

    // Prefer client project over staff project for the main project display
    project = clientProject || staffProject;

    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      needsPasswordChange: user.needsPasswordChange || false,
      googleCalendarId: user.googleCalendarId,
      googleAccessToken: user.googleAccessToken ? true : false, // Only return boolean for security
      googleRefreshToken: user.googleRefreshToken ? true : false, // Only return boolean for security
      googleTokenExpiry: user.googleTokenExpiry,
      project: project ? {
        id: project._id,
        name: project.name,
        description: project.description,
        isActive: project.isActive,
        userRole: clientProject ? 'client' : 'staff'
      } : null,
      createdAt: user.createdAt
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
