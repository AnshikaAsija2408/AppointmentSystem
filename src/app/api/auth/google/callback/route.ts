import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the user ID
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=oauth_failed`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=missing_params`);
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user's calendar info
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    let calendarId = 'primary';
    if (calendarResponse.ok) {
      const calendarData = await calendarResponse.json();
      calendarId = calendarData.id;
    }

    // Store tokens in user document
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expires_in);

    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(state) },
      {
        $set: {
          googleAccessToken: access_token,
          googleRefreshToken: refresh_token,
          googleTokenExpiry: tokenExpiry,
          googleCalendarId: calendarId,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?success=google_connected`);

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?error=callback_failed`);
  }
} 