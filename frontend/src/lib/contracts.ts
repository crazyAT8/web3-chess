import { getContract, type PublicClient, type WalletClient } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  CHESS_TOKEN: process.env.NEXT_PUBLIC_CHESS_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_NFT: process.env.NEXT_PUBLIC_CHESS_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_GAME: process.env.NEXT_PUBLIC_CHESS_GAME_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_TOURNAMENT: process.env.NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

// Contract ABIs - Will be loaded from artifacts after deployment
// For now, using empty arrays as placeholders
export const CONTRACT_ABIS = {
  CHESS_TOKEN: [] as any,
  CHESS_NFT: [] as any,
  CHESS_GAME: [] as any,
  CHESS_TOURNAMENT: [] as any,
} as const;

// Function to load ABIs from artifacts (to be called after deployment)
export async function loadContractABIs() {
  try {
    // This will be implemented after contracts are deployed
    // For now, we'll use the placeholder empty arrays
    console.log('Contract ABIs will be loaded after deployment');
  } catch (error) {
    console.error('Failed to load contract ABIs:', error);
  }
}

// Contract types
export type ContractName = keyof typeof CONTRACT_ADDRESSES;
export type ContractABI = keyof typeof CONTRACT_ABIS;

// Helper function to get contract instance
export function getContractInstance(
  contractName: ContractName,
  publicClient: PublicClient,
  walletClient?: WalletClient
) {
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = CONTRACT_ABIS[contractName];
  
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Contract ${contractName} address not configured`);
  }

  if (!abi || abi.length === 0) {
    throw new Error(`Contract ${contractName} ABI not loaded`);
  }

  return getContract({
    address: address as `0x${string}`,
    abi,
    client: publicClient,
  });
}

// Hook to get contract instances
export function useContract(contractName: ContractName) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!publicClient) {
    throw new Error('Public client not available');
  }

  return getContractInstance(contractName, publicClient, walletClient);
}

// Export individual contract hooks for convenience
export function useChessToken() {
  return useContract('CHESS_TOKEN');
}

export function useChessNFT() {
  return useContract('CHESS_NFT');
}

export function useChessGame() {
  return useContract('CHESS_GAME');
}

export function useChessTournament() {
  return useContract('CHESS_TOURNAMENT');
}
