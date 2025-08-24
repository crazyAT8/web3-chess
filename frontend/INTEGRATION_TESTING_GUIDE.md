# 🧪 Contract Integration Testing Guide

This guide will help you test the integration between your frontend and smart contracts.

## 🚀 **Step 1: Deploy Contracts (If Not Already Deployed)**

### **Option A: Deploy to Sepolia Testnet (Recommended for Testing)**

1. **Navigate to contracts directory:**

   ```bash
   cd contracts
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment:**

   ```bash
   cp env.example .env
   ```

4. **Edit `.env` file with your values:**

   ```env
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

5. **Deploy contracts:**

   ```bash
   npx hardhat run scripts/deploy-sepolia.js --network sepolia
   ```

6. **Copy deployed addresses to frontend:**
   Create `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=0x...deployed_token_address
   NEXT_PUBLIC_CHESS_NFT_ADDRESS=0x...deployed_nft_address
   NEXT_PUBLIC_CHESS_GAME_ADDRESS=0x...deployed_game_address
   NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=0x...deployed_tournament_address
   ```

### **Option B: Use Local Hardhat Network**

1. **Start local network:**

   ```bash
   npx hardhat node
   ```

2. **Deploy to local network:**

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Update frontend config to use localhost:**

   ```typescript
   // In frontend/src/config/contracts.ts
   export const CONTRACT_CONFIG = {
     NETWORK: {
       CHAIN_ID: 31337, // Hardhat local
       RPC_URL: 'http://127.0.0.1:8545',
       EXPLORER: 'http://localhost:8545'
     }
   }
   ```

## 🧪 **Step 2: Test the Integration**

### **1. Start the Frontend**

```bash
cd frontend
npm run dev
```

### **2. Navigate to Testing Tab**

1. Go to `http://localhost:3000/profile`
2. Connect your wallet
3. Click on the "Testing" tab

### **3. Run Integration Tests**

Click "Run All Tests" to execute the comprehensive test suite.

## 📋 **What the Tests Check**

### **✅ Wallet Connection Test**

- Verifies wallet is connected
- Checks for valid wallet address
- Ensures proper connection state

### **✅ Contract Configuration Test**

- Validates contract addresses are set
- Checks address format (42 characters, starts with 0x)
- Ensures no zero addresses

### **✅ Contract Instances Test**

- Verifies all contract instances are created
- Checks contract context availability
- Ensures proper contract naming

### **✅ Contract Reads Test**

- Tests token balance reading
- Tests NFT balance reading
- Verifies data loading states

### **✅ Contract Writes Test (Simulated)**

- Simulates write operations
- Checks transaction state management
- Validates error handling for writes

### **✅ Error Handling Test**

- Tests error message extraction
- Verifies error utility functions
- Ensures proper error display

### **✅ Transaction State Test**

- Tests transaction status helpers
- Verifies loading states
- Checks progress indicators

## 🔧 **Troubleshooting Common Issues**

### **Issue: "Contracts not properly configured"**

**Solution:**

1. Check if `.env.local` exists in frontend directory
2. Verify contract addresses are correct
3. Ensure addresses are 42 characters long
4. Check network configuration matches deployed contracts

### **Issue: "Contract context not available"**

**Solution:**

1. Verify `ContractProvider` wraps your app in `layout.tsx`
2. Check if `useContractContext` is called within provider
3. Ensure all contract hooks are properly imported

### **Issue: "Wallet not connected"**

**Solution:**

1. Connect your wallet using the connect button
2. Ensure you're on the correct network
3. Check wallet connection state in browser console

### **Issue: "Contract reads failing"**

**Solution:**

1. Verify contract addresses are correct
2. Check if contracts are deployed on the right network
3. Ensure wallet is connected to the same network
4. Check browser console for specific error messages

## 🎯 **Manual Testing Scenarios**

### **1. NFT Minting Test**

1. Go to `/mint` page
2. Fill out NFT minting form
3. Try to mint with test data
4. Verify transaction state management
5. Check for proper error handling

### **2. Game Creation Test**

1. Go to `/game` page
2. Try to create a game with minimal stake
3. Verify form validation
4. Test stake amount calculations
5. Check transaction flow

### **3. Token Staking Test**

1. Go to `/profile` → "Staking" tab
2. Try to stake tokens
3. Verify balance calculations
4. Test reward calculations
5. Check unstaking functionality

## 📊 **Expected Test Results**

### **With Deployed Contracts:**

- ✅ All tests should pass
- ✅ Contract reads should return real data
- ✅ Write operations should be available
- ✅ Error handling should work properly

### **With Mock Data:**

- ✅ Configuration tests should pass
- ✅ Contract instance tests should pass
- ✅ Error handling tests should pass
- ⚠️ Contract read tests may show mock data
- ⚠️ Write tests will be simulated

## 🚨 **Important Notes**

1. **Never test with real funds on mainnet**
2. **Always use testnet or local network for testing**
3. **Keep private keys secure and never commit them**
4. **Test with small amounts first**
5. **Verify all error scenarios**

## 🔄 **Continuous Testing**

### **Development Workflow:**

1. Make changes to contracts
2. Deploy to testnet
3. Update frontend addresses
4. Run integration tests
5. Fix any issues
6. Repeat until all tests pass

### **Pre-deployment Checklist:**

- [ ] All integration tests pass
- [ ] Contract addresses are correct
- [ ] Network configuration matches
- [ ] Wallet connection works
- [ ] Error handling works
- [ ] Transaction states work properly

## 📞 **Getting Help**

If you encounter issues:

1. **Check browser console** for error messages
2. **Verify contract deployment** on block explorer
3. **Check network configuration** matches
4. **Ensure wallet is connected** to correct network
5. **Review test results** for specific failure points

## 🎉 **Success Indicators**

You'll know the integration is working when:

- ✅ All integration tests pass
- ✅ Contract data loads properly
- ✅ Forms submit without errors
- ✅ Transaction states update correctly
- ✅ Error messages are user-friendly
- ✅ Loading states work smoothly

---
