import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendPortalInvitation } from '@/service/emailService';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    const { email, name, company } = body;

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
      if (project.clients?.some((clientId: any) => clientId.equals(userId))) {
        return NextResponse.json(
          { error: 'User is already a client of this project' },
          { status: 400 }
        );
      }
    } else {
      // Create new user
      tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = {
        _id: new mongoose.Types.ObjectId(),
        name,
        email,
        password: hashedPassword,
        role: 'client',
        company: company || '',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await usersCollection.insertOne(newUser);
      userId = newUser._id;

      // Send invitation email
      try {
        const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`;
        emailSent = await sendPortalInvitation(email, name, tempPassword, portalUrl);
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        emailSent = false;
      }
    }

    // Add user to project's clients array
    await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $addToSet: { clients: userId },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      message: 'Client added to project successfully',
      client: {
        id: userId,
        name,
        email,
        company: company || '',
        role: 'Client'
      },
      emailSent,
      tempPassword: !existingUser ? tempPassword : undefined
    });

  } catch (error) {
    console.error('Error adding client to project:', error);
    return NextResponse.json(
      { error: 'Failed to add client to project' },
      { status: 500 }
    );
  }
}

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

    // Get project with clients
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

    // Get client details
    const clientIds = project.clients || [];
    const clients = await usersCollection.find(
      { _id: { $in: clientIds } },
      { projection: { password: 0 } } // Exclude password
    ).toArray();

    const formattedClients = clients.map(client => ({
      id: client._id,
      name: client.name,
      email: client.email,
      company: client.company || '',
      role: client.role,
      isVerified: client.isVerified,
      addedAt: client.createdAt
    }));

    return NextResponse.json(formattedClients);

  } catch (error) {
    console.error('Error fetching project clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project clients' },
      { status: 500 }
    );
  }
}
