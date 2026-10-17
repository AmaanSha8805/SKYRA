'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CareerRoadmapResponse } from '@/types/career-roadmap';

interface CareerRoadmapPhase {
  phase_number: number;
  title: string;
  duration: string;
  goals: string[];
  skills_to_learn: string[];
  milestones: string[];
}

interface CareerRoadmapTreeProps {
  roadmapData: CareerRoadmapResponse;
}

interface NodeData {
  name: string;
  type: 'root' | 'phase' | 'skill';
  phase?: CareerRoadmapPhase;
  children?: NodeData[];
}

export default function CareerRoadmapTree({ roadmapData }: CareerRoadmapTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roadmapData || !svgRef.current || !containerRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 600;

    // Transform data into hierarchical structure
    const rootData: NodeData = {
      name: roadmapData.target_role,
      type: 'root',
      children: roadmapData.phases.map((phase) => ({
        name: phase.title,
        type: 'phase',
        phase: phase,
        children: phase.skills_to_learn.map((skill) => ({
          name: skill,
          type: 'skill',
        })),
      })),
    };

    // Create hierarchy
    const root: any = d3.hierarchy(rootData);
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse all children initially except first level
    if (root.children) {
      root.children.forEach((child: any) => {
        if (child.children) {
          child._children = child.children;
          child.children = null;
        }
      });
    }

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .style('font', '14px sans-serif');

    // Create group for zoom/pan
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create tree layout
    const treeLayout = d3.tree<any>().nodeSize([70, 200]);

    // Define gradients
    const defs = svg.append('defs');

    // Pink to purple gradient for root
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'rootGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#E91E8C');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#8B5CF6');

    // Update function
    const update = (source: any) => {
      const treeData = treeLayout(root);

      const nodes = treeData.descendants();
      const links = treeData.links();

      // Normalize for fixed-depth
      nodes.forEach((d: any) => {
        d.y = d.depth * 200;
      });

      // Get nodes
      const node = g.selectAll<SVGGElement, any>('g.node').data(nodes, (d: any) => d.id || (d.id = ++i));

      // Enter new nodes
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d: any) => `translate(${source.y0},${source.x0})`)
        .on('click', (event: any, d: any) => click(event, d));

      // Add circles for nodes
      nodeEnter
        .append('circle')
        .attr('r', (d: any) => {
          if (d.data.type === 'root') return 50;
          if (d.data.type === 'phase') return 55;
          return 35;
        })
        .attr('fill', (d: any) => {
          if (d.data.type === 'root') return 'url(#rootGradient)';
          if (d.data.type === 'phase') return 'rgba(139,92,246,0.8)';
          return 'rgba(233,30,140,0.6)';
        })
        .attr('stroke', (d: any) => {
          if (d.data.type === 'root') return '#E91E8C';
          if (d.data.type === 'phase') return '#8B5CF6';
          return '#E91E8C';
        })
        .attr('stroke-width', (d: any) => (d.data.type === 'root' ? 3 : 2))
        .style('cursor', 'pointer')
        .on('mouseover', function (event: any, d: any) {
          d3.select(this).attr('stroke-width', 4);
          showTooltip(event, d);
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke-width', (d: any) => (d.data.type === 'root' ? 3 : 2));
          hideTooltip();
        });

      // Add labels with text wrapping
      nodeEnter
        .append('text')
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-weight', (d: any) => (d.data.type === 'root' ? 'bold' : 'normal'))
        .style('font-size', (d: any) => {
          if (d.data.type === 'root') return '14px';
          if (d.data.type === 'phase') return '10px';
          return '9px';
        })
        .style('pointer-events', 'none')
        .each(function (this: SVGTextElement, d: any) {
          const text = d3.select(this);
          const nodeRadius = d.data.type === 'root' ? 50 : (d.data.type === 'phase' ? 55 : 35);
          const maxCharsPerLine = d.data.type === 'root' ? 20 : (d.data.type === 'phase' ? 18 : 12);
          const maxLines = 2;
          
          const words = d.data.name.split(' ');
          let lines: string[] = [];
          let currentLine = '';
          
          words.forEach((word: string) => {
            if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
              currentLine = (currentLine + ' ' + word).trim();
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          });
          if (currentLine) lines.push(currentLine);
          
          // Limit to maxLines
          if (lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            // Add ellipsis to last line if truncated
            if (lines[maxLines - 1].length > maxCharsPerLine - 3) {
              lines[maxLines - 1] = lines[maxLines - 1].substring(0, maxCharsPerLine - 3) + '...';
            }
          }
          
          // Create tspans
          const lineHeight = d.data.type === 'root' ? 16 : (d.data.type === 'phase' ? 12 : 11);
          const startY = -((lines.length - 1) * lineHeight) / 2 + (d.data.type === 'root' ? 5 : 4);
          
          lines.forEach((line: string, i: number) => {
            text.append('tspan')
              .attr('x', 0)
              .attr('dy', i === 0 ? startY : lineHeight)
              .text(line);
          });
        });

      // Transition nodes to their new position
      const nodeUpdate = node
        .merge(nodeEnter)
        .transition()
        .duration(500)
        .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

      // Update circles
      nodeUpdate
        .select('circle')
        .attr('r', (d: any) => {
          if (d.data.type === 'root') return 50;
          if (d.data.type === 'phase') return 55;
          return 35;
        })
        .attr('fill', (d: any) => {
          if (d.data.type === 'root') return 'url(#rootGradient)';
          if (d.data.type === 'phase') return 'rgba(139,92,246,0.8)';
          return 'rgba(233,30,140,0.6)';
        });

      // Update labels
      nodeUpdate.select('text').style('fill-opacity', 1);

      // Remove exiting nodes
      const nodeExit = node
        .exit()
        .transition()
        .duration(500)
        .attr('transform', (d: any) => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select('circle').attr('r', 1e-6);
      nodeExit.select('text').style('fill-opacity', 1e-6);

      // Get links
      const link = g.selectAll<SVGPathElement, any>('path.link').data(links, (d: any) => d.target.id);

      // Enter new links
      const linkEnter = link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', (d: any) => {
          const o = { x: source.x0 || 0, y: source.y0 || 0 };
          return diagonal(o, d.target);
        })
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,0.15)')
        .attr('stroke-width', 2);

      // Transition links to their new position
      link
        .merge(linkEnter)
        .transition()
        .duration(500)
        .attr('d', (d: any) => diagonal(d.source, d.target));

      // Remove exiting links
      link
        .exit()
        .transition()
        .duration(500)
        .attr('d', (d: any) => {
          const o = { x: source.x || 0, y: source.y || 0 };
          return diagonal(o, d.source);
        })
        .remove();

      // Store old positions for transition
      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    // Diagonal path generator
    const diagonal = (d: { x: number; y: number }, s: { x: number; y: number }) => {
      return `M ${d.y} ${d.x} C ${(d.y + s.y) / 2} ${d.x}, ${(d.y + s.y) / 2} ${s.x}, ${s.y} ${s.x}`;
    };

    // Click handler
    const click = (event: any, d: any) => {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    };

    // Tooltip functions
    const showTooltip = (event: any, d: any) => {
      if (d.data.type !== 'phase') return;

      const phase = d.data.phase;
      if (!phase) return;

      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(8, 8, 24, 0.95)')
        .style('border', '1px solid rgba(139, 92, 246, 0.5)')
        .style('border-radius', '8px')
        .style('padding', '12px')
        .style('color', 'white')
        .style('font-size', '12px')
        .style('max-width', '300px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)');

      tooltip
        .html(`
          <div style="font-weight: bold; margin-bottom: 8px; color: #E91E8C;">${phase.title}</div>
          <div style="margin-bottom: 8px;"><strong>Duration:</strong> ${phase.duration}</div>
          <div style="margin-bottom: 8px;">
            <strong>Goals:</strong>
            <ul style="margin: 4px 0; padding-left: 16px;">
              ${phase.goals.map((goal: string) => `<li>${goal}</li>`).join('')}
            </ul>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Skills:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
              ${phase.skills_to_learn.map((skill: string) => `<span style="background: rgba(139, 92, 246, 0.3); padding: 2px 6px; border-radius: 4px; font-size: 10px;">${skill}</span>`).join('')}
            </div>
          </div>
          <div>
            <strong>Milestones:</strong>
            <ul style="margin: 4px 0; padding-left: 16px;">
              ${phase.milestones.map((milestone: string) => `<li>${milestone}</li>`).join('')}
            </ul>
          </div>
        `)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 10 + 'px');
    };

    const hideTooltip = () => {
      d3.selectAll('.tooltip').remove();
    };

    let i = 0;
    update(root);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !svgRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      d3.select(svgRef.current).attr('width', newWidth).attr('viewBox', [-newWidth / 2, -height / 2, newWidth, height]);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      d3.selectAll('.tooltip').remove();
    };
  }, [roadmapData]);

  return (
    <div ref={containerRef} style={{ width: '100%', minHeight: '600px', backgroundColor: '#080818', borderRadius: '12px', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '600px' }}></svg>
    </div>
  );
}
