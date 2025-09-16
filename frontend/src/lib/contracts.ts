import { getContract, type PublicClient, type WalletClient } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

// Import contract ABIs from artifacts
import ChessTokenABI from './contracts/ChessToken.json';
import ChessNFTABI from './contracts/ChessNFT.json';
import ChessGameABI from './contracts/ChessGame.json';
import ChessTournamentABI from './contracts/ChessTournament.json';

// Contract addresses (deployed on Hardhat local network)
export const CONTRACT_ADDRESSES = {
  CHESS_TOKEN: process.env.NEXT_PUBLIC_CHESS_TOKEN_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CHESS_NFT: process.env.NEXT_PUBLIC_CHESS_NFT_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  CHESS_GAME: process.env.NEXT_PUBLIC_CHESS_GAME_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  CHESS_TOURNAMENT: process.env.NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
} as const;

// Contract ABIs - Loaded from Hardhat artifacts
export const CONTRACT_ABIS = {
  CHESS_TOKEN: ChessTokenABI.abi,
  CHESS_NFT: ChessNFTABI.abi,
  CHESS_GAME: ChessGameABI.abi,
  CHESS_TOURNAMENT: ChessTournamentABI.abi,
} as const;

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

  if (!abi || (abi as readonly unknown[]).length === 0) {
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
