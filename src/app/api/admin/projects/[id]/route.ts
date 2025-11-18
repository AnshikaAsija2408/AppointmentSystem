import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


/**
 * Get project details by ID
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

    // Get user details for populated fields
    const usersCollection = db.collection('users');
    
    // Get creator details
    const creator = await usersCollection.findOne(
      { _id: project.createdBy },
      { projection: { name: 1, email: 1 } }
    );

    // Get staff details
    const staff = await usersCollection.find(
      { _id: { $in: project.tbbStaff || [] } },
      { projection: { name: 1, email: 1, role: 1 } }
    ).toArray();

    // Get client details
    const clients = await usersCollection.find(
      { _id: { $in: project.clients || [] } },
      { projection: { name: 1, email: 1, role: 1 } }
    ).toArray();

    return NextResponse.json({
      id: project._id,
      name: project.name,
      description: project.description,
      isActive: project.isActive,
      tbbStaff: staff,
      clients: clients,
      createdBy: creator,
      teamSize: (project.tbbStaff?.length || 0) + (project.clients?.length || 0),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}


/**
 * Update project details by ID
 * @param request 
 * @param param1 
 * @returns 
 * TODO: Implement validation for project updates, such as checking if the user is authorized to update the project
 */


export async function PUT(
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
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');

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

    // Update project fields
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const result = await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get updated project
    const updatedProject = await projectsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    });

    return NextResponse.json({
      message: 'Project updated successfully',
      project: {
        id: updatedProject._id,
        name: updatedProject.name,
        description: updatedProject.description,
        isActive: updatedProject.isActive,
        teamSize: (updatedProject.tbbStaff?.length || 0) + (updatedProject.clients?.length || 0),
        updatedAt: updatedProject.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}


/**
 * Delete a project by ID
 * @param request 
 * @param param1 
 * @returns 
 * 
 * TODO: Implement soft delete functionality and check if the clients need to be removed from the project                                                                                                        
 * 
 */

export async function DELETE(
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

    // Soft delete by setting isActive to false
    const result = await projectsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
