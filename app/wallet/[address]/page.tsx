// app/wallet/[address]/page.tsx

import React from 'react';
import Wallet from '@/components/wallet';

interface WalletPageProps {
  params: Promise<{
    address: string;
  }>;
}

const WalletPage = async ({ params }: WalletPageProps) => {
  // await the promise to get the actual params object
  const { address } = await params;
  return <Wallet address={address} />;
};

export default WalletPage;