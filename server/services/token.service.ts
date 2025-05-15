import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  Account,
  getMint,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up Solana connection
const endpoint = 'https://api.testnet.solana.com';
const connection = new Connection(endpoint, 'confirmed');

// Default payer keypair path - will be generated if it doesn't exist
const KEYPAIR_PATH = path.join(__dirname, '..', '..', 'keypair.json');

/**
 * Get or create a payer keypair
 */
export async function getOrCreateKeypair(): Promise<Keypair> {
  try {
    if (fs.existsSync(KEYPAIR_PATH)) {
      const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
      return Keypair.fromSecretKey(new Uint8Array(keypairData));
    } else {
      // Create new keypair if one doesn't exist
      const newKeypair = Keypair.generate();
      fs.writeFileSync(
        KEYPAIR_PATH,
        JSON.stringify(Array.from(newKeypair.secretKey))
      );
      console.log('Generated new keypair');
      return newKeypair;
    }
  } catch (error) {
    console.error('Error loading or creating keypair:', error);
    throw error;
  }
}

// Initialize tokenInfo from token-info.json if it exists
let tokenInfo: {
  mint: PublicKey;
  decimals: number;
} | null = null;

// Try to load token info from token-info.json
try {
  const tokenInfoPath = path.join(__dirname, '..', '..', 'token-info.json');
  if (fs.existsSync(tokenInfoPath)) {
    const savedTokenInfo = JSON.parse(fs.readFileSync(tokenInfoPath, 'utf-8'));
    console.log('Loaded token info from file:', savedTokenInfo);
    tokenInfo = {
      mint: new PublicKey(savedTokenInfo.address),
      decimals: savedTokenInfo.decimals
    };
  }
} catch (error) {
  console.error('Error loading token info from file:', error);
}

/**
 * Create a new SPL token on Solana testnet
 */
export async function createToken(): Promise<{ mint: PublicKey; tokenAddress: string }> {
  try {
    const payer = await getOrCreateKeypair();
    
    console.log('Creating token with payer:', payer.publicKey.toString());
    console.log('Requesting airdrop for payer...');
    
    // Request airdrop to cover transaction fees
    const signature = await connection.requestAirdrop(payer.publicKey, 1000000000); // 1 SOL
    await connection.confirmTransaction(signature);
    
    console.log('Airdrop confirmed, creating token mint...');
    
    // Create new mint
    const mintAuthority = payer.publicKey;
    const freezeAuthority = payer.publicKey;
    const decimals = 9;
    
    const tokenMint = await createMint(
      connection,
      payer,
      mintAuthority,
      freezeAuthority,
      decimals,
      undefined,
      { commitment: 'confirmed' },
      TOKEN_PROGRAM_ID
    );
    
    console.log('Token mint created:', tokenMint.toString());
    
    // Store token info for future use
    tokenInfo = {
      mint: tokenMint,
      decimals
    };
    
    // Create metadata for the token (additional info would go here)
    console.log('Token created successfully!');
    console.log('Solscan URL:', `https://solscan.io/token/${tokenMint.toString()}?cluster=testnet`);

    return {
      mint: tokenMint,
      tokenAddress: tokenMint.toString()
    };
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

/**
 * Mint tokens to a specified wallet address
 */
export async function mintTokens(
  destinationAddress: string, 
  amount: number
): Promise<{ signature: string }> {
  try {
    // Make sure token has been created
    if (!tokenInfo) {
      throw new Error('Token not created yet. Call createToken first.');
    }
    
    const payer = await getOrCreateKeypair();
    const destinationPubkey = new PublicKey(destinationAddress);
    
    // Get or create associated token account for recipient
    const associatedToken = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenInfo.mint,
      destinationPubkey
    );
    
    console.log('Associated token account:', associatedToken.address.toString());
    
    // Convert amount to proper decimal representation
    const mintInfo = await getMint(connection, tokenInfo.mint);
    const amountWithDecimals = amount * 10 ** mintInfo.decimals;
    
    // Mint tokens to recipient
    const mintSignature = await mintTo(
      connection,
      payer,
      tokenInfo.mint,
      associatedToken.address,
      payer, // mint authority
      amountWithDecimals
    );
    
    console.log('Tokens minted successfully. Signature:', mintSignature);
    return { signature: mintSignature };
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
}

/**
 * Transfer tokens between wallets
 */
export async function transferTokens(
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<{ signature: string }> {
  try {
    // Make sure token has been created
    if (!tokenInfo) {
      throw new Error('Token not created yet. Call createToken first.');
    }
    
    const payer = await getOrCreateKeypair();
    const fromPubkey = new PublicKey(fromAddress);
    const toPubkey = new PublicKey(toAddress);
    
    // Get associated token accounts for sender and recipient
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenInfo.mint,
      fromPubkey
    );
    
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenInfo.mint,
      toPubkey
    );
    
    // Convert amount to proper decimal representation
    const mintInfo = await getMint(connection, tokenInfo.mint);
    const amountWithDecimals = amount * 10 ** mintInfo.decimals;
    
    // Transfer tokens
    const transferSignature = await transfer(
      connection,
      payer,
      fromTokenAccount.address,
      toTokenAccount.address,
      payer.publicKey, // use payer as authority (normally, this would be the sender's wallet)
      amountWithDecimals
    );
    
    console.log('Tokens transferred successfully. Signature:', transferSignature);
    return { signature: transferSignature };
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
}

/**
 * Get token balance for a wallet address
 */
export async function getTokenBalance(walletAddress: string): Promise<{ balance: number; uiBalance: number }> {
  try {
    // Make sure token has been created
    if (!tokenInfo) {
      throw new Error('Token not created yet. Call createToken first.');
    }
    
    const walletPubkey = new PublicKey(walletAddress);
    
    try {
      // Get associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        await getOrCreateKeypair(),
        tokenInfo.mint,
        walletPubkey
      );
      
      // Get account info
      const accountInfo = await getAccount(connection, tokenAccount.address);
      
      // Convert to UI-friendly amount with decimals
      const mintInfo = await getMint(connection, tokenInfo.mint);
      const uiBalance = Number(accountInfo.amount) / (10 ** mintInfo.decimals);
      
      return { 
        balance: Number(accountInfo.amount), 
        uiBalance
      };
    } catch (error) {
      // Return zero if account doesn't exist
      return { balance: 0, uiBalance: 0 };
    }
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
}

/**
 * Get token info (supply, decimals, etc.)
 */
export async function getTokenInfo(): Promise<any> {
  try {
    // Make sure token has been created
    if (!tokenInfo) {
      throw new Error('Token not created yet. Call createToken first.');
    }
    
    try {
      const mintInfo = await getMint(connection, tokenInfo.mint);
      
      return {
        address: tokenInfo.mint.toString(),
        totalSupply: Number(mintInfo.supply) / (10 ** mintInfo.decimals),
        decimals: mintInfo.decimals,
        authority: mintInfo.mintAuthority?.toString(),
        solscanUrl: `https://solscan.io/token/${tokenInfo.mint.toString()}?cluster=testnet`,
        freezeAuthority: mintInfo.freezeAuthority?.toString() || null,
        isInitialized: mintInfo.isInitialized
      };
    } catch (error: any) {
      console.warn('Could not fetch token from chain, using stored info:', error.message);
      
      // If we can't get mint info, return the basic info we have
      return {
        address: tokenInfo.mint.toString(),
        decimals: tokenInfo.decimals,
        solscanUrl: `https://solscan.io/token/${tokenInfo.mint.toString()}?cluster=testnet`,
        note: "Token verified from stored configuration. Full on-chain data unavailable."
      };
    }
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
}

// Export token info getter
export function getCurrentTokenInfo() {
  return tokenInfo 
    ? { 
        address: tokenInfo.mint.toString(),
        decimals: tokenInfo.decimals,
        solscanUrl: `https://solscan.io/token/${tokenInfo.mint.toString()}?cluster=testnet`
      } 
    : null;
}