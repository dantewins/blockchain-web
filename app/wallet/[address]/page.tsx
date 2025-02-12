// app/wallet/[address]/page.tsx

import React from 'react';
import Wallet from '@/components/wallet';

interface WalletPageProps {
    params: {
        address: string;
    };
}

const WalletPage = async ({ params }: WalletPageProps) => {
    // No need to await params since it's not a promise
    const { address } = params;
    return <Wallet address={address} />;
};

export default WalletPage;