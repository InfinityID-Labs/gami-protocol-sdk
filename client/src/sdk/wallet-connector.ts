import { ConnectWalletParams, ConnectWalletResponse, WalletType, GamiError } from './types';
import { apiRequest, configureApi } from './api';

/**
 * Wallet Connection Data
 */
export interface WalletData {
  publicKey: string;
  chainType: 'solana' | 'ethereum' | 'polygon' | 'avalanche' | 'bsc' | 'fantom';
  walletType: WalletType;
  walletObject?: any;
  isConnected: boolean;
}

/**
 * Wallet Transaction Params
 */
export interface TransactionParams {
  to: string;
  amount: number;
  token?: string;
  memo?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Wallet Transaction Response
 */
export interface TransactionResponse {
  success: boolean;
  txHash?: string;
  error?: GamiError;
}

/**
 * Token Balance Response
 */
export interface TokenBalanceResponse {
  success: boolean;
  balances?: {
    token: string;
    amount: number;
    usdValue?: number;
  }[];
  error?: GamiError;
}

/**
 * Manages wallet connections and interactions for blockchain operations
 */
export class WalletConnector {
  private connectedWallets: Map<string, WalletData> = new Map();

  /**
   * Initialize the wallet connector with API configuration
   * @param apiUrl Base API URL
   * @param apiKey API key
   */
  constructor(apiUrl: string, apiKey: string) {
    // Configure the API module for this instance
    configureApi(apiUrl, apiKey);
  }

  /**
   * Connect to a blockchain wallet
   * @param params Connection parameters
   * @returns Promise with connection result
   */
  async connectWallet(params: ConnectWalletParams): Promise<ConnectWalletResponse> {
    try {
      // First verify wallet type is enabled on the server
      try {
        const serverResponse = await apiRequest('POST', '/connect-wallet', 
          { walletType: params.walletType }
        );
        
        // If we reach here, the server check passed
      } catch (serverError) {
        const error = new Error(serverError instanceof Error 
          ? serverError.message 
          : 'Failed to verify wallet type');
        
        if (params.onError) params.onError(error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Handle wallet connection based on type
      let publicKey: string | undefined;
      let walletObject: any;
      
      switch (params.walletType) {
        case 'phantom':
          const phantomResult = await this.connectPhantom();
          publicKey = phantomResult.publicKey;
          walletObject = phantomResult.walletObj;
          break;
        case 'solflare':
          const solflareResult = await this.connectSolflare();
          publicKey = solflareResult.publicKey;
          walletObject = solflareResult.walletObj;
          break;
        case 'walletconnect':
          const walletConnectResult = await this.connectWalletConnect();
          publicKey = walletConnectResult.publicKey;
          walletObject = walletConnectResult.walletObj;
          break;
        default:
          throw new Error(`Unsupported wallet type: ${params.walletType}`);
      }

      if (publicKey) {
        // Store the connected wallet
        this.connectedWallets.set(publicKey, {
          publicKey,
          chainType: this.getChainType(params.walletType),
          walletType: params.walletType,
          walletObject,
          isConnected: true
        });

        if (params.onSuccess) params.onSuccess(publicKey);
        return {
          success: true,
          publicKey,
        };
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error) {
      if (params.onError) params.onError(error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Disconnect a wallet
   * @param publicKey Wallet public key
   * @returns Whether disconnect was successful
   */
  async disconnectWallet(publicKey: string): Promise<boolean> {
    const walletData = this.connectedWallets.get(publicKey);
    
    if (!walletData) {
      return false;
    }

    try {
      switch (walletData.walletType) {
        case 'phantom':
          if (walletData.walletObject?.disconnect) {
            await walletData.walletObject.disconnect();
          }
          break;
        case 'solflare':
          if (walletData.walletObject?.disconnect) {
            await walletData.walletObject.disconnect();
          }
          break;
        // Handle other wallet types
      }

      this.connectedWallets.delete(publicKey);
      return true;
    } catch (error) {
      console.error('Wallet disconnect error:', error);
      return false;
    }
  }

  /**
   * Get a connected wallet
   * @param publicKey The wallet's public key
   * @returns The wallet data or undefined if not connected
   */
  getWallet(publicKey: string): WalletData | undefined {
    return this.connectedWallets.get(publicKey);
  }

  /**
   * Get all connected wallets
   * @returns Array of wallet data
   */
  getAllWallets(): WalletData[] {
    return Array.from(this.connectedWallets.values());
  }

  /**
   * Check if a wallet is connected
   * @param publicKey Wallet public key
   * @returns True if connected
   */
  isWalletConnected(publicKey: string): boolean {
    return this.connectedWallets.has(publicKey);
  }

  /**
   * Get token balances for a wallet
   * @param publicKey Wallet's public key
   * @returns Token balances
   */
  async getTokenBalances(publicKey: string): Promise<TokenBalanceResponse> {
    const walletData = this.connectedWallets.get(publicKey);
    
    if (!walletData) {
      return {
        success: false,
        error: {
          code: 'WALLET_NOT_CONNECTED',
          message: 'Wallet is not connected'
        }
      };
    }

    try {
      // Call our backend API for token balance information
      const response = await apiRequest('POST', '/wallet/balances', {
        publicKey,
        chainType: walletData.chainType
      });

      const data = await response.json();
      return {
        success: true,
        balances: data.balances || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: error instanceof Error ? error.message : 'Unexpected error fetching balances'
        }
      };
    }
  }

  /**
   * Send a transaction from a connected wallet
   * @param publicKey Wallet's public key
   * @param params Transaction parameters
   * @returns Transaction result
   */
  async sendTransaction(publicKey: string, params: TransactionParams): Promise<TransactionResponse> {
    const walletData = this.connectedWallets.get(publicKey);
    
    if (!walletData) {
      const error = new Error('Wallet is not connected');
      if (params.onError) params.onError(error);
      return {
        success: false,
        error: {
          code: 'WALLET_NOT_CONNECTED',
          message: 'Wallet is not connected'
        }
      };
    }

    try {
      // Different implementation based on chain type
      if (walletData.chainType === 'solana') {
        return await this.sendSolanaTransaction(walletData, params);
      } else {
        // For demonstration, we'll use our backend API for non-Solana chains
        return await this.sendGenericTransaction(walletData, params);
      }
    } catch (error) {
      if (params.onError) params.onError(error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: {
          code: 'TRANSACTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to send transaction'
        }
      };
    }
  }

  /**
   * Create a Solana transaction
   */
  private async sendSolanaTransaction(walletData: WalletData, params: TransactionParams): Promise<TransactionResponse> {
    // This would be implemented using Solana web3.js in a real app
    // Here we'll use a server API instead since we don't have the libraries installed
    
    const response = await apiRequest('POST', '/solana/transaction', {
      fromPublicKey: walletData.publicKey,
      toAddress: params.to,
      amount: params.amount,
      token: params.token || 'SOL',
      memo: params.memo
    });

    const data = await response.json();
    
    // In a real implementation, we would:
    // 1. Deserialize the transaction
    // 2. Get wallet to sign it
    // 3. Send the signed transaction
    
    if (params.onSuccess) {
      params.onSuccess(data.txHash);
    }

    return {
      success: true,
      txHash: data.txHash
    };
  }

  /**
   * Generic transaction for other chains
   */
  private async sendGenericTransaction(walletData: WalletData, params: TransactionParams): Promise<TransactionResponse> {
    const response = await apiRequest('POST', '/transaction', {
      fromPublicKey: walletData.publicKey,
      chainType: walletData.chainType,
      toAddress: params.to,
      amount: params.amount,
      token: params.token,
      memo: params.memo
    });

    const data = await response.json();
    
    if (params.onSuccess) {
      params.onSuccess(data.txHash);
    }

    return {
      success: true,
      txHash: data.txHash
    };
  }

  /**
   * Connect to Phantom wallet
   */
  private async connectPhantom(): Promise<{ publicKey: string; walletObj: any }> {
    // Check if Phantom is installed
    const phantom = (window as any).phantom?.solana;
    
    if (!phantom?.isPhantom) {
      throw new Error('Phantom wallet is not installed');
    }

    try {
      // Connect to wallet
      const { publicKey } = await phantom.connect();
      return {
        publicKey: publicKey.toString(),
        walletObj: phantom
      };
    } catch (error) {
      console.error('Phantom connection error:', error);
      throw new Error('Failed to connect to Phantom wallet');
    }
  }

  /**
   * Connect to Solflare wallet
   */
  private async connectSolflare(): Promise<{ publicKey: string; walletObj: any }> {
    // Check if Solflare is installed
    const solflare = (window as any).solflare;
    
    if (!solflare?.isSolflare) {
      throw new Error('Solflare wallet is not installed');
    }

    try {
      // Connect to wallet
      await solflare.connect();
      
      if (solflare.publicKey) {
        return {
          publicKey: solflare.publicKey.toString(),
          walletObj: solflare
        };
      } else {
        throw new Error('Failed to get public key from Solflare');
      }
    } catch (error) {
      console.error('Solflare connection error:', error);
      throw new Error('Failed to connect to Solflare wallet');
    }
  }

  /**
   * Connect using WalletConnect
   */
  private async connectWalletConnect(): Promise<{ publicKey: string; walletObj: any }> {
    // This would be implemented with WalletConnect libraries in a real app
    throw new Error('WalletConnect integration is not implemented yet');
  }
  
  /**
   * Get the chain type for a wallet type
   */
  private getChainType(walletType: WalletType): 'solana' | 'ethereum' | 'polygon' | 'avalanche' | 'bsc' | 'fantom' {
    // Map wallet types to chain types
    switch (walletType) {
      case 'phantom':
      case 'solflare':
        return 'solana';
      case 'walletconnect':
        return 'ethereum'; // Default to Ethereum for WalletConnect
      default:
        return 'ethereum';
    }
  }
}
