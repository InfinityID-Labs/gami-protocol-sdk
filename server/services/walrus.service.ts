import { db } from '../db';
import { eq } from 'drizzle-orm';
import { walrusMetadata } from '@shared/schema';

/**
 * Service for handling Walrus blockchain storage metadata
 */
export class WalrusService {
  /**
   * Store metadata for a Walrus blob
   * @param blobId The blob ID
   * @param metadata The metadata to store
   */
  async storeMetadata(blobId: string, metadata: any): Promise<any> {
    try {
      const existingMetadata = await this.getMetadata(blobId);
      
      if (existingMetadata) {
        // Update existing metadata
        const [updated] = await db
          .update(walrusMetadata)
          .set({ 
            metadata: metadata,
            updatedAt: new Date()
          })
          .where(eq(walrusMetadata.blobId, blobId))
          .returning();
        
        return updated;
      } else {
        // Insert new metadata
        const [created] = await db
          .insert(walrusMetadata)
          .values({
            blobId,
            metadata,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('Failed to store Walrus metadata:', error);
      throw new Error(`Failed to store metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get metadata for a Walrus blob
   * @param blobId The blob ID
   * @returns The metadata or null if not found
   */
  async getMetadata(blobId: string): Promise<any> {
    try {
      const [result] = await db
        .select()
        .from(walrusMetadata)
        .where(eq(walrusMetadata.blobId, blobId));
      
      return result || null;
    } catch (error) {
      console.error('Failed to get Walrus metadata:', error);
      throw new Error(`Failed to get metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete metadata for a Walrus blob
   * @param blobId The blob ID
   * @returns True if metadata was deleted, false if not found
   */
  async deleteMetadata(blobId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(walrusMetadata)
        .where(eq(walrusMetadata.blobId, blobId));
      
      // For PostgreSQL/Drizzle ORM, we check if any rows were affected
      return result !== undefined && Object.keys(result).length > 0;
    } catch (error) {
      console.error('Failed to delete Walrus metadata:', error);
      throw new Error(`Failed to delete metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all Walrus blobs and their metadata
   * @param limit Max number of items to return
   * @param offset Offset for pagination
   * @returns List of blob metadata
   */
  async listMetadata(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(walrusMetadata)
        .limit(limit)
        .offset(offset)
        .orderBy(walrusMetadata.createdAt);
      
      return results;
    } catch (error) {
      console.error('Failed to list Walrus metadata:', error);
      throw new Error(`Failed to list metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export a singleton instance
export const walrusService = new WalrusService();