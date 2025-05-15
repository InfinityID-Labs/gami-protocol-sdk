import { Schema, model, Document } from 'mongoose';

// Define the wallet transaction status enum
export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Define the wallet transaction type enum
export enum WalletTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  REWARD = 'reward',
  PURCHASE = 'purchase',
  TRANSFER = 'transfer',
  CROSS_CHAIN = 'cross_chain'
}

// Interface for wallet transaction document
export interface IWalletTransaction extends Document {
  transactionId: string;
  userId: string;
  externalUserId: string;
  projectId: number;
  walletAddress: string;
  chainType: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  tokenSymbol: string;
  tokenAddress?: string;
  txHash?: string;
  destinationAddress?: string;
  destinationChain?: string;
  feeAmount?: number;
  feeToken?: string;
  metadata?: Record<string, any>;
  initiatedAt: Date;
  completedAt?: Date;
  relatedTransactionId?: string;
}

// Schema for wallet transaction
const WalletTransactionSchema = new Schema<IWalletTransaction>({
  transactionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  externalUserId: { type: String, required: true },
  projectId: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  chainType: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: Object.values(WalletTransactionType) 
  },
  status: { 
    type: String, 
    required: true, 
    enum: Object.values(WalletTransactionStatus),
    default: WalletTransactionStatus.PENDING
  },
  amount: { type: Number, required: true },
  tokenSymbol: { type: String, required: true },
  tokenAddress: { type: String },
  txHash: { type: String },
  destinationAddress: { type: String },
  destinationChain: { type: String },
  feeAmount: { type: Number },
  feeToken: { type: String },
  metadata: { type: Schema.Types.Mixed },
  initiatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  relatedTransactionId: { type: String },
}, {
  timestamps: true,
  versionKey: false
});

// transactionId already has an implicit index due to unique: true
// No need to explicitly add it again
WalletTransactionSchema.index({ userId: 1 });
WalletTransactionSchema.index({ externalUserId: 1, projectId: 1 });
WalletTransactionSchema.index({ walletAddress: 1 });
WalletTransactionSchema.index({ txHash: 1 });
WalletTransactionSchema.index({ initiatedAt: -1 });
WalletTransactionSchema.index({ projectId: 1, status: 1 });
WalletTransactionSchema.index({ projectId: 1, initiatedAt: -1 });

// Export the wallet transaction model
export const WalletTransaction = model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);