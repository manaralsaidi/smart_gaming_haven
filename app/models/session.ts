import mongoose, { Schema, model, models } from 'mongoose';

const sessionSchema = new Schema(
  {
    // ربط المنظم بـ ID المستخدم (Foreign Key / Reference)
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameTitle: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    maxPlayers: {
      type: Number,
      default: 4,
    },
    aiSummary: {
      type: String,
    },
    // قائمة تحتوي على IDs اللاعبين المنضمين
    joinedPlayers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Session = models.Session || model('Session', sessionSchema);
export default Session;