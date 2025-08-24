// Test configuration for contract integration
export const TEST_CONFIG = {
  // Set to true to use mock data for testing without deployed contracts
  USE_MOCK_DATA: process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_CHESS_TOKEN_ADDRESS,
  
  // Mock contract addresses for testing (replace with actual deployed addresses)
  MOCK_ADDRESSES: {
    CHESS_TOKEN: '0x1234567890123456789012345678901234567890',
    CHESS_NFT: '0x2345678901234567890123456789012345678901',
    CHESS_GAME: '0x3456789012345678901234567890123456789012',
    CHESS_TOURNAMENT: '0x4567890123456789012345678901234567890123',
  },
  
  // Test data for NFT minting
  TEST_NFT_DATA: {
    single: {
      type: 0, // Piece
      rarity: 1, // Uncommon
      name: 'Test Chess Piece',
      description: 'A test chess piece for integration testing',
      imageURI: 'ipfs://QmTestHash123456789',
      mintPrice: '0.1'
    },
    set: {
      name: 'Test Chess Set',
      description: 'A complete test chess set',
      imageURI: 'ipfs://QmTestSetHash123456789',
      pieceURIs: Array(16).fill('ipfs://QmTestPieceHash123456789')
    }
  },
  
  // Test data for game creation
  TEST_GAME_DATA: {
    stakeAmount: '0.001', // 0.001 ETH
    gameId: '1'
  },
  
  // Test data for token staking
  TEST_STAKING_DATA: {
    stakeAmount: '100', // 100 CHESS tokens
    unstakeAmount: '50' // 50 CHESS tokens
  }
};

// Helper function to get contract addresses for testing
export function getTestContractAddresses() {
  if (TEST_CONFIG.USE_MOCK_DATA) {
    return TEST_CONFIG.MOCK_ADDRESSES;
  }
  
  // Return actual environment variables if available
  return {
    CHESS_TOKEN: process.env.NEXT_PUBLIC_CHESS_TOKEN_ADDRESS || TEST_CONFIG.MOCK_ADDRESSES.CHESS_TOKEN,
    CHESS_NFT: process.env.NEXT_PUBLIC_CHESS_NFT_ADDRESS || TEST_CONFIG.MOCK_ADDRESSES.CHESS_NFT,
    CHESS_GAME: process.env.NEXT_PUBLIC_CHESS_GAME_ADDRESS || TEST_CONFIG.MOCK_ADDRESSES.CHESS_GAME,
    CHESS_TOURNAMENT: process.env.NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS || TEST_CONFIG.MOCK_ADDRESSES.CHESS_TOURNAMENT,
  };
}

// Helper function to check if contracts are properly configured
export function areContractsReady(): boolean {
  const addresses = getTestContractAddresses();
  return Object.values(addresses).every(addr => 
    addr && addr !== '0x0000000000000000000000000000000000000000' && addr.length === 42
  );
}

// Helper function to check if local contracts are deployed
export function areLocalContractsDeployed(): boolean {
  // Import local deployment config
  try {
    const { LOCAL_DEPLOYMENT } = require('./local-deployment');
    const addresses = Object.values(LOCAL_DEPLOYMENT.CONTRACT_ADDRESSES) as string[];
    return addresses.every(addr => 
      addr && addr !== '0x0000000000000000000000000000000000000000' && addr.length === 42
    );
  } catch {
    return false;
  }
}
