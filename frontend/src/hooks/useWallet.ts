'use client';

import { useAccount, useBalance, useNetwork, useSwitchNetwork } from 'wagmi';
import { useMemo } from 'react';

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  const { data: balance } = useBalance({
    address,
    watch: true,
  });

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const isWrongNetwork = chain?.unsupported || false;

  return {
    // Account state
    address,
    shortAddress,
    isConnected,
    isConnecting,
    isDisconnected,
    
    // Network state
    chain,
    isWrongNetwork,
    switchNetwork,
    
    // Balance
    balance,
    
    // Computed states
    isReady: isConnected && !isWrongNetwork,
  };
} 