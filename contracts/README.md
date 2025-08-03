# ChessFi Smart Contracts

This directory contains the smart contracts for the ChessFi Web3 chess platform. The contracts are built using Solidity and Hardhat.

## 📋 Contract Overview

### Core Contracts

1. **ChessGame.sol** - Main game logic and state management
2. **ChessNFT.sol** - NFT minting for chess pieces, boards, and avatars
3. **ChessTournament.sol** - Tournament management with prize pools
4. **ChessToken.sol** - ERC20 token for rewards and governance

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

## 📜 Contract Details

### ChessGame.sol

**Purpose**: Manages individual chess games with staking and rewards.

**Key Features**:

- Create and join games with ETH stakes
- Make moves and track game state
- Automatic stake distribution on game completion
- Player statistics tracking
- Platform fee collection

**Main Functions**:

- `createGame(uint256 stake)` - Create a new game with stake
- `joinGame(uint256 gameId)` - Join an existing game
- `makeMove(uint256 gameId, uint8 fromRow, uint8 fromCol, uint8 toRow, uint8 toCol, PieceType pieceType)` - Make a chess move
- `endGame(uint256 gameId, GameState state)` - End a game manually

### ChessNFT.sol

**Purpose**: Manages NFT minting for chess-related digital assets.

**Key Features**:

- Mint individual chess pieces, boards, and avatars
- Complete chess set minting
- Rarity levels and metadata management
- Collection statistics
- Tradeable and non-tradeable NFTs

**Main Functions**:

- `mintNFT(NFTType nftType, Rarity rarity, string name, string description, string imageURI, uint256 mintPrice)` - Mint individual NFT
- `mintChessSet(string setName, string description, string imageURI, string[] pieceURIs)` - Mint complete chess set
- `getTokensByOwner(address owner)` - Get all tokens owned by address
- `getCollectionStats()` - Get collection statistics

### ChessTournament.sol

**Purpose**: Manages chess tournaments with brackets and prize pools.

**Key Features**:

- Single elimination, double elimination, and round robin tournaments
- Automatic bracket generation
- Prize pool distribution
- Tournament state management
- Player registration and match tracking

**Main Functions**:

- `createTournament(string name, string description, TournamentType tournamentType, uint256 entryFee, uint256 maxPlayers, uint256 startTime)` - Create tournament
- `registerForTournament(uint256 tournamentId)` - Register for tournament
- `completeMatch(uint256 tournamentId, uint256 matchId, address winner)` - Complete a match
- `getTournament(uint256 tournamentId)` - Get tournament details

### ChessToken.sol

**Purpose**: ERC20 token for platform rewards and governance.

**Key Features**:

- Token rewards for game participation and wins
- Staking rewards system
- Authorized rewarder system
- Tokenomics management
- Emergency pause functionality

**Main Functions**:

- `rewardWin(address player)` - Reward tokens for winning
- `rewardDraw(address player)` - Reward tokens for drawing
- `stake(uint256 amount)` - Stake tokens for rewards
- `claimRewards()` - Claim staking rewards

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/ChessGame.test.js

# Run with coverage
npx hardhat coverage
```

## 📦 Deployment

### Local Development

```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet Deployment

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the contracts directory:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
MAINNET_URL=https://mainnet.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Network Configuration

The `hardhat.config.js` file includes configurations for:

- Local development network
- Sepolia testnet
- Ethereum mainnet

## 📊 Contract Addresses

After deployment, contract addresses will be saved to `deployment.json`:

```json
{
  "network": "localhost",
  "deployer": "0x...",
  "contracts": {
    "ChessToken": "0x...",
    "ChessGame": "0x...",
    "ChessNFT": "0x...",
    "ChessTournament": "0x..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔗 Integration

### Frontend Integration

Update your frontend configuration with the deployed contract addresses:

```typescript
// contracts.ts
export const CONTRACTS = {
  CHESS_TOKEN: "0x...",
  CHESS_GAME: "0x...",
  CHESS_NFT: "0x...",
  CHESS_TOURNAMENT: "0x..."
};
```

### Backend Integration

Update your backend with contract ABIs and addresses:

```javascript
// contractConfig.js
const contractAddresses = {
  chessToken: "0x...",
  chessGame: "0x...",
  chessNFT: "0x...",
  chessTournament: "0x..."
};
```

## 🛡️ Security

### Best Practices

- All contracts use OpenZeppelin libraries for security
- Reentrancy protection on all external functions
- Access control with Ownable pattern
- Input validation and bounds checking
- Emergency pause functionality

### Audit Considerations

- External audit recommended before mainnet deployment
- Test coverage should exceed 90%
- Manual testing of all edge cases
- Gas optimization for user interactions

## 📈 Gas Optimization

### Tips for Gas Efficiency

- Use `uint256` for loop counters
- Pack structs efficiently
- Minimize storage reads/writes
- Use events instead of storage for historical data
- Batch operations when possible

## 🐛 Troubleshooting

### Common Issues

1. **Compilation Errors**

   ```bash
   # Clear cache and recompile
   npx hardhat clean
   npx hardhat compile
   ```

2. **Test Failures**

   ```bash
   # Run tests with verbose output
   npx hardhat test --verbose
   ```

3. **Deployment Issues**

   ```bash
   # Check network configuration
   npx hardhat console --network localhost
   ```

## 📚 Additional Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Development](https://ethereum.org/developers/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 