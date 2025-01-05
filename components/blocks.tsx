// src/components/Blocks.tsx

"use client";

import React, { useContext, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"; // Ensure you have these components
import { BlockchainContext } from "@/context/blockchain-context"; // Adjust the import path as necessary
import { IBlock, ITransaction } from "@/lib/blockchain"; // Ensure correct paths

const Blocks: React.FC = () => {
    // Access the blockchain context
    const { blocks } = useContext(BlockchainContext);

    // State to track the currently expanded block by its hash
    const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

    // Function to toggle block expansion
    const toggleBlock = (hash: string) => {
        setExpandedBlock((prev) => (prev === hash ? null : hash));
    };

    // Function to format timestamp to a readable date
    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // Helper function to truncate strings
    const truncate = (str: string, maxLength: number) => {
        return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-2">Blocks on chain</h2>
                <p className="text-muted-foreground mb-6">
                    Each card represents a block on the chain. Click on a block to see the transactions stored inside.
                </p>
                {blocks.length === 0 ? (
                    <div className="text-center text-gray-500">No blocks available.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="inline-flex gap-4 min-w-full pb-4">
                            {blocks.map((block: IBlock, index: number) => {
                                const blockNumber = index + 1;
                                const isGenesis = index === 0;
                                const isExpanded = expandedBlock === block.hash;

                                return (
                                    <Card
                                        key={block.hash}
                                        className={`hover:bg-accent/50 cursor-pointer transition flex-shrink-0 ${isExpanded ? 'border-2 border-black' : ''
                                            }`}
                                        onClick={() => toggleBlock(block.hash)}
                                    >
                                        <CardHeader>
                                            <CardTitle>
                                                Block {blockNumber} {isGenesis && "(Genesis Block)"}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <div className="text-sm font-medium mb-1">Hash</div>
                                                <div className="text-sm font-mono text-muted-foreground break-all">
                                                    {truncate(block.hash, 40)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium mb-1">Previous Hash</div>
                                                <div className="text-sm font-mono text-muted-foreground break-all">
                                                    {truncate(block.previousHash, 40)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium mb-1">Nonce</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {block.nonce}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium mb-1">Timestamp</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatTimestamp(block.timestamp)}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions Section */}
            {expandedBlock && (() => {
                const block = blocks.find((b) => b.hash === expandedBlock);
                if (!block) return null;

                const blockIndex = blocks.findIndex((b) => b.hash === expandedBlock) + 1;

                return (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">
                            Transactions inside block {blockIndex}
                        </h2>
                        {block.transactions.length === 0 ? (
                            <p className="text-muted-foreground">No transactions in this block.</p>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">#</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead className="w-[100px]">Valid?</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {block.transactions.map((tx: ITransaction, txIndex: number) => (
                                            <TableRow key={txIndex}>
                                                <TableCell>{txIndex}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {tx.fromAddress ? truncate(tx.fromAddress, 25) : "System"}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {truncate(tx.toAddress, 25)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {tx.amount}
                                                    {txIndex + 1 === block.transactions.length && <span className="text-xs ml-2 text-muted-foreground">(Block reward)</span>}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {formatTimestamp(tx.timestamp)}
                                                </TableCell>
                                                <TableCell>✓</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};

export default Blocks;
