import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DashboardData } from '../../types';
import { PROJECT_ASSETS } from '../../lib/projectAssets';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  radius: number;
  volume: number;
  color: string;
  logo: string;
}

export default function GravityPoolTab({ data }: { data: DashboardData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, name: string, volume: number } | null>(null);

  // Memoize physics nodes to prevent recalculation on main thread
  const nodes = useMemo(() => {
    if (!data.projects) return [];
    
    // Scale radius based on volume rather than users to avoid bot inflation metrics
    // Using log scale to keep visual balance between whales and smaller projects
    const maxVolume = Math.max(...data.projects.map(p => p.stats30d?.volume || 0));
    const radiusScale = d3.scaleLog().domain([100, maxVolume || 1000]).range([20, 80]).clamp(true);

    return data.projects.map(p => {
      const assetData = PROJECT_ASSETS[p.id] || { color: '#00FF66', logo: '' };
      return {
        id: p.id,
        name: p.name,
        volume: p.stats30d?.volume || 0,
        radius: radiusScale(Math.max(100, p.stats30d?.volume || 0)),
        color: assetData.color,
        logo: assetData.logo,
      };
    });
  }, [data.projects]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = 500;
    
    // Clear previous SVG
    d3.select(containerRef.current).select('svg').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('overflow', 'visible');

    // Add glowing filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "8")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add image patterns
    nodes.forEach(node => {
      if (node.logo) {
        defs.append('pattern')
          .attr('id', `img-${node.id}`)
          .attr('patternContentUnits', 'objectBoundingBox')
          .attr('width', 1)
          .attr('height', 1)
          .append('image')
          .attr('href', node.logo)
          .attr('referrerpolicy', 'no-referrer')
          .attr('preserveAspectRatio', 'xMidYMid slice')
          .attr('width', 1)
          .attr('height', 1);
      }
    });

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 4).iterations(2))
      .alphaDecay(0.01); // Slower decay for floaty feel

    const nodeGroup = svg.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('mouseenter', (event: MouseEvent, d: any) => {
         d3.select(event.currentTarget as Element).select('circle').attr('stroke', '#fff').attr('stroke-width', 2).style("filter", "url(#glow)");
         setTooltip({ x: event.clientX, y: event.clientY, name: d.name, volume: d.volume });
      })
      .on('mousemove', (event: MouseEvent) => {
         setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
      })
      .on('mouseleave', (event: MouseEvent) => {
         d3.select(event.currentTarget as Element).select('circle').attr('stroke', (d: any) => d.color).attr('stroke-width', 2).style("filter", "none");
         setTooltip(null);
      })
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    // Glassmorphic circles or logo
    nodeGroup.append('circle')
      .attr('r', (d: any) => (d as Node).radius)
      .attr('fill', (d: any) => (d as Node).logo ? `url(#img-${(d as Node).id})` : `${(d as Node).color}33`)
      .attr('stroke', (d: any) => (d as Node).color)
      .attr('stroke-width', 2)
      .style('backdrop-filter', 'blur(4px)');

    // Text labels (only if no logo, otherwise it overlaps)
    nodeGroup.append('text')
      .filter((d: any) => !(d as Node).logo)
      .text((d: any) => (d as Node).name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#fff')
      .style('font-size', (d: any) => Math.min(12, (d as Node).radius / 2.5) + 'px')
      .style('font-weight', '500')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      nodeGroup.attr('transform', (d: any) => {
         const r = d.radius + 2; 
         d.x = Math.max(r, Math.min(width - r, d.x));
         d.y = Math.max(r, Math.min(height - r, d.y));
         return `translate(${d.x},${d.y})`;
      });
    });

    return () => {
      simulation.stop();
    };
  }, [nodes]);

  return (
    <div className="bg-abstract-card border border-white/5 rounded-3xl p-6 shadow-2xl relative">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-lg font-medium text-white mb-1">Gravity Pool</h3>
        <p className="text-sm text-zinc-400">Physics-based simulation by Volume (30d). Drag nodes to interact.</p>
      </div>

      <div ref={containerRef} className="w-full h-[500px]" />

      {/* Tooltip */}
      {tooltip && (
        <div 
          className="fixed z-50 pointer-events-none bg-[#0D0D0D]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl transform -translate-x-1/2 -translate-y-full mt-[-15px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-abstract-neon" />
            <span className="font-medium text-white text-sm">{tooltip.name}</span>
          </div>
          <span className="text-xs text-zinc-400 pl-4">${tooltip.volume >= 1e9 ? (tooltip.volume / 1e9).toFixed(2) + 'B' : tooltip.volume >= 1e6 ? (tooltip.volume / 1e6).toFixed(2) + 'M' : tooltip.volume >= 1e3 ? (tooltip.volume / 1e3).toFixed(1) + 'k' : tooltip.volume.toFixed(0)} Volume (30d)</span>
        </div>
      )}
    </div>
  );
}
