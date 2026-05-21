import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Database,
  Search,
  Wallet,
} from 'lucide-react';
import { VolumeTrackerData } from '../../types';

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const DISCORD_INVITE_URL = 'https://discord.gg/UtR5EDfK';

const TIER_ASSETS = {
  explorer: new URL('../../../roleslogos/explorer.webp', import.meta.url).href,
  builder: new URL('../../../roleslogos/builder.webp', import.meta.url).href,
  quant: new URL('../../../roleslogos/quant.webp', import.meta.url).href,
};

type VolumeTier = {
  name: string;
  threshold: string;
  image: string;
  accent: string;
};

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0.00';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}k`;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value: string): string {
  if (!value) return 'N/A';
  const normalized = value.replace(' UTC', 'Z');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getVolumeTier(volume: number): VolumeTier | null {
  if (volume > 10000) {
    return {
      name: 'Quant',
      threshold: '> $10k 90d volume',
      image: TIER_ASSETS.quant,
      accent: '#A78BFA',
    };
  }

  if (volume > 5000) {
    return {
      name: 'Builder',
      threshold: '> $5k 90d volume',
      image: TIER_ASSETS.builder,
      accent: '#38BDF8',
    };
  }

  if (volume > 1000) {
    return {
      name: 'Explorer',
      threshold: '> $1k 90d volume',
      image: TIER_ASSETS.explorer,
      accent: '#00FF66',
    };
  }

  return null;
}

export default function VolumeTrackerTab() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<VolumeTrackerData[] | null>(null);
  const [result, setResult] = useState<VolumeTrackerData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const lastSearched = localStorage.getItem('last_volume_tracker_wallet');
    if (lastSearched) {
      setAddress(lastSearched);
    }
  }, []);

  const cacheUpdatedAt = useMemo(() => {
    if (!cache?.length) return '';
    return cache[0]?.updated_at || '';
  }, [cache]);

  const loadCache = async () => {
    if (cache) return cache;

    const res = await fetch('/data/volume-tracker-cache.json');
    if (!res.ok) {
      throw new Error('Volume tracker cache is not available yet.');
    }

    const rows: VolumeTrackerData[] = await res.json();
    setCache(rows);
    return rows;
  };

  const analyzeAddress = async (targetAddress: string) => {
    if (!ADDRESS_RE.test(targetAddress.trim())) {
      setError('Please enter a valid EVM address.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const rows = await loadCache();
      if (rows.length === 0) {
        throw new Error('Volume tracker cache is empty. Refresh Dune data to populate it.');
      }

      const normalized = targetAddress.trim().toLowerCase();
      const match = rows.find((row) => row.user_address?.toLowerCase() === normalized) || null;

      if (!match) {
        setError('No detected 90-day swap volume for this address in the current cache.');
        localStorage.setItem('last_volume_tracker_wallet', targetAddress.trim());
        return;
      }

      setResult(match);
      localStorage.setItem('last_volume_tracker_wallet', targetAddress.trim());
    } catch (err: any) {
      setError(err.message || 'Unable to load volume tracker data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    analyzeAddress(address);
  };

  const tier = result ? getVolumeTier(result.estimated_volume_usd) : null;

  return (
    <div className="flex flex-col gap-8 text-white relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2 text-white">
            <BarChart3 className="w-6 h-6 text-[#00FF66]" />
            Volume Tracker
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-zinc-400">Estimated Abstract swap volume from Dune's weekly cached data.</p>
            <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <CalendarClock className="w-3 h-3" />
              90D Snapshot
            </div>
            {cacheUpdatedAt && (
              <span className="text-[11px] text-zinc-500">
                Updated {formatDateTime(cacheUpdatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-2xl mx-auto flex gap-3">
        <div className="relative flex-1">
          <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter EVM Address (0x...)"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00FF66]/50 focus:bg-white/5 transition-all text-sm font-mono placeholder:font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Loading...
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
        <div className="text-center text-red-400 text-sm bg-red-400/10 border border-red-400/20 py-3 px-4 rounded-xl max-w-2xl mx-auto w-full">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {result && !loading && (
          <motion.div
            key={result.user_address}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Wallet</p>
                <p className="font-mono text-sm text-zinc-300">{shortAddress(result.user_address)}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Database className="w-4 h-4 text-[#00FF66]" />
                Dune query 7550279, refreshed weekly
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <MetricBox
                title="Estimated 90d Swap Volume"
                value={formatUsd(result.estimated_volume_usd)}
                icon={<Activity className="w-5 h-5 text-[#00FF66]" />}
              />
              <MetricBox
                title="Swap Transactions"
                value={result.swap_transactions.toLocaleString()}
                icon={<Search className="w-5 h-5 text-blue-400" />}
              />
              <MetricBox
                title="DEX Confirmed"
                value={formatUsd(result.dex_confirmed_volume_usd)}
                subtitle={`${result.dex_confirmed_tx_count.toLocaleString()} tx`}
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              />
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 overflow-hidden relative">
              {tier && (
                <div
                  className="absolute -top-16 -right-16 w-52 h-52 blur-[70px] rounded-full opacity-20 pointer-events-none"
                  style={{ backgroundColor: tier.accent }}
                />
              )}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0"
                    style={tier ? { borderColor: `${tier.accent}55`, backgroundColor: `${tier.accent}12` } : undefined}
                  >
                    {tier ? (
                      <img src={tier.image} alt={tier.name} className="w-full h-full object-cover" />
                    ) : (
                      <BarChart3 className="w-9 h-9 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Eligible Role</p>
                    <h3 className="text-2xl font-bold text-white">{tier ? tier.name : 'No tier yet'}</h3>
                    <p className="text-sm text-zinc-400">
                      {tier ? tier.threshold : 'Reach more than $1k estimated 90d swap volume to unlock Explorer.'}
                    </p>
                  </div>
                </div>
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  Apply
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBox({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-white/10 transition-colors min-h-[140px]">
      <div className="flex items-center justify-between text-zinc-400">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <span className="text-2xl font-bold tracking-tight text-white break-words">
        {value}
      </span>
      {subtitle && <span className="text-xs text-zinc-500">{subtitle}</span>}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
