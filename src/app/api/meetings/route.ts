import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { sendMeetingInvitation } from '@/service/emailService';

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
    const { title, description, startTime, endTime, meetingType, projectId } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Title, start time, and end time are required' },
        { status: 400 }
      );
    }

    const db = mongoose.connection.db;
    const meetingsCollection = db.collection('meetings');
    const usersCollection = db.collection('users');
    const projectsCollection = db.collection('projects');

    // Get user details
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get admin user with Google tokens
    const admin = await usersCollection.findOne(
      { role: 'ADMIN' },
      { 
        projection: { 
          googleAccessToken: 1, 
          googleRefreshToken: 1, 
          googleTokenExpiry: 1, 
          googleCalendarId: 1,
          name: 1,
          email: 1
        } 
      }
    );

    if (!admin || !admin.googleAccessToken) {
      return NextResponse.json(
        { error: 'Admin Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = admin.googleAccessToken;
    if (admin.googleTokenExpiry && new Date() > admin.googleTokenExpiry) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: admin.googleRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.access_token;
        
        // Update the token in database
        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + refreshData.expires_in);
        
        await usersCollection.updateOne(
          { _id: admin._id },
          {
            $set: {
              googleAccessToken: accessToken,
              googleTokenExpiry: tokenExpiry,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    // Create Google Calendar event
    const eventData = {
      summary: title,
      description: description || '',
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: user.email, displayName: user.name },
        { email: admin.email, displayName: admin.name },
      ],
      conferenceData: {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${admin.googleCalendarId || 'primary'}/events?conferenceDataVersion=1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!calendarResponse.ok) {
      console.error('Calendar API error:', await calendarResponse.text());
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }

    const calendarEvent = await calendarResponse.json();
    const googleMeetLink = calendarEvent.conferenceData?.entryPoints?.find(
      (entry: any) => entry.entryPointType === 'video'
    )?.uri;

    // Create meeting record in database
    const newMeeting = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description: description || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      client: new mongoose.Types.ObjectId(userId),
      tbbStaff: admin._id,
      project: projectId ? new mongoose.Types.ObjectId(projectId) : null,
      status: 'CONFIRMED',
      meetingType: meetingType || 'VIRTUAL',
      googleMeetLink,
      googleEventId: calendarEvent.id,
      notes: '',
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await meetingsCollection.insertOne(newMeeting);

    // Send confirmation emails
    try {
      await sendMeetingInvitation(user.email, user.name, {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        googleMeetLink,
      });
    } catch (emailError) {
      console.error('Failed to send meeting invitation:', emailError);
    }

    return NextResponse.json({
      message: 'Meeting scheduled successfully',
      meeting: {
        id: newMeeting._id,
        title,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime,
        status: 'CONFIRMED',
        googleMeetLink,
      },
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}

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
    const meetingsCollection = db.collection('meetings');
    const usersCollection = db.collection('users');

    // Get user details to determine role
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let query: any = {};
    
    // Filter meetings based on user role
    if (user.role === 'CLIENT') {
      query.client = new mongoose.Types.ObjectId(userId);
    } else if (user.role === 'TBB_STAFF') {
      query.tbbStaff = new mongoose.Types.ObjectId(userId);
    } else if (user.role === 'ADMIN') {
      // Admin can see all meetings
      query = {};
    }

    // Get user's meetings with populated client, staff, and project info
    const meetings = await meetingsCollection.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'tbbStaff',
          foreignField: '_id',
          as: 'tbbStaffInfo'
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      {
        $unwind: {
          path: '$clientInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$tbbStaffInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$projectInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { startTime: -1 }
      }
    ]).toArray();

    const formattedMeetings = meetings.map(meeting => ({
      id: meeting._id,
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      status: meeting.status,
      meetingType: meeting.meetingType,
      googleMeetLink: meeting.googleMeetLink,
      client: {
        id: meeting.clientInfo?._id,
        name: meeting.clientInfo?.name || 'Unknown Client',
        email: meeting.clientInfo?.email || 'unknown@example.com'
      },
      tbbStaff: {
        id: meeting.tbbStaffInfo?._id,
        name: meeting.tbbStaffInfo?.name || 'Unknown Staff',
        email: meeting.tbbStaffInfo?.email || 'unknown@example.com'
      },
      project: {
        id: meeting.projectInfo?._id,
        name: meeting.projectInfo?.name || 'Unknown Project'
      },
      createdAt: meeting.createdAt,
    }));

    return NextResponse.json(formattedMeetings);

  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
