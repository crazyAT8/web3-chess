# Frontend Contract Integration Guide

This guide explains how to set up and use the smart contract integration in the ChessFi frontend.

## 🚀 Quick Start

### 1. Deploy Contracts

First, deploy your smart contracts using Hardhat:

```bash
cd contracts
npm run deploy:local  # For local development
# or
npm run deploy:sepolia  # For testnet
```

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Contract Addresses (set these after deploying contracts)
NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=0x... # Your deployed ChessToken address
NEXT_PUBLIC_CHESS_NFT_ADDRESS=0x...   # Your deployed ChessNFT address
NEXT_PUBLIC_CHESS_GAME_ADDRESS=0x...  # Your deployed ChessGame address
NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=0x... # Your deployed ChessTournament address

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_NETWORK_NAME=localhost
NEXT_PUBLIC_LOCALHOST_RPC=http://127.0.0.1:8545
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

## 🏗️ Architecture

### Contract Integration Layers

1. **Contract ABIs** (`src/lib/contracts.ts`)
   - Imports compiled contract ABIs from Hardhat artifacts
   - Provides contract instances and hooks

2. **Read Hooks** (`src/hooks/useContractRead.ts`)
   - Read data from smart contracts
   - Handle loading states and errors

3. **Write Hooks** (`src/hooks/useContractWrite.ts`)
   - Execute transactions on smart contracts
   - Manage transaction states

4. **Contract Context** (`src/contexts/ContractContext.tsx`)
   - Global contract state management
   - Provides contract instances throughout the app

5. **Utility Functions** (`src/lib/contractUtils.ts`)
   - Format contract data for display
   - Handle common contract operations

## 📱 Usage Examples

### Reading Contract Data

```tsx
import { useChessTokenBalance } from '@/hooks/useContractRead';

function TokenBalance() {
  const { data: balance, isLoading, error } = useChessTokenBalance();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Balance: {balance} CHESS</div>;
}
```

### Writing to Contracts

```tsx
import { useChessTokenStake } from '@/hooks/useContractWrite';

function StakeTokens() {
  const { write, isLoading, isSuccess } = useChessTokenStake();
  
  const handleStake = () => {
    write({
      args: [parseEther('100')], // Stake 100 tokens
    });
  };
  
  return (
    <button onClick={handleStake} disabled={isLoading}>
      {isLoading ? 'Staking...' : 'Stake 100 CHESS'}
    </button>
  );
}
```

### Using Contract Context

```tsx
import { useContractContext } from '@/contexts/ContractContext';

function GameComponent() {
  const { chessGame, playerStats } = useContractContext();
  
  // Use contract instance directly
  const createGame = async () => {
    try {
      await chessGame.createGame({ value: parseEther('0.1') });
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };
  
  return (
    <div>
      <p>Wins: {playerStats || 0}</p>
      <button onClick={createGame}>Create Game</button>
    </div>
  );
}
```

## 🔧 Available Hooks

### Read Hooks

- `useChessTokenBalance()` - Get user's token balance

- `useChessTokenStakingInfo()` - Get staking information
- `useChessNFTBalance()` - Get user's NFT count
- `useChessNFTCollectionStats()` - Get collection statistics
- `useChessGamePlayerStats()` - Get player game statistics
- `useChessTournamentInfo()` - Get tournament information

### Write Hooks

- `useChessTokenStake()` - Stake tokens

- `useChessTokenUnstake()` - Unstake tokens
- `useChessTokenClaimRewards()` - Claim staking rewards
- `useChessNFTMint()` - Mint individual NFTs
- `useChessNFTMintChessSet()` - Mint complete chess sets
- `useChessGameCreate()` - Create new games
- `useChessGameJoin()` - Join existing games
- `useChessGameEnd()` - End games
- `useChessTournamentRegister()` - Register for tournaments

## 🎯 Contract Functions

### ChessToken

- **Staking**: `stake()`, `unstake()`, `claimRewards()`
- **Rewards**: `rewardWin()`, `rewardDraw()`, `rewardParticipation()`
- **Admin**: `setAuthorizedRewarder()`, `setWinReward()`, `pause()`

### ChessNFT

- **Minting**: `mintNFT()`, `mintChessSet()`
- **Management**: `burnNFT()`, `updateRarity()`, `updateMintPrice()`
- **Queries**: `getTokensByType()`, `getTokensByRarity()`, `getCollectionStats()`

### ChessGame

- **Game Management**: `createGame()`, `joinGame()`, `endGame()`
- **Moves**: `makeMove()` (to be implemented)
- **Admin**: `setPlatformFee()`, `setStakeLimits()`

### ChessTournament

- **Tournament Management**: `createTournament()`, `startTournament()`
- **Registration**: `registerForTournament()`
- **Admin**: `setPlatformFee()`, `setEntryFeeLimits()`

## 🚨 Error Handling

The integration includes comprehensive error handling:

```tsx
import { contractUtils } from '@/lib/contractUtils';

function handleError(error: any) {
  const message = contractUtils.getErrorMessage(error);
  console.error('Contract error:', message);
  // Show user-friendly error message
}
```

## 🔄 State Management

### Transaction States

- `isPending` - User needs to confirm transaction
- `isConfirming` - Transaction is being processed
- `isSuccess` - Transaction completed successfully
- `error` - Transaction failed with error details

### Loading States

- `isLoading` - Data is being fetched
- `isConfirming` - Transaction is being processed

## 🧪 Testing

### Local Development

1. Start Hardhat node: `npm run node`
2. Deploy contracts: `npm run deploy:local`
3. Copy contract addresses to `.env.local`
4. Start frontend: `npm run dev`

### Testnet Deployment

1. Configure network in `hardhat.config.js`
2. Set environment variables
3. Deploy: `npm run deploy:sepolia`
4. Update frontend environment variables

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🐛 Troubleshooting

### Common Issues

1. **Contracts not configured**
   - Check environment variables
   - Ensure contracts are deployed
   - Verify network configuration

2. **ABI import errors**
   - Run `npm run compile` in contracts folder
   - Check artifact paths
   - Verify contract compilation

3. **Transaction failures**
   - Check user has sufficient funds
   - Verify contract permissions
   - Check network configuration

4. **Loading states stuck**
   - Check RPC endpoint
   - Verify wallet connection
   - Check contract addresses
