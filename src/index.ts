import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { Block } from "./entity/Block";
import { Transaction } from "./entity/Transaction";
import { startIndexer } from "./indexer";
import { startBitcoinIndexer } from "./bitcoin-indexer";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
const PORT = 3000;
const RPC_URL = process.env.RPC_URL || "https://rpc.ankr.com/eth";
const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || "";
const BITCOIN_API_KEY = process.env.BITCOIN_API_KEY || "";

app.use(express.json());

// ETH Routes
app.get("/eth/blocks", async (req, res) => {
    try {
        const blocks = await AppDataSource.getRepository(Block).find({
            where: { chain: 'eth' },
            order: { number: "DESC" },
            take: 20,
            relations: ["transactions"]
        });
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching blocks" });
    }
});

app.get("/eth/blocks/:identifier", async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let block;
        
        if (identifier.startsWith('0x')) {
            block = await AppDataSource.getRepository(Block).findOne({
                where: { chain: 'eth', hash: identifier },
                relations: ["transactions"]
            });
        } else {
            block = await AppDataSource.getRepository(Block).findOne({
                where: { chain: 'eth', number: parseInt(identifier) },
                relations: ["transactions"]
            });
        }
        
        if (block) res.json(block);
        else res.status(404).json({ error: "Block not found" });
    } catch (error) {
        res.status(500).json({ error: "Error fetching block" });
    }
});

app.get("/eth/transactions", async (req, res) => {
    try {
        const transactions = await AppDataSource.getRepository(Transaction).find({
            where: { chain: 'eth' },
            order: { createdAt: "DESC" },
            take: 20
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

app.get("/eth/transactions/:hash", async (req, res) => {
    try {
        const transaction = await AppDataSource.getRepository(Transaction).findOne({
            where: { chain: 'eth', hash: req.params.hash }
        });
        if (transaction) res.json(transaction);
        else res.status(404).json({ error: "Transaction not found" });
    } catch (error) {
        res.status(500).json({ error: "Error fetching transaction" });
    }
});

app.get("/eth/address/:address/transactions", async (req, res) => {
    try {
        const address = req.params.address;
        const transactions = await AppDataSource.getRepository(Transaction).find({
            where: [
                { chain: 'eth', from: address },
                { chain: 'eth', to: address }
            ],
            order: { blockNumber: "DESC" },
            take: 50
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching address transactions" });
    }
});

app.get("/eth/balance/:address", async (req, res) => {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL, 1);
        const balance = await provider.getBalance(req.params.address);
        res.json({ balance: balance.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching balance" });
    }
});

// BTC Routes
app.get("/btc/blocks", async (req, res) => {
    try {
        const blocks = await AppDataSource.getRepository(Block).find({
            where: { chain: 'btc' },
            order: { number: "DESC" },
            take: 20,
            relations: ["transactions"]
        });
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ error: "Error fetching blocks" });
    }
});

app.get("/btc/blocks/:identifier", async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let block;
        
        if (isNaN(Number(identifier))) {
            block = await AppDataSource.getRepository(Block).findOne({
                where: { chain: 'btc', hash: identifier },
                relations: ["transactions"]
            });
        } else {
            block = await AppDataSource.getRepository(Block).findOne({
                where: { chain: 'btc', number: parseInt(identifier) },
                relations: ["transactions"]
            });
        }
        
        if (block) res.json(block);
        else res.status(404).json({ error: "Block not found" });
    } catch (error) {
        res.status(500).json({ error: "Error fetching block" });
    }
});

app.get("/btc/transactions", async (req, res) => {
    try {
        const transactions = await AppDataSource.getRepository(Transaction).find({
            where: { chain: 'btc' },
            order: { createdAt: "DESC" },
            take: 20
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

app.get("/btc/transactions/:hash", async (req, res) => {
    try {
        const transaction = await AppDataSource.getRepository(Transaction).findOne({
            where: { chain: 'btc', hash: req.params.hash }
        });
        if (transaction) res.json(transaction);
        else res.status(404).json({ error: "Transaction not found" });
    } catch (error) {
        res.status(500).json({ error: "Error fetching transaction" });
    }
});

app.get("/btc/address/:address/transactions", async (req, res) => {
    try {
        const address = req.params.address;
        const transactions = await AppDataSource.getRepository(Transaction).find({
            where: [
                { chain: 'btc', from: address },
                { chain: 'btc', to: address }
            ],
            order: { blockNumber: "DESC" },
            take: 50
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching address transactions" });
    }
});

// Start server
app.get("/btc/balance/:address", async (req, res) => {
    try {
        const address = req.params.address;
        const response = await axios.get(`${BITCOIN_RPC_URL}/address/${address}?apikey=${BITCOIN_API_KEY}&details=basic`);
        // Blockbook returns balance in satoshis as string or number
        const balanceSat = response.data.balance || "0";
        res.json({ balance: balanceSat });
    } catch (error: any) {
        console.error("Error fetching BTC balance:", error.message);
        res.status(500).json({ error: "Error fetching balance" });
    }
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Initialize DB
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("Database connected.");
    }
    
    // Start both indexers in the background
    startIndexer().catch(err => console.error("ETH Indexer failed to start:", err));
    startBitcoinIndexer().catch(err => console.error("BTC Indexer failed to start:", err));
});
