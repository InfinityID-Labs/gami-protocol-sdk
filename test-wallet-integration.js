// Test script for wallet integration
import axios from 'axios';

async function testWalletIntegration() {
  console.log('Testing wallet integration APIs...');
  
  try {
    const API_KEY = 'test-dev-api-key-123456';
    const BASE_URL = 'http://localhost:5000/api';
    
    // 1. Test connecting to a wallet
    console.log('Testing wallet connection...');
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
    console.log('\nTesting wallet balances...');
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
    
    // 3. Test transaction
    console.log('\nTesting transaction...');
    const txResponse = await axios.post(`${BASE_URL}/transaction`, {
      fromPublicKey: publicKey,
      toAddress: '9XWsT4BQT2XbLEPzJQNinN9KGNcgXBzEiGj7JHyQgSAm',
      amount: 0.1,
      chainType: 'solana',
      token: 'SOL'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });
    
    console.log('Transaction response:', txResponse.data);
    
    // 4. Test Solana specific transaction
    console.log('\nTesting Solana transaction...');
    const solTxResponse = await axios.post(`${BASE_URL}/solana/transaction`, {
      fromPublicKey: publicKey,
      toAddress: '9XWsT4BQT2XbLEPzJQNinN9KGNcgXBzEiGj7JHyQgSAm',
      amount: 0.1,
      token: 'SOL'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    });
    
    console.log('Solana transaction response:', solTxResponse.data);
    
    console.log('\nAll wallet integration tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testWalletIntegration();