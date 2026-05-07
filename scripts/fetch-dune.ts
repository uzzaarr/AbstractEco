import fs from "fs";
import path from "path";
import 'dotenv/config';

const DUNE_API_KEY = process.env.DUNE_API_KEY;

const PUBLIC_DIR = path.join(process.cwd(), "public", "data");
const ECOSYSTEM_OUT_FILE = path.join(PUBLIC_DIR, "dune-cache.json");
const WALLET_OUT_FILE = path.join(PUBLIC_DIR, "wallet-cache.json");

const force = process.argv.includes('--force');

async function checkAndFetchQuery(queryId: number, outFile: string, transformFn?: (rows: any[]) => any) {
  if (fs.existsSync(outFile)) {
    const stats = fs.statSync(outFile);
    const now = new Date().getTime();
    const ageInMs = now - stats.mtimeMs;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (!force && ageInMs < sevenDaysInMs) {
      console.log(`[Dune Fetcher] Cache for query ${queryId} is less than 7 days old (${Math.round(ageInMs / 1000 / 60 / 60)} hours). Skipping live API execution.`);
      return;
    }
  }

  console.log(`[Dune Fetcher] Fetching results for query ${queryId}...`);
  try {
    let fetchUrl = `https://api.dune.com/api/v1/query/${queryId}/results?limit=100000`;
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'x-dune-api-key': DUNE_API_KEY! }
    });

    if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.result?.rows || [];
    console.log(`[Dune Fetcher] Received ${rows.length} rows for query ${queryId}.`);
    
    const finalData = transformFn ? transformFn(rows) : rows;

    fs.writeFileSync(outFile, JSON.stringify(finalData, null, 2));
    console.log(`[Dune Fetcher] Data successfully formatted and cached statically at ${outFile}`);

  } catch (err: any) {
    if (fs.existsSync(outFile)) {
      const now = new Date();
      fs.utimesSync(outFile, now, now);
      console.warn(`[Dune Fetcher] WARN: fetch failed for query ${queryId}: ${err.message}. Keeping existing cache and backing off 7 days.`);
      return;
    }
    console.error(`[Dune Fetcher] FATAL: fetch failed for query ${queryId} and no prior cache exists:`, err.message);
    process.exit(1);
  }
}

async function main() {
  if (!DUNE_API_KEY) {
    console.error("Missing DUNE_API_KEY in environment variables. Define it in .env");
    process.exit(1);
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  await checkAndFetchQuery(7434732, ECOSYSTEM_OUT_FILE, transformDuneData);
  await checkAndFetchQuery(7436536, WALLET_OUT_FILE); // Save raw rows for wallet analytics
}

function transformDuneData(rows: any[]) {
    let totalVolume = 0;
    let totalUsers = 0;
    let totalTrx = 0;

    const projects = rows.map((row) => {
      const projName = row.Project || row.project || row.project_name || row.contract_name || "Unknown Project";
        const volume = parseFloat(row['Volume USD (30d)'] || 0);
        const users = parseInt(row['Unique Users (30d)'] || 0);
        const trx = parseInt(row['Transactions (30d)'] || 0);

        totalVolume += volume;
        totalUsers += users;
        totalTrx += trx;
        
        return {
            id: projName.toLowerCase().replace(/\s+/g, '-'),
            name: projName,
            stats30d: { volume, users, trx },
            volume,
            users,
            trx
        }
    });

    return {
        globalData: {
            totalVolume30d: totalVolume,
            totalUsers30d: totalUsers,
            totalTrx30d: totalTrx
        },
        projects,
        updatedAt: new Date().toISOString()
    };
}

main();
