// Simple script to test Walrus storage integration
import axios from 'axios';

async function testWalrusStorage() {
  console.log('Testing Walrus storage API endpoints...');
  
  try {
    // First, we need to create some mock metadata
    const mockBlobId = `test-blob-${Date.now()}`;
    const mockMetadata = {
      name: 'Test Blob',
      contentType: 'text/plain',
      tags: {
        purpose: 'testing',
        environment: 'development'
      },
      createdAt: new Date().toISOString()
    };
    
    console.log(`Creating metadata for blob ID: ${mockBlobId}`);
    
    // Store metadata
    const storeResponse = await axios.post('http://localhost:5000/api/walrus/metadata', {
      blobId: mockBlobId,
      metadata: mockMetadata
    }, {
      headers: {
        'Content-Type': 'application/json',
        // In a real-world scenario, we'd need to provide an API key here
        // 'X-API-Key': 'test-api-key'
      }
    });
    
    console.log('Metadata stored successfully:', storeResponse.data);
    
    // Get metadata for the blob
    const getResponse = await axios.get(`http://localhost:5000/api/walrus/metadata/${mockBlobId}`, {
      headers: {
        // 'X-API-Key': 'test-api-key'
      }
    });
    
    console.log('Retrieved metadata:', getResponse.data);
    
    // Get all metadata
    const listResponse = await axios.get('http://localhost:5000/api/walrus/metadata', {
      headers: {
        // 'X-API-Key': 'test-api-key'
      }
    });
    
    console.log(`Listed ${listResponse.data.count} metadata entries`);
    
    // Delete the metadata
    const deleteResponse = await axios.delete(`http://localhost:5000/api/walrus/metadata/${mockBlobId}`, {
      headers: {
        // 'X-API-Key': 'test-api-key'
      }
    });
    
    console.log('Metadata deleted successfully:', deleteResponse.data);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testWalrusStorage();