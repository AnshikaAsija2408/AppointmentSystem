import nodemailer from 'nodemailer';

// Type definitions for email data
interface PortalInvitationData {
  name?: string;
  email: string;
  tempPassword?: string;
  portalUrl: string;
}

interface MeetingData {
  name?: string;
  meetingTitle?: string;
  date: string;
  time: string;
  duration?: string;
  agenda?: string;
  meetingUrl: string;
  meetingId?: string;
  password?: string;
  timeUntilMeeting?: string;
}

interface MiscellaneousData {
  title?: string;
  name?: string;
  message?: string;
  actionUrl?: string;
  actionText?: string;
  additionalInfo?: string;
  footerText?: string;
}

type EmailData = PortalInvitationData | MeetingData | MiscellaneousData;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// HTML Templates
const emailTemplates = {
  portalInvitation: (data: PortalInvitationData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Portal Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to TBB Portal!</h1>
        </div>
        <h2>Hello ${data.name || 'User'},</h2>
        <p>You have been invited to join the TBB Portal. We're excited to have you on board!</p>
        <p><strong>Your login credentials:</strong></p>
        <ul>
          <li>Email: ${data.email}</li>
          <li>Temporary Password: ${data.tempPassword || 'Please check with admin'}</li>
        </ul>
        <p>Click the button below to access the portal and get started:</p>
        <a href="${data.portalUrl}" class="btn">Access Portal</a>
        <p>Please change your password after your first login for security purposes.</p>
        <div class="footer">
          <p>If you have any questions, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} TBB Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  meetingLink: (data: MeetingData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
        .meeting-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .btn { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Meeting Invitation</h1>
        </div>
        <h2>Hello ${data.name || 'Participant'},</h2>
        <p>You're invited to join our meeting. Here are the details:</p>
        <div class="meeting-info">
          <h3>${data.meetingTitle || 'Meeting'}</h3>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Duration:</strong> ${data.duration || 'To be determined'}</p>
          ${data.agenda ? `<p><strong>Agenda:</strong> ${data.agenda}</p>` : ''}
        </div>
        <p>Click the button below to join the meeting:</p>
        <a href="${data.meetingUrl}" class="btn">Join Meeting</a>
        <p><strong>Meeting ID:</strong> ${data.meetingId || 'N/A'}</p>
        ${data.password ? `<p><strong>Password:</strong> ${data.password}</p>` : ''}
        <div class="footer">
          <p>Please join the meeting a few minutes early to test your connection.</p>
          <p>&copy; ${new Date().getFullYear()} TBB Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  meetingReminder: (data: MeetingData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #ffc107; padding-bottom: 20px; margin-bottom: 30px; }
        .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .btn { display: inline-block; background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Meeting Reminder</h1>
        </div>
        <h2>Hello ${data.name || 'Participant'},</h2>
        <div class="reminder-box">
          <h3>Upcoming Meeting: ${data.meetingTitle || 'Meeting'}</h3>
          <p><strong>Starting in:</strong> ${data.timeUntilMeeting || '30 minutes'}</p>
          <p><strong>Date & Time:</strong> ${data.date} at ${data.time}</p>
          <p><strong>Duration:</strong> ${data.duration || 'To be determined'}</p>
        </div>
        <p>Don't forget to join your scheduled meeting. Click the button below:</p>
        <a href="${data.meetingUrl}" class="btn">Join Meeting Now</a>
        <p><strong>Meeting ID:</strong> ${data.meetingId || 'N/A'}</p>
        ${data.password ? `<p><strong>Password:</strong> ${data.password}</p>` : ''}
        <p><strong>Preparation checklist:</strong></p>
        <ul>
          <li>Test your camera and microphone</li>
          <li>Ensure stable internet connection</li>
          <li>Review meeting agenda</li>
          <li>Prepare any required materials</li>
        </ul>
        <div class="footer">
          <p>If you can't attend, please inform the meeting organizer as soon as possible.</p>
          <p>&copy; ${new Date().getFullYear()} TBB Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  miscellaneous: (data: MiscellaneousData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title || 'Notification'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #6c757d; padding-bottom: 20px; margin-bottom: 30px; }
        .content { margin: 20px 0; }
        .btn { display: inline-block; background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.title || 'Notification'}</h1>
        </div>
        <h2>Hello ${data.name || 'User'},</h2>
        <div class="content">
          ${data.message || '<p>This is a general notification.</p>'}
        </div>
        ${data.actionUrl ? `<a href="${data.actionUrl}" class="btn">${data.actionText || 'Take Action'}</a>` : ''}
        ${data.additionalInfo ? `<p><strong>Additional Information:</strong> ${data.additionalInfo}</p>` : ''}
        <div class="footer">
          <p>${data.footerText || 'Thank you for your attention.'}</p>
          <p>&copy; ${new Date().getFullYear()} TBB Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

export const sendEmail = async (
  to: string, 
  subject: string, 
  emailType: keyof typeof emailTemplates, 
  data: EmailData = {}
) => {
  const templateFunction = emailTemplates[emailType];
  
  if (!templateFunction) {
    throw new Error(`Invalid email type: ${emailType}. Available types: ${Object.keys(emailTemplates).join(', ')}`);
  }

  const html = templateFunction(data as any);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', (error as any).code);
      console.error('❌ Error response:', (error as any).response);
    }
    return false;
  }
};

// Utility functions for common email types
export const sendPortalInvitation = async (
  email: string, 
  name: string, 
  tempPassword: string, 
  portalUrl: string
) => {
  return sendEmail(
    email,
    'Welcome to TBB Portal - Your Access Details',
    'portalInvitation',
    { email, name, tempPassword, portalUrl }
  );
};

export const sendMeetingInvitation = async (
  recipientEmail: string,
  recipientName: string,
  meetingDetails: {
    title: string;
    startTime: Date;
    endTime: Date;
    googleMeetLink?: string;
  }
) => {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Meeting Invitation</h2>
        <p>Hello ${recipientName},</p>
        <p>Your meeting has been scheduled successfully!</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Meeting Details</h3>
          <p><strong>Title:</strong> ${meetingDetails.title}</p>
          <p><strong>Date:</strong> ${meetingDetails.startTime.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${meetingDetails.startTime.toLocaleTimeString()} - ${meetingDetails.endTime.toLocaleTimeString()}</p>
          ${meetingDetails.googleMeetLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingDetails.googleMeetLink}" style="color: #007bff;">Join Meeting</a></p>` : ''}
        </div>
        
        <p>Please make sure to join the meeting on time. If you need to reschedule, please contact us at least 2 hours before the meeting.</p>
        
        <p>Best regards,<br>The TBB Team</p>
      </div>
    `;

    // For now, just log the email content
    // In production, you would integrate with a real email service like SendGrid, AWS SES, etc.
    console.log('Meeting invitation email would be sent to:', recipientEmail);
    console.log('Email content:', emailContent);
    
    return true;
  } catch (error) {
    console.error('Error sending meeting invitation:', error);
    return false;
  }
};

export const sendMeetingReminder = async (
  email: string,
  meetingData: MeetingData
) => {
  return sendEmail(
    email,
    `Reminder: ${meetingData.meetingTitle || 'TBB Meeting'} starting soon`,
    'meetingReminder',
    meetingData
  );
};

export const sendCustomEmail = async (
  email: string,
  subject: string,
  data: MiscellaneousData
) => {
  return sendEmail(email, subject, 'miscellaneous', data);
};