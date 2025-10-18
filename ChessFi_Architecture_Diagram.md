# ChessFi - Full-Stack Web3 Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    %% User Layer
    subgraph "User Interface Layer"
        UI[Next.js Frontend<br/>React 19 + TypeScript<br/>Tailwind CSS]
        WALLET[MetaMask Wallet<br/>RainbowKit + wagmi]
    end

    %% Frontend Components
    subgraph "Frontend Components"
        GAME[Game Board<br/>Chess.js Integration]
        PROFILE[User Profile<br/>Statistics & History]
        LEADERBOARD[Leaderboard<br/>Rankings & Stats]
        MINT[NFT Minting<br/>Chess Pieces & Boards]
        TOURNAMENT[Tournament<br/>Creation & Management]
    end

    %% API Layer
    subgraph "Backend API Layer"
        API[Express.js Server<br/>Node.js + TypeScript]
        AUTH[JWT Authentication<br/>Wallet-based SIWE]
        SOCKET[Socket.IO<br/>Real-time Gameplay]
        MIDDLEWARE[Middleware<br/>CORS, Rate Limiting, Helmet]
    end

    %% Database Layer
    subgraph "Database Layer"
        DB[(PostgreSQL<br/>Production Database)]
        SQLITE[(SQLite<br/>Development Database)]
        REDIS[(Redis Cache<br/>Session & Game State)]
    end

    %% Blockchain Layer
    subgraph "Blockchain Layer - Sepolia Testnet"
        subgraph "Smart Contracts"
            TOKEN[ChessToken<br/>ERC20 Token<br/>Rewards & Staking]
            NFT[ChessNFT<br/>ERC721 NFTs<br/>Pieces & Avatars]
            GAME_CONTRACT[ChessGame<br/>Game Logic & Staking]
            TOURNAMENT_CONTRACT[ChessTournament<br/>Tournament Management]
        end
        
        RPC[Sepolia RPC<br/>Infura/Alchemy]
        EXPLORER[Etherscan<br/>Contract Verification]
    end

    %% External Services
    subgraph "External Services"
        INFURA[Infura/Alchemy<br/>Blockchain RPC]
        IPFS[IPFS<br/>Game History Storage]
    end

    %% Data Flow Connections
    UI --> WALLET
    UI --> GAME
    UI --> PROFILE
    UI --> LEADERBOARD
    UI --> MINT
    UI --> TOURNAMENT

    WALLET --> TOKEN
    WALLET --> NFT
    WALLET --> GAME_CONTRACT
    WALLET --> TOURNAMENT_CONTRACT

    GAME --> SOCKET
    PROFILE --> API
    LEADERBOARD --> API
    MINT --> API
    TOURNAMENT --> API

    API --> AUTH
    API --> MIDDLEWARE
    SOCKET --> API

    API --> DB
    API --> SQLITE
    API --> REDIS

    TOKEN --> RPC
    NFT --> RPC
    GAME_CONTRACT --> RPC
    TOURNAMENT_CONTRACT --> RPC

    RPC --> INFURA
    GAME_CONTRACT --> EXPLORER
    TOKEN --> EXPLORER
    NFT --> EXPLORER
    TOURNAMENT_CONTRACT --> EXPLORER

    API --> IPFS

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef blockchain fill:#fff3e0
    classDef external fill:#fce4ec

    class UI,WALLET,GAME,PROFILE,LEADERBOARD,MINT,TOURNAMENT frontend
    class API,AUTH,SOCKET,MIDDLEWARE backend
    class DB,SQLITE,REDIS database
    class TOKEN,NFT,GAME_CONTRACT,TOURNAMENT_CONTRACT,RPC,EXPLORER blockchain
    class INFURA,IPFS external
```

## Technology Stack Details

### Frontend (Next.js 15)

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3 Integration**: wagmi + viem + RainbowKit
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI + Custom Components
- **Real-time**: Socket.IO Client
- **Chess Logic**: chess.js library

### Backend (Node.js/Express)

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Language**: JavaScript
- **Authentication**: JWT + Wallet-based SIWE
- **Real-time**: Socket.IO
- **Database ORM**: Sequelize
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi
- **Blockchain**: ethers.js + web3.js

### Database

- **Production**: PostgreSQL
- **Development**: SQLite
- **Caching**: Redis (optional)
- **Models**: User, Game, Tournament, NFT

### Smart Contracts (Solidity)

- **ChessToken**: ERC20 token with staking rewards
- **ChessNFT**: ERC721 for chess pieces and avatars
- **ChessGame**: Game logic with crypto staking
- **ChessTournament**: Tournament management system
- **Network**: Sepolia Testnet
- **Framework**: Hardhat

### Key Features

1. **Real-time Chess Gameplay** with Socket.IO
2. **Wallet-based Authentication** using Sign-In With Ethereum
3. **Crypto Staking** for game participation
4. **NFT Minting** for chess pieces and boards
5. **Tournament System** with prize distribution
6. **Leaderboard** with player statistics
7. **Token Rewards** for gameplay and achievements

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development Environment"
        DEV_FRONTEND[Frontend<br/>localhost:3000]
        DEV_BACKEND[Backend<br/>localhost:3001]
        DEV_DB[SQLite Database]
    end

    subgraph "Production Environment"
        PROD_FRONTEND[Frontend<br/>Vercel/Netlify]
        PROD_BACKEND[Backend<br/>Railway/Heroku]
        PROD_DB[PostgreSQL<br/>Supabase/AWS RDS]
    end

    subgraph "Blockchain Network"
        SEPOLIA[Sepolia Testnet<br/>Contract Addresses]
    end

    DEV_FRONTEND --> DEV_BACKEND
    DEV_BACKEND --> DEV_DB
    DEV_FRONTEND --> SEPOLIA
    DEV_BACKEND --> SEPOLIA

    PROD_FRONTEND --> PROD_BACKEND
    PROD_BACKEND --> PROD_DB
    PROD_FRONTEND --> SEPOLIA
    PROD_BACKEND --> SEPOLIA
```

## Security & Performance Features

- **JWT Authentication** with wallet signature verification
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** using Joi schemas
- **SQL Injection Protection** via Sequelize ORM
- **Real-time Communication** with Socket.IO
- **Caching Strategy** with Redis
- **Database Migrations** for schema management
- **Environment-based Configuration** for different deployments
