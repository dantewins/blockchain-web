"use client";

import { useState, useContext, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlockchainContext, IWalletKey } from "@/context/blockchain-context";
import { toast } from 'sonner';

const Transaction: React.FC = () => {
    const { walletKeys, addTransaction } = useContext(BlockchainContext);

    const currentUser: IWalletKey | undefined = walletKeys[0];

    const [toAddress, setToAddress] = useState<string>("");
    const [amount, setAmount] = useState<string>('0');

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!currentUser) {
                toast("Operation failed", {
                    description: "No wallet available, please generate a wallet first",
                    action: {
                        label: "Understood",
                        onClick: () => console.log("close"),
                    },
                });
                return;
            }

            if (!toAddress.trim()) {
                toast("Operation failed", {
                    description: "Please provide a recipient address",
                    action: {
                        label: "Understood",
                        onClick: () => console.log("close"),
                    },
                });
                return;
            }

            if (Number(amount) <= 0 || !/^\d+(\.\d{1,2})?$/.test(amount)) {
                toast("Operation failed", {
                    description: "Please enter a valid dollar amount",
                    action: {
                        label: "Understood",
                        onClick: () => console.log("close"),
                    },
                });
                return;
            }

            addTransaction(currentUser.publicKey, toAddress.trim(), Number(amount));

            toast("Success", {
                description: "Successfully added your transaction to pending transactions",
                action: {
                    label: "Understood",
                    onClick: () => console.log("close"),
                },
            });

            setToAddress("");
            setAmount('0');
        } catch (error: any) {
            console.log(error)
            toast('Operation failed.', {
                description: "An unexpected error occurred",
                action: {
                    label: "Understood",
                    onClick: () => console.log("close"),
                },
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center w-full mb-4">
                    <Link href="/" passHref>
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                    <Link href="/pending-transactions" passHref>
                        <Button variant="ghost">
                            Pending transactions <ArrowRight className="mr-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Transaction</CardTitle>
                        <CardDescription>
                            Transfer some money to someone!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="fromAddress">From Address</Label>
                                <Input
                                    id="fromAddress"
                                    value={currentUser ? currentUser.publicKey : "No Wallet Available"}
                                    readOnly
                                    className="font-mono text-sm bg-muted"
                                />
                                <p className="text-sm text-muted-foreground">
                                    This is your wallet address. You cannot change it because you can only spend your own coins.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="toAddress">To Address</Label>
                                <Input
                                    id="toAddress"
                                    value={toAddress}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setToAddress(e.target.value)}
                                    placeholder="Enter recipient's address"
                                    className="font-mono text-sm"
                                />
                                <p className="text-sm text-muted-foreground">
                                    The address of the wallet where you want to send the money to. You can type random text here (if you are not interested in recovering the funds)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                                    placeholder="Enter amount"

                                    step={0.01}
                                />
                                <p className="text-sm text-muted-foreground">
                                    You can transfer any amount. Account balance is not checked in this demo. Have at it!
                                </p>
                            </div>

                            <Button type="submit" className="w-full">
                                Sign & Create Transaction
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Transaction;
