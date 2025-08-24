import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';

// Hook for reading contract data
export function useContractRead(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  args?: any[]
) {
  const { address } = useAccount();
  
  const contractAddress = CONTRACT_ADDRESSES[contractName];
  const contractABI = CONTRACT_ABIS[contractName];

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName,
    args,
    query: {
      enabled: !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  });
}

// Specific hooks for common contract reads
export function useChessTokenBalance(userAddress?: string) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;
  
  return useContractRead('CHESS_TOKEN', 'balanceOf', targetAddress ? [targetAddress] : undefined);
}

export function useChessTokenStakingInfo(userAddress?: string) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;
  
  return useContractRead('CHESS_TOKEN', 'getStakingInfo', targetAddress ? [targetAddress] : undefined);
}

export function useChessNFTBalance(userAddress?: string) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;
  
  return useContractRead('CHESS_NFT', 'balanceOf', targetAddress ? [targetAddress] : undefined);
}

export function useChessNFTCollectionStats() {
  return useContractRead('CHESS_NFT', 'getCollectionStats');
}

export function useChessGamePlayerStats(userAddress?: string) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;
  
  return useContractRead('CHESS_GAME', 'playerStats', targetAddress ? [targetAddress] : undefined);
}

export function useChessTournamentInfo(tournamentId?: number) {
  return useContractRead('CHESS_TOURNAMENT', 'getTournament', tournamentId ? [tournamentId] : undefined);
}
