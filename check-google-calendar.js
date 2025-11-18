// Debug script to check Google Calendar integration
import { MongoClient } from 'mongodb';

// Load environment variables manually
import { readFileSync } from 'fs';
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

async function checkGoogleCalendar() {
  const client = new MongoClient('mongodb://localhost:27017/appointment');
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Find admin user
    const admin = await users.findOne({ role: 'ADMIN' });
    
    if (!admin) {
      console.log('✗ No admin user found');
      return;
    }
    
    console.log('✓ Admin user found:', admin.email);
    console.log('\nGoogle Calendar Status:');
    console.log('  Access Token:', admin.googleAccessToken ? '✓ Present' : '✗ Missing');
    console.log('  Refresh Token:', admin.googleRefreshToken ? '✓ Present' : '✗ Missing');
    console.log('  Calendar ID:', admin.googleCalendarId || 'Not set');
    
    if (admin.googleTokenExpiry) {
      const expiry = new Date(admin.googleTokenExpiry);
      const now = new Date();
      const isExpired = expiry < now;
      
      console.log('  Token Expiry:', expiry.toLocaleString());
      console.log('  Token Status:', isExpired ? '✗ EXPIRED' : '✓ Valid');
    } else {
      console.log('  Token Expiry:', '✗ Not set');
    }
    
    console.log('\nEnvironment Variables:');
    console.log('  GOOGLE_CLIENT_ID:', env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
    console.log('  GOOGLE_CLIENT_SECRET:', env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkGoogleCalendar();
