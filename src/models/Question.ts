import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
    content: string;
    sender: mongoose.Types.ObjectId;
    senderRole: 'CLIENT' | 'TBB_STAFF' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
}

export interface IQuestion extends Document {
    title: string;
    category: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    client: mongoose.Types.ObjectId;
    project: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    content: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['CLIENT', 'TBB_STAFF', 'ADMIN'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const QuestionSchema = new Schema<IQuestion>({
    title: { type: String, required: true },
    category: { type: String, required: true, default: 'general' },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [MessageSchema]
}, {
    timestamps: true // This automatically adds createdAt and updatedAt
});

// Update the updatedAt field whenever a new message is added
QuestionSchema.pre('save', function(next) {
    if (this.isModified('messages')) {
        this.updatedAt = new Date();
    }
    next();
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
