import React, { useMemo } from 'react';
import { DashboardData } from '../../types';
import ProjectCard from '../ProjectCard';

export default function SpotlightTab({ data }: { data: DashboardData }) {
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
