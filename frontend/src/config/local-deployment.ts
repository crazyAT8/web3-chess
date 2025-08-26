// Local deployment configuration helper
// After deploying contracts locally, update these addresses

export const LOCAL_DEPLOYMENT = {
  // Update these addresses after running: npx hardhat run deploy-local.js --network localhost
  CONTRACT_ADDRESSES: {
    CHESS_TOKEN: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', // Replace with deployed address
    CHESS_NFT: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',   // Replace with deployed address
    CHESS_GAME: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',  // Replace with deployed address
    CHESS_TOURNAMENT: '0x0165878A594ca255338adfa4d48449f69242Eb8F', // Replace with deployed address
  },
  
  // Network configuration for local Hardhat
  NETWORK: {
    CHAIN_ID: 31337,
    NAME: 'Hardhat Local',
    RPC_URL: 'http://127.0.0.1:8545',
    EXPLORER: 'http://localhost:8545'
  }
};

// Helper function to check if local contracts are deployed
export function areLocalContractsDeployed(): boolean {
  return Object.values(LOCAL_DEPLOYMENT.CONTRACT_ADDRESSES).every(addr => 
    addr !== '0x0000000000000000000000000000000000000000'
  );
}

// Helper function to get local contract address
export function getLocalContractAddress(contractName: keyof typeof LOCAL_DEPLOYMENT.CONTRACT_ADDRESSES): string {
  return LOCAL_DEPLOYMENT.CONTRACT_ADDRESSES[contractName];
}

// Instructions for local deployment
export const LOCAL_DEPLOYMENT_INSTRUCTIONS = `
🚀 Local Deployment Instructions:

1. Start Hardhat node:
   cd contracts && npx hardhat node

2. Deploy contracts (in new terminal):
   cd contracts && npx hardhat run deploy-local.js --network localhost

3. Copy the deployed addresses above to LOCAL_DEPLOYMENT.CONTRACT_ADDRESSES

4. Start frontend:
   cd frontend && npm run dev

5. Connect wallet to "Hardhat Local" network

6. Test integration at /profile → Testing tab
`;
