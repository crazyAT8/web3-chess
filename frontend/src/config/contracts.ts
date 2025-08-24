// Contract configuration
export const CONTRACT_CONFIG = {
  // Contract addresses (set these after deploying contracts)
  ADDRESSES: {
    CHESS_TOKEN: process.env.NEXT_PUBLIC_CHESS_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    CHESS_NFT: process.env.NEXT_PUBLIC_CHESS_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
    CHESS_GAME: process.env.NEXT_PUBLIC_CHESS_GAME_ADDRESS || '0x0000000000000000000000000000000000000000',
    CHESS_TOURNAMENT: process.env.NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
  },

  // Network configuration
  NETWORK: {
    CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337'),
    NAME: process.env.NEXT_PUBLIC_NETWORK_NAME || 'localhost',
    RPC_URL: process.env.NEXT_PUBLIC_LOCALHOST_RPC || 'http://127.0.0.1:8545',
  },

  // Contract settings
  SETTINGS: {
    // ChessToken settings
    TOKEN: {
      INITIAL_SUPPLY: '10000000', // 10 million tokens
      REWARD_POOL: '5000000',     // 5 million for rewards
      STAKING_RATE: '50',         // 5% APY
    },

    // ChessNFT settings
    NFT: {
      MINT_FEE: '0.01',           // 0.01 ETH
      MAX_SUPPLY: '10000',        // 10,000 NFTs
    },

    // ChessGame settings
    GAME: {
      MIN_STAKE: '0.001',         // 0.001 ETH
      MAX_STAKE: '10',            // 10 ETH
      PLATFORM_FEE: '25',         // 2.5%
      GAME_TIMEOUT: '3600',       // 1 hour
    },

    // ChessTournament settings
    TOURNAMENT: {
      MIN_ENTRY_FEE: '0.001',     // 0.001 ETH
      MAX_ENTRY_FEE: '5',         // 5 ETH
      PLATFORM_FEE: '50',         // 5%
    },
  },
} as const;

// Helper function to check if contracts are configured
export function areContractsConfigured(): boolean {
  const addresses = Object.values(CONTRACT_CONFIG.ADDRESSES);
  return addresses.every(address => 
    address !== '0x0000000000000000000000000000000000000000'
  );
}

// Helper function to get contract address
export function getContractAddress(contractName: keyof typeof CONTRACT_CONFIG.ADDRESSES): string {
  return CONTRACT_CONFIG.ADDRESSES[contractName];
}

// Helper function to get network info
export function getNetworkInfo() {
  return CONTRACT_CONFIG.NETWORK;
}

// Helper function to get contract settings
export function getContractSettings(contractType: keyof typeof CONTRACT_CONFIG.SETTINGS) {
  return CONTRACT_CONFIG.SETTINGS[contractType];
}
