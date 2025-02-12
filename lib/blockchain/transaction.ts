import SHA256 from 'crypto-js/sha256';
import { ec as EC } from 'elliptic';
import { ITransaction } from '@/lib/blockchain/types';

const ec = new EC('secp256k1');

export class Transaction implements ITransaction {
    fromAddress: string | null;
    toAddress: string;
    amount: number;
    signature?: string;
    timestamp: number;

    constructor(fromAddress: string | null, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash(): string {
        // Include timestamp so that each transaction hash is unique
        return SHA256(
            this.fromAddress + this.toAddress + this.amount + this.timestamp
        ).toString();
    }

    signTransaction(signingKey: EC.KeyPair): void {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(): boolean {
        // If the transaction is a mining reward, no signature is required.
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

    static fromData(data: any): Transaction {
        const tx = new Transaction(data.fromAddress, data.toAddress, data.amount);
        tx.timestamp = data.timestamp;
        tx.signature = data.signature;
        return tx;
    }
}
