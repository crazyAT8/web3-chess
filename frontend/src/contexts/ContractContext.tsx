'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useChessToken, useChessNFT, useChessGame, useChessTournament } from '@/lib/contracts';
import { useChessTokenBalance, useChessNFTBalance, useChessGamePlayerStats } from '@/hooks/useContractRead';

interface ContractContextType {
  // Contract instances
  chessToken: any;
  chessNFT: any;
  chessGame: any;
  chessTournament: any;
  
  // Contract data
  tokenBalance: any;
  nftBalance: any;
  playerStats: any;
  
  // Loading states
  isLoading: boolean;
  
  // Error states
  error: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  
  // Contract instances
  const chessToken = useChessToken();
  const chessNFT = useChessNFT();
  const chessGame = useChessGame();
  const chessTournament = useChessTournament();
  
  // Contract data
  const { data: tokenBalance, isLoading: tokenLoading } = useChessTokenBalance();
  const { data: nftBalance, isLoading: nftLoading } = useChessNFTBalance();
  const { data: playerStats, isLoading: statsLoading } = useChessGamePlayerStats();
  
  const isLoading = tokenLoading || nftLoading || statsLoading;
  const error = null; // Could be enhanced to track contract errors
  
  const value: ContractContextType = {
    chessToken,
    chessNFT,
    chessGame,
    chessTournament,
    tokenBalance,
    nftBalance,
    playerStats,
    isLoading,
    error,
  };
  
  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContractContext must be used within a ContractProvider');
  }
  return context;
}
