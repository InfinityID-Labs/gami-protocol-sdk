import { GameEvent, IGameEvent } from '../models/game-event.model';
import { UserData, IUserData } from '../models/user-data.model';
import { WalletTransaction, IWalletTransaction, WalletTransactionStatus, WalletTransactionType } from '../models/wallet-transaction.model';

/**
 * Service class for MongoDB operations
 */
export class MongoDbService {
  /**
   * User data operations
   */
  
  // Get user data by external user ID and project ID
  async getUserData(externalUserId: string, projectId: number): Promise<IUserData | null> {
    return UserData.findOne({ externalUserId, projectId }).exec();
  }
  
  // Create or update user data
  async createOrUpdateUserData(userData: Partial<IUserData>): Promise<IUserData> {
    const { externalUserId, projectId } = userData;
    
    if (!externalUserId || !projectId) {
      throw new Error('External user ID and project ID are required');
    }
    
    const existingUser = await UserData.findOne({ externalUserId, projectId }).exec();
    
    if (existingUser) {
      // Update existing user
      Object.assign(existingUser, userData);
      await existingUser.save();
      return existingUser;
    } else {
      // Create new user
      const newUser = new UserData(userData);
      await newUser.save();
      return newUser;
    }
  }
  
  // Add XP to user
  async addUserXp(externalUserId: string, projectId: number, eventId: string, amount: number, metadata?: Record<string, any>): Promise<IUserData> {
    const userData = await this.getUserData(externalUserId, projectId);
    
    if (!userData) {
      // Create new user data if not exists
      return this.createOrUpdateUserData({
        externalUserId,
        projectId,
        userId: `${projectId}_${externalUserId}`,
        totalXp: amount,
        level: 1,
        xpHistory: [{
          eventId,
          amount,
          metadata,
          timestamp: new Date()
        }]
      });
    }
    
    // Update existing user data
    userData.totalXp += amount;
    userData.xpHistory.push({
      eventId,
      amount,
      metadata,
      timestamp: new Date()
    });
    
    // TODO: Implement level progression logic based on XP thresholds
    
    await userData.save();
    return userData;
  }
  
  // Add achievement to user
  async addUserAchievement(externalUserId: string, projectId: number, achievement: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
  }): Promise<IUserData> {
    const userData = await this.getUserData(externalUserId, projectId);
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Check if achievement already exists
    const existingAchievement = userData.achievements.find(a => a.id === achievement.id);
    
    if (!existingAchievement) {
      userData.achievements.push({
        ...achievement,
        unlockedAt: new Date()
      });
      
      await userData.save();
    }
    
    return userData;
  }
  
  // Add inventory item to user
  async addUserInventoryItem(externalUserId: string, projectId: number, item: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    quantity: number;
    attributes?: Record<string, any>;
  }): Promise<IUserData> {
    const userData = await this.getUserData(externalUserId, projectId);
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Check if item already exists
    const existingItemIndex = userData.inventory.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      userData.inventory[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      userData.inventory.push({
        ...item,
        acquiredAt: new Date()
      });
    }
    
    await userData.save();
    return userData;
  }
  
  /**
   * Game event operations
   */
  
  // Create game event
  async createGameEvent(eventData: Partial<IGameEvent>): Promise<IGameEvent> {
    const gameEvent = new GameEvent(eventData);
    await gameEvent.save();
    return gameEvent;
  }
  
  // Get game events by user
  async getGameEventsByUser(externalUserId: string, projectId: number, limit: number = 100, skip: number = 0): Promise<IGameEvent[]> {
    return GameEvent.find({ externalUserId, projectId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
  
  // Get game events by project
  async getGameEventsByProject(projectId: number, limit: number = 100, skip: number = 0): Promise<IGameEvent[]> {
    return GameEvent.find({ projectId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
  
  // Get game events by event name
  async getGameEventsByName(eventName: string, projectId: number, limit: number = 100, skip: number = 0): Promise<IGameEvent[]> {
    return GameEvent.find({ eventName, projectId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
  
  /**
   * Wallet transaction operations
   */
  
  // Create wallet transaction
  async createWalletTransaction(transactionData: Partial<IWalletTransaction>): Promise<IWalletTransaction> {
    // Generate transaction ID if not provided
    if (!transactionData.transactionId) {
      transactionData.transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
    
    const transaction = new WalletTransaction(transactionData);
    await transaction.save();
    return transaction;
  }
  
  // Update wallet transaction
  async updateWalletTransaction(transactionId: string, updateData: Partial<IWalletTransaction>): Promise<IWalletTransaction | null> {
    const transaction = await WalletTransaction.findOne({ transactionId }).exec();
    
    if (!transaction) {
      return null;
    }
    
    // Update transaction data
    Object.assign(transaction, updateData);
    
    // If status is completed, set completedAt
    if (updateData.status === WalletTransactionStatus.COMPLETED && !transaction.completedAt) {
      transaction.completedAt = new Date();
    }
    
    await transaction.save();
    return transaction;
  }
  
  // Get user wallet transactions
  async getUserWalletTransactions(externalUserId: string, projectId: number, limit: number = 100, skip: number = 0): Promise<IWalletTransaction[]> {
    return WalletTransaction.find({ externalUserId, projectId })
      .sort({ initiatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
  
  // Get wallet transactions by status
  async getWalletTransactionsByStatus(projectId: number, status: WalletTransactionStatus, limit: number = 100, skip: number = 0): Promise<IWalletTransaction[]> {
    return WalletTransaction.find({ projectId, status })
      .sort({ initiatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
  
  // Get transaction by ID
  async getWalletTransactionById(transactionId: string): Promise<IWalletTransaction | null> {
    return WalletTransaction.findOne({ transactionId }).exec();
  }
  
  // Get wallet transactions by wallet address
  async getWalletTransactionsByAddress(walletAddress: string, projectId: number, limit: number = 100, skip: number = 0): Promise<IWalletTransaction[]> {
    return WalletTransaction.find({ walletAddress, projectId })
      .sort({ initiatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
  
  /**
   * Analytics operations
   */
  
  // Get total users count by project
  async getTotalUserCount(projectId: number): Promise<number> {
    return UserData.countDocuments({ projectId }).exec();
  }
  
  // Get total XP awarded by project
  async getTotalXpAwarded(projectId: number): Promise<number> {
    const result = await GameEvent.aggregate([
      { $match: { projectId } },
      { $group: { _id: null, totalXp: { $sum: '$xpAwarded' } } }
    ]).exec();
    
    return result.length > 0 ? result[0].totalXp : 0;
  }
  
  // Get event count by type for a project
  async getEventCountByType(projectId: number): Promise<Record<string, number>> {
    const result = await GameEvent.aggregate([
      { $match: { projectId } },
      { $group: { _id: '$eventName', count: { $sum: 1 } } }
    ]).exec();
    
    return result.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);
  }
  
  // Get transactions by type
  async getTransactionCountByType(projectId: number): Promise<Record<string, number>> {
    const result = await WalletTransaction.aggregate([
      { $match: { projectId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).exec();
    
    return result.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Export a singleton instance
export const mongoDbService = new MongoDbService();