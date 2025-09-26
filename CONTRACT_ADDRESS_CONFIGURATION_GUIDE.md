# ChessFi Contract Address Configuration Guide

## 🎯 Overview

This guide explains how to properly configure contract addresses for the ChessFi application across different environments (local development, testnet, and production).

## 📋 Current Contract Addresses

### ✅ **Hardhat Local Network (Chain ID: 1337)**

| Contract | Address | Status |
|----------|---------|--------|
| **ChessToken** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | ✅ Deployed |
| **ChessNFT** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | ✅ Deployed |
| **ChessGame** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | ✅ Deployed |
| **ChessTournament** | `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` | ✅ Deployed |

## 🔧 Configuration Files

### 1. **Frontend Environment Configuration**

#### Local Development (`frontend/env.local`)
```bash
# Contract Addresses (Hardhat Local Network)
NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHESS_NFT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_CHESS_GAME_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

# Network Configuration (Hardhat Local)
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_NETWORK_NAME=localhost
NEXT_PUBLIC_LOCALHOST_RPC=http://127.0.0.1:8545
```

#### Production Template (`frontend/env.production.template`)
```bash
# Contract Addresses (Sepolia Testnet - Update after deployment)
NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHESS_NFT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHESS_GAME_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=0x0000000000000000000000000000000000000000

# Network Configuration (Sepolia Testnet)
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

### 2. **Contract Configuration Files**

#### Main Configuration (`frontend/src/config/contracts.ts`)
- ✅ **Already configured** with correct local addresses
- Uses environment variables with fallback to deployed addresses
- Includes network configuration and contract settings

#### Local Deployment (`frontend/src/config/local-deployment.ts`)
- ✅ **Updated** with correct deployed addresses
- Includes network configuration for Hardhat local
- Provides helper functions for local development

#### Test Configuration (`frontend/src/config/test-contracts.ts`)
- Configured for testing with mock data
- Includes test data for NFT minting, game creation, and staking

### 3. **Contract Integration Files**

#### Contract Library (`frontend/src/lib/contracts.ts`)
- ✅ **Already configured** with correct addresses
- Imports contract ABIs from artifacts
- Provides contract instance helpers and hooks

#### Contract Context (`frontend/src/contexts/ContractContext.tsx`)
- ✅ **Already configured** to use contract library
- Provides React context for contract instances
- Includes loading states and error handling

## 🚀 Deployment Workflows

### **Local Development Setup**

1. **Start Hardhat Node**
   ```bash
   cd contracts
   npx hardhat node
   ```

2. **Deploy Contracts** (in new terminal)
   ```bash
   cd contracts
   npx hardhat run deploy-local.js --network localhost
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Connect Wallet**
   - Connect to "Hardhat Local" network
   - Use the first account from Hardhat (has test ETH)

### **Sepolia Testnet Deployment**

1. **Set up Environment**
   ```bash
   cd contracts
   cp env.template .env
   # Fill in your private key and RPC URL
   ```

2. **Deploy to Sepolia**
   ```bash
   npx hardhat run scripts/deploy-sepolia.js --network sepolia
   ```

3. **Update Frontend Configuration**
   ```bash
   cd frontend
   cp env.production.template .env.local
   # Update with deployed addresses from step 2
   ```

4. **Verify Contracts** (optional)
   ```bash
   npx hardhat run scripts/verify-sepolia.js --network sepolia
   ```

### **Mainnet Deployment**

1. **Set up Production Environment**
   ```bash
   cd contracts
   cp env.template .env
   # Fill in production values
   ```

2. **Deploy to Mainnet**
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

3. **Update Frontend Configuration**
   ```bash
   cd frontend
   cp env.production.template .env.local
   # Update with mainnet addresses
   ```

## 🔍 Verification Steps

### **Check Contract Configuration**

1. **Verify Environment Variables**
   ```bash
   cd frontend
   npm run dev
   # Check browser console for contract address logs
   ```

2. **Test Contract Integration**
   - Go to `/profile` page
   - Check "Testing" tab
   - Verify contract addresses are displayed correctly

3. **Test Contract Functions**
   - Try minting an NFT
   - Create a test game
   - Check token balance

### **Common Issues & Solutions**

#### **Issue: "Contract address not configured"**
- **Solution**: Check environment variables are set correctly
- **Check**: Verify `.env.local` file exists and has correct addresses

#### **Issue: "Contract not found"**
- **Solution**: Ensure contracts are deployed to the correct network
- **Check**: Verify chain ID matches the deployed network

#### **Issue: "Transaction failed"**
- **Solution**: Check if you have enough ETH for gas fees
- **Check**: Verify you're connected to the correct network

## 📊 Network Configuration

### **Supported Networks**

| Network | Chain ID | RPC URL | Status |
|---------|----------|---------|--------|
| **Hardhat Local** | 1337 | http://127.0.0.1:8545 | ✅ Configured |
| **Sepolia** | 11155111 | https://sepolia.infura.io/v3/... | 🔄 Ready |
| **Mainnet** | 1 | https://mainnet.infura.io/v3/... | 🔄 Ready |

### **Wallet Configuration**

The application supports:
- ✅ MetaMask
- ✅ WalletConnect
- ✅ Coinbase Wallet
- ✅ Rainbow Wallet

## 🎯 Next Steps

1. **Deploy to Sepolia Testnet**
   - Follow the Sepolia deployment workflow
   - Test all functionality on testnet
   - Get community feedback

2. **Prepare for Mainnet**
   - Security audit (recommended)
   - Gas optimization
   - Final testing

3. **Production Launch**
   - Deploy to mainnet
   - Update frontend configuration
   - Launch application

## 📝 Notes

- All contract addresses are **case-sensitive**
- Always verify addresses on block explorers
- Keep private keys secure and never commit them to version control
- Test thoroughly on testnet before mainnet deployment

---

**✅ Contract addresses are now properly configured for local development!**

The application is ready to use with the deployed Hardhat local contracts. For production deployment, follow the Sepolia and Mainnet workflows outlined above.
