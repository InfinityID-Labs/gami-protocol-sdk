/**
 * @fileoverview E-commerce Integration SDK
 * This SDK provides methods for integrating with Gami Protocol for e-commerce partners.
 * It supports partner registration, customer onboarding, and points management.
 */

import { apiKeyRequest } from '../lib/api';

/**
 * Transaction type for points transactions
 */
export enum TransactionType {
  AWARD = 'award',
  REDEEM = 'redeem',
  SHADOW_AWARD = 'shadow_award',       // Award to customer without app
  SHADOW_REDEEM = 'shadow_redeem',     // Redeem from customer without app
  ACCOUNT_ACTIVATION = 'account_activation', // When shadow account is activated
  POINTS_MIGRATION = 'points_migration'  // When points are migrated to activated account
}

/**
 * Partner registration data
 */
export interface PartnerRegistrationData {
  partnerId?: string;
  partnerName: string;
  partnerApiKey?: string;
  deepLinkUrl?: string;
  redirectUrl?: string;
  oauthCallbackUrl?: string;
  customCssUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Customer onboarding data
 */
export interface CustomerOnboardingData {
  partnerId: string;
  externalCustomerId: string;
  name?: string;
  email?: string;
  phone?: string;
  walletPublicKey?: string;
  metadata?: Record<string, any>;
}

/**
 * Award points data
 */
export interface AwardPointsData {
  partnerId: string;
  externalCustomerId: string;
  points: number;
  transactionType?: TransactionType;
  metadata?: Record<string, any>;
}

/**
 * Redeem points data
 */
export interface RedeemPointsData {
  partnerId: string;
  externalCustomerId: string;
  points: number;
  purpose: string;
  metadata?: Record<string, any>;
}

/**
 * Shadow account activation data
 */
export interface ShadowAccountActivationData {
  claimCode: string;
  walletPublicKey: string;
  email?: string;
  phone?: string;
  deviceId?: string;
}

/**
 * Shadow account info
 */
export interface ShadowAccountInfo {
  universalId: string;
  points: number;
  partnerName: string;
  pendingActivation: boolean;
  lastActivity: string;
}

/**
 * QR code format options
 */
export type QRFormat = 'svg' | 'png' | 'dataUrl';

/**
 * E-commerce Integration SDK
 */
export class EcommerceIntegration {
  private apiKey: string;
  
  /**
   * Create a new instance of the E-commerce Integration SDK
   * @param apiKey API key for authentication
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Alternative constructor for use with GamiSDK
   * @param apiUrl Base API URL
   * @param apiKey API key for authentication
   */
  static create(apiUrl: string, apiKey: string): EcommerceIntegration {
    const instance = new EcommerceIntegration(apiKey);
    return instance;
  }
  
  /**
   * Register a new partner business
   * @param data Partner registration data
   * @returns Partner registration response
   */
  async registerPartner(data: PartnerRegistrationData) {
    const response = await apiKeyRequest('POST', '/api/partner/register', this.apiKey, data);
    return await response.json();
  }
  
  /**
   * Onboard a new customer from a partner
   * @param data Customer onboarding data
   * @returns Customer onboarding response with QR code and deep link
   */
  async onboardCustomer(data: CustomerOnboardingData) {
    const response = await apiKeyRequest('POST', '/api/customer/onboard', this.apiKey, data);
    return await response.json();
  }
  
  /**
   * Generate a QR code for customer onboarding
   * @param universalId Universal customer ID
   * @param format QR code format (svg, png, dataUrl)
   * @returns QR code data
   */
  async generateQRCode(universalId: string, format: QRFormat = 'svg') {
    const response = await apiKeyRequest('GET', `/api/customer/${universalId}/qr?format=${format}`, this.apiKey);
    return await response.json();
  }
  
  /**
   * Generate a deep link for the mobile app
   * @param universalId Universal customer ID
   * @returns Deep link URL
   */
  async generateDeepLink(universalId: string) {
    const response = await apiKeyRequest('GET', `/api/customer/${universalId}/deeplink`, this.apiKey);
    return await response.json();
  }
  
  /**
   * Award points to a customer
   * @param data Award points data
   * @returns Transaction response with updated balance
   */
  async awardPoints(data: AwardPointsData) {
    const response = await apiKeyRequest('POST', '/api/points/award', this.apiKey, data);
    return await response.json();
  }
  
  /**
   * Redeem points from a customer's balance
   * @param data Redeem points data
   * @returns Transaction response with updated balance
   */
  async redeemPoints(data: RedeemPointsData) {
    const response = await apiKeyRequest('POST', '/api/points/redeem', this.apiKey, data);
    return await response.json();
  }
  
  /**
   * Get a customer's points balance
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Current points balance
   */
  async getCustomerBalance(externalCustomerId: string, partnerId: string) {
    const response = await apiKeyRequest('GET', `/api/customer/balance?externalCustomerId=${encodeURIComponent(externalCustomerId)}&partnerId=${encodeURIComponent(partnerId)}`, this.apiKey);
    return await response.json();
  }
  
  /**
   * Check if a customer exists
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Whether the customer exists
   */
  async customerExists(externalCustomerId: string, partnerId: string) {
    const response = await apiKeyRequest('GET', `/api/customer/exists?externalCustomerId=${encodeURIComponent(externalCustomerId)}&partnerId=${encodeURIComponent(partnerId)}`, this.apiKey);
    return await response.json();
  }
  
  /**
   * Validate and get information about a claim code
   * @param claimCode Claim code to validate
   * @returns Information about the shadow account
   */
  async validateClaimCode(claimCode: string) {
    const response = await apiKeyRequest('GET', `/api/customer/claim-code/${encodeURIComponent(claimCode)}`, this.apiKey);
    return await response.json();
  }
  
  /**
   * Activate a shadow account
   * @param data Shadow account activation data
   * @returns Activated account information
   */
  async activateShadowAccount(data: ShadowAccountActivationData) {
    const response = await apiKeyRequest('POST', '/api/customer/activate-shadow-account', this.apiKey, data);
    return await response.json();
  }
  
  /**
   * Get all shadow accounts for a partner
   * @param partnerId Partner ID
   * @returns List of shadow accounts
   */
  async getPartnerShadowAccounts(partnerId: string) {
    const response = await apiKeyRequest('GET', `/api/partner/${encodeURIComponent(partnerId)}/shadow-accounts`, this.apiKey);
    return await response.json();
  }
  
  /**
   * Create a customer profile for automated onboarding
   * This is used when a customer doesn't have the app yet. The system will create
   * a shadow account and generate a claim code that can be used later to claim all
   * accumulated points when the customer downloads the app.
   * 
   * @param data Customer onboarding data (without wallet address)
   * @returns Shadow customer profile with claim code
   */
  async createShadowCustomer(data: Omit<CustomerOnboardingData, 'walletPublicKey'>) {
    // Ensure walletPublicKey is undefined to trigger shadow account creation
    const shadowData = { ...data, walletPublicKey: undefined };
    const response = await apiKeyRequest('POST', '/api/customer/onboard', this.apiKey, shadowData);
    return await response.json();
  }
}

export default EcommerceIntegration;