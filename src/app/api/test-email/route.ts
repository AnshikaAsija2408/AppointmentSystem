import { NextRequest, NextResponse } from 'next/server';
import { sendPortalInvitation } from '@/service/emailService';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing email configuration...');
    console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}`);
    console.log(`📧 EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);
    console.log(`📧 NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL}`);
    
    // Test email
    const testEmail = process.env.EMAIL_USER || '04raghavsingla28@gmail.com';
    const testName = 'Test User';
    const testPassword = 'test123';
    const testUrl = 'http://localhost:3000/login';
    
    console.log(`🧪 Sending test email to: ${testEmail}`);
    
    const result = await sendPortalInvitation(testEmail, testName, testPassword, testUrl);
    
    return NextResponse.json({
      success: result,
      message: result ? 'Test email sent successfully!' : 'Failed to send test email',
      config: {
        emailUser: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
        emailPass: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
    });
    
  } catch (error) {
    console.error('🧪 Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        emailUser: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
        emailPass: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
    }, { status: 500 });
  }
}
