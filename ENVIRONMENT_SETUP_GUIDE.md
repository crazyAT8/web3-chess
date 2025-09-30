# ChessFi Environment Configuration Guide

This guide will help you set up the environment configuration for all components of the ChessFi application.

## 🎯 **Environment Setup Overview**

The ChessFi application has three main components that need environment configuration:
1. **Backend** (Node.js/Express API)
2. **Frontend** (Next.js React App)
3. **Smart Contracts** (Hardhat/Solidity)

## 📋 **Prerequisites**

Before setting up environments, you need:
- [ ] Node.js v18+ installed
- [ ] A wallet with testnet ETH (for Sepolia)
- [ ] Infura or Alchemy account (for RPC endpoints)
- [ ] WalletConnect Project ID (optional)

## 🔧 **Step 1: Backend Environment Setup**

### **For Development (SQLite):**
```bash
cd backend
cp env.sepolia .env
```

### **For Production (PostgreSQL):**
```bash
cd backend
cp env.example .env
# Edit .env with your production values
```

### **Required Backend Environment Variables:**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chessfi
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Contract Addresses (Sepolia Testnet)
CHESS_TOKEN_CONTRACT=0x0E887B3aAd61c724De20308cc7a3d6d8197A992a
NFT_CONTRACT=0x91a32Ce740BE656f8F150806d9d4a22518136415
GAME_CONTRACT=0x3DF6f0284Bf92fd48c5517b9cA9788aB479f0796
TOURNAMENT_CONTRACT=0x3a34F400393cB1193616dF72Eb843Fe826ABC137

# Network Configuration
CHAIN_ID=11155111
NETWORK_NAME=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🎨 **Step 2: Frontend Environment Setup**

### **For Sepolia Testnet:**
```bash
cd frontend
cp env.sepolia .env.local
```

### **For Local Development:**
```bash
cd frontend
cp env.localhost .env.local
```

### **Required Frontend Environment Variables:**
```env
# Contract Addresses (Sepolia Testnet)
NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=0x0E887B3aAd61c724De20308cc7a3d6d8197A992a
NEXT_PUBLIC_CHESS_NFT_ADDRESS=0x91a32Ce740BE656f8F150806d9d4a22518136415
NEXT_PUBLIC_CHESS_GAME_ADDRESS=0x3DF6f0284Bf92fd48c5517b9cA9788aB479f0796
NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=0x3a34F400393cB1193616dF72Eb843Fe826ABC137

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

## ⛓️ **Step 3: Smart Contracts Environment Setup**

### **For Sepolia Deployment:**
```bash
cd contracts
cp env.example .env
```

### **Required Contract Environment Variables:**
```env
# Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## 🚀 **Step 4: Quick Setup Commands**

### **Complete Environment Setup:**
```bash
# 1. Backend (Sepolia)
cd backend
cp env.sepolia .env
npm install
npm run setup-sqlite
npm run dev

# 2. Frontend (Sepolia)
cd frontend
cp env.sepolia .env.local
npm install
npm run dev

# 3. Contracts (if needed)
cd contracts
cp env.example .env
# Edit .env with your values
npm install
```

## 🔍 **Step 5: Verification**

### **Test Backend:**
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/users
```

### **Test Frontend:**
- Open http://localhost:3000
- Check browser console for errors
- Verify wallet connection

### **Test Contracts:**
```bash
cd contracts
npx hardhat test
```

## 🌐 **Network Configurations**

### **Sepolia Testnet:**
- **Chain ID:** 11155111
- **RPC:** https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Explorer:** https://sepolia.etherscan.io
- **Faucet:** https://sepoliafaucet.com

### **Localhost (Hardhat):**
- **Chain ID:** 1337
- **RPC:** http://127.0.0.1:8545
- **Explorer:** N/A (local)

## 🔐 **Security Notes**

1. **Never commit .env files** to version control
2. **Use strong JWT secrets** in production
3. **Keep private keys secure** and never share them
4. **Use environment-specific configurations** for different deployments
5. **Rotate API keys regularly** in production

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Missing script: dev"**
   - Run `npm install` in the frontend directory
   - Check package.json for correct scripts

2. **Database connection errors**
   - Ensure PostgreSQL is running (for production)
   - Check database credentials in .env

3. **Contract connection errors**
   - Verify contract addresses are correct
   - Check RPC URL is accessible
   - Ensure wallet is connected to correct network

4. **CORS errors**
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend URL matches backend CORS settings

## 📞 **Support**

If you encounter issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all services are running on correct ports
4. Check network connectivity and RPC endpoints

---

**Next Steps:** After setting up environments, you can start the application and begin testing the features!
