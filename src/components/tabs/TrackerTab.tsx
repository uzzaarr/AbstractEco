import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Dot } from 'recharts';
import { DashboardData } from '../../types';
import { PROJECT_ASSETS } from '../../lib/projectAssets';

const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  const entry = props.chartData.find((d: any) => d.name === payload.value);
  if (!entry) return <text x={x} y={y} fill="#71717a" fontSize={11} textAnchor="middle" dy={16}>{payload.value}</text>;

  const assetData = PROJECT_ASSETS[entry.id];
  
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`clip-${entry.id}`}>
          <circle cx="0" cy="20" r="10" />
        </clipPath>
      </defs>
      {assetData?.logo ? (
        <image
          href={assetData.logo}
          x="-10"
          y="10"
          width="20"
          height="20"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#clip-${entry.id})`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <circle cx="0" cy="20" r="10" fill={assetData?.color || '#333'} />
      )}
      <text
        x="0"
        y="45"
        fill="#71717a"
        fontSize={10}
        textAnchor="middle"
        className="font-medium"
      >
        {payload.value.length > 10 ? payload.value.substring(0, 8) + '...' : payload.value}
      </text>
    </g>
  );
};

export default function TrackerTab({ data }: { data: DashboardData }) {
  const [metric, setMetric] = useState<'volume' | 'trx'>('volume');
  
  // Transform data for recharts. Relay is excluded from the volume view only —
  // it dwarfs every other project and crushes the y-axis so the rest is unreadable.
  const chartData = useMemo(() => {
    if (!data.projects || data.projects.length === 0) return [];

    const projects = metric === 'volume'
      ? data.projects.filter(p => p.id !== 'relay')
      : data.projects;

    return projects.map(p => ({
      name: p.name,
      id: p.id,
      volume: p.stats30d.volume,
      trx: p.stats30d.trx
    })).sort((a, b) => b[metric] - a[metric]);
  }, [data.projects, metric]);

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    data.projects.forEach((p) => {
      map[p.id] = PROJECT_ASSETS[p.id]?.color || '#ffffff';
    });
    return map;
  }, [data.projects]);

  return (
    <div className="bg-abstract-card border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-abstract-neon/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex gap-2 p-1 bg-white/[0.02] rounded-lg border border-white/5 w-fit">
          <button 
            onClick={() => setMetric('volume')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${metric === 'volume' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Volume (USD)
          </button>
          <button
            onClick={() => setMetric('trx')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${metric === 'trx' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Transactions
          </button>
        </div>
        {metric === 'volume' && (
          <span className="text-[11px] text-zinc-500">Relay excluded for readability — see Spotlight for full ranking.</span>
        )}
      </div>

      <div className="h-[400px] w-full relative z-10 overflow-x-auto overflow-y-hidden">
        <div className="h-full min-w-[720px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.2)" 
              tick={<CustomTick chartData={chartData} />}
              tickMargin={12}
              axisLine={false}
              tickLine={false}
              height={80}
              interval={0}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)"
              tick={{fill: '#71717a', fontSize: 11}}
              tickFormatter={(val) => {
                if (metric === 'volume') {
                  if (val >= 1e9) return `$${(val/1e9).toFixed(1)}B`;
                  if (val >= 1e6) return `$${(val/1e6).toFixed(1)}M`;
                  if (val >= 1e3) return `$${(val/1000).toFixed(0)}k`;
                  return `$${val}`;
                }
                if (val >= 1e6) return `${(val/1e6).toFixed(1)}M`;
                if (val >= 1e3) return `${(val/1e3).toFixed(0)}k`;
                return val;
              }}
              tickMargin={12}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const entry = payload[0].payload;
                  const assetData = PROJECT_ASSETS[entry.id] || { logo: '', color: colorMap[entry.id] };
                  const value = metric === 'volume' 
                    ? (entry[metric] >= 1e9 ? `$${(entry[metric] / 1e9).toFixed(2)}B` : entry[metric] >= 1e6 ? `$${(entry[metric] / 1e6).toFixed(2)}M` : entry[metric] >= 1e3 ? `$${(entry[metric] / 1000).toFixed(1)}k` : `$${entry[metric].toFixed(2)}`)
                    : entry[metric].toLocaleString();
                  
                  return (
                    <div className="bg-[#1A1A1A]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-white/5 shrink-0 flex items-center justify-center border border-white/10">
                          {assetData.logo ? (
                            <img src={assetData.logo} alt={entry.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: colorMap[entry.id]}}></div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-zinc-300">{entry.name}</span>
                        <span className="text-sm font-bold ml-auto pl-4 drop-shadow-md" style={{color: colorMap[entry.id]}}>{value}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorMap[entry.id]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
