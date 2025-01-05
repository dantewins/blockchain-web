// lib/blockchain/Block.ts
import SHA256 from 'crypto-js/sha256';
import { Transaction } from '@/lib/blockchain/transaction';
import { IBlock, ITransaction } from '@/lib/blockchain/types';

export class Block implements IBlock {
    timestamp: number;
    transactions: ITransaction[];
    previousHash: string;
    hash: string;
    nonce: number;

    constructor(timestamp: number, transactions: ITransaction[], previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(): string {
        return SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
    }

    mineBlock(difficulty: number): void {
        const target = Array(difficulty + 1).join('0');
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block mined: ' + this.hash);
    }

    hasValidTransactions(): boolean {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }

    static fromData(data: any): Block {
        const transactions = data.transactions.map((txData: any) =>
            Transaction.fromData(txData)
        );
        const block = new Block(data.timestamp, transactions, data.previousHash);
        block.hash = data.hash;
        block.nonce = data.nonce;
        return block;
    }
}
