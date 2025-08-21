# 🏗️ ChessFi Smart Contracts

This directory contains the smart contracts for the ChessFi Web3 chess gaming platform.

## 📋 Contract Overview

- **ChessToken.sol** - ERC20 token with staking rewards and game incentives
- **ChessGame.sol** - Core chess game logic with staking and winner determination
- **ChessNFT.sol** - NFT contract for chess pieces, boards, and player avatars
- **ChessTournament.sol** - Tournament system with multiple formats and prize distribution

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Run Tests

```bash
npm test
```

## 🌐 Deployment

### Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:local
```

### Sepolia Testnet

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify contracts on Etherscan
npm run verify:sepolia

# Test deployed contracts
npm run test:deployed
```

## ⚙️ Configuration

### Environment Setup

1. Copy `env.example` to `.env`
2. Fill in your values:
   - `PRIVATE_KEY` - Your wallet's private key
   - `SEPOLIA_URL` - Sepolia RPC endpoint
   - `ETHERSCAN_API_KEY` - For contract verification

### Network Configuration

The project supports multiple networks:

- **Localhost** - For development and testing
- **Sepolia** - Ethereum testnet (recommended for testing)
- **Goerli** - Legacy testnet (deprecated)
- **Mainnet** - Production deployment

## 📚 Scripts

| Script | Description |
|--------|-------------|
| `compile` | Compile all contracts |
| `test` | Run test suite |
| `deploy` | Deploy to default network |
| `deploy:local` | Deploy to local Hardhat network |
| `deploy:sepolia` | Deploy to Sepolia testnet |
| `verify:sepolia` | Verify contracts on Etherscan |
| `test:deployed` | Test deployed contracts on Sepolia |
| `console:sepolia` | Open Hardhat console on Sepolia |
| `console:local` | Open Hardhat console on local network |

## 🔍 Contract Verification

Contract verification makes your smart contract code publicly readable on Etherscan.

### Prerequisites

- Etherscan API key
- Deployed contracts
- Correct constructor arguments

### Verification Commands

```bash
# Verify all contracts
npm run verify:sepolia

# Manual verification (if needed)
npx hardhat verify --network sepolia CONTRACT_ADDRESS [CONSTRUCTOR_ARGS]
```

## 🧪 Testing

### Test Structure

- **Unit Tests** - Individual contract function testing
- **Integration Tests** - Contract interaction testing
- **Deployment Tests** - Post-deployment verification

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/ChessGame.test.js

# Run with gas reporting
REPORT_GAS=true npm test
```

## 📁 Project Structure

```
contracts/
├── contracts/           # Smart contract source files
├── scripts/            # Deployment and utility scripts
├── test/              # Test files
├── artifacts/         # Compiled contract artifacts
├── cache/             # Hardhat cache
├── hardhat.config.js  # Hardhat configuration
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🔗 Useful Commands

### Hardhat Console

```bash
# Connect to Sepolia
npm run console:sepolia

# Connect to local network
npm run console:local
```

### Contract Interaction

```javascript
// Get contract factory
const ChessToken = await ethers.getContractFactory("ChessToken");

// Deploy new contract
const token = await ChessToken.deploy();

// Attach to existing contract
const token = ChessToken.attach("CONTRACT_ADDRESS");

// Call contract functions
const name = await token.name();
const balance = await token.balanceOf("ADDRESS");
```

## 🚨 Troubleshooting

### Common Issues

#### Compilation Errors

- Check Solidity version compatibility
- Verify OpenZeppelin contract versions
- Ensure all imports are correct

#### Deployment Failures

- Verify sufficient ETH balance
- Check RPC endpoint connectivity
- Confirm private key format

#### Verification Issues

- Wait for deployment to be mined
- Verify correct constructor arguments
- Check Etherscan API key validity

### Getting Help

1. Check the troubleshooting section in `DEPLOYMENT_GUIDE.md`
2. Review error messages and logs
3. Verify network configuration
4. Check contract compilation status

## 📖 Documentation

- **DEPLOYMENT_GUIDE.md** - Comprehensive deployment instructions
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment checklist
- **Hardhat Documentation** - https://hardhat.org/docs
- **OpenZeppelin Contracts** - https://docs.openzeppelin.com/contracts/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🎉** 