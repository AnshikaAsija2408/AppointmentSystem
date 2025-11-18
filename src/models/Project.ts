import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  tbbStaff: mongoose.Types.ObjectId[];
  clients: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
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
  isActive: {
    type: Boolean,
    default: true,
  },
  tbbStaff: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  clients: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ isActive: 1 });
ProjectSchema.index({ createdBy: 1 });

// Virtual to get total team size
ProjectSchema.virtual('teamSize').get(function() {
  return this.tbbStaff.length + this.clients.length;
});

// Method to add TBB staff member
ProjectSchema.methods.addTBBStaff = function(userId: mongoose.Types.ObjectId) {
  if (!this.tbbStaff.includes(userId)) {
    this.tbbStaff.push(userId);
  }
  return this.save();
};

// Method to add client
ProjectSchema.methods.addClient = function(userId: mongoose.Types.ObjectId) {
  if (!this.clients.includes(userId)) {
    this.clients.push(userId);
  }
  return this.save();
};

// Method to remove team member
ProjectSchema.methods.removeTeamMember = function(userId: mongoose.Types.ObjectId) {
  this.tbbStaff = this.tbbStaff.filter(id => !id.equals(userId));
  this.clients = this.clients.filter(id => !id.equals(userId));
  return this.save();
};

// Static method to find active projects
ProjectSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
