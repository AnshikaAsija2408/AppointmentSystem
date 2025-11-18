
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const DB_URL = "mongodb://localhost:27017/appointment"
mongoose.connect(DB_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function createAdmin() {
    try {
        // Connect to database
        console.log('Connecting to MongoDB...');
        // Wait for connection to be established
        await new Promise((resolve, reject) => {
            if (mongoose.connection.readyState === 1) {
                console.log('Already connected to MongoDB');
                resolve();
            } else {
                mongoose.connection.once('open', () => {
                    console.log('Connected to MongoDB');
                    resolve();
                });
                mongoose.connection.once('error', reject);
            }
        });

        // Admin details
        const email = 'suhani@gmail.com';
        // const password = 'Admin@123!';
        // const password = 'Client@123!';
        const password = 'Staff@123!';
        const name = 'Anshika';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Get users collection
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({ 
            $or: [{ email }, { role: 'TBB_STAFF' }]
        });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        // Create admin user
        const adminUser = {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN',
            projects: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await usersCollection.insertOne(adminUser);
        
        console.log('Admin created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createAdmin();
