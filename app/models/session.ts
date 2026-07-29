import mongoose, { Schema, model, models } from 'mongoose';

const SessionSchema = new Schema(
  {
    hostName: { type: String, required: true },
    gameTitle: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    maxPlayers: { type: Number, required: true },
    joinedPlayers: { type: [String], default: [] },
    discordLink: { type: String, default: '' },
    aiSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Session = models.Session || model('Session', SessionSchema);
export default Session;