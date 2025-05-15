// Load token info and update token service
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up Solana connection
const endpoint = 'https://api.testnet.solana.com';
const connection = new Connection(endpoint, 'confirmed');

async function loadToken() {
  try {
    // Read token info from file
    const tokenInfoPath = path.join(__dirname, 'token-info.json');
    
    if (!fs.existsSync(tokenInfoPath)) {
      console.error('Token info file not found. Create a token first.');
      return null;
    }
    
    const tokenInfo = JSON.parse(fs.readFileSync(tokenInfoPath, 'utf-8'));
    console.log('Loaded token info:', tokenInfo);
    
    // Verify token on-chain
    try {
      const mintAddress = new PublicKey(tokenInfo.address);
      const mintInfo = await getMint(connection, mintAddress);
      
      console.log('\nToken verified on Solana testnet:');
      console.log('Address:', tokenInfo.address);
      console.log('Decimals:', mintInfo.decimals);
      console.log('Supply:', Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals));
      console.log('Is initialized:', mintInfo.isInitialized);
      console.log('Mint authority:', mintInfo.mintAuthority?.toString());
      console.log('\nSolscan URL:', tokenInfo.solscanUrl);
      
      return {
        ...tokenInfo,
        supply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
        mintAuthority: mintInfo.mintAuthority?.toString()
      };
    } catch (error) {
      console.error('Error verifying token on-chain:', error.message);
      console.log('Using saved token info:', tokenInfo);
      return tokenInfo;
    }
  } catch (error) {
    console.error('Error loading token:', error);
    return null;
  }
}

async function main() {
  console.log('Loading GAMI token from token-info.json...');
  const token = await loadToken();
  
  if (token) {
    console.log('\nToken loaded successfully!');
    console.log('GAMI token on Solana testnet is ready for use in the application.');
    console.log('Solscan URL:', token.solscanUrl);
  } else {
    console.error('Failed to load token.');
  }
}

main();