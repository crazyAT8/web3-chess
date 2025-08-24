import { formatEther, parseEther } from 'viem';

// Contract interaction utilities
export const contractUtils = {
  // Format token amounts
  formatTokenAmount: (amount: bigint | string | number) => {
    try {
      if (typeof amount === 'string') {
        return formatEther(BigInt(amount));
      }
      if (typeof amount === 'number') {
        return formatEther(BigInt(amount));
      }
      return formatEther(amount);
    } catch (error) {
      return '0';
    }
  },

  // Parse token amounts
  parseTokenAmount: (amount: string) => {
    try {
      return parseEther(amount);
    } catch (error) {
      return BigInt(0);
    }
  },

  // Format ETH amounts
  formatETH: (amount: bigint | string | number) => {
    try {
      if (typeof amount === 'string') {
        return formatEther(BigInt(amount));
      }
      if (typeof amount === 'number') {
        return formatEther(BigInt(amount));
      }
      return formatEther(amount);
    } catch (error) {
      return '0';
    }
  },

  // Parse ETH amounts
  parseETH: (amount: string) => {
    try {
      return parseEther(amount);
    } catch (error) {
      return BigInt(0);
    }
  },

  // Get readable error message from contract revert
  getErrorMessage: (error: any): string => {
    if (!error) return 'Unknown error occurred';
    
    // Handle custom errors
    if (error.message?.includes('execution reverted')) {
      const customErrorMatch = error.message.match(/execution reverted: ([^"]+)/);
      if (customErrorMatch) {
        return customErrorMatch[1];
      }
    }
    
    // Handle other error types
    if (error.message?.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    
    if (error.message?.includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
    
    if (error.message?.includes('network error')) {
      return 'Network error occurred';
    }
    
    return error.message || 'Transaction failed';
  },

  // Validate address format
  isValidAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Shorten address for display
  shortenAddress: (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  },

  // Get transaction status message
  getTransactionStatus: (isPending: boolean, isConfirming: boolean, isSuccess: boolean): string => {
    if (isPending) return 'Confirming transaction...';
    if (isConfirming) return 'Processing transaction...';
    if (isSuccess) return 'Transaction successful!';
    return 'Ready to transact';
  },
};

// Contract-specific utilities
export const chessUtils = {
  // Get NFT type name
  getNFTTypeName: (type: number): string => {
    const types = ['Piece', 'Board', 'Avatar', 'Set'];
    return types[type] || 'Unknown';
  },

  // Get rarity name
  getRarityName: (rarity: number): string => {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    return rarities[rarity] || 'Unknown';
  },

  // Get game state name
  getGameStateName: (state: number): string => {
    const states = ['Waiting', 'Active', 'White Won', 'Black Won', 'Draw', 'Cancelled'];
    return states[state] || 'Unknown';
  },

  // Get tournament state name
  getTournamentStateName: (state: number): string => {
    const states = ['Registration', 'Active', 'Finished', 'Cancelled'];
    return states[state] || 'Unknown';
  },

  // Get tournament type name
  getTournamentTypeName: (type: number): string => {
    const types = ['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss'];
    return types[type] || 'Unknown';
  },
};

export default contractUtils;
