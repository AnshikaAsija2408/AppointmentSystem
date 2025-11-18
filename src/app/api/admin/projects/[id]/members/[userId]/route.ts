import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Delete a team member from a project
 * @param request 
 * @param param1 
 * @returns 
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
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

    const { id, userId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid project or user ID' },
        { status: 400 }
      );
    }

    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');

    // Check if project exists
    const project = await projectsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(id),
      isActive: true 
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Remove user from both tbbStaff and clients arrays
    const result = await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $pull: { 
          tbbStaff: userObjectId,
          clients: userObjectId
        } as any,
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Team member removed from project successfully'
    });

  } catch (error) {
    console.error('Error removing team member from project:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member from project' },
      { status: 500 }
    );
  }
}
