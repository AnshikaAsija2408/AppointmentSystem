```javascript
// Portal invitation
await sendEmail(
  'user@example.com',
  'Welcome to Our Portal',
  'portalInvitation',
  {
    name: 'John Doe',
    email: 'user@example.com',
    tempPassword: 'temp123',
    portalUrl: 'https://portal.company.com'
  }
);

// Meeting link
await sendEmail(
  'participant@example.com',
  'Meeting Invitation',
  'meetingLink',
  {
    name: 'Jane Smith',
    meetingTitle: 'Weekly Standup',
    date: 'March 15, 2024',
    time: '10:00 AM EST',
    duration: '1 hour',
    meetingUrl: 'https://zoom.us/j/123456789',
    meetingId: '123-456-789',
    password: 'meeting123',
    agenda: 'Project updates and planning'
  }
);

// Meeting reminder
await sendEmail(
  'participant@example.com',
  'Meeting Starting Soon',
  'meetingReminder',
  {
    name: 'Jane Smith',
    meetingTitle: 'Weekly Standup',
    timeUntilMeeting: '15 minutes',
    date: 'March 15, 2024',
    time: '10:00 AM EST',
    meetingUrl: 'https://zoom.us/j/123456789'
  }
);

// Miscellaneous
await sendEmail(
  'user@example.com',
  'Important Update',
  'miscellaneous',
  {
    name: 'John Doe',
    title: 'System Maintenance Notice',
    message: '<p>Our system will undergo maintenance tonight from 10 PM to 2 AM.</p>',
    actionUrl: 'https://status.company.com',
    actionText: 'Check Status'
  }
);

```