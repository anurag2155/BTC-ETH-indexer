import { AppDataSource } from "./data-source";
import { Block } from "./entity/Block";
import { Transaction } from "./entity/Transaction";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || "";
const BITCOIN_API_KEY = process.env.BITCOIN_API_KEY || "";

let lastProcessedBlock = 0;

async function indexBitcoinBlock(blockHeight: number) {
    try {
        console.log(`Fetching Bitcoin block ${blockHeight}...`);
        
        // Fetch block data from Bitcoin API
        const blockResponse = await axios.get(`${BITCOIN_RPC_URL}/block/${blockHeight}?apikey=${BITCOIN_API_KEY}`);
        const blockData = blockResponse.data;
        
        // Save block
        const blockRepo = AppDataSource.getRepository(Block);
        const block = blockRepo.create({
            chain: 'btc',
            number: blockHeight,
            hash: blockData.hash,
            parentHash: blockData.previousBlockHash || '0x0',
            timestamp: blockData.time.toString()
        });
        await blockRepo.save(block);

        // Save transactions
        const txRepo = AppDataSource.getRepository(Transaction);
        if (blockData.txs && blockData.txs.length > 0) {
            for (const tx of blockData.txs.slice(0, 100)) { // Limit to 100 txs per block
                const transaction = txRepo.create({
                    chain: 'btc',
                    hash: tx.txid,
                    from: tx.vin[0]?.addresses?.[0] || 'coinbase',
                    to: tx.vout[0]?.addresses?.[0] || '',
                    value: (tx.vout[0]?.value || '0').toString(),
                    blockNumber: blockHeight,
                    blockChain: 'btc'
                });
                await txRepo.save(transaction);
            }
        }

        console.log(`Bitcoin block ${blockHeight} and ${blockData.txs?.length || 0} transactions indexed.`);
    } catch (error: any) {
        console.error(`Error indexing Bitcoin block ${blockHeight}:`, error.message);
    }
}

export async function startBitcoinIndexer() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("Database connected (Bitcoin).");
    }

    try {
        // Get current block height
        const statusResponse = await axios.get(`${BITCOIN_RPC_URL}?apikey=${BITCOIN_API_KEY}`);
        const currentHeight = statusResponse.data.blockbook.bestHeight;
        console.log(`Current Bitcoin block height: ${currentHeight}`);

        // Start from a recent block (last 20 blocks)
        lastProcessedBlock = currentHeight - 19;

        // Index last 20 blocks
        for (let i = lastProcessedBlock; i <= currentHeight; i++) {
            await indexBitcoinBlock(i);
        }

        // Poll for new blocks every 30 seconds (Bitcoin is slower than ETH)
        setInterval(async () => {
            try {
                const statusResponse = await axios.get(`${BITCOIN_RPC_URL}?apikey=${BITCOIN_API_KEY}`);
                const latestHeight = statusResponse.data.blockbook.bestHeight;

                if (latestHeight > lastProcessedBlock) {
                    for (let i = lastProcessedBlock + 1; i <= latestHeight; i++) {
                        await indexBitcoinBlock(i);
                    }
                    lastProcessedBlock = latestHeight;
                }
            } catch (error: any) {
                console.error("Error checking for new Bitcoin blocks:", error.message);
            }
        }, 30000);

        console.log("Bitcoin indexer started. Listening for new blocks...");
    } catch (error: any) {
        console.error("Error starting Bitcoin indexer:", error.message);
        console.log("Retrying in 10 seconds...");
        setTimeout(() => startBitcoinIndexer(), 10000);
    }
}
