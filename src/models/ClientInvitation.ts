import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IClientInvitation extends Document {
    email: string;
    project: mongoose.Types.ObjectId;
    invitedBy: mongoose.Types.ObjectId;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ClientInvitationSchema = new Schema<IClientInvitation>({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
        default: 'PENDING',
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    acceptedAt: Date,
}, {
    timestamps: true,
});

// Indexes
ClientInvitationSchema.index({ email: 1, project: 1 }, { unique: true });
ClientInvitationSchema.index({ token: 1 }, { unique: true });

// Generate token on save
ClientInvitationSchema.pre('save', function(next) {
    if (this.isNew && !this.token) {
        this.token = crypto.randomBytes(32).toString('hex');
    }
    next();
});

// Accept invitation method
ClientInvitationSchema.methods.accept = function() {
    this.status = 'ACCEPTED';
    this.acceptedAt = new Date();
    return this.save();
};

export default mongoose.models.ClientInvitation || mongoose.model<IClientInvitation>('ClientInvitation', ClientInvitationSchema);
