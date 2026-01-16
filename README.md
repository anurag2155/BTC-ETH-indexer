# Multi-Chain Blockchain Indexer

A full-stack blockchain indexer supporting both Ethereum and Bitcoin networks with real-time block and transaction tracking.

## Features

- **Multi-Chain Support**: Index both Ethereum and Bitcoin blockchains
- **Real-Time Indexing**: Automatic detection and indexing of new blocks
- **Web Interface**: Beautiful React frontend with chain switching
- **REST API**: Query blocks, transactions, and addresses
- **Docker Support**: Easy deployment with Docker Compose

## Architecture

- **Backend**: Node.js + TypeScript + Express + TypeORM
- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Database**: PostgreSQL
- **Blockchain APIs**: 
  - Ethereum: JSON-RPC
  - Bitcoin: Blockbook API

## Quick Start with Docker

1. **Clone and configure**:
   ```bash
   cp .env.example .env
   # Edit .env with your RPC URLs and API keys
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Development Setup

### Backend
```bash
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
Ensure PostgreSQL is running on port 5433 with credentials from `.env`

## API Endpoints

### Ethereum
- `GET /eth/blocks` - Latest 20 blocks
- `GET /eth/blocks/:identifier` - Block by number or hash
- `GET /eth/transactions/:hash` - Transaction details
- `GET /eth/address/:address/transactions` - Address transactions
- `GET /eth/balance/:address` - Current ETH balance

### Bitcoin
- `GET /btc/blocks` - Latest 20 blocks
- `GET /btc/blocks/:identifier` - Block by number or hash
- `GET /btc/transactions/:hash` - Transaction details
- `GET /btc/address/:address/transactions` - Address transactions

## Environment Variables

```env
# Database
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Ethereum
RPC_URL=https://eth.llamarpc.com

# Bitcoin
BITCOIN_RPC_URL=https://your-bitcoin-node/api/v2
BITCOIN_API_KEY=your-api-key
```

## License

MIT
