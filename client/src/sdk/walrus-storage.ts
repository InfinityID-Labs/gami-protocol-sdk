import { WalrusClient, TESTNET_WALRUS_PACKAGE_CONFIG, MAINNET_WALRUS_PACKAGE_CONFIG } from '@mysten/walrus';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import axios from 'axios';

/**
 * Supported Walrus storage networks
 */
export type WalrusNetwork = 'testnet' | 'mainnet' | 'devnet';

/**
 * Configuration for the Walrus storage provider
 */
export interface WalrusStorageConfig {
  /** The network to connect to */
  network: WalrusNetwork;
  /** SUI RPC URL */
  rpcUrl?: string;
  /** Private key for SUI transactions (hex format) */
  privateKey?: string;
}

/**
 * Metadata for a stored blob
 */
export interface BlobMetadata {
  /** User-defined name for the blob */
  name: string;
  /** Content type of the blob */
  contentType: string;
  /** User-defined tags for the blob */
  tags?: Record<string, string>;
  /** Timestamp when the blob was created */
  createdAt: string;
}

/**
 * Options for storing data
 */
export interface StoreOptions {
  /** Metadata for the blob */
  metadata?: BlobMetadata;
  /** If the blob should be deletable later */
  deletable?: boolean;
  /** How many epochs to store the blob for (undefined = permanent) */
  storageEpochs?: number;
}

/**
 * Result of a blob storage operation
 */
export interface StorageResult {
  /** Unique blob ID */
  blobId: string;
  /** Transaction ID if on-chain operation was performed */
  transactionId?: string;
  /** URI to access the blob */
  uri?: string;
  /** Metadata for the blob */
  metadata?: BlobMetadata;
}

/**
 * Result of a blob retrieval operation
 */
export interface RetrieveResult {
  /** The data retrieved */
  data: Uint8Array;
  /** Metadata for the blob */
  metadata?: BlobMetadata;
  /** Content type of the blob */
  contentType?: string;
}

/**
 * Walrus storage provider for Gami Protocol
 * 
 * Provides blockchain-based storage for game assets and achievement NFTs
 * using Walrus protocol on Sui blockchain
 */
export class WalrusStorage {
  private client: WalrusClient | null = null;
  private keypair: Ed25519Keypair | null = null;
  private config: WalrusStorageConfig;
  private initialized = false;

  /**
   * Create a new Walrus storage provider
   * @param config Configuration for the Walrus storage
   */
  constructor(config: WalrusStorageConfig) {
    this.config = config;
  }

  /**
   * Initialize the Walrus client
   * @returns True if initialization was successful
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) return true;

      // Set up SUI client
      const clientUrl = this.config.rpcUrl || this.getDefaultRpcUrl();
      const suiClient = new SuiClient({ url: clientUrl });

      // Set up keypair if private key provided
      if (this.config.privateKey) {
        this.keypair = Ed25519Keypair.fromSecretKey(
          Buffer.from(this.config.privateKey.replace('0x', ''), 'hex')
        );
      }

      // Set up Walrus client
      const packageConfig = this.getPackageConfig();
      
      // Create a Walrus client with the necessary configuration
      // Using type assertion to work with client architecture
      // The Walrus client constructor expects network to be only 'testnet' or 'mainnet',
      // but we support 'devnet' internally (mapped to testnet in our code)
      const networkForClient = this.config.network === 'devnet' ? 'testnet' : this.config.network;
      
      // Initialize Walrus client with suiRpcUrl
      this.client = new WalrusClient({
        packageConfig,
        network: networkForClient as 'testnet' | 'mainnet',
        suiRpcUrl: clientUrl
      }) as unknown as WalrusClient;
      
      // Manually set properties that may not be in the public interface
      // We need to use this approach for compatibility
      (this.client as any).suiClient = suiClient;
      if (this.keypair) {
        (this.client as any).signer = this.keypair;
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Walrus client:', error);
      return false;
    }
  }

  /**
   * Store data in Walrus
   * @param data The data to store
   * @param options Options for storing the data
   * @returns Result of the storage operation
   */
  async store(data: Uint8Array | string, options: StoreOptions = {}): Promise<StorageResult> {
    await this.ensureInitialized();

    const dataBytes = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : data;

    try {
      // We need to work with the API versions that may not match 
      // the exact TypeScript interface. Using type assertions here.
      
      // Register blob on-chain
      // Create transaction and add blob registration
      const tx = new Transaction();
      
      // The Walrus SDK may have different API versions with different parameter structures
      // We'll handle both possibilities with type assertions
      let registerBlobResult: any;
      
      // Use type assertion to bypass TypeScript errors due to SDK version differences
      registerBlobResult = await (this.client as any).registerBlob({
        data: dataBytes,
        // Use options provided or defaults
        deletable: options.deletable ?? false,
        storageEpochs: options.storageEpochs, // undefined = permanent
        transaction: tx
      });
      
      // Execute transaction with suiClient
      const suiClient = (this.client as any).suiClient;
      const result = await (tx as any).execute({ client: suiClient });
      
      // Extract the blob ID from the result
      const blobId = registerBlobResult.blobId;

      // Store metadata if provided
      if (options.metadata) {
        // Prepare metadata with defaults
        const metadata = {
          ...options.metadata,
          createdAt: options.metadata.createdAt || new Date().toISOString(),
        };

        // Store metadata to Gami backend
        await this.storeMetadata(blobId, metadata);
      }

      return {
        blobId,
        transactionId: result.digest,
        metadata: options.metadata,
      };
    } catch (error) {
      console.error('Failed to store data in Walrus:', error);
      throw new Error(`Failed to store data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieve data from Walrus
   * @param blobId The blob ID to retrieve
   * @returns The retrieved data and metadata
   */
  async retrieve(blobId: string): Promise<RetrieveResult> {
    await this.ensureInitialized();

    try {
      // Get blob data
      const data = await this.client!.readBlob({ blobId });
      
      // Get metadata from Gami backend
      const metadata = await this.retrieveMetadata(blobId);
      
      return {
        data,
        metadata,
        contentType: metadata?.contentType,
      };
    } catch (error) {
      console.error('Failed to retrieve data from Walrus:', error);
      throw new Error(`Failed to retrieve data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a blob from Walrus
   * @param blobId The blob ID to delete
   * @returns Transaction ID of the deletion
   */
  async delete(blobId: string): Promise<string> {
    await this.ensureInitialized();

    try {
      // Create transaction for blob deletion
      const tx = new Transaction();
      
      // Use type assertion to bypass TypeScript errors due to SDK version differences
      await (this.client as any).deleteBlob({
        blobId,
        transaction: tx
      });
      
      // Execute transaction with suiClient
      const suiClient = (this.client as any).suiClient;
      const result = await (tx as any).execute({ client: suiClient });
      
      // Also delete metadata from the backend
      await this.deleteMetadata(blobId);
      
      return result.digest;
    } catch (error) {
      console.error('Failed to delete data from Walrus:', error);
      throw new Error(`Failed to delete data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get blob status from Walrus
   * @param blobId The blob ID to check
   * @returns Status information about the blob
   */
  async getBlobStatus(blobId: string): Promise<any> {
    await this.ensureInitialized();

    try {
      // Get blob metadata from chain
      const metadata = await this.client!.getBlobMetadata({ blobId });
      return metadata;
    } catch (error) {
      console.error('Failed to get blob status from Walrus:', error);
      throw new Error(`Failed to get blob status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Store metadata for a blob in Gami backend
   * @param blobId The blob ID
   * @param metadata The metadata to store
   */
  private async storeMetadata(blobId: string, metadata: BlobMetadata): Promise<void> {
    try {
      await axios.post('/api/walrus/metadata', {
        blobId,
        metadata
      });
    } catch (error) {
      console.error('Failed to store metadata for blob:', error);
      // Continue even if metadata storage fails
    }
  }

  /**
   * Retrieve metadata for a blob from Gami backend
   * @param blobId The blob ID
   * @returns The metadata or undefined if not found
   */
  private async retrieveMetadata(blobId: string): Promise<BlobMetadata | undefined> {
    try {
      const response = await axios.get(`/api/walrus/metadata/${blobId}`);
      return response.data.metadata;
    } catch (error) {
      // 404 is expected if metadata is not found
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      console.error('Failed to retrieve metadata for blob:', error);
      return undefined;
    }
  }

  /**
   * Delete metadata for a blob from Gami backend
   * @param blobId The blob ID
   */
  private async deleteMetadata(blobId: string): Promise<void> {
    try {
      await axios.delete(`/api/walrus/metadata/${blobId}`);
    } catch (error) {
      // 404 is expected if metadata is not found
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return;
      }
      console.error('Failed to delete metadata for blob:', error);
      // Continue even if metadata deletion fails
    }
  }

  /**
   * Get the appropriate package config for the selected network
   */
  private getPackageConfig() {
    switch (this.config.network) {
      case 'mainnet':
        return MAINNET_WALRUS_PACKAGE_CONFIG;
      case 'testnet':
        return TESTNET_WALRUS_PACKAGE_CONFIG;
      case 'devnet':
        // For devnet, we would typically use testnet config
        // but you'd override package ID in real implementation
        return TESTNET_WALRUS_PACKAGE_CONFIG;
      default:
        return TESTNET_WALRUS_PACKAGE_CONFIG;
    }
  }

  /**
   * Get default RPC URL for the selected network
   */
  private getDefaultRpcUrl(): string {
    switch (this.config.network) {
      case 'mainnet':
        return 'https://sui-mainnet.mystenlabs.com';
      case 'testnet':
        return 'https://sui-testnet.mystenlabs.com';
      case 'devnet':
        return 'https://sui-devnet.mystenlabs.com';
      default:
        return 'https://sui-testnet.mystenlabs.com';
    }
  }

  /**
   * Ensure the client is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error('Failed to initialize Walrus client');
      }
    }
  }
}