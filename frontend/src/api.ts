import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export interface Block {
    chain?: string;
    number: number;
    hash: string;
    parentHash: string;
    timestamp: string;
    transactions?: Transaction[];
}

export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    chain: 'eth' | 'btc';
    createdAt?: string;
}
