import { Schema, model, Document } from 'mongoose';

// Interface for game event document
export interface IGameEvent extends Document {
  eventName: string;
  userId: string;
  externalUserId: string;
  projectId: number;
  timestamp: Date;
  xpAwarded: number;
  actionType: string;
  contextData?: Record<string, any>;
  metadata?: Record<string, any>;
  sessionId?: string;
  deviceInfo?: {
    type?: string;
    os?: string;
    browser?: string;
  };
  location?: {
    coordinates?: [number, number]; // [longitude, latitude]
    country?: string;
    region?: string;
    city?: string;
  };
}

// Schema for game event
const GameEventSchema = new Schema<IGameEvent>({
  eventName: { type: String, required: true },
  userId: { type: String, required: true },
  externalUserId: { type: String, required: true },
  projectId: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  xpAwarded: { type: Number, default: 0 },
  actionType: { type: String, required: true },
  contextData: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed },
  sessionId: { type: String },
  deviceInfo: {
    type: { type: String },
    os: { type: String },
    browser: { type: String },
  },
  location: {
    coordinates: { type: [Number], index: '2dsphere' },
    country: { type: String },
    region: { type: String },
    city: { type: String },
  }
}, {
  timestamps: true,
  versionKey: false
});

// Add indexes for efficient querying
GameEventSchema.index({ userId: 1 });
GameEventSchema.index({ externalUserId: 1, projectId: 1 });
GameEventSchema.index({ eventName: 1, projectId: 1 });
GameEventSchema.index({ timestamp: -1 });
GameEventSchema.index({ projectId: 1, timestamp: -1 });

// Export the game event model
export const GameEvent = model<IGameEvent>('GameEvent', GameEventSchema);