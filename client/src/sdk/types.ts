// SDK Configuration
export interface GamiSDKConfig {
  apiKey: string;
  projectId?: string;
  environment?: 'development' | 'production';
  apiUrl?: string;
}

// XP Event Tracking
export interface TrackEventParams {
  userId: string;
  event: string;
  metadata?: Record<string, any>;
}

export interface TrackEventResponse {
  success: boolean;
  transaction?: {
    id: number;
    userId: string;
    event: string;
    xp: number;
    timestamp: Date;
  };
  error?: string;
}

// Wallet Integration
export type WalletType = 'phantom' | 'solflare' | 'walletconnect';

export interface ConnectWalletParams {
  walletType: WalletType;
  onSuccess?: (publicKey: string) => void;
  onError?: (error: Error) => void;
}

export interface ConnectWalletResponse {
  success: boolean;
  publicKey?: string;
  error?: string;
}

// API Error
export interface GamiError {
  code: string;
  message: string;
  details?: any;
}
