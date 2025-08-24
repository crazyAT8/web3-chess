import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';
import { useState } from 'react';

// Hook for writing to contracts
export function useContractWrite(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string
) {
  const { address } = useAccount();
  
  const contractAddress = CONTRACT_ADDRESSES[contractName];
  const contractABI = CONTRACT_ABIS[contractName];

  const { data: hash, error, isPending, write, writeAsync } = useWriteContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName,
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    write,
    writeAsync,
    isLoading: isPending || isConfirming,
  };
}

// Specific hooks for common contract writes
export function useChessTokenStake() {
  return useContractWrite('CHESS_TOKEN', 'stake');
}

export function useChessTokenUnstake() {
  return useContractWrite('CHESS_TOKEN', 'unstake');
}

export function useChessTokenClaimRewards() {
  return useContractWrite('CHESS_TOKEN', 'claimRewards');
}

export function useChessNFTMint() {
  return useContractWrite('CHESS_NFT', 'mintNFT');
}

export function useChessNFTMintChessSet() {
  return useContractWrite('CHESS_NFT', 'mintChessSet');
}

export function useChessGameCreate() {
  return useContractWrite('CHESS_GAME', 'createGame');
}

export function useChessGameJoin() {
  return useContractWrite('CHESS_GAME', 'joinGame');
}

export function useChessGameEnd() {
  return useContractWrite('CHESS_GAME', 'endGame');
}

export function useChessTournamentRegister() {
  return useContractWrite('CHESS_TOURNAMENT', 'registerForTournament');
}

// Hook for managing transaction state
export function useTransactionState() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  const setLoading = (loading: boolean) => setIsLoading(loading);
  const setErrorMsg = (err: string | null) => setError(err);
  const setSuccessState = (success: boolean) => setSuccess(success);

  return {
    isLoading,
    error,
    success,
    resetState,
    setLoading,
    setErrorMsg,
    setSuccessState,
  };
}
