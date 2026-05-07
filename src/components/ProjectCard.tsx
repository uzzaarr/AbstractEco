import React from 'react';
import { ProjectData } from '../types';
import { PROJECT_ASSETS } from '../lib/projectAssets';

interface ProjectCardProps {
  key?: React.Key;
  project: ProjectData;
  rank?: number;
  glow?: boolean;
  label?: string;
}

function formatVolume(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

export default function ProjectCard({ project, rank, glow = false, label }: ProjectCardProps) {
  const assetData = PROJECT_ASSETS[project.id] || { color: '#00FF66', logo: '' };
  const projectColor = assetData.color;
  const subline = label ?? (rank !== undefined ? `Rank #${rank}` : '');

  return (
    <div
      className={`bg-abstract-card border rounded-2xl p-5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden flex flex-col justify-between min-h-[140px] ${
        glow
          ? 'border-abstract-neon/30 shadow-[0_0_30px_rgba(0,255,102,0.08)]'
          : 'border-white/5'
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-[50px] pointer-events-none rounded-full transition-opacity ${
          glow ? 'opacity-40 group-hover:opacity-60' : 'opacity-20 group-hover:opacity-40'
        }`}
        style={{ backgroundColor: projectColor }}
      />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-white shadow-inner overflow-hidden shrink-0">
            {assetData.logo ? (
              <img
                src={assetData.logo}
                alt={project.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              project.name.charAt(0)
            )}
          </div>
          <div>
            <h4 className="font-semibold text-white truncate max-w-[140px]" title={project.name}>
              {project.name}
            </h4>
            {subline && <p className="text-xs text-zinc-500 font-mono mt-0.5">{subline}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 relative z-10">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">30d Vol</p>
          <p className="font-medium text-white text-sm">{formatVolume(project.stats30d?.volume || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">30d Users</p>
          <p className="font-medium text-white text-sm">{(project.stats30d?.users || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">30d Tx</p>
          <p className="font-medium text-white text-sm">{(project.stats30d?.trx || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
