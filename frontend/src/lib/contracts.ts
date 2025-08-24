import { getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

// Import contract ABIs
import ChessTokenABI from '../../contracts/artifacts/contracts/ChessToken.sol/ChessToken.json';
import ChessNFTABI from '../../contracts/artifacts/contracts/ChessNFT.sol/ChessNFT.json';
import ChessGameABI from '../../contracts/artifacts/contracts/ChessGame.sol/ChessGame.json';
import ChessTournamentABI from '../../contracts/artifacts/contracts/ChessTournament.sol/ChessTournament.json';

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  CHESS_TOKEN: process.env.NEXT_PUBLIC_CHESS_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_NFT: process.env.NEXT_PUBLIC_CHESS_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_GAME: process.env.NEXT_PUBLIC_CHESS_GAME_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_TOURNAMENT: process.env.NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

// Contract ABIs
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
  publicClient: any,
  walletClient?: any
) {
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = CONTRACT_ABIS[contractName];
  
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Contract ${contractName} address not configured`);
  }

  return getContract({
    address: address as `0x${string}`,
    abi,
    publicClient,
    walletClient,
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
