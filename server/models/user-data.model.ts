import { Schema, model, Document } from 'mongoose';

// Interface for achievement
interface IAchievement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  unlockedAt: Date;
}

// Interface for inventory item
interface IInventoryItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  attributes?: Record<string, any>;
  acquiredAt: Date;
}

// Interface for XP event
interface IXpEvent {
  eventId: string;
  amount: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Interface for User data document
export interface IUserData extends Document {
  userId: string;
  externalUserId: string;
  projectId: number;
  totalXp: number;
  level: number;
  achievements: IAchievement[];
  inventory: IInventoryItem[];
  xpHistory: IXpEvent[];
  metadata: Record<string, any>;
  walletAddresses?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for achievement
const AchievementSchema = new Schema<IAchievement>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  unlockedAt: { type: Date, default: Date.now }
});

// Schema for inventory item
const InventoryItemSchema = new Schema<IInventoryItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  attributes: { type: Schema.Types.Mixed },
  acquiredAt: { type: Date, default: Date.now }
});

// Schema for XP event
const XpEventSchema = new Schema<IXpEvent>({
  eventId: { type: String, required: true },
  amount: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

// Schema for User data
const UserDataSchema = new Schema<IUserData>({
  userId: { type: String, required: true },
  externalUserId: { type: String, required: true },
  projectId: { type: Number, required: true },
  totalXp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  achievements: [AchievementSchema],
  inventory: [InventoryItemSchema],
  xpHistory: [XpEventSchema],
  metadata: { type: Schema.Types.Mixed, default: {} },
  walletAddresses: [{ type: String }]
}, {
  timestamps: true,
  versionKey: false
});

// Add indexes for efficient querying
UserDataSchema.index({ userId: 1 }, { unique: true });
UserDataSchema.index({ externalUserId: 1, projectId: 1 }, { unique: true });
UserDataSchema.index({ projectId: 1 });

// Export the user data model
export const UserData = model<IUserData>('UserData', UserDataSchema);