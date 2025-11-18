import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  client: mongoose.Types.ObjectId;
  tbbStaff: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  meetingType: 'VIRTUAL' | 'IN_PERSON' | 'PHONE';
  googleMeetLink?: string;
  location?: string;
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IMeeting, value: Date) {
        return value > this.startTime;
      },
      message: 'End time must be after start time',
    },
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tbbStaff: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
    default: 'SCHEDULED',
  },
  meetingType: {
    type: String,
    enum: ['VIRTUAL', 'IN_PERSON', 'PHONE'],
    default: 'VIRTUAL',
  },
  googleMeetLink: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
MeetingSchema.index({ startTime: 1 });
MeetingSchema.index({ client: 1, startTime: 1 });
MeetingSchema.index({ tbbStaff: 1, startTime: 1 });
MeetingSchema.index({ project: 1, startTime: 1 });
MeetingSchema.index({ status: 1 });

// Virtual to get meeting duration in minutes
MeetingSchema.virtual('duration').get(function() {
  return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
});

// Virtual to check if meeting is upcoming
MeetingSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date() && this.status !== 'CANCELLED';
});

// Virtual to check if meeting is today
MeetingSchema.virtual('isToday').get(function() {
  const today = new Date();
  const meetingDate = new Date(this.startTime);
  return today.toDateString() === meetingDate.toDateString();
});

// Method to confirm meeting
MeetingSchema.methods.confirm = function() {
  this.status = 'CONFIRMED';
  return this.save();
};

// Method to cancel meeting
MeetingSchema.methods.cancel = function(reason?: string) {
  this.status = 'CANCELLED';
  if (reason) {
    this.notes = this.notes ? `${this.notes}\n\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }
  return this.save();
};

// Method to complete meeting
MeetingSchema.methods.complete = function(notes?: string) {
  this.status = 'COMPLETED';
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n\n${notes}` : notes;
  }
  return this.save();
};

// Static method to find upcoming meetings
MeetingSchema.statics.findUpcoming = function(userId?: mongoose.Types.ObjectId) {
  const query: any = {
    startTime: { $gte: new Date() },
    status: { $in: ['SCHEDULED', 'CONFIRMED'] },
  };
  
  if (userId) {
    query.$or = [
      { client: userId },
      { tbbStaff: userId },
    ];
  }
  
  return this.find(query).sort({ startTime: 1 });
};

// Static method to find meetings for today
MeetingSchema.statics.findToday = function(userId?: mongoose.Types.ObjectId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const query: any = {
    startTime: { $gte: startOfDay, $lt: endOfDay },
    status: { $in: ['SCHEDULED', 'CONFIRMED'] },
  };
  
  if (userId) {
    query.$or = [
      { client: userId },
      { tbbStaff: userId },
    ];
  }
  
  return this.find(query).sort({ startTime: 1 });
};

export default mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema);
