import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendPortalInvitation } from '@/service/emailService';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function POST(
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
    const usersCollection = db.collection('users');

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

    // Get user details
    const user = await usersCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(userId) 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the project
    const isClient = project.clients?.some((clientId: any) => clientId.equals(user._id));
    const isStaff = project.tbbStaff?.some((staffId: any) => staffId.equals(user._id));

    if (!isClient && !isStaff) {
      return NextResponse.json(
        { error: 'User is not a member of this project' },
        { status: 400 }
      );
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user's password
    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          needsPasswordChange: true,
          updatedAt: new Date()
        }
      }
    );

    // Send invitation email
    let emailSent = false;
    try {
      const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`;
      emailSent = await sendPortalInvitation(user.email, user.name, tempPassword, portalUrl);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      emailSent = false;
    }

    return NextResponse.json({
      message: emailSent ? 'Invitation email sent successfully' : 'Failed to send invitation email',
      emailSent,
      tempPassword
    });

  } catch (error) {
    console.error('Error resending invitation email:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation email' },
      { status: 500 }
    );
  }
} 