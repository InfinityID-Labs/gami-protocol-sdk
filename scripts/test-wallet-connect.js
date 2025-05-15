// Test script for wallet connection functionality
import axios from 'axios';

async function testWalletConnection() {
  console.log('Testing wallet connection functionality...');
  
  try {
    const API_KEY = 'test-dev-api-key-123456';
    const BASE_URL = 'http://localhost:5000/api';
    
    // 1. Test connecting to a wallet
    console.log('Testing wallet connection API...');
    const connectResponse = await axios.post(`${BASE_URL}/connect-wallet`, {
      walletType: 'phantom'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });
    
    console.log('Wallet connection response:', connectResponse.data);
    
    // 2. Test wallet balances
    console.log('\nTesting wallet balances API...');
    const publicKey = '8YLSsCJqHAwJo5cVfMG3XU4uYDWGUEAMkiJEy2gGYrT8'; // Example public key
    
    const balanceResponse = await axios.post(`${BASE_URL}/wallet/balances`, {
      publicKey,
      chainType: 'solana'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });
    
    console.log('Wallet balances response:', balanceResponse.data);

    console.log('\nWallet connection tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testWalletConnection();