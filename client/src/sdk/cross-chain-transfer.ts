import { GamiError } from './types';
import { apiRequest, configureApi } from './api';

// Wormhole cross-chain transfer types
export interface CrossChainTransferParams {
  fromChain: ChainType;
  toChain: ChainType;
  amount: number;
  tokenAddress: string;
  destinationAddress: string;
  walletPublicKey: string;
  onStatusChange?: (status: TransferStatus, txHash?: string) => void;
}

export type ChainType = 'solana' | 'ethereum' | 'polygon' | 'avalanche' | 'bsc' | 'fantom';

export enum TransferStatus {
  INITIATED = 'initiated',
  SOURCE_TRANSFER_PENDING = 'source_transfer_pending',
  SOURCE_TRANSFER_COMPLETE = 'source_transfer_complete',
  WORMHOLE_RELAY_PENDING = 'wormhole_relay_pending',
  DESTINATION_TRANSFER_PENDING = 'destination_transfer_pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface CrossChainTransferResponse {
  success: boolean;
  transferId?: string;
  sourceTxHash?: string;
  destinationTxHash?: string;
  error?: GamiError;
}

/**
 * Handles cross-chain token transfers via Wormhole protocol
 */
export class CrossChainTransfer {
  /**
   * Initialize the cross-chain transfer with API configuration
   * @param apiUrl Base API URL
   * @param apiKey API key
   */
  constructor(apiUrl: string, apiKey: string) {
    // Configure the API module for this instance
    configureApi(apiUrl, apiKey);
  }

  /**
   * Initiate a cross-chain token transfer using Wormhole protocol
   * @param params Transfer parameters
   * @returns Promise with transfer results
   */
  async transferTokens(params: CrossChainTransferParams): Promise<CrossChainTransferResponse> {
    // Update status to initiated
    if (params.onStatusChange) {
      params.onStatusChange(TransferStatus.INITIATED);
    }

    try {
      // Call our backend API that will handle the Wormhole integration
      const response = await apiRequest('POST', '/cross-chain/transfer', {
        fromChain: params.fromChain,
        toChain: params.toChain,
        amount: params.amount,
        tokenAddress: params.tokenAddress,
        destinationAddress: params.destinationAddress,
        walletPublicKey: params.walletPublicKey
      });

      const data = await response.json();
      
      // Subscribe to transfer status updates if callback provided
      if (params.onStatusChange && data.transferId) {
        this.subscribeToTransferStatus(data.transferId, params.onStatusChange);
      }

      return {
        success: true,
        transferId: data.transferId,
        sourceTxHash: data.sourceTxHash,
      };
    } catch (error) {
      // Handle unexpected errors
      if (params.onStatusChange) {
        params.onStatusChange(TransferStatus.FAILED);
      }
      
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: error instanceof Error ? error.message : 'Unexpected error during transfer',
        }
      };
    }
  }

  /**
   * Get supported chains for cross-chain transfers
   * @returns Promise with list of supported chains
   */
  async getSupportedChains(): Promise<ChainType[]> {
    try {
      const response = await apiRequest('GET', '/cross-chain/supported-chains');
      const data = await response.json();
      return data.chains as ChainType[];
    } catch (error) {
      console.error('Failed to fetch supported chains:', error);
      return ['solana', 'ethereum']; // Default fallback 
    }
  }

  /**
   * Get the fee estimate for a cross-chain transfer
   * @param fromChain Source chain
   * @param toChain Destination chain
   * @param amount Amount to transfer
   * @returns Promise with fee estimate
   */
  async getFeeEstimate(fromChain: ChainType, toChain: ChainType, amount: number): Promise<{ fee: number; token: string }> {
    try {
      const response = await apiRequest(
        'GET', 
        `/cross-chain/fee-estimate?fromChain=${fromChain}&toChain=${toChain}&amount=${amount}`
      );

      const data = await response.json();
      return {
        fee: data.fee,
        token: data.token
      };
    } catch (error) {
      console.error('Fee estimation error:', error);
      // Return a fallback estimate
      return {
        fee: 0.001,
        token: fromChain === 'solana' ? 'SOL' : 'ETH'
      };
    }
  }

  /**
   * Get transfer history for a user
   * @param walletPublicKey The user's wallet public key
   * @returns Promise with transfer history
   */
  async getTransferHistory(walletPublicKey: string): Promise<any[]> {
    try {
      const response = await apiRequest(
        'GET', 
        `/cross-chain/history?walletPublicKey=${walletPublicKey}`
      );

      const data = await response.json();
      return data.transfers || [];
    } catch (error) {
      console.error('Failed to fetch transfer history:', error);
      return [];
    }
  }

  /**
   * Private method to subscribe to transfer status updates
   * In a real implementation, this would use WebSockets or polling
   */
  private subscribeToTransferStatus(
    transferId: string,
    callback: (status: TransferStatus, txHash?: string) => void
  ): void {
    // This is a simplified implementation, in a real scenario would use WebSockets
    const checkStatus = async () => {
      try {
        const response = await apiRequest('GET', `/cross-chain/status/${transferId}`);
        const data = await response.json();
        callback(data.status as TransferStatus, data.txHash);

        // Continue polling if not in a final state
        if (
          data.status !== TransferStatus.COMPLETED &&
          data.status !== TransferStatus.FAILED
        ) {
          setTimeout(checkStatus, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Error checking transfer status:', error);
        // Retry after a delay
        setTimeout(checkStatus, 10000);
      }
    };

    // Start polling
    checkStatus();
  }
}