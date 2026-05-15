import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Spinner } from "../components/ui/Spinner";
import { getPlatformMeta, type ContentType } from "../utlis/contentTypeDetection";
import { PlatformIcon } from "../utlis/PlatformIcon";
import { ShareIcon } from "@heroicons/react/24/outline";
import { cn } from "../utlis/cn";

interface RawNode {
  id: string;
  title: string;
  type: string;
  link: string;
  connectionCount: number;
}

interface RawLink {
  source: string;
  target: string;
  sharedTags: string[];
  weight: number;
}

interface GraphData {
  nodes: RawNode[];
  links: RawLink[];
  topTags: { name: string; count: number }[];
  stats: { totalNodes: number; totalLinks: number; isolatedNodes: number };
}

// Physics node with mutable position / velocity
interface SimNode extends RawNode {
  [x: string]: any;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number; // pinned x
  fy?: number; // pinned y
}

interface SimLink {
  source: SimNode;
  target: SimNode;
  sharedTags: string[];
  weight: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const REPULSION      = 4500;
const SPRING_LENGTH  = 120;
const SPRING_STRENGTH = 0.06;
const GRAVITY        = 0.03;
const DAMPING        = 0.82;
const NODE_BASE_R    = 8;
const MAX_NODES_SHOWN = 150;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nodeRadius(n: SimNode) {
  return NODE_BASE_R + Math.min(n.connectionCount * 2, 14);
}

function typeColor(type: string): string {
  const meta = getPlatformMeta(type as ContentType);
  return meta.color ?? "#8B5CF6";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation state stored as ref so animation loop reads latest without re-renders
  const simNodes = useRef<SimNode[]>([]);
  const simLinks = useRef<SimLink[]>([]);

  // Render trigger — incremented each animation frame to cause re-render
  const [_tick, setTick] = useState(0);

  // Interaction state
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const draggingRef = useRef<SimNode | null>(null);

  // Pan / zoom
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Filter
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get<GraphData>(`${BACKEND_URL}/api/v1/graph`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGraphData(data);
      } catch {
        setError("Failed to load graph data. Make sure you have saved some content first.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Build simulation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!graphData) return;

    const rect = svgRef.current?.getBoundingClientRect() ?? { width: 800, height: 600 };
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Limit nodes for performance
    const rawNodes = graphData.nodes.slice(0, MAX_NODES_SHOWN);
    const idSet = new Set(rawNodes.map(n => n.id));

    simNodes.current = rawNodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / rawNodes.length;
      const r = Math.min(cx, cy) * 0.6;
      return {
        ...n,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    });

    const nodeById = new Map(simNodes.current.map(n => [n.id, n]));
    simLinks.current = graphData.links
      .filter(l => idSet.has(l.source) && idSet.has(l.target))
      .map(l => ({
        source: nodeById.get(l.source)!,
        target: nodeById.get(l.target)!,
        sharedTags: l.sharedTags,
        weight: l.weight,
      }));

    // Run simulation
    let frame = 0;
    const MAX_FRAMES = 300;

    const animTick = () => {
      const nodes = simNodes.current;
      const links = simLinks.current;
      const W = svgRef.current?.clientWidth ?? rect.width;
      const H = svgRef.current?.clientHeight ?? rect.height;
      const centerX = W / 2;
      const centerY = H / 2;

      // Repulsion (Barnes-Hut approximation: just O(n²) for n ≤ 150)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy + 1;
          const force = REPULSION / d2;
          const fx = (dx / Math.sqrt(d2)) * force;
          const fy = (dy / Math.sqrt(d2)) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      // Spring attraction
      for (const link of links) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const stretch = d - SPRING_LENGTH * (1 / Math.max(link.weight, 1));
        const fx = (dx / d) * stretch * SPRING_STRENGTH;
        const fy = (dy / d) * stretch * SPRING_STRENGTH;
        link.source.vx += fx; link.source.vy += fy;
        link.target.vx -= fx; link.target.vy -= fy;
      }

      // Center gravity + integrate
      for (const n of nodes) {
        if (n.fx !== undefined || n.fy !== undefined) {
          if (n.fx !== undefined) n.x = n.fx;
          if (n.fy !== undefined) n.y = n.fy;
          n.vx = 0; n.vy = 0;
          continue;
        }
        n.vx += (centerX - n.x) * GRAVITY;
        n.vy += (centerY - n.y) * GRAVITY;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;
        // Clamp
        n.x = Math.max(20, Math.min(W - 20, n.x));
        n.y = Math.max(20, Math.min(H - 20, n.y));
      }

      frame++;
      setTick(t => t + 1);

      if (frame < MAX_FRAMES) {
        animRef.current = requestAnimationFrame(animTick);
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animTick);

    return () => cancelAnimationFrame(animRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  // ── SVG pointer events ─────────────────────────────────────────────────────
  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top  - transform.y) / transform.scale,
    };
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGCircleElement>, node: SimNode) => {
    e.stopPropagation();
    draggingRef.current = node;
    node.fx = node.x;
    node.fy = node.y;
    // Wake up simulation while dragging
    animRef.current = requestAnimationFrame(function loop() {
      setTick(t => t + 1);
      if (draggingRef.current) animRef.current = requestAnimationFrame(loop);
    });
  }, []);

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingRef.current) {
      const pt = getSvgPoint(e.clientX, e.clientY);
      draggingRef.current.fx = pt.x;
      draggingRef.current.fy = pt.y;
      draggingRef.current.x  = pt.x;
      draggingRef.current.y  = pt.y;
    } else if (isPanning.current) {
      setTransform(prev => ({
        ...prev,
        x: panStart.current.tx + (e.clientX - panStart.current.x),
        y: panStart.current.ty + (e.clientY - panStart.current.y),
      }));
    }
  }, [getSvgPoint]);

  const handleSvgMouseUp = useCallback(() => {
    if (draggingRef.current) {
      draggingRef.current.fx = undefined;
      draggingRef.current.fy = undefined;
      draggingRef.current = null;
    }
    isPanning.current = false;
  }, []);

  const handleSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as SVGElement).tagName !== "circle") {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    }
  }, [transform]);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => {
      const newScale = Math.max(0.2, Math.min(4, prev.scale * delta));
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return prev;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      return {
        scale: newScale,
        x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
        y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
      };
    });
  }, []);

  // ── Filtered nodes ─────────────────────────────────────────────────────────
  const visibleNodeIds = new Set(
    simNodes.current
      .filter(n => {
        if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (!activeTag) return true;
        return n.tags?.includes(activeTag);
      })
      .map(n => n.id)
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !graphData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <div className="text-6xl">
          <ShareIcon className="w-16 h-16 text-gray-400 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">No Graph Yet</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {error ?? "Save some content with shared tags to see connections appear here."}
        </p>
      </div>
    );
  }

  const nodes = simNodes.current;
  const links = simLinks.current;

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur border-b border-gray-800 z-10"
      >
        <div>
          <h1 className="text-lg font-bold gradient-text">Knowledge Graph</h1>
          <p className="text-xs text-gray-400">
            {graphData.stats.totalNodes} nodes · {graphData.stats.totalLinks} connections
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="ml-auto w-48 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Instructions */}
        <span className="hidden md:block text-xs text-gray-500">
          Drag nodes · Scroll to zoom · Click to open
        </span>

        {/* Reset zoom */}
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
        >
          Reset View
        </button>
      </motion.div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Helper message if no links */}
        {graphData.links.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-gray-900/80 backdrop-blur px-6 py-4 rounded-xl border border-gray-800 text-center max-w-sm">
              <ShareIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">
                Nodes are pushed apart right now. <strong className="text-white">Add the same tags</strong> to multiple items to see them connect and cluster together!
              </p>
            </div>
          </div>
        )}

        {/* ── Graph canvas ── */}
        <svg
          ref={svgRef}
          className="flex-1 cursor-grab active:cursor-grabbing"
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
          onMouseDown={handleSvgMouseDown}
          onWheel={handleWheel}
          style={{ background: "radial-gradient(ellipse at center, #1a1030 0%, #0a0a0f 100%)" }}
        >
          <defs>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {/* Links */}
            {links
              .filter(l => visibleNodeIds.has(l.source.id) && visibleNodeIds.has(l.target.id))
              .map((l, i) => {
                const isHighlighted =
                  selectedNode &&
                  (l.source.id === selectedNode.id || l.target.id === selectedNode.id);
                return (
                  <line
                    key={i}
                    x1={l.source.x}
                    y1={l.source.y}
                    x2={l.target.x}
                    y2={l.target.y}
                    stroke={isHighlighted ? "#c4b5fd" : "rgba(167, 139, 250, 0.25)"}
                    strokeWidth={isHighlighted ? l.weight + 2 : Math.min(l.weight, 4)}
                    strokeOpacity={isHighlighted ? 1 : 0.8}
                  />
                );
              })}

            {/* Nodes */}
            {nodes
              .filter(n => visibleNodeIds.has(n.id))
              .map(n => {
                const r = nodeRadius(n);
                const color = typeColor(n.type);
                const isHovered   = hoveredNode?.id  === n.id;
                const isSelected  = selectedNode?.id === n.id;
                const isConnected = selectedNode
                  ? links.some(l => (l.source.id === selectedNode.id || l.target.id === selectedNode.id) && (l.source.id === n.id || l.target.id === n.id))
                  : false;
                const dimmed = selectedNode && !isSelected && !isConnected;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x},${n.y})`}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredNode(n)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      if (selectedNode?.id === n.id) {
                        window.open(n.link, "_blank", "noopener,noreferrer");
                        setSelectedNode(null);
                      } else {
                        setSelectedNode(n);
                      }
                    }}
                    onMouseDown={e => handleMouseDown(e as unknown as React.MouseEvent<SVGCircleElement>, n)}
                    opacity={dimmed ? 0.2 : 1}
                  >
                    {/* Glow ring for selected/hovered */}
                    {(isHovered || isSelected) && (
                      <circle
                        r={r + 6}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        opacity={0.6}
                        filter="url(#glow)"
                      />
                    )}
                    <circle
                      r={r}
                      fill={color}
                      fillOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.75}
                      stroke="#fff"
                      strokeWidth={isSelected ? 2.5 : 0.5}
                      strokeOpacity={0.4}
                      filter={isSelected ? "url(#glow-strong)" : isHovered ? "url(#glow)" : undefined}
                    />
                    {/* Label — show always if large enough, or on hover */}
                    {(r >= 14 || isHovered || isSelected) && (
                      <text
                        textAnchor="middle"
                        dy={r + 12}
                        fontSize={isSelected ? 11 : 9}
                        fill="#e5e7eb"
                        fontWeight={isSelected ? "700" : "400"}
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {n.title.length > 22 ? n.title.slice(0, 20) + "…" : n.title}
                      </text>
                    )}
                  </g>
                );
              })}
          </g>
        </svg>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex flex-col w-64 bg-gray-900/80 backdrop-blur border-l border-gray-800 overflow-y-auto">
          {/* Selected node info */}
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 border-b border-gray-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <PlatformIcon type={selectedNode.type as ContentType} className="w-5 h-5" />
                <span
                  className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: typeColor(selectedNode.type) + "22",
                    color: typeColor(selectedNode.type),
                  }}
                >
                  {selectedNode.type}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mb-1 leading-snug">{selectedNode.title}</p>
              <p className="text-xs text-gray-400 mb-3">{selectedNode.connectionCount} connections</p>
              <a
                href={selectedNode.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-3 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                Open Link ↗
              </a>
              <button
                onClick={() => setSelectedNode(null)}
                className="mt-2 block w-full text-center px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Clear selection
              </button>
            </motion.div>
          ) : (
            <div className="p-4 border-b border-gray-800">
              <p className="text-xs text-gray-500">Click a node to inspect it</p>
            </div>
          )}

          {/* Tag filter */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Filter by tag
            </h3>
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-lg text-xs mb-1 transition-colors",
                !activeTag ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-gray-800"
              )}
            >
              All tags
            </button>
            {graphData.topTags.map(tag => (
              <button
                key={tag.name}
                onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-lg text-xs mb-1 transition-colors flex justify-between items-center",
                  activeTag === tag.name
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:bg-gray-800"
                )}
              >
                <span>#{tag.name}</span>
                <span className="opacity-60">{tag.count}</span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="p-4 mt-auto border-t border-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Legend</h3>
            <p className="text-xs text-gray-500 mb-2">Node size = connections</p>
            <p className="text-xs text-gray-500">Node color = content type</p>
          </div>
        </div>
      </div>

      {/* Tooltip on hover */}
      {hoveredNode && !draggingRef.current && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white shadow-2xl pointer-events-none z-20"
        >
          <span className="font-semibold">{hoveredNode.title}</span>
          <span className="ml-2 text-gray-400 text-xs">
            {hoveredNode.type} · {hoveredNode.connectionCount} connections ·
            {selectedNode?.id === hoveredNode.id ? " Click again to open" : " Click to select"}
          </span>
        </div>
      )}
    </div>
  );
}
