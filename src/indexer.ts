import { ethers } from "ethers";
import { AppDataSource } from "./data-source";
import { Block } from "./entity/Block";
import { Transaction } from "./entity/Transaction";

const RPC_URL = process.env.RPC_URL || "https://rpc.ankr.com/eth";

async function indexBlock(blockNumber: number, provider: ethers.JsonRpcProvider) {
    console.log(`Fetching block ${blockNumber}...`);
    try {
        const blockData = await provider.getBlock(blockNumber, true);

        if (!blockData) {
            console.log(`Block ${blockNumber} not found.`);
            return;
        }

        const block = new Block();
        block.chain = 'eth';
        block.number = blockData.number;
        block.hash = blockData.hash || ""; 
        block.parentHash = blockData.parentHash;
        block.timestamp = blockData.timestamp.toString();
        
        await AppDataSource.manager.save(block);
        
        const transactions: Transaction[] = [];
        
        if (blockData.prefetchedTransactions && blockData.prefetchedTransactions.length > 0) {
             for (const txData of blockData.prefetchedTransactions) {
                const tx = new Transaction();
                tx.chain = 'eth';
                tx.hash = txData.hash;
                tx.from = txData.from;
                tx.to = txData.to || ""; 
                tx.value = txData.value.toString();
                tx.block = block;
                tx.blockNumber = block.number;
                tx.blockChain = 'eth';
                transactions.push(tx);
             }
             await AppDataSource.manager.save(transactions);
        }

        console.log(`Block ${blockNumber} and ${transactions.length} transactions indexed.`);

    } catch (error) {
        console.error(`Error indexing block ${blockNumber}:`, error);
    }
}

export async function startIndexer() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("Database connected.");
    }

    // Use static network config to skip auto-detection
    const provider = new ethers.JsonRpcProvider(RPC_URL, 1);
    
    try {
        const currentBlock = await provider.getBlockNumber();
        console.log(`Current block number: ${currentBlock}`);
        await indexBlock(currentBlock, provider);
        
        provider.on("block", async (blockNumber) => {
            console.log(`New block mined: ${blockNumber}`);
            await indexBlock(blockNumber, provider);
        });

        console.log("Indexer started. Listening for new blocks...");
    } catch (error) {
        console.error("Error starting indexer:", error);
        console.log("Retrying in 5 seconds...");
        setTimeout(() => startIndexer(), 5000);
    }
}

// Allow running standalone
if (require.main === module) {
    startIndexer().catch(console.error);
}
