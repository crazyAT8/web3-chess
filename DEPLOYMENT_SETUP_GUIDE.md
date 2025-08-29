# 🚀 ChessFi Deployment Setup Guide

## Overview
This guide will walk you through deploying the ChessFi smart contracts to Sepolia testnet and configuring the frontend to interact with them.

## ✅ What We've Completed

1. **Contracts Compiled** - Smart contracts are compiled and artifacts generated
2. **Frontend Fixed** - Compilation errors resolved, frontend builds successfully
3. **ABI Integration** - Contract ABIs are ready to be loaded after deployment

## 🔧 Step-by-Step Deployment

### Step 1: Set Up Environment Variables

#### For Smart Contract Deployment:
1. Copy `contracts/env.template` to `contracts/.env`
2. Fill in your values:

```bash
# Copy the template
cp contracts/env.template contracts/.env

# Edit the .env file with your actual values
```

**Required Values:**
- `PRIVATE_KEY`: Your wallet's private key (without 0x prefix)
- `SEPOLIA_URL`: Sepolia RPC endpoint (Infura or Alchemy)
- `ETHERSCAN_API_KEY`: For contract verification (optional)

**Example:**
```bash
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### For Frontend:
1. Copy `frontend/env.template` to `frontend/.env.local`
2. **Leave contract addresses as 0x0000... for now** - we'll update them after deployment

### Step 2: Deploy Smart Contracts

1. **Navigate to contracts folder:**
```bash
cd contracts
```

2. **Install dependencies (if not already done):**
```bash
npm install
```

3. **Deploy to Sepolia:**
```bash
npm run deploy:sepolia
```

4. **Save the deployed addresses** from the console output

### Step 3: Update Frontend Configuration

1. **Update `frontend/.env.local`** with the deployed contract addresses:

```bash
NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=0x... # From deployment
NEXT_PUBLIC_CHESS_NFT_ADDRESS=0x...   # From deployment
NEXT_PUBLIC_CHESS_GAME_ADDRESS=0x...  # From deployment
NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=0x... # From deployment
```

2. **Update the contracts configuration** to load real ABIs:

Edit `frontend/src/lib/contracts.ts` and replace the placeholder ABIs with real ones from the artifacts.

### Step 4: Test the Integration

1. **Start the frontend:**
```bash
cd frontend
npm run dev
```

2. **Test wallet connection** and basic functionality
3. **Verify contract interactions** work correctly

## 🎯 Prerequisites

### Before You Start:
- [ ] **Sepolia ETH**: You need at least 0.1 ETH for deployment
- [ ] **Private Key**: Your wallet's private key (keep it secure!)
- [ **RPC Endpoint**: Sepolia RPC URL from Infura, Alchemy, or similar
- [ ] **Etherscan API Key**: For contract verification (optional but recommended)

### How to Get Sepolia ETH:
1. **Sepolia Faucet**: https://sepoliafaucet.com/
2. **Alchemy Faucet**: https://sepoliafaucet.com/
3. **Infura Faucet**: Check their documentation

## 🔍 Troubleshooting

### Common Issues:

1. **"Insufficient balance"**
   - Get more Sepolia ETH from a faucet

2. **"Network connection failed"**
   - Check your RPC URL
   - Verify you're on Sepolia testnet

3. **"Contract deployment failed"**
   - Check gas settings
   - Verify private key format

4. **"Frontend can't connect to contracts"**
   - Verify contract addresses in `.env.local`
   - Check network configuration

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Sepolia ETH available (≥0.1 ETH)
- [ ] Smart contracts deployed
- [ ] Contract addresses saved
- [ ] Frontend environment updated
- [ ] Basic functionality tested
- [ ] Wallet connection working
- [ ] Contract interactions functional

## 🚨 Security Notes

- **NEVER commit your `.env` file** to version control
- **Keep your private key secure** - it controls your wallet
- **Use testnet wallets** for development, not mainnet wallets
- **Verify contract addresses** before testing

## 📚 Next Steps

After successful deployment:

1. **Implement game logic** - Connect chess moves to smart contracts
2. **Add backend integration** - Connect frontend to backend API
3. **Complete core features** - NFT minting, staking, tournaments
4. **Add real-time gameplay** - WebSocket implementation
5. **User testing** - Test with real users

## 🆘 Need Help?

If you encounter issues:

1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure you have sufficient Sepolia ETH
4. Check network connectivity and RPC endpoints

---

**Status**: ⏳ Ready for Deployment
**Last Updated**: $(date)
**Next Action**: Set up environment variables and deploy contracts
