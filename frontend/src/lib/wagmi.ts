import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains';

// Local Hardhat network configuration
const localhost = {
  id: 31337,
  name: 'Hardhat Local',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'ChessFi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '04814b397ae6bbd6d024f74e28c6a942',
  chains: [
    localhost, // Add localhost first for development
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
  ],
  ssr: true,
});

// For development, you can use a default project ID
// In production, get a real project ID from https://cloud.walletconnect.com/
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn('⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Using default project ID for development.');
} 