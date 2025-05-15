// Script to create a GAMI token on Solana testnet
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getMint } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up Solana connection
const endpoint = 'https://api.testnet.solana.com';
const connection = new Connection(endpoint, 'confirmed');

// Keypair path
const KEYPAIR_PATH = path.join(__dirname, 'keypair.json');

// Get or create a payer keypair
async function getOrCreateKeypair() {
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

// Create GAMI token
async function createToken() {
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
      decimals
    );
    
    console.log('Token mint created:', tokenMint.toString());
    console.log('Solscan URL:', `https://solscan.io/token/${tokenMint.toString()}?cluster=testnet`);
    
    // Mint some tokens
    console.log('\nMinting tokens to creator wallet...');
    
    // Get or create associated token account for recipient
    const associatedToken = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenMint,
      payer.publicKey
    );
    
    console.log('Associated token account:', associatedToken.address.toString());
    
    // Mint 1,000,000 tokens (with decimals)
    const mintAmount = 1000000 * Math.pow(10, decimals);
    
    const mintSignature = await mintTo(
      connection,
      payer,
      tokenMint,
      associatedToken.address,
      payer, // mint authority
      mintAmount
    );
    
    console.log('Tokens minted successfully! Signature:', mintSignature);
    
    // Get token supply
    const mintInfo = await getMint(connection, tokenMint);
    console.log('\nToken information:');
    console.log('Address:', tokenMint.toString());
    console.log('Decimals:', mintInfo.decimals);
    console.log('Supply:', parseInt(mintInfo.supply) / Math.pow(10, decimals));
    console.log('Is initialized:', mintInfo.isInitialized);
    
    console.log('\nToken creation completed successfully!');
    console.log('You can now use the created token in the application.');
    console.log('Solscan URL:', `https://solscan.io/token/${tokenMint.toString()}?cluster=testnet`);
    
    // Save token info to a file for future reference
    const tokenInfo = {
      address: tokenMint.toString(),
      decimals,
      solscanUrl: `https://solscan.io/token/${tokenMint.toString()}?cluster=testnet`,
      issuerPublicKey: payer.publicKey.toString()
    };
    
    // Save in JSON format for easy reading
    fs.writeFileSync('token-info.json', JSON.stringify(tokenInfo, null, 2));
    console.log('\nToken info saved to token-info.json');
    
    // Add info to README for documentation
    try {
      if (fs.existsSync('README.md')) {
        let readme = fs.readFileSync('README.md', 'utf-8');
        if (!readme.includes('## GAMI Token')) {
          const tokenSection = `\n\n## GAMI Token\n\nToken Address: ${tokenMint.toString()}\nDecimals: ${decimals}\nNetwork: Solana Testnet\nSolscan URL: ${tokenInfo.solscanUrl}\n`;
          fs.writeFileSync('README.md', readme + tokenSection);
          console.log('Token info added to README.md');
        }
      }
    } catch (error) {
      console.warn('Could not update README:', error.message);
    }
    
    return tokenInfo;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Creating GAMI token on Solana testnet...');
    await createToken();
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();