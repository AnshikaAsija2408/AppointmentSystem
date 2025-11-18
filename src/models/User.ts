import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  role: "CLIENT" | "TBB_STAFF" | "ADMIN";
  googleCalendarId?: string;
  invitedBy?: mongoose.Types.ObjectId;
  invitedAt?: Date;
  projects: mongoose.Types.ObjectId[];
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiry?: Date;
  needsPasswordChange?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.role !== "CLIENT" || !this.invitedBy;
      },
    },
    role: {
      type: String,
      enum: ["CLIENT", "TBB_STAFF", "ADMIN"],
      required: true,
    },

    googleCalendarId: {
      type: String,
      trim: true,
    },
    googleAccessToken: {
      type: String,
      select: false,
    },
    googleRefreshToken: {
      type: String,
      select: false,
    },
    googleTokenExpiry: {
      type: Date,
    },

    needsPasswordChange: {
      type: Boolean,
      default: false,
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    invitedAt: {
      type: Date,
    },

    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for full name formatting
UserSchema.virtual("displayName").get(function () {
  return this.name;
});

// Method to check if user is TBB staff
UserSchema.methods.isTBBStaff = function () {
  return this.role === "TBB_STAFF" || this.role === "ADMIN";
};

// Method to check if user is client
UserSchema.methods.isClient = function () {
  return this.role === "CLIENT";
};

// Static method to find active users

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
