// Configuration settings for different environments
export interface EnvironmentConfig {
  isProduction: boolean;
  isProd: boolean; // alias for isProduction
  apiBaseUrl: string;
  solanaEndpoint: string;  
  walrusStorageEndpoint: string;
  tokenAddress: string;
  sessionSecret: string;
  corsOrigins: string[];
  rateLimits: {
    windowMs: number;
    max: number;
  };
  security: {
    bcryptRounds: number;
    apiKeyLength: number;
  };
}

// Load environment variables
const env = process.env.NODE_ENV || 'development';

const developmentConfig: EnvironmentConfig = {
  isProduction: false,
  isProd: false,
  apiBaseUrl: 'http://localhost:5000',
  solanaEndpoint: 'https://api.devnet.solana.com',
  walrusStorageEndpoint: 'https://api.walrus.dev',
  tokenAddress: 'GAMiRzg7XurshUC3MWVhv9zFPQkf15bjULjRpRoGwKuB', // Testnet token
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-prod',
  corsOrigins: ['*'],
  rateLimits: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Higher limit for development
  },
  security: {
    bcryptRounds: 10,
    apiKeyLength: 32
  }
};

const productionConfig: EnvironmentConfig = {
  isProduction: true,
  isProd: true,
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.gamiprotocol.com',
  solanaEndpoint: process.env.SOLANA_ENDPOINT || 'https://api.mainnet-beta.solana.com',
  walrusStorageEndpoint: process.env.WALRUS_ENDPOINT || 'https://api.walrus.dev',
  tokenAddress: process.env.TOKEN_ADDRESS || 'GAMiRzg7XurshUC3MWVhv9zFPQkf15bjULjRpRoGwKuB', // Default to testnet, override in prod
  sessionSecret: process.env.SESSION_SECRET || '',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['https://gamiprotocol.com'],
  rateLimits: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Stricter limit for production
  },
  security: {
    bcryptRounds: 12, // Higher for production
    apiKeyLength: 32
  }
};

// Select the appropriate config based on environment
const config: EnvironmentConfig = 
  env === 'production' ? productionConfig : developmentConfig;

// Validate critical production settings
if (config.isProduction) {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error('WARNING: Production environment detected but SESSION_SECRET is not properly configured!');
    console.error('Set a strong, random SESSION_SECRET environment variable (min 32 chars)');
  }
  
  if (!process.env.TOKEN_ADDRESS || process.env.TOKEN_ADDRESS === developmentConfig.tokenAddress) {
    console.warn('Using test token address in production. Set TOKEN_ADDRESS environment variable for production.');
  }
}

export default config;