import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ChessFi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
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