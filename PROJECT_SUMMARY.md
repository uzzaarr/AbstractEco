# Project Summary: Ecosystem & Wallet Analytics Dashboard

## Architecture Overview
This is a decoupled Full-Stack Web Application built with a **React (Vite)** frontend and a **Node.js script-based data fetcher** for the backend. The application relies on Dune Analytics for blockchain data.

**Key Architectural Decision:** 
Data fetching is decoupled from the live frontend. Instead of the React app making live API calls to Dune (which could expose API keys and exhaust query quotas quickly), a Node.js script (`scripts/fetch-dune.ts`) securely queries Dune using a server-side `DUNE_API_KEY`, and outputs static JSON files to the `public/data/` directory. The React frontend then reads these static JSON files. This results in high performance, top-tier security for API keys, and low operational costs.

## Backend (Data Fetching Script)
- **Language / Runtime:** TypeScript / Node.js
- **Location:** `scripts/fetch-dune.ts` 
- **Command:** `npx tsx scripts/fetch-dune.ts` (can be forced with `--force`)
- **How it works:** 
  1. Reads `DUNE_API_KEY` from `.env`.
  2. Queries Dune for Ecosystem Data (Query ID `7434732`) and caches it to `public/data/dune-cache.json`.
  3. Queries Dune for Wallet Analytics Data (Query ID `7436536`) and caches it to `public/data/wallet-cache.json`.
  4. Includes a 7-day TTL check so it won't re-run the queries if the cache is recent (unless forced), saving Dune credits.

## Frontend (React SPA)
- **Framework:** React 19 + Vite
- **Language:** TypeScript (`.tsx`)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React (`lucide-react`)
- **Data Visualization:** Recharts, D3
- **Entry Points:** `src/main.tsx`, `src/App.tsx`
- **Data Consumption:** Components use `fetch('/data/...json')` to pull the statically generated JSON feeds.

### Key Components & Tabs (`src/components/tabs/`)
1. **TrackerTab (`TrackerTab.tsx`):** Ecosystem overview displaying aggregate volumes, users, and transactions.
2. **GravityPoolTab (`GravityPoolTab.tsx`):** Displays statistics related to specific ecosystem pools.
3. **VolumeWarsTab (`VolumeWarsTab.tsx`):** Compares ecosystem projects against each other by transaction count, unique users, and volume using Recharts.
4. **SpotlightTab (`SpotlightTab.tsx`):** Detailed spotlight on specific metrics or projects.
5. **WalletAnalyticsTab (`WalletAnalyticsTab.tsx`):** A tool allowing users to enter a specific EVM wallet address to see their historic on-chain snapshot (total volume, transactions, gas/fees spent, global rank) matched perfectly with the Dune cached JSON (`public/data/wallet-cache.json`).

## Security & Environment Variables
- `DUNE_API_KEY` must be set in the `.env` file (see `.env.example`).
- **Critical Security Note:** `VITE_DUNE_API_KEY` shouldn't be loaded into the client. The frontend has been hardened so it reads only from local cached files.
- No live user input directly touches a backend database or third-party paid API interactively.

## Static Assets
- `public/*.jpg` / `public/*.png`: Custom logos for the ecosystems such as Rug Pull Bakery (`rugpullb.png`), Maze of Gains (`maze.png`), Relay (`relay.jpg`), LiFi (`lifi.jpg`) to provide branded UI elements.
