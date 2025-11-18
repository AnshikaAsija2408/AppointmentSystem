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

    // Get admin user with Google tokens
    const admin = await usersCollection.findOne(
      { role: 'ADMIN' },
      { 
        projection: { 
          googleAccessToken: 1, 
          googleRefreshToken: 1, 
          googleTokenExpiry: 1, 
          googleCalendarId: 1 
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
      console.log('Token expired, refreshing...');
      
      if (!admin.googleRefreshToken) {
        return NextResponse.json(
          { error: 'No refresh token available. Please reconnect Google Calendar.' },
          { status: 400 }
        );
      }

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

      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error('Token refresh failed:', errorText);
        return NextResponse.json(
          { error: 'Failed to refresh Google token. Please reconnect Google Calendar.', details: errorText },
          { status: 401 }
        );
      }

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
      
      console.log('Token refreshed successfully');
    }

    // Get free/busy times for the next 7 days
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const freebusyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: admin.googleCalendarId || 'primary' }],
      }),
    });

    if (!freebusyResponse.ok) {
      const errorText = await freebusyResponse.text();
      console.error('Free/busy API error:', errorText);
      console.error('Status:', freebusyResponse.status);
      
      // If unauthorized, token might be invalid
      if (freebusyResponse.status === 401) {
        return NextResponse.json(
          { error: 'Google Calendar authorization failed. Please reconnect your Google Calendar.', details: errorText },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch calendar availability', details: errorText },
        { status: freebusyResponse.status }
      );
    }

    const freebusyData = await freebusyResponse.json();
    const busyTimes = freebusyData.calendars[admin.googleCalendarId || 'primary']?.busy || [];

    // Generate available time slots (9 AM to 6 PM, 30-minute intervals)
    const availableSlots = [];
    const workingHours = { start: 9, end: 18 }; // 9 AM to 6 PM

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() + day);
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + 30);

          // Skip if slot is in the past
          if (slotStart <= now) continue;

          // Check if slot conflicts with busy times
          const isAvailable = !busyTimes.some((busy: any) => {
            const busyStart = new Date(busy.start);
            const busyEnd = new Date(busy.end);
            return slotStart < busyEnd && slotEnd > busyStart;
          });

          if (isAvailable) {
            availableSlots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              date: slotStart.toDateString(),
              time: slotStart.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }),
            });
          }
        }
      }
    }

    return NextResponse.json({
      availableSlots,
      totalSlots: availableSlots.length,
      dateRange: {
        start: now.toISOString(),
        end: endDate.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error fetching free/busy times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 