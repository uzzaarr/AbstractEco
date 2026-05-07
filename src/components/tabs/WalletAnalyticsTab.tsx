import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Wallet, Activity, Zap, Droplet, ArrowRight, TrendingUp, Trophy, Clock, Fingerprint } from 'lucide-react';
import { DashboardData } from '../../types';
import { PROJECT_ASSETS } from '../../lib/projectAssets';

export default function WalletAnalyticsTab({ data }: { data: DashboardData }) {
  const [address, setAddress] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [error, setError] = useState('');

  // Auto-load if there's a cached address we recently searched
  useEffect(() => {
    const lastSearched = localStorage.getItem('last_searched_wallet');
    if (lastSearched) {
      setAddress(lastSearched);
      loadWalletData(lastSearched, false);
    }
  }, []);

  const loadWalletData = async (targetAddress: string, simulateFetch = true) => {
    if (!targetAddress || targetAddress.length < 10) {
      setError('Please enter a valid wallet address');
      return;
    }
    setError('');

    const cacheKey = `wallet_analysis_${targetAddress.toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData && simulateFetch) {
      try {
        const parsedData = JSON.parse(cachedData);
        // Check if data is less than 7 days old
        const isFresh = (Date.now() - parsedData.timestamp) < 7 * 24 * 60 * 60 * 1000;
        if (isFresh) {
           setWalletData(parsedData.data);
           localStorage.setItem('last_searched_wallet', targetAddress);
           return;
        }
      } catch (e) {
        // Fallback to fetch if parse fails
      }
    }

    setAnalyzing(true);
    setWalletData(null);

    try {
      const res = await fetch('/data/wallet-cache.json');
      if (!res.ok) {
        throw new Error("Unable to fetch ecosystem data. Data cache may not be generated yet.");
      }
      
      const duneRows: any[] = await res.json();

      const targetStr = targetAddress.toLowerCase().replace(/^0x/, '');
      const walletRows = duneRows.filter(r => {
        // Robust address matching: search all values in the row
        return Object.values(r).some(val => {
          if (!val) return false;
          const strVal = String(val).toLowerCase().replace(/^0x/, '');
          return strVal === targetStr;
        });
      });

      if (walletRows.length === 0) {
         throw new Error("Wallet not found in ecosystem data");
      }

      let totalVolume = 0;
      let totalTrx = 0;
      let totalGas = 0;
      let bestPercentile = Infinity;
      const projectMap: Record<string, any> = {};

      walletRows.forEach(r => {
        const keys = Object.keys(r);
        const getVal = (possibleKeys: string[]): any => {
          // Exact match first
          for (const k of possibleKeys) {
             const foundKey = keys.find(key => key.toLowerCase() === k);
             if (foundKey && r[foundKey] !== null && r[foundKey] !== undefined) return r[foundKey];
          }
          // Partial match fallback
          for (const k of possibleKeys) {
             const foundKey = keys.find(key => key.toLowerCase().includes(k));
             if (foundKey && r[foundKey] !== null && r[foundKey] !== undefined) return r[foundKey];
          }
          return null;
        };

        const projName = String(getVal(['project', 'app', 'protocol', 'name', 'dapp', 'to', 'contract']) || 'Unknown');
        const pTrx = parseFloat(getVal(['txs', 'transactions', 'trx', 'tx_count', 'interactions', 'count'])) || 0;
        const pVol = parseFloat(getVal(['volume_usd', 'usd_volume', 'vol_usd', 'volume', 'vol', 'usd'])) || 0;
        // Prioritize USD gas over ETH gas
        const pGas = parseFloat(getVal(['fees_usd', 'gas_usd', 'fee_usd', 'gas_spent_usd', 'gas_fee_usd', 'gas_fees', 'fees', 'fee', 'gas_fee', 'gas', 'gas_spent', 'spent'])) || 0;
        
        const pRankPct = getVal(['top_pct_vol', 'top_pct_tx', 'top_pct_gas', 'percentile', 'rank_percent', 'top_percent', 'percent']);
        
        if (pRankPct !== null && pRankPct !== undefined) {
           let num = parseFloat(pRankPct);
           if (!isNaN(num)) {
             bestPercentile = Math.min(bestPercentile, num);
           }
        }

        const pid = projName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (!projectMap[pid]) {
          projectMap[pid] = { id: pid, title: projName, trx: 0, volume: 0, gas: 0 };
        }
        projectMap[pid].trx += pTrx;
        // Depending on Dune query, sometimes volume is null or missing, only add if valid number
        if (!isNaN(pVol)) projectMap[pid].volume += pVol;
        if (!isNaN(pGas)) projectMap[pid].gas += pGas;

        totalTrx += pTrx;
        if (!isNaN(pVol)) totalVolume += pVol;
        if (!isNaN(pGas)) totalGas += pGas;
      });

      let rankPercent = 'N/A';
      if (bestPercentile !== Infinity) {
        rankPercent = `Top ${bestPercentile.toFixed(1)}%`;
      }

      const parsedWalletData = {
        rankPercent,
        totalVolume,
        totalTrx,
        totalGas,
        projects: Object.values(projectMap).sort((a: any, b: any) => b.volume - a.volume)
      };

      setWalletData(parsedWalletData);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: parsedWalletData }));
      } catch(e) {}
      localStorage.setItem('last_searched_wallet', targetAddress);

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadWalletData(address, true);
  };

  return (
    <div className="flex flex-col gap-8 text-white relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
           <h2 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2 text-white">
             <Fingerprint className="w-6 h-6 text-[#00FF66]" /> 
             On-Chain Identity
           </h2>
           <div className="flex items-center gap-2">
             <p className="text-sm text-zinc-400">Deep dive into wallet activity across the Abstract ecosystem.</p>
             <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
               <Clock className="w-3 h-3" />
               30D Snapshot
             </div>
           </div>
         </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative z-10 w-full max-w-2xl mx-auto flex gap-3">
         <div className="relative flex-1">
           <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
           <input 
             type="text" 
             value={address}
             onChange={(e) => setAddress(e.target.value)}
             placeholder="Enter EVM Address (0x...)" 
             className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF66]/50 focus:bg-white/5 transition-all text-sm font-mono placeholder:font-sans"
           />
         </div>
         <button 
           type="submit" 
           disabled={analyzing}
           className="bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
         >
           {analyzing ? (
             <>
               <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
               Analyzing...
             </>
           ) : (
             <>
               Analyze
               <ArrowRight className="w-4 h-4" />
             </>
           )}
         </button>
      </form>
      
      {error && (
        <div className="text-center text-red-400 text-sm bg-red-400/10 border border-red-400/20 py-3 px-4 rounded-xl max-w-2xl mx-auto w-full">{error}</div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {walletData && !analyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
             {/* Top Global Metrics */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricBox title="Global Rank" value={walletData.rankPercent && walletData.rankPercent !== 'N/A' ? walletData.rankPercent : 'N/A'} icon={<Trophy className="w-5 h-5 text-yellow-400" />} />
                <MetricBox title="Ecosystem Volume" value={`$${walletData.totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}`} icon={<Activity className="w-5 h-5 text-blue-400" />} />
                <MetricBox title="Total Transactions" value={walletData.totalTrx.toLocaleString()} icon={<TrendingUp className="w-5 h-5 text-purple-400" />} />
                <MetricBox title="Gas/Fees Spent" value={`$${walletData.totalGas.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}`} icon={<Droplet className="w-5 h-5 text-zinc-400" />} />
             </div>

             {/* Project Breakdown Breakdown */}
             <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden mt-4">
               <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                   <Zap className="w-5 h-5 text-[#00FF66]" />
                   Ecosystem Footprint
                 </h3>
                 <span className="text-xs text-zinc-500 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                   Data sourced from Dune
                 </span>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="text-xs text-zinc-500 font-medium border-b border-white/5">
                       <th className="py-4 px-6">Project</th>
                       <th className="py-4 px-6 text-right">Transactions</th>
                       <th className="py-4 px-6 text-right">Volume</th>
                       <th className="py-4 px-6 text-right">Gas/Fees ($)</th>
                       <th className="py-4 px-6 text-center">Activity Status</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {walletData.projects.map((proj: any) => {
                       const assetData = PROJECT_ASSETS[proj.id] || { logo: '', color: '#fff' };
                       return (
                         <tr key={proj.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                           <td className="py-4 px-6">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10 flex items-center justify-center">
                                 {assetData.logo ? (
                                   <img src={assetData.logo} alt={proj.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                 ) : (
                                   <span className="text-xs opacity-50">{proj.title.charAt(0)}</span>
                                 )}
                               </div>
                               <span className="font-medium group-hover:text-white text-zinc-300 transition-colors">{proj.title}</span>
                             </div>
                           </td>
                           <td className="py-4 px-6 text-right font-mono text-zinc-300">{proj.trx}</td>
                           <td className="py-4 px-6 text-right font-mono text-zinc-300">
                             ${proj.volume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                           </td>
                           <td className="py-4 px-6 text-right font-mono text-zinc-400">
                             ${proj.gas.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                           </td>
                           <td className="py-4 px-6 text-center">
                             <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                               proj.trx > 50 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                               proj.trx > 10 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                               proj.trx > 0 ? 'bg-white/5 text-zinc-400 border border-white/10' :
                               'bg-zinc-900 text-zinc-600 border border-white/5'
                             }`}>
                               {proj.trx > 50 ? 'Whale' : proj.trx > 10 ? 'Active' : proj.trx > 0 ? 'Casual' : 'Inactive'}
                             </span>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBox({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between text-zinc-400">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}



