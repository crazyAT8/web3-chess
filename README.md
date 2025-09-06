# ♟️ Web3 Chess

A multiplayer chess game platform powered by Web3.

## Features

- Real-time chess gameplay with Socket.IO
- Wallet-based login using Sign-In With Ethereum (SIWE)
- Crypto wagers via smart contracts (Solidity + Hardhat)
- Clean Next.js frontend with Tailwind CSS
- Game history tracking (optional IPFS)

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- wagmi + viem + RainbowKit
- express + socket.io
- Solidity + Hardhat

## Getting Started

```bash
git clone https://github.com/your-username/web3-chess.git
cd web3-chess

# Install deps per folder
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
