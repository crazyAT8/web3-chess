# 🚀 Local Hardhat Network Testing - Quick Start

This guide will get you testing the ChessFi contract integration on a local Hardhat network in minutes!

## ⚡ **Quick Setup (3 Steps)**

### **Step 1: Start Local Blockchain**

```bash
# Terminal 1: Start Hardhat node
cd contracts
npx hardhat node
```
**Keep this terminal running!** You'll see 20 pre-funded accounts with 10,000 ETH each.

### **Step 2: Deploy Contracts**

```bash
# Terminal 2: Deploy contracts
cd contracts
npx hardhat run deploy-local.js --network localhost
```
**Copy the contract addresses** that are output - you'll need them for the frontend.

### **Step 3: Start Frontend**



```bash
# Terminal 3: Start frontend
cd frontend
npm run dev
```

## 🔧 **Configure Frontend with Contract Addresses**

After deployment, you'll see output like this:
```
📋 Contract Addresses for Frontend:
=====================================
NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHESS_NFT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_CHESS_GAME_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9c3C7325C7
NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
=====================================
```

**Update the frontend configuration:**

1. Open `frontend/src/config/local-deployment.ts`
2. Replace the placeholder addresses with your deployed addresses:

   ```typescript
   CONTRACT_ADDRESSES: {
     CHESS_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
     CHESS_NFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
     CHESS_GAME: '0x9fE46736679d2D9a65F0992F2272dE9c3C7325C7',
     CHESS_TOURNAMENT: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
   }
   ```

## 🧪 **Test the Integration**

1. **Open your browser** to `http://localhost:3000`
2. **Connect your wallet** (MetaMask, etc.)
3. **Switch to "Hardhat Local" network** (Chain ID: 31337)
4. **Go to Profile page** → **Testing tab**
5. **Click "Run All Tests"**

## 💰 **Get Test ETH**

Your Hardhat node provides 20 accounts with 10,000 ETH each. To use them in MetaMask:

1. **Copy a private key** from the Hardhat terminal output
2. **Import account** in MetaMask using the private key
3. **Switch to Hardhat Local network** (Chain ID: 31337)

## 🔍 **What You Can Test**

### **✅ Contract Reads**

- Token balances
- NFT ownership
- Game statistics
- Tournament information

### **✅ Contract Writes**

- Mint NFTs (with test ETH)
- Create games (with test ETH)
- Stake tokens
- Join tournaments

### **✅ Full Integration**

- Form submissions
- Transaction states
- Error handling
- Loading states

## 🚨 **Troubleshooting**

### **"Contracts not properly configured"**

- Check if you updated `local-deployment.ts` with correct addresses
- Verify addresses are 42 characters long and start with `0x`

### **"Wallet not connected"**

- Make sure MetaMask is connected
- Switch to "Hardhat Local" network (Chain ID: 31337)
- Check if you're on the right network

### **"Transaction failed"**

- Ensure you have test ETH in your account
- Check browser console for specific error messages
- Verify contract addresses are correct

### **"Network not found"**

- Add Hardhat Local network to MetaMask:
  - Network Name: `Hardhat Local`
  - RPC URL: `http://127.0.0.1:8545`
  - Chain ID: `31337`
  - Currency Symbol: `ETH`

## 🎯 **Expected Results**

With local contracts deployed:

- ✅ All integration tests should pass
- ✅ Contract reads return real data
- ✅ Write operations work with test ETH
- ✅ Full transaction flow works
- ✅ Error handling works properly

## 🔄 **Development Workflow**

1. **Make changes** to contracts
2. **Redeploy** to local network
3. **Update addresses** in frontend config
4. **Test changes** immediately
5. **Repeat** until satisfied

## 🎉 **Success!**

You'll know everything is working when:

- All integration tests pass ✅
- You can mint NFTs with test ETH ✅
- You can create games and tournaments ✅
- Transaction states update properly ✅
- Error handling works smoothly ✅

---

**Happy Local Testing! 🚀**

*This local setup gives you a full blockchain environment for development without any costs or external dependencies.*
