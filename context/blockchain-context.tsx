"use client";

import React, {
  createContext,
  FC,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import {
  Blockchain,
  Transaction as BlockchainTransaction,
  IBlock,
  ITransaction,
  IBlockchain,
} from "@/lib/blockchain"; // Adjust the import path as necessary
import { ec as EC } from "elliptic";

// Define the Wallet Key interface
export interface IWalletKey {
  keyObj: EC.KeyPair;
  publicKey: string;
  privateKey: string;
}

// Define the context properties
interface BlockchainContextProps {
  difficulty: number;
  setDifficulty: (value: number) => void;
  miningReward: number;
  setMiningReward: (value: number) => void;
  blockchain: IBlockchain;
  blocks: IBlock[];
  walletKeys: IWalletKey[];
  generateWalletKeys: () => IWalletKey;
  addTransaction: (from: string, to: string, amount: number) => void;
  minePendingTransactions: () => void;
  isAddressFromCurrentUser: (address: string) => boolean;
  pendingTransactions: ITransaction[];
  getBalanceOfAddress: (address: string) => number;
  isChainValid: () => boolean;
}

// Create the context with default values
export const BlockchainContext = createContext<BlockchainContextProps>({
  difficulty: 2,
  setDifficulty: () => { },
  miningReward: 100,
  setMiningReward: () => { },
  blockchain: new Blockchain(),
  blocks: [],
  walletKeys: [],
  generateWalletKeys: () => ({
    keyObj: null as any,
    publicKey: "",
    privateKey: "",
  }),
  addTransaction: () => { },
  minePendingTransactions: () => { },
  isAddressFromCurrentUser: () => false,
  pendingTransactions: [],
  getBalanceOfAddress: () => 0,
  isChainValid: () => false,
});

// Define the provider props
interface BlockchainProviderProps {
  children: ReactNode;
}

// Helper functions for serialization and deserialization
const serializeBlockchain = (blockchain: IBlockchain): string => {
  return JSON.stringify({
    difficulty: blockchain.difficulty,
    miningReward: blockchain.miningReward,
    chain: blockchain.chain.map((block) => ({
      ...block,
      transactions: block.transactions.map((tx) => ({
        ...tx,
        // If there are any nested objects, serialize them appropriately
      })),
    })),
    pendingTransactions: blockchain.pendingTransactions.map((tx) => ({
      ...tx,
      // Serialize nested objects if necessary
    })),
  });
};

const deserializeBlockchain = (data: string, ec: EC): IBlockchain => {
  const parsed = JSON.parse(data);

  const blockchain = new Blockchain();
  blockchain.difficulty = parsed.difficulty;
  blockchain.miningReward = parsed.miningReward;

  // Reconstruct the chain
  blockchain.chain = parsed.chain.map((blockData: any) => {
    const block = blockchain.createBlockFromData(blockData);
    return block;
  });

  // Reconstruct pending transactions
  blockchain.pendingTransactions = parsed.pendingTransactions.map(
    (txData: any) => {
      const tx = blockchain.createTransactionFromData(txData);
      return tx;
    }
  );

  return blockchain;
};

// Create the provider component
export const BlockchainProvider: FC<BlockchainProviderProps> = ({ children }) => {
  const [difficulty, setDifficulty] = useState<number>(2);
  const [miningReward, setMiningReward] = useState<number>(100);
  const [blocks, setBlocks] = useState<IBlock[]>([]);
  const [walletKeys, setWalletKeys] = useState<IWalletKey[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Memoize EC to prevent re-creation on every render
  const ec = useMemo(() => new EC("secp256k1"), []);

  // Initialize Blockchain instance
  const [blockchain, setBlockchain] = useState<IBlockchain>(new Blockchain());

  // Initialize blockchain and wallet on mount
  useEffect(() => {
    // Function to initialize the blockchain
    const initializeBlockchain = () => {
      let initializedBlockchain = new Blockchain();

      // Load blockchain data from localStorage
      const savedBlockchain = localStorage.getItem("blockchain");
      if (savedBlockchain) {
        try {
          initializedBlockchain = deserializeBlockchain(savedBlockchain, ec) as Blockchain;
        } catch (error) {
          console.error("Failed to deserialize blockchain:", error);
          // Optionally, reset to genesis block
          initializedBlockchain = new Blockchain();
        }
      } else {
        // Create genesis block if no saved blockchain exists
        initializedBlockchain.createGenesisBlock();
      }

      // Load settings from localStorage
      const savedDifficulty = localStorage.getItem("difficulty");
      const savedReward = localStorage.getItem("miningReward");

      if (savedDifficulty && !isNaN(Number(savedDifficulty))) {
        setDifficulty(Number(savedDifficulty));
        initializedBlockchain.difficulty = Number(savedDifficulty);
      }

      if (savedReward && !isNaN(Number(savedReward))) {
        setMiningReward(Number(savedReward));
        initializedBlockchain.miningReward = Number(savedReward);
      }

      // Load or generate wallet keys
      const existingKeysJSON = localStorage.getItem("walletKeys");
      let existingKeys: IWalletKey[] = [];

      if (existingKeysJSON) {
        const parsedKeys = JSON.parse(existingKeysJSON) as {
          publicKey: string;
          privateKey: string;
        }[];
        existingKeys = parsedKeys.map((key) => ({
          keyObj: ec.keyFromPrivate(key.privateKey, "hex"),
          publicKey: key.publicKey,
          privateKey: key.privateKey,
        }));
      } else {
        // Generate a new key if none exist
        const key = ec.genKeyPair();
        const newKey: IWalletKey = {
          keyObj: key,
          publicKey: key.getPublic("hex"),
          privateKey: key.getPrivate("hex"),
        };
        existingKeys.push(newKey);
        localStorage.setItem(
          "walletKeys",
          JSON.stringify(
            existingKeys.map((key) => ({
              publicKey: key.publicKey,
              privateKey: key.privateKey,
            }))
          )
        );
      }

      setWalletKeys(existingKeys);
      setBlockchain(initializedBlockchain);
      setBlocks(initializedBlockchain.chain);
      setPendingTransactions(initializedBlockchain.pendingTransactions);
      setLoading(false);
    };

    initializeBlockchain();
  }, [ec]);

  // Persist settings, wallet keys, and blockchain to localStorage
  useEffect(() => {
    if (!loading) {
      // Save settings
      localStorage.setItem("difficulty", difficulty.toString());
      localStorage.setItem("miningReward", miningReward.toString());

      // Save wallet keys
      localStorage.setItem(
        "walletKeys",
        JSON.stringify(
          walletKeys.map((key) => ({
            publicKey: key.publicKey,
            privateKey: key.privateKey,
          }))
        )
      );

      // Save the entire blockchain
      localStorage.setItem("blockchain", serializeBlockchain(blockchain));
    }
  }, [difficulty, miningReward, walletKeys, blockchain, loading]);

  // Sync blockchain state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks([...blockchain.chain]);
      setPendingTransactions([...blockchain.pendingTransactions]);

      // Optionally, re-serialize the blockchain to localStorage here as well
      localStorage.setItem("blockchain", serializeBlockchain(blockchain));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [blockchain]);

  // Action Methods
  const addTransaction = useCallback(
    (from: string, to: string, amount: number): void => {
      const tx = new BlockchainTransaction(from, to, amount);
      // Sign the transaction with the sender's key
      const senderKey = walletKeys.find((key) => key.publicKey === from);
      if (!senderKey) {
        throw new Error("Sender wallet key not found");
      }
      tx.signTransaction(senderKey.keyObj);
      blockchain.addTransaction(tx);
      setPendingTransactions([...blockchain.pendingTransactions]);
      setBlockchain(blockchain); // Trigger re-render
    },
    [walletKeys, blockchain]
  );

  const minePendingTransactions = useCallback((): void => {
    if (walletKeys.length === 0) {
      throw new Error("No wallet keys available for mining.");
    }
    const miningRewardAddress = walletKeys[0].publicKey;
    blockchain.minePendingTransactions(miningRewardAddress);
    setBlocks([...blockchain.chain]);
    setPendingTransactions([...blockchain.pendingTransactions]);
    setBlockchain(blockchain); // Trigger re-render
  }, [walletKeys, blockchain]);

  const generateWalletKeys = useCallback((): IWalletKey => {
    const key = ec.genKeyPair();
    const newKey: IWalletKey = {
      keyObj: key,
      publicKey: key.getPublic("hex"),
      privateKey: key.getPrivate("hex"),
    };
    const updatedKeys = [...walletKeys, newKey];
    setWalletKeys(updatedKeys);
    localStorage.setItem(
      "walletKeys",
      JSON.stringify(
        updatedKeys.map((key) => ({
          publicKey: key.publicKey,
          privateKey: key.privateKey,
        }))
      )
    );
    return newKey;
  }, [walletKeys, ec]);

  const isAddressFromCurrentUser = useCallback(
    (address: string): boolean => {
      return walletKeys.some((key) => key.publicKey === address);
    },
    [walletKeys]
  );

  const getBalanceOfAddress = useCallback(
    (address: string): number => {
      return blockchain.getBalanceOfAddress(address);
    },
    [blockchain]
  );

  const isChainValid = useCallback((): boolean => {
    return blockchain.isChainValid();
  }, [blockchain]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      difficulty,
      setDifficulty,
      miningReward,
      setMiningReward,
      blockchain,
      blocks,
      walletKeys,
      generateWalletKeys,
      addTransaction,
      minePendingTransactions,
      isAddressFromCurrentUser,
      pendingTransactions,
      getBalanceOfAddress,
      isChainValid,
    }),
    [
      difficulty,
      setDifficulty,
      miningReward,
      setMiningReward,
      blockchain,
      blocks,
      walletKeys,
      generateWalletKeys,
      addTransaction,
      minePendingTransactions,
      isAddressFromCurrentUser,
      pendingTransactions,
      getBalanceOfAddress,
      isChainValid,
    ]
  );

  if (loading) {
    // Optionally, render a loading indicator here
    return '';
  }

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};