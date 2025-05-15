import { GamiSDKConfig, TrackEventParams, ConnectWalletParams } from './types';
import { EventTracker } from './event-tracker';
import { WalletConnector, TransactionParams, WalletData } from './wallet-connector';
import { CrossChainTransfer, CrossChainTransferParams, ChainType } from './cross-chain-transfer';
import { WalrusStorage, WalrusStorageConfig, StoreOptions } from './walrus-storage';
import { 
  EcommerceIntegration, 
  PartnerRegistrationData, 
  CustomerOnboardingData,
  AwardPointsData,
  RedeemPointsData,
  QRFormat,
  TransactionType
} from './ecommerce-integration';
import * as gamification from './gamification';

/**
 * Gami Protocol SDK for integrating gamification into React applications
 */
export class GamiSDK {
  private config: GamiSDKConfig;
  private apiUrl: string;
  private eventTracker: EventTracker;
  private walletConnector: WalletConnector;
  private crossChainTransfer: CrossChainTransfer;
  private walrusStorage: WalrusStorage | null = null;
  private ecommerceIntegration: EcommerceIntegration;

  /**
   * Initialize the Gami SDK
   * @param config SDK configuration
   */
  constructor(config: GamiSDKConfig) {
    this.config = {
      ...config,
      environment: config.environment || 'development'
    };

    // Set API URL
    this.apiUrl = config.apiUrl || 
      (this.config.environment === 'production' 
        ? 'https://api.gamiprotocol.com/api'
        : '/api');
    
    // Initialize components
    this.eventTracker = new EventTracker(this.apiUrl, this.config.apiKey);
    this.walletConnector = new WalletConnector(this.apiUrl, this.config.apiKey);
    this.crossChainTransfer = new CrossChainTransfer(this.apiUrl, this.config.apiKey);
    this.ecommerceIntegration = new EcommerceIntegration(this.config.apiKey);
  }

  /**
   * Track a user action to award XP
   * @param params The tracking parameters
   */
  async trackEvent(params: TrackEventParams) {
    return this.eventTracker.trackEvent(params);
  }

  /**
   * Add an event listener to track user actions
   * @param element The DOM element to listen to
   * @param eventType The DOM event type (e.g., 'click', 'submit')
   * @param gamiEvent The Gami event name to track
   * @param userId The user ID
   * @param metadataFn Optional function to extract metadata from the event
   */
  addEventTracker(
    element: HTMLElement | null,
    eventType: string,
    gamiEvent: string,
    userId: string,
    metadataFn?: (event: Event) => Record<string, any>
  ) {
    this.eventTracker.addEventTracker(element, eventType, gamiEvent, userId, metadataFn);
  }

  /**
   * Connect to a blockchain wallet
   * @param params Connection parameters
   */
  async connectWallet(params: ConnectWalletParams) {
    return this.walletConnector.connectWallet(params);
  }

  /**
   * Disconnect a wallet
   * @param publicKey Wallet public key
   */
  async disconnectWallet(publicKey: string) {
    return this.walletConnector.disconnectWallet(publicKey);
  }

  /**
   * Get a connected wallet by public key
   * @param publicKey The wallet's public key
   */
  getWallet(publicKey: string): WalletData | undefined {
    return this.walletConnector.getWallet(publicKey);
  }

  /**
   * Get all connected wallets
   */
  getAllWallets(): WalletData[] {
    return this.walletConnector.getAllWallets();
  }

  /**
   * Check if a wallet is connected
   * @param publicKey Wallet public key
   */
  isWalletConnected(publicKey: string): boolean {
    return this.walletConnector.isWalletConnected(publicKey);
  }

  /**
   * Get token balances for a wallet
   * @param publicKey Wallet's public key
   */
  async getTokenBalances(publicKey: string) {
    return this.walletConnector.getTokenBalances(publicKey);
  }

  /**
   * Send a transaction from a connected wallet
   * @param publicKey Wallet's public key
   * @param params Transaction parameters
   */
  async sendTransaction(publicKey: string, params: TransactionParams) {
    return this.walletConnector.sendTransaction(publicKey, params);
  }

  /**
   * Initiate a cross-chain token transfer
   * @param params Transfer parameters
   */
  async transferTokensCrossChain(params: CrossChainTransferParams) {
    return this.crossChainTransfer.transferTokens(params);
  }

  /**
   * Get supported chains for cross-chain transfers
   */
  async getSupportedChains() {
    return this.crossChainTransfer.getSupportedChains();
  }

  /**
   * Get the fee estimate for a cross-chain transfer
   * @param fromChain Source chain
   * @param toChain Destination chain
   * @param amount Amount to transfer
   */
  async getCrossChainFeeEstimate(fromChain: ChainType, toChain: ChainType, amount: number) {
    return this.crossChainTransfer.getFeeEstimate(fromChain, toChain, amount);
  }

  /**
   * Get transfer history for a user
   * @param walletPublicKey The user's wallet public key
   */
  async getCrossChainTransferHistory(walletPublicKey: string) {
    return this.crossChainTransfer.getTransferHistory(walletPublicKey);
  }

  /**
   * Check the status of services (PostgreSQL, MongoDB)
   */
  async checkServicesStatus() {
    return gamification.checkStatus();
  }

  /**
   * Award an achievement to a user
   * @param userId The user ID
   * @param achievement Achievement details
   */
  async awardAchievement(userId: string, achievement: {
    achievementId: string;
    title: string;
    description: string;
    imageUrl?: string;
    xpAmount?: number;
    metadata?: Record<string, any>;
  }) {
    return gamification.awardAchievement(userId, achievement);
  }

  /**
   * Add an item to a user's inventory
   * @param userId The user ID
   * @param item Item details
   */
  async addInventoryItem(userId: string, item: {
    itemId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    quantity?: number;
    attributes?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    return gamification.addInventoryItem(userId, item);
  }

  /**
   * Track a gamification event with optional XP
   * @param data Event data
   */
  async trackGamificationEvent(data: {
    userId: string;
    event: string;
    actionType?: string;
    xpAmount?: number;
    contextData?: Record<string, any>;
    metadata?: Record<string, any>;
    sessionId?: string;
  }) {
    return gamification.trackEvent(data);
  }

  /**
   * Get a user's profile with achievements and inventory
   * @param userId The user ID
   */
  async getUserProfile(userId: string) {
    return gamification.getUserProfile(userId);
  }

  /**
   * Get a user's event history
   * @param userId The user ID
   * @param options Pagination options
   */
  async getUserEvents(userId: string, options?: { limit?: number; skip?: number }) {
    return gamification.getUserEvents(userId, options);
  }

  /**
   * Get analytics for the current project
   */
  async getProjectAnalytics() {
    return gamification.getAnalytics();
  }

  /**
   * Initialize Walrus blockchain storage
   * @param config Walrus storage configuration
   * @returns True if initialization was successful
   */
  async initializeStorage(config: WalrusStorageConfig): Promise<boolean> {
    this.walrusStorage = new WalrusStorage(config);
    return this.walrusStorage.initialize();
  }

  /**
   * Store data in Walrus blockchain storage
   * @param data Data to store (string or binary)
   * @param options Storage options
   * @returns Storage result with blob ID
   */
  async storeData(data: string | Uint8Array, options?: StoreOptions) {
    if (!this.walrusStorage) {
      throw new Error('Walrus storage not initialized. Call initializeStorage() first.');
    }
    return this.walrusStorage.store(data, options);
  }

  /**
   * Retrieve data from Walrus blockchain storage
   * @param blobId Blob ID to retrieve
   * @returns Retrieved data and metadata
   */
  async retrieveData(blobId: string) {
    if (!this.walrusStorage) {
      throw new Error('Walrus storage not initialized. Call initializeStorage() first.');
    }
    return this.walrusStorage.retrieve(blobId);
  }

  /**
   * Delete data from Walrus blockchain storage
   * @param blobId Blob ID to delete
   * @returns Transaction ID of the deletion
   */
  async deleteData(blobId: string) {
    if (!this.walrusStorage) {
      throw new Error('Walrus storage not initialized. Call initializeStorage() first.');
    }
    return this.walrusStorage.delete(blobId);
  }

  /**
   * Get storage blob status
   * @param blobId Blob ID to check
   * @returns Status information about the blob
   */
  async getStorageBlobStatus(blobId: string) {
    if (!this.walrusStorage) {
      throw new Error('Walrus storage not initialized. Call initializeStorage() first.');
    }
    return this.walrusStorage.getBlobStatus(blobId);
  }

  /**
   * Register a partner business for e-commerce integration
   * @param data Partner registration data
   * @returns Partner registration response
   */
  async registerPartner(data: PartnerRegistrationData) {
    return this.ecommerceIntegration.registerPartner(data);
  }

  /**
   * Onboard a new customer from a partner
   * @param data Customer onboarding data
   * @returns Customer onboarding response with QR code and deep link
   */
  async onboardCustomer(data: CustomerOnboardingData) {
    return this.ecommerceIntegration.onboardCustomer(data);
  }

  /**
   * Generate a QR code for customer onboarding
   * @param universalId Universal customer ID
   * @param format QR code format (svg, png, dataUrl)
   * @returns QR code data
   */
  async generateQRCode(universalId: string, format?: QRFormat) {
    return this.ecommerceIntegration.generateQRCode(universalId, format);
  }

  /**
   * Generate a deep link for the mobile app
   * @param universalId Universal customer ID
   * @returns Deep link URL
   */
  async generateDeepLink(universalId: string) {
    return this.ecommerceIntegration.generateDeepLink(universalId);
  }

  /**
   * Award points to a customer
   * @param data Award points data
   * @returns Transaction response with updated balance
   */
  async awardPoints(data: AwardPointsData) {
    return this.ecommerceIntegration.awardPoints(data);
  }

  /**
   * Redeem points from a customer's balance
   * @param data Redeem points data
   * @returns Transaction response with updated balance
   */
  async redeemPoints(data: RedeemPointsData) {
    return this.ecommerceIntegration.redeemPoints(data);
  }

  /**
   * Get a customer's points balance
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Current points balance
   */
  async getCustomerBalance(externalCustomerId: string, partnerId: string) {
    return this.ecommerceIntegration.getCustomerBalance(externalCustomerId, partnerId);
  }

  /**
   * Check if a customer exists
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Whether the customer exists
   */
  async customerExists(externalCustomerId: string, partnerId: string) {
    return this.ecommerceIntegration.customerExists(externalCustomerId, partnerId);
  }
}

// Export types
export * from './types';
export * from './wallet-connector';
export * from './cross-chain-transfer';
export * from './ecommerce-integration';
export { gamification };
export * from './walrus-storage';
