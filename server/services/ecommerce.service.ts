import { v4 as uuidv4 } from 'uuid';
import { generateApiKey } from '../auth';
import { db } from '../db';
import { 
  partners, 
  customers, 
  pointsTransactions,
  Partner, 
  Customer, 
  PointsTransaction, 
  InsertPartner,
  InsertCustomer,
  InsertPointsTransaction,
  TransactionType
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import QRCode from 'qrcode';

/**
 * QR code formats that can be generated
 */
export type QRFormat = 'svg' | 'png' | 'dataUrl';

/**
 * Service for e-commerce partner integrations
 */
export class EcommerceService {
  /**
   * Register a new partner business
   * @param partnerData Partner registration data
   * @returns The created partner record
   */
  async registerPartner(partnerData: InsertPartner): Promise<Partner> {
    // Generate a unique ID for the partner if none provided
    if (!partnerData.partnerId) {
      partnerData.partnerId = `partner_${uuidv4().replace(/-/g, '')}`;
    }
    
    // Generate API key if none provided
    if (!partnerData.partnerApiKey) {
      partnerData.partnerApiKey = generateApiKey();
    }
    
    // Insert the partner record
    const [partner] = await db
      .insert(partners)
      .values(partnerData)
      .returning();
      
    return partner;
  }

  /**
   * Get a partner by ID
   * @param partnerId Partner ID
   * @returns The partner or undefined if not found
   */
  async getPartnerById(partnerId: string): Promise<Partner | undefined> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.partnerId, partnerId));
      
    return partner;
  }

  /**
   * Check if a partner API key is valid
   * @param partnerId Partner ID
   * @param apiKey API key to validate
   * @returns Whether the API key is valid
   */
  async validatePartnerApiKey(partnerId: string, apiKey: string): Promise<boolean> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(
        and(
          eq(partners.partnerId, partnerId),
          eq(partners.partnerApiKey, apiKey),
          eq(partners.active, true)
        )
      );
      
    return !!partner;
  }

  /**
   * Onboard a new customer from a partner
   * @param customerData Customer data
   * @returns The created customer record with QR code and deep link
   */
  async onboardCustomer(customerData: Omit<InsertCustomer, 'universalId'>): Promise<Customer> {
    // Check if the partner exists
    const partner = await this.getPartnerById(customerData.partnerId);
    if (!partner) {
      throw new Error(`Partner with ID ${customerData.partnerId} not found`);
    }
    
    // Check if the customer already exists for this partner
    const existingCustomer = await this.getCustomerByExternalId(
      customerData.externalCustomerId,
      customerData.partnerId
    );
    
    if (existingCustomer) {
      return existingCustomer;
    }
    
    // Generate a universal customer ID
    const universalId = `cust_${uuidv4().replace(/-/g, '')}`;
    
    // Determine if this is a shadow account (no wallet public key)
    const isShadowAccount = !customerData.walletPublicKey;
    
    // Generate a claim code if this is a shadow account
    const claimCode = isShadowAccount ? this.generateClaimCode() : null;
    
    // Create complete customer data with generated values
    const completeCustomerData: InsertCustomer = {
      ...customerData,
      universalId,
      shadowAccount: isShadowAccount,
      metadata: {
        ...customerData.metadata,
        isShadowAccount,
        createdAt: new Date().toISOString(),
        claimNotified: false
      }
    };
    
    // Insert the customer record
    const [customer] = await db
      .insert(customers)
      .values(completeCustomerData)
      .returning();
    
    // Generate QR code and deep link
    const qrCode = await this.generateQRCode(universalId);
    // Convert null to undefined for type compatibility
    const deepLinkUrl = partner.deepLinkUrl === null ? undefined : partner.deepLinkUrl;
    const deepLink = this.generateDeepLink(universalId, deepLinkUrl);
    
    // Update the customer record with QR code, deep link, and claim code
    const [updatedCustomer] = await db
      .update(customers)
      .set({ 
        qrCode, 
        deepLink,
        claimCode
      })
      .where(eq(customers.id, customer.id))
      .returning();
      
    return updatedCustomer;
  }

  /**
   * Generate a unique claim code for shadow accounts
   * @returns A unique 8-character alphanumeric code
   */
  private generateClaimCode(): string {
    // Generate a unique, easy-to-type code for claiming points
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitting similar looking characters
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get a customer by external ID and partner ID
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns The customer or undefined if not found
   */
  async getCustomerByExternalId(
    externalCustomerId: string,
    partnerId: string
  ): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.externalCustomerId, externalCustomerId),
          eq(customers.partnerId, partnerId)
        )
      );
      
    return customer;
  }

  /**
   * Get a customer by universal ID
   * @param universalId Universal customer ID
   * @returns The customer or undefined if not found
   */
  async getCustomerByUniversalId(universalId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.universalId, universalId));
      
    return customer;
  }

  /**
   * Find a customer by claim code
   * @param claimCode Claim code 
   * @returns The customer or undefined if not found
   */
  async getCustomerByClaimCode(claimCode: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.claimCode, claimCode));
      
    return customer;
  }

  /**
   * Check if customer exists
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Whether the customer exists
   */
  async customerExists(externalCustomerId: string, partnerId: string): Promise<boolean> {
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    return !!customer;
  }

  /**
   * Generate a QR code for customer onboarding
   * @param universalId Universal customer ID
   * @param format QR code format
   * @returns QR code data
   */
  async generateQRCode(universalId: string, format: QRFormat = 'svg'): Promise<string> {
    const data = `https://app.gamiprotocol.com/onboard?id=${universalId}`;
    
    switch (format) {
      case 'svg':
        return QRCode.toString(data, { type: 'svg' });
      case 'png':
        return QRCode.toDataURL(data);
      case 'dataUrl':
        return QRCode.toDataURL(data);
      default:
        return QRCode.toString(data, { type: 'svg' });
    }
  }

  /**
   * Generate a deep link for the mobile app
   * @param universalId Universal customer ID
   * @param baseUrl Optional base URL from partner config
   * @returns Deep link URL
   */
  generateDeepLink(universalId: string, baseUrl?: string): string {
    // Use nullish coalescing to handle undefined or empty string
    const base = baseUrl ?? 'gami://onboard';
    return `${base}?id=${universalId}`;
  }

  /**
   * Award points to a customer
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @param points Number of points to award
   * @param transactionType Type of transaction
   * @param metadata Additional transaction data
   * @returns Transaction record and updated points balance
   */
  async awardPoints(
    externalCustomerId: string,
    partnerId: string,
    points: number,
    transactionType: string = TransactionType.AWARD,
    metadata: Record<string, any> = {}
  ): Promise<{ transaction: PointsTransaction; balance: number }> {
    // Get the customer
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    if (!customer) {
      throw new Error(`Customer with external ID ${externalCustomerId} not found for partner ${partnerId}`);
    }
    
    // For shadow accounts, use SHADOW_AWARD transaction type
    const effectiveTransactionType = customer.shadowAccount 
      ? TransactionType.SHADOW_AWARD 
      : transactionType;
    
    // Create transaction record
    const transferId = `txn_${uuidv4().replace(/-/g, '')}`;
    
    const transactionData: InsertPointsTransaction = {
      transferId,
      universalId: customer.universalId,
      partnerId,
      externalCustomerId,
      points,
      transactionType: effectiveTransactionType,
      metadata: {
        ...metadata,
        isShadowTransaction: customer.shadowAccount
      }
    };
    
    const [transaction] = await db
      .insert(pointsTransactions)
      .values(transactionData)
      .returning();
    
    // Update customer points
    const newBalance = customer.points + points;
    const [updatedCustomer] = await db
      .update(customers)
      .set({ 
        points: newBalance,
        lastActivity: new Date()
      })
      .where(eq(customers.id, customer.id))
      .returning();
    
    return {
      transaction,
      balance: updatedCustomer.points
    };
  }

  /**
   * Redeem points from customer's balance
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @param points Number of points to redeem
   * @param purpose Purpose of redemption
   * @param metadata Additional redemption data
   * @returns Transaction record and updated points balance
   */
  async redeemPoints(
    externalCustomerId: string,
    partnerId: string,
    points: number,
    purpose: string,
    metadata: Record<string, any> = {}
  ): Promise<{ transaction: PointsTransaction; balance: number }> {
    // Get the customer
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    if (!customer) {
      throw new Error(`Customer with external ID ${externalCustomerId} not found for partner ${partnerId}`);
    }
    
    // Check if customer has enough points
    if (customer.points < points) {
      throw new Error(`Customer has insufficient points (${customer.points}) to redeem ${points} points`);
    }
    
    // For shadow accounts, use SHADOW_REDEEM transaction type
    const effectiveTransactionType = customer.shadowAccount 
      ? TransactionType.SHADOW_REDEEM 
      : TransactionType.REDEEM;
    
    // Create transaction record
    const transferId = `txn_${uuidv4().replace(/-/g, '')}`;
    
    const transactionData: InsertPointsTransaction = {
      transferId,
      universalId: customer.universalId,
      partnerId,
      externalCustomerId,
      points: -points, // Negative for redemption
      transactionType: effectiveTransactionType,
      purpose,
      metadata: {
        ...metadata,
        isShadowTransaction: customer.shadowAccount
      }
    };
    
    const [transaction] = await db
      .insert(pointsTransactions)
      .values(transactionData)
      .returning();
    
    // Update customer points
    const newBalance = customer.points - points;
    const [updatedCustomer] = await db
      .update(customers)
      .set({ 
        points: newBalance,
        lastActivity: new Date()
      })
      .where(eq(customers.id, customer.id))
      .returning();
    
    return {
      transaction,
      balance: updatedCustomer.points
    };
  }

  /**
   * Get a customer's points balance
   * @param externalCustomerId External customer ID
   * @param partnerId Partner ID
   * @returns Current points balance or null if customer not found
   */
  async getCustomerBalance(
    externalCustomerId: string,
    partnerId: string
  ): Promise<number | null> {
    const customer = await this.getCustomerByExternalId(externalCustomerId, partnerId);
    return customer ? customer.points : null;
  }
  
  /**
   * Activate a shadow account when a customer downloads the mobile app
   * @param claimCodeOrUniversalId Claim code or universal ID 
   * @param walletPublicKey Customer's wallet public key
   * @param additionalData Additional customer data to update
   * @returns The activated customer account
   */
  async activateShadowAccount(
    claimCodeOrUniversalId: string,
    walletPublicKey: string,
    additionalData: {
      email?: string;
      phone?: string;
      deviceId?: string;
    } = {}
  ): Promise<Customer> {
    // Try to find customer by claim code first
    let customer = await this.getCustomerByClaimCode(claimCodeOrUniversalId);
    
    // If not found by claim code, try universal ID
    if (!customer) {
      customer = await this.getCustomerByUniversalId(claimCodeOrUniversalId);
    }
    
    if (!customer) {
      throw new Error('Invalid claim code or universal ID');
    }
    
    // Check if this is indeed a shadow account
    if (!customer.shadowAccount) {
      throw new Error('This account is already activated');
    }
    
    // Update customer metadata with activation information
    const metadata = customer.metadata || {};
    metadata.activatedAt = new Date().toISOString();
    metadata.isShadowAccount = false;
    
    if (additionalData.deviceId) {
      metadata.deviceId = additionalData.deviceId;
    }
    
    // Update customer record
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        walletPublicKey,
        shadowAccount: false,
        claimCode: null, // Clear claim code after activation
        email: additionalData.email || customer.email,
        phone: additionalData.phone || customer.phone,
        metadata,
        lastActivity: new Date()
      })
      .where(eq(customers.id, customer.id))
      .returning();
    
    // Create an activation transaction record
    const transferId = `txn_${uuidv4().replace(/-/g, '')}`;
    await db
      .insert(pointsTransactions)
      .values({
        transferId,
        universalId: customer.universalId,
        partnerId: customer.partnerId,
        externalCustomerId: customer.externalCustomerId,
        points: 0, // No point change for activation
        transactionType: TransactionType.ACCOUNT_ACTIVATION,
        metadata: {
          note: 'Shadow account activated with mobile app',
          previousPoints: customer.points,
          activationMethod: 'claim_code'
        }
      });
    
    return updatedCustomer;
  }
  
  /**
   * Get all shadow accounts for a partner
   * @param partnerId Partner ID
   * @returns List of shadow accounts
   */
  async getPartnerShadowAccounts(partnerId: string): Promise<Customer[]> {
    const shadowAccounts = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.partnerId, partnerId),
          eq(customers.shadowAccount, true)
        )
      );
      
    return shadowAccounts;
  }
  
  /**
   * Get transactions for a shadow account
   * @param universalId Universal customer ID
   * @returns List of transactions
   */
  async getShadowAccountTransactions(universalId: string): Promise<PointsTransaction[]> {
    const transactions = await db
      .select()
      .from(pointsTransactions)
      .where(eq(pointsTransactions.universalId, universalId));
      
    return transactions;
  }
  
  /**
   * Get migration-ready shadow accounts (with points, not claimed)
   * @returns List of shadow accounts ready for migration
   */
  async getMigrationReadyShadowAccounts(): Promise<Customer[]> {
    const shadowAccounts = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.shadowAccount, true),
          db.sql`${customers.points} > 0`
        )
      );
      
    return shadowAccounts;
  }
}

export const ecommerceService = new EcommerceService();