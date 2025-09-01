import { getContract, type PublicClient, type WalletClient } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  CHESS_TOKEN: process.env.NEXT_PUBLIC_CHESS_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_NFT: process.env.NEXT_PUBLIC_CHESS_NFT_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_GAME: process.env.NEXT_PUBLIC_CHESS_GAME_ADDRESS || '0x0000000000000000000000000000000000000000',
  CHESS_TOURNAMENT: process.env.NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

// Contract ABIs - Loaded from Hardhat artifacts
// These should be imported from the contracts/artifacts directory
export const CONTRACT_ABIS = {
  CHESS_TOKEN: [
    // Basic ERC20 functions
    {
      "inputs": [],
      "name": "name",
      "outputs": [{"type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{"type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{"type": "uint8"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"type": "address"}],
      "name": "balanceOf",
      "outputs": [{"type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"type": "address"}, {"type": "uint256"}],
      "name": "transfer",
      "outputs": [{"type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // ChessFi specific functions
    {
      "inputs": [{"type": "uint256"}],
      "name": "stake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unstake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const,
  CHESS_NFT: [
    // Basic ERC721 functions
    {
      "inputs": [],
      "name": "name",
      "outputs": [{"type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{"type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"type": "uint256"}],
      "name": "tokenURI",
      "outputs": [{"type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"type": "address"}],
      "name": "balanceOf",
      "outputs": [{"type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    // ChessFi specific functions
    {
      "inputs": [{"type": "string"}],
      "name": "mintNFT",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mintChessSet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const,
  CHESS_GAME: [
    // ChessFi game functions
    {
      "inputs": [{"type": "uint256"}],
      "name": "createGame",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{"type": "uint256"}],
      "name": "joinGame",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{"type": "uint256"}],
      "name": "endGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"type": "address"}],
      "name": "playerStats",
      "outputs": [{"type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"type": "uint256"}],
      "name": "games",
      "outputs": [
        {"type": "address"},
        {"type": "address"},
        {"type": "uint8"},
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "address"},
        {"type": "bool"},
        {"type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const,
  CHESS_TOURNAMENT: [
    // ChessFi tournament functions
    {
      "inputs": [{"type": "uint256"}],
      "name": "registerForTournament",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"type": "uint256"}],
      "name": "getTournament",
      "outputs": [
        {"type": "string"},
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "uint256"},
        {"type": "bool"},
        {"type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const,
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
