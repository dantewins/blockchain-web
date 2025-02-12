// app/wallet/[address]/page.tsx

import React from 'react';
import Wallet from '@/components/wallet';

interface WalletPageProps {
  params: {
    address: string;
  };
}

const WalletPage = ({ params }: WalletPageProps) => {
  const { address } = params;
  return <Wallet address={address} />;
};

export default WalletPage;