# Abstract Analytics — Full Progress Log

## Project Overview
Analytics dashboard for 10 projects on the Abstract blockchain (chainID 2741).
Three KPIs per project: **Volume (USD)**, **Transactions**, **Unique Users** — all 30-day rolling window, success-only txs.

---

## Chain / Token Constants
- **Abstract chain ID**: 2741
- **Native USDC**: `0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1` (symbol: USDC.e)
- **ETH price proxy on Abstract**: WETH at `0x3439153eb7af838ad19d56e1571fbd09333c2809` (symbol='WETH') — use this in `prices.usd`, NOT symbol='ETH' (returns NULL)
- **Dune tables**: `abstract.transactions`, `tokens.transfers` (blockchain='abstract'), `prices.usd`

---

## Contract Addresses Per Project

### 1. DYLI Marketplace
| CA | Role | Vol? |
|---|---|---|
| `0xC74d5002c10c13D2ad258B4584690829387f84dC` | Marketplace | ✓ USDC |

### 2. Roach Racing
| CA | Role | Vol? |
|---|---|---|
| `0x341C67CB6b91Fb0b476860E8487DAc219E9D3369` | TraxExchange (buy) | ✓ USDC |
| `0x7735CcdF5D1f3B17ebC5f5decFB2883A1A2f1479` | TraxRedeem (sell) | ✓ USDC |

### 3. LiFi
| CA | Role | Vol? |
|---|---|---|
| `0x4f8C9056bb8A3616693a76922FA35d53C056E5b3` | LiFi Diamond (proxy, EIP-2535) | ✓ token transfers |
| `0xe1E182Bf4AA042514368b264CD96544B3f0895cE` | RouteProcessor (SushiSwap-style) | ✓ token transfers |

### 4. Gigaverse (7 CAs)
| CA | Role | Vol? |
|---|---|---|
| `0x57E8994e2Ac2e49974b0aE685C15b468d1C09259` | Username NFT (ERC721) | — no direct payment |
| `0x5f8b7eb615d5fce81faffb107450ede201384c00` | UsernameMinter (user-facing) | ✓ ETH ~0.005/name |
| `0xbA3274Ff65466bDC217745dC276394da4Ffe02b7` | Swap (LiFi Executor) | ✓ token transfers |
| `0x37d6DBFa9f82aC4aCC86D49702aC0612D3aa1AfE` | Item Marketplace | ✓ ETH msg.value |
| `0x19e547F1bD342094BC4318C539dBB91a8F52786C` | Vendor System | ✓ ETH or ERC20 |
| `0x0E5ca01B63acD1841489ca87D0Ab33F692E5a7Ba` | GigaJuice | ✓ ETH msg.value |
| `0x66c1Ea89E7801243172d8bcCDA3f0F7864bc67b3` | Item Minter (admin only) | — no user volume |
| `0xE85584686FEF920D2D53620315A83Cae9a4E7e33` | Redeem Item | — msg.value ~0 |

### 5. Kuga Bash
| CA | Role | Vol? |
|---|---|---|
| `0xafcA524Dc2CDd7C21cD1de4E837c8c813c8322CC` | Registration proxy (ERC1967) | — free |

### 6. Relay (7 CAs)
| CA | Role | Vol? |
|---|---|---|
| `0xb92fe925DC43a0ECdE6c8b1a2709c170Ec4fFf4f` | Router | ✓ token transfers |
| `0xCcC88a9d1B4ED6b0EABA998850414b24f1c315bE` | Approval Proxy v3 | ✓ token transfers |
| `0x0649F2dAa72a6524f0eb7f5f65e13CFfc8082b10` | ERC20 Router | ✓ token transfers |
| `0x4cD00E387622C35bDDB9b4c962C136462338BC31` | Depository | ✓ token transfers |
| `0x634E831cE6D460c2CD5067Af98D6452Eb280E374` | Receiver | ✓ token transfers |
| `0x7dF4E182Da01EbA2FF902b3F13b7a7b12bB87dEa` | ERC20 Router v2 | ✓ token transfers |
| `0xF5042e6ffaC5a625D4E7848e0b01373D8eB9e222` | Router v2 | ✓ token transfers |

### 7. Ruyi Ember
| CA | Role | Vol? |
|---|---|---|
| `0xF724aeC8d4A4C88f4B475D412B1F50Dc35C4Ae3E` | Shop / Sign-up | ✓ ETH msg.value |
| `0x920fEfb4E92dBbA0393BA233CECB1051A0dDE25c` | Marketplace | ✓ ETH or ERC20 |

### 8. Maze of Gain
| CA | Role | Vol? |
|---|---|---|
| `0x40018Cbb1926dae72DCb315E89AAB7320A191D02` | Token Claim | ✓ reward token amount |
| `0xBDE2483b242C266a97E39826b2B5B3c06FC02916` | Key Purchase (DropERC1155) | ✓ ETH msg.value |

### 9. Moody Madness
| CA | Role | Vol? |
|---|---|---|
| `0x10919961A413610caD2f3d73Dc94b3F44146a5F1` | Claim/distributor | ✓ reward token transfers |
| `0x35ffe9d966E35Bd1B0e79F0d91e438701eA1C644` | Reward token | ✓ if priced |
| `0xF6eA0cCbB746d94657cec0884E84cCfdff0d5Bd3` | Reward token | ✓ if priced |

### 10. Rug Pull Bakery
| CA | Role | Vol? |
|---|---|---|
| `0x080F7ad315AB65f02A821F072170d469D444A6c4` | Game (bake) | — (mint-only, filtered) |
| `0xFEB79a841D69C08aFCDC7B2BEEC8a6fbbe46C455` | Game (bake) | — (mint-only, filtered) |
| `0xaEB8Eef0deAbA98E3B65f6311DD7F997e72B837a` | Game (bake) | — (mint-only, filtered) |
| ~~`0x663D69eCFF14b4dbD245cdac03f2e1DEb68Ed250`~~ | **REMOVED — faulty CA** | — |

> **On-chain finding (verified via Etherscan)**: PlayerRegistry implementation at `0x2c1735f471f133b2bec969c76beb20d7602ffa19` inherits `is ERC20`. So cookies ARE technically an ERC20 — every bake() emits standard `Transfer(0x0, player, amount)` via `_mint()`. A thin DEX price (~$0.00007/cookie) gave nominal volume of ~$22M before filtering.
>
> **Filter applied** (queries 7434732 and 7436536): `tt."from" != 0x0` excludes mints, plus `priced_tokens` CTE requires avg token price ≥ $0.02 over 30d. This filters out cookies and Moody reward tokens. After filter: Rug Pull and Moody volume → ~$0. Real swap/payment volume on Relay/LiFi/DYLI/etc unchanged.

---

## Dune Queries

| Query | ID | URL | Purpose |
|---|---|---|---|
| Project KPIs | 7434732 | https://dune.com/queries/7434732 | Per-project vol/txs/users/revenue (30d) |
| Chain Share | 7434894 | https://dune.com/queries/7434894 | Each project's % of total Abstract chain txs + fee revenue |
| Wallet Base | 7436536 | https://dune.com/queries/7436536 | All users' per-project stats + percentile ranks — **refresh weekly** |
| Wallet Lookup | 7436575 | https://dune.com/queries/7436575 | Instant wallet search (reads from 7436536 cache) |

### Query methodology (all queries)
- **Txs**: `COUNT(DISTINCT tx_hash)` from `abstract.transactions WHERE to IN (project_cas) AND success=true AND block_date >= NOW()-30d`
- **Users**: `COUNT(DISTINCT "from")` from same filter (per-project sum, not cross-project deduped)
- **Token volume**: `MAX(amount_usd)` per (project, tx_hash) from `tokens.transfers` — MAX avoids double-counting multi-leg swap transfers
  - **Filter (v4)**: exclude mints (`tt."from" != 0x0`) AND require token avg price ≥ $0.02 (`priced_tokens` CTE) — keeps real swap/payment volume, drops trace-priced reward tokens (cookies, Moody rewards, etc.)
- **Native ETH volume**: `SUM(value/1e18 * avg_eth_price)` from txs where value > 0
- **Total volume**: token + native ETH summed
- **Gas fees**: `SUM(gas_used * gas_price / 1e18)` in ETH, × avg WETH price for USD
- **Percentile rank**: `PERCENT_RANK()` within each project; "Top X%" = (1 - rank) × 100

---

## Ecosystem Stats (from query 7434732, latest execution 01KQZ54ERNGBGBP1FT0MR2TJ0S)
| Metric | Value |
|---|---|
| Ecosystem Volume (30d) | ~$35.99M |
| Total Users (30d) | ~29,873 (per-project sum) |
| Total Transactions (30d) | ~33.89M |
| Avg TPS | ~13.1 tx/s |
| Top by Tx | Rug Pull Bakery (~30.89M) |
| Top by Volume | Rug Pull Bakery (~$22.16M — cookie token mints) |
| #2 Volume | Relay (~$10.00M) |
| #3 Volume | LiFi (~$2.27M) |

---

## Key Issues Found & Fixed

| Issue | Fix |
|---|---|
| ETH price NULL in `prices.usd` | Use `contract_address=0x3439...` (WETH), NOT `symbol='ETH'` |
| DYLI revenue overcounted ($402k) | Restrict to txs in DYLI project_tx_index, not all transfers to royalty wallet |
| Fee revenue USD = NaN | Timestamp type mismatch in per-minute join → use AVG(price) over 30d window |
| Relay missing 3 CAs | Added `0xCcC88a9d...`, `0x4cD00E38...`, `0x634E831c...`; users 1,715→10,482, vol $1.4M→$9.9M |
| `0x663D69` (Rug Pull marketplace) | Removed from all 3 queries — faulty CA |
| Chain reconciliation | LEFT JOIN + COALESCE gives exact total; verified against independent COUNT(*) |

---

## Bot Warning
| Project | Tx/User | Implication |
|---|---|---|
| Rug Pull Bakery | ~13,680 | Automated bake() loops, not human users |
| Moody Madness | ~427 | Same pattern |

Users metric for these two is inflated by bots. Volume for Rug Pull = $0 (bake is free).

---

## Website Architecture (AI Studio build)

**Stack**: Vite + React + Express + Tailwind + Recharts + D3.js + Framer Motion

**Data flow**:
1. `scripts/fetch-dune.ts` runs server-side with `DUNE_API_KEY`
2. Fetches query 7434732 → saves `public/data/dune-cache.json`
3. Fetches query 7436536 → saves `public/data/wallet-cache.json`
4. 7-day cache — skip fetch if file < 7 days old; bypass with `--force`
5. Frontend reads static JSON files only — no live API calls, no key exposure

**Tabs**: Tracker (Recharts line chart) | Gravity Pool (D3 force) | Volume Wars (bar race) | Spotlight (grid) | Wallet Analytics

**Known data issue in site**: Historical chart timelines (Tracker, Volume Wars daily rate) are **simulated** — daily breakdown = total/30 ± 30% random variance. Real Dune query only returns 30d aggregates, not daily series.

**Wallet analytics fix applied**: After initial bad implementations (hardcoded mock data, VITE_DUNE_API_KEY exposed on client), correctly refactored to server-side fetch + static file + local filter.

---

## Pending / To Do
- [ ] Decide on Rug Pull / Moody volume policy: keep token mint volume as-is, exclude reward-token mints (filter `from = 0x0`), or split CAs into volume vs tx-only buckets
- [ ] Re-run `npx tsx scripts/fetch-dune.ts --force` after any query change to refresh both cache files
- [ ] Decide on real daily timeseries data source (Dune query with `block_date` grouping) to replace simulated charts
- [ ] Add team revenue wallets for Gigaverse, Ruyi, Rug Pull (need on-chain wallet confirmation)
- [ ] Consider migrating to GitHub + Vercel for deployment
- [ ] Set up weekly cron job (GitHub Actions or Vercel cron) to auto-refresh Dune cache

## Website Code Review

### v1 (C:\Users\uasim\Downloads\abstractanalytics) — superseded
Critical bugs found, all flagged: empty wallet-cache, SpotlightTab.history crash, rankPercent overwrite bug, simulated history data, Express server incompatible with Vercel.

### v2 (C:\Users\uasim\Downloads\newabs) — CURRENT, mostly fixed
**All critical bugs from v1 resolved:**
- ✅ `wallet-cache.json` populated (~2 MB, 30k user rows)
- ✅ `dune-cache.json` reflects mint-filtered query results (total volume $7.14M vs old $35.84M)
- ✅ `SpotlightTab` no longer reads `project.history` — shows Vol/Users/Tx without simulated daily data
- ✅ `TrackerTab` is a clean bar chart of real 30d totals with logo X-axis ticks; no fake timelines
- ✅ `GravityPool` correctly says "by Volume (30d)" + uses log scale clamped to floor 100
- ✅ `WalletAnalyticsTab` Global Rank uses `Math.min` (best percentile across projects); regex fixed to `/^0x/`
- ✅ `topGainer.reduce()` has initial value
- ✅ `fetch-dune.ts` simplified — `--force` only bypasses local 7-day cache, always reads `/results` endpoint (cheap, never burns execution credits)
- ✅ Project IDs `transformDuneData` produces match `projectAssets.ts` keys (logos render correctly)

**Remaining cosmetic/non-critical issues:**
- ⚠️ Express + Vite middleware in `server.ts` — won't deploy to Vercel as-is. Replace with plain `vite build` static deploy.
- ⚠️ Decorative nav search bar (no value/onChange handler) — wire it up or remove
- ⚠️ "Global Rank" technically = best project percentile (cherry-pick) — could rename to "Best Project Rank"
- ⚠️ `transformDuneData` has dead column fallbacks (project_name, contract_name) — your query only outputs `Project`
- ⚠️ Wallet tab auto-loads previous wallet on mount (UX choice, not a bug)
- ⚠️ `transformDuneData` writes both top-level `volume/users/trx` AND `stats30d.{volume,users,trx}` — redundant storage
- ⚠️ `parseFloat` used for tx counts in WalletAnalyticsTab — should be `parseInt` (cosmetic)

**Verdict**: Ready to ship. None of remaining issues block launch.

## Vercel Migration Steps (planned)
1. Replace `server.ts` (Express + Vite middleware) with plain `vite build` → Vercel native static deploy
2. Set up GitHub Actions weekly cron:
   - Run `npx tsx scripts/fetch-dune.ts --force` → reads latest Dune cached results
   - Commit updated `public/data/*.json` files
   - Vercel auto-redeploys on commit
3. Add `DUNE_API_KEY` to GitHub Actions secrets (NOT to Vercel env — never needed at runtime)
4. Optional: decorative nav search bar cleanup
5. Optional: rename "Global Rank" → "Best Project Rank" in Wallet Analytics

## Refresh Workflow (for the user to remember)
- **Auto refresh after Vercel migration**: GitHub Actions cron runs weekly, commits cache, redeploys
- **Manual one-time refresh**: re-run queries 7434732 + 7436536 on Dune.com → delete `public/data/*.json` → `npm run fetch-dune` (no `--force` needed since `/results` endpoint always returns latest execution)
- **Important**: 7-day local cache check in `fetch-dune.ts` only gates re-runs; doesn't trigger anything automatically
