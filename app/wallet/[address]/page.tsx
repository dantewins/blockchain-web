// app/wallet/[address]/page.tsx

import React from 'react';
import Wallet from '@/components/wallet';

interface WalletPageProps {
  // Allow params to be either a plain object or a Promise that resolves to that object.
  params: { address: string } | Promise<{ address: string }>;
}

const WalletPage = async ({ params }: WalletPageProps) => {
  // Ensure params is resolved; if it’s already an object this is a no-op.
  const resolvedParams = await Promise.resolve(params);
  const { address } = resolvedParams;
  return <Wallet address={address} />;
};

export default WalletPage;