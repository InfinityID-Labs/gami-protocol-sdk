import { storage } from '../storage';
import { mongoDbService } from './mongodb.service';
import { isMongoAvailable } from '../mongo';

/**
 * Service for handling gamification features across different storage backends
 * This service provides an abstraction layer that works with both PostgreSQL and MongoDB
 */
export class GamificationService {
  
  /**
   * Track an XP event for a user
   */
  async trackXpEvent(data: {
    projectId: number;
    externalUserId: string;
    eventName: string;
    actionType: string;
    xpAmount: number;
    contextData?: Record<string, any>;
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
  }) {
    try {
      // Create XP transaction in PostgreSQL
      const transaction = await storage.createUserXpTransaction({
        projectId: data.projectId,
        externalUserId: data.externalUserId,
        eventId: 0, // This will be updated with the actual event ID
        xpAmount: data.xpAmount,
        metadata: data.metadata || {}
      });
      
      // If MongoDB is available, also store the event there
      if (isMongoAvailable) {
        // Store the detailed event in MongoDB
        const gameEvent = await mongoDbService.createGameEvent({
          eventName: data.eventName,
          userId: data.userId || `user_${data.projectId}_${data.externalUserId}`,
          externalUserId: data.externalUserId,
          projectId: data.projectId,
          timestamp: new Date(),
          xpAwarded: data.xpAmount,
          actionType: data.actionType,
          contextData: data.contextData,
          metadata: data.metadata,
          sessionId: data.sessionId
        });
        
        // Add XP to user data in MongoDB
        await mongoDbService.addUserXp(
          data.externalUserId,
          data.projectId,
          gameEvent.id,
          data.xpAmount,
          data.metadata
        );
      }
      
      return {
        success: true,
        transaction: {
          id: transaction.id,
          userId: transaction.externalUserId,
          event: data.eventName,
          xp: transaction.xpAmount,
          timestamp: transaction.createdAt
        }
      };
    } catch (error) {
      console.error('Error tracking XP event:', error);
      throw error;
    }
  }
  
  /**
   * Award an achievement to a user
   */
  async awardAchievement(data: {
    projectId: number;
    externalUserId: string;
    achievementId: string;
    achievementTitle: string;
    achievementDescription: string;
    imageUrl?: string;
    xpAmount?: number;
    metadata?: Record<string, any>;
  }) {
    try {
      // If MongoDB is available, store the achievement
      if (isMongoAvailable) {
        await mongoDbService.addUserAchievement(
          data.externalUserId,
          data.projectId,
          {
            id: data.achievementId,
            title: data.achievementTitle,
            description: data.achievementDescription,
            imageUrl: data.imageUrl
          }
        );
        
        // If XP is associated with the achievement, add that too
        if (data.xpAmount && data.xpAmount > 0) {
          await mongoDbService.addUserXp(
            data.externalUserId,
            data.projectId,
            `achievement_${data.achievementId}`,
            data.xpAmount,
            data.metadata
          );
          
          // Also record it in PostgreSQL for consistency
          await storage.createUserXpTransaction({
            projectId: data.projectId,
            externalUserId: data.externalUserId,
            eventId: 0, // This will be updated with the actual event ID
            xpAmount: data.xpAmount,
            metadata: { 
              achievementId: data.achievementId,
              achievementTitle: data.achievementTitle,
              ...data.metadata 
            }
          });
        }
        
        return {
          success: true,
          achievement: {
            id: data.achievementId,
            title: data.achievementTitle,
            description: data.achievementDescription,
            imageUrl: data.imageUrl,
            unlockedAt: new Date()
          }
        };
      } else {
        // If MongoDB isn't available, just record the XP in PostgreSQL
        if (data.xpAmount && data.xpAmount > 0) {
          await storage.createUserXpTransaction({
            projectId: data.projectId,
            externalUserId: data.externalUserId,
            eventId: 0, // This will be updated with the actual event ID
            xpAmount: data.xpAmount,
            metadata: { 
              achievementId: data.achievementId,
              achievementTitle: data.achievementTitle,
              ...data.metadata 
            }
          });
        }
        
        return {
          success: true,
          achievement: {
            id: data.achievementId,
            title: data.achievementTitle,
            description: data.achievementDescription,
            imageUrl: data.imageUrl,
            unlockedAt: new Date()
          },
          notice: "MongoDB not available. Achievement recorded as XP transaction only."
        };
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  }
  
  /**
   * Add an item to a user's inventory
   */
  async addInventoryItem(data: {
    projectId: number;
    externalUserId: string;
    itemId: string;
    itemName: string;
    itemDescription?: string;
    imageUrl?: string;
    quantity: number;
    attributes?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    try {
      // If MongoDB is available, store the inventory item
      if (isMongoAvailable) {
        await mongoDbService.addUserInventoryItem(
          data.externalUserId,
          data.projectId,
          {
            id: data.itemId,
            name: data.itemName,
            description: data.itemDescription,
            imageUrl: data.imageUrl,
            quantity: data.quantity,
            attributes: data.attributes
          }
        );
        
        return {
          success: true,
          item: {
            id: data.itemId,
            name: data.itemName,
            description: data.itemDescription,
            imageUrl: data.imageUrl,
            quantity: data.quantity,
            attributes: data.attributes,
            acquiredAt: new Date()
          }
        };
      } else {
        // If MongoDB isn't available, record a transaction in PostgreSQL with the item data
        await storage.createUserXpTransaction({
          projectId: data.projectId,
          externalUserId: data.externalUserId,
          eventId: 0, // This will be updated with the actual event ID
          xpAmount: 0, // No XP for inventory items unless specified
          metadata: { 
            type: 'inventory_item',
            itemId: data.itemId,
            itemName: data.itemName,
            itemDescription: data.itemDescription,
            quantity: data.quantity,
            attributes: data.attributes,
            ...data.metadata 
          }
        });
        
        return {
          success: true,
          item: {
            id: data.itemId,
            name: data.itemName,
            description: data.itemDescription,
            imageUrl: data.imageUrl,
            quantity: data.quantity,
            attributes: data.attributes,
            acquiredAt: new Date()
          },
          notice: "MongoDB not available. Item recorded as transaction only."
        };
      }
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }
  
  /**
   * Record a wallet transaction
   */
  async recordWalletTransaction(data: {
    projectId: number;
    externalUserId: string;
    userId?: string;
    transactionId?: string;
    walletAddress: string;
    chainType: string;
    type: string;
    amount: number;
    tokenSymbol: string;
    tokenAddress?: string;
    txHash?: string;
    destinationAddress?: string;
    destinationChain?: string;
    feeAmount?: number;
    feeToken?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      // If MongoDB is available, store the wallet transaction
      if (isMongoAvailable) {
        const transaction = await mongoDbService.createWalletTransaction({
          transactionId: data.transactionId,
          userId: data.userId || `user_${data.projectId}_${data.externalUserId}`,
          externalUserId: data.externalUserId,
          projectId: data.projectId,
          walletAddress: data.walletAddress,
          chainType: data.chainType,
          type: data.type as any, // Type assertion to match enum
          status: 'pending' as any, // Type assertion to match enum
          amount: data.amount,
          tokenSymbol: data.tokenSymbol,
          tokenAddress: data.tokenAddress,
          txHash: data.txHash,
          destinationAddress: data.destinationAddress,
          destinationChain: data.destinationChain,
          feeAmount: data.feeAmount,
          feeToken: data.feeToken,
          metadata: data.metadata,
          initiatedAt: new Date()
        });
        
        return {
          success: true,
          transaction: {
            id: transaction.transactionId,
            walletAddress: transaction.walletAddress,
            chainType: transaction.chainType,
            type: transaction.type,
            amount: transaction.amount,
            token: transaction.tokenSymbol,
            status: transaction.status,
            timestamp: transaction.initiatedAt
          }
        };
      } else {
        // If MongoDB isn't available, generate a transaction ID and record the data in PostgreSQL
        const generatedTxId = data.transactionId || `tx_${data.chainType}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        
        // Record in PostgreSQL for consistency
        await storage.createUserXpTransaction({
          projectId: data.projectId,
          externalUserId: data.externalUserId,
          eventId: 0, // This will be updated with the actual event ID
          xpAmount: 0, // No XP for wallet transactions
          metadata: { 
            type: 'wallet_transaction',
            transactionId: generatedTxId,
            walletAddress: data.walletAddress,
            chainType: data.chainType,
            transactionType: data.type,
            amount: data.amount,
            tokenSymbol: data.tokenSymbol,
            ...data.metadata 
          }
        });
        
        return {
          success: true,
          transaction: {
            id: generatedTxId,
            walletAddress: data.walletAddress,
            chainType: data.chainType,
            type: data.type,
            amount: data.amount,
            token: data.tokenSymbol,
            status: 'pending',
            timestamp: new Date()
          },
          notice: "MongoDB not available. Transaction recorded as XP transaction metadata only."
        };
      }
    } catch (error) {
      console.error('Error recording wallet transaction:', error);
      throw error;
    }
  }
  
  /**
   * Get user profile data
   */
  async getUserProfile(projectId: number, externalUserId: string) {
    try {
      // Get XP transactions from PostgreSQL
      const xpTransactions = await storage.getUserXpTransactionsByExternalUserId(projectId, externalUserId);
      
      // Calculate total XP from PostgreSQL
      const totalXp = xpTransactions.reduce((sum: number, tx: any) => sum + tx.xpAmount, 0);
      
      // Basic profile with data available from PostgreSQL
      const basicProfile = {
        externalUserId,
        projectId,
        totalXp,
        transactions: xpTransactions.map((tx: any) => ({
          id: tx.id,
          xpAmount: tx.xpAmount,
          timestamp: tx.createdAt,
          metadata: tx.metadata
        }))
      };
      
      // If MongoDB is available, get rich user data
      if (isMongoAvailable) {
        const userData = await mongoDbService.getUserData(externalUserId, projectId);
        
        if (userData) {
          // Combine data from both sources
          return {
            externalUserId,
            projectId,
            totalXp: userData.totalXp, // Use MongoDB's value as it's more authoritative
            level: userData.level,
            achievements: userData.achievements,
            inventory: userData.inventory,
            xpHistory: userData.xpHistory,
            transactions: xpTransactions.map((tx: any) => ({
              id: tx.id,
              xpAmount: tx.xpAmount,
              timestamp: tx.createdAt,
              metadata: tx.metadata
            })),
            walletAddresses: userData.walletAddresses || [],
            metadata: userData.metadata
          };
        }
      }
      
      // Return basic profile if MongoDB is not available or user not found
      return basicProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Get user game events
   */
  async getUserEvents(projectId: number, externalUserId: string, limit: number = 100, skip: number = 0) {
    try {
      if (isMongoAvailable) {
        const events = await mongoDbService.getGameEventsByUser(externalUserId, projectId, limit, skip);
        return events.map(event => ({
          id: event.id,
          eventName: event.eventName,
          actionType: event.actionType,
          xpAwarded: event.xpAwarded,
          timestamp: event.timestamp,
          contextData: event.contextData,
          metadata: event.metadata
        }));
      } else {
        // Fallback to PostgreSQL
        const xpTransactions = await storage.getUserXpTransactionsByExternalUserId(projectId, externalUserId);
        
        return xpTransactions.map((tx: any) => ({
          id: tx.id.toString(),
          eventName: tx.metadata?.eventName || 'xp_transaction',
          actionType: tx.metadata?.actionType || 'transaction',
          xpAwarded: tx.xpAmount,
          timestamp: tx.createdAt,
          contextData: tx.metadata?.contextData || {},
          metadata: tx.metadata || {}
        }));
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  }
  
  /**
   * Get project analytics
   */
  async getProjectAnalytics(projectId: number) {
    try {
      // Basic analytics from PostgreSQL
      const xpTransactions = await storage.getUserXpTransactionsByProjectId(projectId);
      
      const basicAnalytics = {
        totalXpAwarded: xpTransactions.reduce((sum: number, tx: any) => sum + tx.xpAmount, 0),
        transactionCount: xpTransactions.length,
        uniqueUsers: new Set(xpTransactions.map((tx: any) => tx.externalUserId)).size
      };
      
      // If MongoDB is available, get rich analytics
      if (isMongoAvailable) {
        const [
          totalUsers,
          totalXp,
          eventCounts,
          transactionCounts
        ] = await Promise.all([
          mongoDbService.getTotalUserCount(projectId),
          mongoDbService.getTotalXpAwarded(projectId),
          mongoDbService.getEventCountByType(projectId),
          mongoDbService.getTransactionCountByType(projectId)
        ]);
        
        return {
          totalUsers,
          totalXpAwarded: totalXp,
          eventCounts,
          transactionCounts,
          uniqueUsers: basicAnalytics.uniqueUsers
        };
      }
      
      // Return basic analytics if MongoDB is not available
      return basicAnalytics;
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const gamificationService = new GamificationService();