import mongoose, { Schema, model, models } from 'mongoose';

const sessionSchema = new Schema(
  {
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