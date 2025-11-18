// MongoDB Models for TBB Client Portal
import connectDB from '@/lib/mongodb';

// Import all models
import User from './User';
import Project from './Project';
import Meeting from './Meeting';
import Question from './Question';
import ClientInvitation from './ClientInvitation';

// Export models
export {
  User,
  Project,
  Meeting,
  Question,
  ClientInvitation,
};

// Export types
export type { IUser } from './User';
export type { IProject } from './Project';
export type { IMeeting } from './Meeting';
export type { IQuestion, IMessage } from './Question';
export type { IClientInvitation } from './ClientInvitation';

// Export database connection
export { connectDB };

// Helper function to initialize all models
export const initializeModels = async () => {
  await connectDB();
  
  // Touch each model to ensure they're registered
  void User.collection;
  void Project.collection;
  void Meeting.collection;
  void Question.collection;
  void ClientInvitation.collection;
  
  console.log('✅ All MongoDB models initialized');
};

// Default export
const models = {
  User,
  Project,
  Meeting,
  Question,
  ClientInvitation,
  connectDB,
  initializeModels,
};

export default models;
