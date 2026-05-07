import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardData } from '../../types';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { PROJECT_ASSETS } from '../../lib/projectAssets';

export default function SpotlightTab({ data }: { data: DashboardData }) {
  
  // Sort projects by total volume to rank them
  const rankedProjects = useMemo(() => {
    return [...data.projects].sort((a, b) => {
      const aVol = a.stats30d?.volume || 0;
      const bVol = b.stats30d?.volume || 0;
      return bVol - aVol;
    });
  }, [data.projects]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rankedProjects.map((project, index) => (
         <ProjectCard key={project.id} project={project} rank={index + 1} />
      ))}
    </div>
  );
}

function ProjectCard({ project, rank }: { key?: React.Key, project: any, rank: number }) {
  const assetData = PROJECT_ASSETS[project.id] || { color: '#00FF66', logo: '' };
  const projectColor = assetData.color;

  return (
    <div className="bg-abstract-card border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
       {/* Background subtle glow based on project color */}
       <div 
         className="absolute top-0 right-0 w-32 h-32 blur-[50px] pointer-events-none rounded-full opacity-20 transition-opacity group-hover:opacity-40" 
         style={{ backgroundColor: projectColor }}
       />

       <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3 relative z-10">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-white shadow-inner overflow-hidden shrink-0">
                {assetData.logo ? (
                  <img src={assetData.logo} alt={project.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  project.name.charAt(0)
                )}
             </div>
             <div>
               <h4 className="font-semibold text-white truncate max-w-[140px]" title={project.name}>{project.name}</h4>
               <p className="text-xs text-zinc-500 font-mono mt-0.5">Rank #{rank}</p>
             </div>
          </div>
       </div>

        <div className="grid grid-cols-3 gap-2 relative z-10">
          <div>
             <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">30d Vol</p>
             <p className="font-medium text-white text-sm">
               {project.stats30d?.volume >= 1e9 ? `$${(project.stats30d.volume / 1e9).toFixed(1)}B` : 
                project.stats30d?.volume >= 1e6 ? `$${(project.stats30d.volume / 1e6).toFixed(1)}M` : 
                project.stats30d?.volume >= 1e3 ? `$${(project.stats30d.volume / 1000).toFixed(1)}k` : 
                `$${(project.stats30d?.volume || 0).toFixed(0)}`}
             </p>
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
