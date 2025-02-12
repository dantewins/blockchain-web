import { IBlockchain, IBlock, ITransaction } from '@/lib/blockchain/types';
import { Block } from '@/lib/blockchain/block';
import { Transaction } from '@/lib/blockchain/transaction';

export class Blockchain implements IBlockchain {
    chain: IBlock[];
    difficulty: number;
    pendingTransactions: ITransaction[];
    miningReward: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(): IBlock {
        return new Block(Date.parse('2017-01-01'), [], '0');
    }

    getLatestBlock(): IBlock {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string): void {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction: ITransaction): void {
        // Ensure that non-reward transactions have both from and to addresses
        if (transaction.fromAddress === null && transaction.toAddress) {
            // Mining reward transactions (fromAddress is null) are allowed
        } else if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Compare with the previous block's stored hash
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    static fromData(data: any): Blockchain {
        const blockchain = new Blockchain();
        blockchain.difficulty = data.difficulty;
        blockchain.miningReward = data.miningReward;

        // Reconstruct the chain
        blockchain.chain = data.chain.map((blockData: any) => Block.fromData(blockData));

        // Reconstruct pending transactions
        blockchain.pendingTransactions = data.pendingTransactions.map((txData: any) =>
            Transaction.fromData(txData)
        );

        return blockchain;
    }

    // Helper methods to create blocks and transactions from data
    createBlockFromData(data: any): IBlock {
        return Block.fromData(data);
    }

    createTransactionFromData(data: any): ITransaction {
        return Transaction.fromData(data);
    }
}
