// src/components/Wallet.tsx

"use client";

import React, { useContext, useEffect, useState } from "react";
import { BlockchainContext } from "@/context/blockchain-context";
import { ITransaction, IBlock } from "@/lib/blockchain"; // Ensure correct import paths
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { Separator } from "@radix-ui/react-dropdown-menu";

interface WalletProps {
    address: string;
}

const Wallet: React.FC<WalletProps> = ({ address }) => {
    const {
        getBalanceOfAddress,
        blocks, // Access blocks directly from context
        isAddressFromCurrentUser,
    } = useContext(BlockchainContext);

    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [isValidAddress, setIsValidAddress] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(1);
    const transactionsPerPage = 10;

    useEffect(() => {
        if (address) {
            // Fetch balance
            const addrBalance = getBalanceOfAddress(address);
            setBalance(addrBalance);

            // Fetch transactions by iterating through all blocks
            const addrTransactions: ITransaction[] = [];

            blocks.forEach((block: IBlock) => {
                block.transactions.forEach((tx: ITransaction) => {
                    if (tx.fromAddress === address || tx.toAddress === address) {
                        addrTransactions.push(tx);
                    }
                });
            });

            setTransactions(addrTransactions);

            // Validate address existence
            const hasTransactions = addrTransactions.length > 0;
            setIsValidAddress(hasTransactions || isAddressFromCurrentUser(address));

            setLoading(false);
        }
    }, [address, getBalanceOfAddress, blocks, isAddressFromCurrentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (!address) {
        return '';
    }

    // Calculate Pagination
    const indexOfLastTx = currentPage * transactionsPerPage;
    const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstTx, indexOfLastTx);
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div>
            <Header />

            {!isValidAddress ?
                <div className="container mx-auto py-6 space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Wallet Not Found</h1>
                        <p className="text-muted-foreground">
                            The wallet address <strong>{truncate(address, 50)}</strong> does not exist in the blockchain.
                        </p>
                    </div>
                </div>
                :
                <div className="container mx-auto py-6 space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Wallet details</h1>
                        <p className="font-semibold">
                            Address:
                        </p>
                        <p className="text-muted-foreground mb-4 hidden xl:block">
                            {address}
                        </p>
                        <p className="text-muted-foreground mb-4 hidden md:block xl:hidden">
                            {truncate(address, 75)}
                        </p>
                        <p className="text-muted-foreground mb-4 block sm:block md:hidden">
                            {truncate(address, 40)}
                        </p>
                        <p className="font-semibold">
                            Balance:
                        </p>
                        <p className="text-muted-foreground">
                            {Math.round(balance * 100) / 100} Coins
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6">
                            Transactions
                        </h2>
                        {transactions.length === 0 ? (
                            <p className="text-muted-foreground">No transactions found for this wallet.</p>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">#</TableHead>
                                                <TableHead>From</TableHead>
                                                <TableHead>To</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead className="text-right">Timestamp</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentTransactions.map((tx, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{indexOfFirstTx + index + 1}</TableCell>
                                                    <TableCell>{tx.fromAddress ? truncate(tx.fromAddress, 15) : "System"}</TableCell>
                                                    <TableCell>{truncate(tx.toAddress, 15)}</TableCell>
                                                    <TableCell>{tx.amount}</TableCell>
                                                    <TableCell className="text-right">{new Date(tx.timestamp).toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-center mt-4 space-x-2">
                                    <Button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                    >
                                        Previous
                                    </Button>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => paginate(index + 1)}
                                            variant={currentPage === index + 1 ? "default" : "outline"}
                                        >
                                            {index + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            }
        </div>
    );
};

// Helper function to truncate long addresses for display
const truncate = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return `${str.slice(0, maxLength)}...`;
};

export default Wallet;
