# Wallet Integration Setup

## Overview

This project uses RainbowKit and wagmi for Web3 wallet integration, providing support for multiple wallet providers including MetaMask, WalletConnect, Coinbase Wallet, and more.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
# WalletConnect Project ID
# Get your project ID from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

### 2. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up/Login
3. Create a new project
4. Copy the Project ID
5. Replace `YOUR_PROJECT_ID_HERE` in `.env.local`

### 3. Supported Networks

The app is configured to support:

- Ethereum Mainnet
- Sepolia Testnet
- Polygon Mainnet
- Polygon Mumbai Testnet

### 4. Components Available

#### `CustomConnectButton`

- Main wallet connection button
- Shows connection status, account info, and balance
- Handles network switching

#### `WalletStatus`

- Detailed wallet information display
- Shows connection status, network, address, and balance
- Used in profile pages

#### `useWallet` Hook

- Provides wallet state and functions
- Returns: `address`, `isConnected`, `balance`, `chain`, etc.

## Usage Examples

```tsx
import { useWallet } from '@/hooks/useWallet';
import { CustomConnectButton } from '@/components/wallet/ConnectButton';

function MyComponent() {
  const { isConnected, address, balance } = useWallet();
  
  return (
    <div>
      <CustomConnectButton />
      {isConnected && (
        <p>Connected: {address}</p>
      )}
    </div>
  );
}
```

## Features

- ✅ Multi-wallet support (MetaMask, WalletConnect, etc.)
- ✅ Network switching
- ✅ Real-time balance updates
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Error handling
- ✅ Loading states
