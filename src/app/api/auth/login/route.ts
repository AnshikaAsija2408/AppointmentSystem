import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Simple user lookup without mongoose model complexity
async function findUserByEmail(email: string) {
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  return await usersCollection.findOne({ email });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await findUserByEmail(email.toLowerCase());
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role.toUpperCase() // Normalize role to uppercase in JWT
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );

    // Prepare user data (without password) - normalize role to uppercase
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.toUpperCase(), // Normalize role to uppercase
      projects: user.projects || [],
      googleCalendarId: user.googleCalendarId,
      invitedBy: user.invitedBy,
      invitedAt: user.invitedAt,
      needsPasswordChange: user.needsPasswordChange || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Set cookie for server-side authentication
    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
      token
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
