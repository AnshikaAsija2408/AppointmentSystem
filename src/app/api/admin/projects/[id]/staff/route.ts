import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendPortalInvitation } from '@/service/emailService';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


/**
 * Add a staff member to a project
 * @param request 
 * @param param1 
 * @returns 
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
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

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    let userId;
    let emailSent = false;
    let tempPassword: string | undefined;

    if (existingUser) {
      userId = existingUser._id;
      
      // Check if user is already in the project
      if (project.tbbStaff?.some((staffId: any) => staffId.equals(userId))) {
        return NextResponse.json(
          { error: 'User is already a staff member of this project' },
          { status: 400 }
        );
      }
    } else {
      // Create new user
      
      // const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      tempPassword = "Staff@123"
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = {
        _id: new mongoose.Types.ObjectId(),
        name,
        email,
        password: hashedPassword,
        role: 'TBB_STAFF',
        isVerified: false,
        needsPasswordChange: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await usersCollection.insertOne(newUser);
      userId = newUser._id;

      // Send invitation email
      try {
        const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`;
        console.log(`Attempting to send invitation email to ${email}...`);
        console.log(`Portal URL: ${portalUrl}`);
        console.log(`Temp Password: ${tempPassword}`);
        console.log(`Email Config - USER: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}, PASS: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);
        
        emailSent = await sendPortalInvitation(email, name, tempPassword, portalUrl);
        
        if (emailSent) {
          console.log(`✅ Invitation email sent successfully to ${email}`);
        } else {
          console.log(`❌ Failed to send invitation email to ${email}`);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        emailSent = false;
      }
    }

    // Add user to project's tbbStaff array
    await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $addToSet: { tbbStaff: userId },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      message: 'Staff member added to project successfully',
      staff: {
        id: userId,
        name,
        email,
        role: role || 'Staff Member'
      },
      emailSent,
      tempPassword: !existingUser ? tempPassword : undefined
    });

  } catch (error) {
    console.error('Error adding staff to project:', error);
    return NextResponse.json(
      { error: 'Failed to add staff to project' },
      { status: 500 }
    );
  }
}


/**
 * Get all staff members for a project
 * @param request 
 * @param param1 
 * @returns 
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');
    const usersCollection = db.collection('users');

    // Get project with staff
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

    // Get staff details
    const staffIds = project.tbbStaff || [];
    const staff = await usersCollection.find(
      { _id: { $in: staffIds } },
      { projection: { password: 0 } } // Exclude password
    ).toArray();

    const formattedStaff = staff.map(member => ({
      id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      isVerified: member.isVerified,
      addedAt: member.createdAt
    }));

    return NextResponse.json(formattedStaff);

  } catch (error) {
    console.error('Error fetching project staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project staff' },
      { status: 500 }
    );
  }
}
