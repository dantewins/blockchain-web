"use client";

import { useContext } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BlockchainContext } from "@/context/blockchain-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const PendingTransactions: React.FC = () => {
    const { pendingTransactions, minePendingTransactions } = useContext(BlockchainContext);

    const truncate = (str: string, maxLength: number) => {
        return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
    };

    const handleMine = async () => {
        try {
            await minePendingTransactions();
            toast("Success", {
                description: "Successfully mined your pending transactions",
                action: {
                    label: "Understood",
                    onClick: () => console.log("close"),
                },
            });
        } catch {
            toast("Operation failed", {
                description: "Failed to mine transactions, please try again",
                action: {
                    label: "Understood",
                    onClick: () => console.log("close"),
                },
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <Link href="/transaction" passHref>
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions
                    </Button>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Pending Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingTransactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No pending transactions.</p>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingTransactions.map((tx, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-mono text-sm">{tx.fromAddress ? <Link href={"/wallet/" + tx.fromAddress} className="text-blue-600 underline">{truncate(tx.fromAddress, 25)}</Link> : "N/A"}</TableCell>
                                                <TableCell className="font-mono text-sm">{tx.toAddress ? <Link href={"/wallet/" + tx.fromAddress} className="text-blue-600 underline">{truncate(tx.toAddress, 25)}</Link> : "N/A"}</TableCell>
                                                <TableCell className="font-mono text-sm">{tx.amount}</TableCell>
                                                <TableCell className="font-mono text-sm">{new Date(tx.timestamp).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-6 w-full">
                                    <Button onClick={handleMine} className="w-full">
                                        Mine Transactions
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PendingTransactions;