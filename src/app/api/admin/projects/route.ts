import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Project from '@/models/Project';

/**
 * Create a new project 
 * @param request 
 * @returns 
 */

export async function POST(request: NextRequest) {
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
    
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'Project name cannot exceed 255 characters' },
        { status: 400 }
      );
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        { error: 'Description cannot exceed 1000 characters' },
        { status: 400 }
      );
    }

    // Create new project using the Project model
    const newProject = new Project({
      name: name.trim(),
      description: description?.trim() || '',
      isActive: true,
      tbbStaff: [],
      clients: [],
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    const savedProject = await newProject.save();

    return NextResponse.json({
      message: 'Project created successfully',
      project: {
        id: savedProject._id,
        name: savedProject.name,
        description: savedProject.description,
        isActive: savedProject.isActive,
        teamSize: savedProject.teamSize,
        createdAt: savedProject.createdAt,
        updatedAt: savedProject.updatedAt
      }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

/**
 * Get all active projects
 * @returns 
 */

export async function GET() {
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

    // Fetch projects using direct collection access for better reliability
    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');
    const usersCollection = db.collection('users');

    const projects = await projectsCollection.find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    // Get creator details for each project
    const formattedProjects = await Promise.all(
      projects.map(async (project) => {
        const creator = await usersCollection.findOne(
          { _id: project.createdBy },
          { projection: { name: 1, email: 1 } }
        );

        return {
          id: project._id,
          name: project.name,
          description: project.description,
          isActive: project.isActive,
          staffCount: project.tbbStaff?.length || 0,
          clientCount: project.clients?.length || 0,
          teamSize: (project.tbbStaff?.length || 0) + (project.clients?.length || 0),
          createdBy: creator,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        };
      })
    );

    return NextResponse.json(formattedProjects);

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
