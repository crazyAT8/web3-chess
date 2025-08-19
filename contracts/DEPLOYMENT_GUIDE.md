# 🚀 ChessFi Smart Contract Deployment Guide

This guide will walk you through deploying the ChessFi smart contracts to Sepolia testnet.

## 📋 Prerequisites

1. **Node.js & npm** - Latest LTS version
2. **Hardhat** - Already configured in this project
3. **Sepolia ETH** - For gas fees (get from faucets below)
4. **Private Key** - Your wallet's private key
5. **RPC URL** - Sepolia network endpoint
6. **Etherscan API Key** - For contract verification (optional)

## 🔑 Getting Testnet ETH

### Sepolia Faucets:
- **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
- **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

You'll need at least **0.1 ETH** for deployment.

## ⚙️ Setup Configuration

### 1. Copy Environment Template
```bash
cp env.example .env
```

### 2. Fill in Your Values
Edit `.env` file with your actual values:

```bash
# Your wallet's private key (without 0x prefix)
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Sepolia RPC URL (choose one)
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# OR
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Etherscan API Key (optional, for verification)
ETHERSCAN_API_KEY=ABC123DEF456GHI789JKL
```

### 3. Get RPC URLs

#### Option A: Infura
1. Go to [Infura](https://infura.io/)
2. Create account and new project
3. Copy Sepolia endpoint URL

#### Option B: Alchemy
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create account and new app
3. Copy Sepolia HTTP URL

## 🚀 Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npx hardhat compile
```

### 3. Deploy to Sepolia
```bash
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

### 4. Verify Contracts (Optional)
```bash
npx hardhat run scripts/verify-sepolia.js --network sepolia
```

## 📊 Deployment Output

After successful deployment, you'll see:

```
🎉 Deployment to Sepolia Testnet completed successfully!

📋 Contract Addresses:
ChessToken: 0x...
ChessGame: 0x...
ChessNFT: 0x...
ChessTournament: 0x...

🔗 Sepolia Explorer Links:
ChessToken: https://sepolia.etherscan.io/address/0x...
ChessGame: https://sepolia.etherscan.io/address/0x...
ChessNFT: https://sepolia.etherscan.io/address/0x...
ChessTournament: https://sepolia.etherscan.io/address/0x...
```

## 📁 Generated Files

- `deployment-sepolia.json` - Contract addresses and deployment info
- `.env.sepolia.example` - Environment template with actual addresses

## 🔍 Contract Verification

### Why Verify?
- Makes contract code publicly readable on Etherscan
- Enables direct interaction through Etherscan interface
- Builds trust with users

### How to Verify
1. Get Etherscan API key from [Etherscan](https://etherscan.io/apis)
2. Add to `.env`: `ETHERSCAN_API_KEY=your_key_here`
3. Run: `npx hardhat run scripts/verify-sepolia.js --network sepolia`

## 🧪 Testing Deployed Contracts

### 1. Check Contract State
```bash
npx hardhat console --network sepolia
```

### 2. Interact with Contracts
```javascript
// Get contract instances
const ChessToken = await ethers.getContractFactory("ChessToken");
const token = ChessToken.attach("CONTRACT_ADDRESS");

// Check token supply
const supply = await token.totalSupply();
console.log("Total Supply:", ethers.formatEther(supply));
```

## 🚨 Troubleshooting

### Common Issues:

#### Insufficient Balance
```
❌ Insufficient balance. Need at least 0.1 ETH for deployment
```
**Solution**: Get more Sepolia ETH from faucets

#### Network Connection Error
```
❌ Network connection error
```
**Solution**: Check RPC URL and internet connection

#### Gas Estimation Failed
```
❌ Gas estimation failed
```
**Solution**: Check contract compilation and network status

#### Verification Failed
```
⚠️ Failed to verify contract
```
**Solution**: Check Etherscan API key and wait for deployment to be mined

## 🔗 Useful Links

- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Hardhat Docs**: https://hardhat.org/docs
- **Etherscan API**: https://etherscan.io/apis
- **Infura**: https://infura.io/
- **Alchemy**: https://www.alchemy.com/

## 📝 Next Steps

After successful deployment:

1. **Update Frontend**: Add contract addresses to frontend config
2. **Update Backend**: Add contract addresses to backend config
3. **Test Integration**: Test contract interactions from frontend
4. **User Testing**: Have users test the platform
5. **Mainnet Deployment**: When ready, deploy to mainnet

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your configuration
3. Check network status and gas prices
4. Review Hardhat and contract logs
5. Ensure sufficient testnet ETH balance

---

**Happy Deploying! 🎉** 