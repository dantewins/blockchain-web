import { ec as EC } from 'elliptic';

export interface ITransaction {
    fromAddress: string | null;
    toAddress: string;
    amount: number;
    signature?: string;
    timestamp: number;
    calculateHash(): string;
    signTransaction(signingKey: EC.KeyPair): void;
    isValid(): boolean;
}

export interface IBlock {
    timestamp: number;
    transactions: ITransaction[];
    previousHash: string;
    hash: string;
    nonce: number;
    calculateHash(): string;
    mineBlock(difficulty: number): void;
    hasValidTransactions(): boolean;
}

export interface IBlockchain {
    chain: IBlock[];
    difficulty: number;
    pendingTransactions: ITransaction[];
    miningReward: number;
    createGenesisBlock(): IBlock;
    getLatestBlock(): IBlock;
    minePendingTransactions(miningRewardAddress: string): void;
    addTransaction(transaction: ITransaction): void;
    getBalanceOfAddress(address: string): number;
    isChainValid(): boolean;
}
