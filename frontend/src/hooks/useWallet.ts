'use client';

import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useMemo } from 'react';

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const { data: balance } = useBalance({
    address,
  });

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const isWrongNetwork = false; // Simplified for now

  return {
    // Account state
    address,
    shortAddress,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Network state
    chainId,
    isWrongNetwork,
    switchChain,
    
    // Balance
    balance,
    
    // Computed states
    isReady: isConnected && !isWrongNetwork,
  };
} 