"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import s from "./JourneyPath.module.css";

interface JourneyPathProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  stepRefs: React.RefObject<(HTMLDivElement | null)[]>;
}

export default function JourneyPath({
  containerRef,
  stepRefs,
}: JourneyPathProps) {
  const [svgData, setSvgData] = useState<{
    width: number;
    height: number;
    pathD: string;
    nodes: { x: number; y: number }[];
  } | null>(null);

  const pathDrawRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const nodeRingsRef = useRef<(SVGCircleElement | null)[]>([]);
  const nodeDotsRef = useRef<(SVGCircleElement | null)[]>([]);
  const pathLengthRef = useRef(0);
  const rafIdRef = useRef(0);
  // OPTIMIZATION: Cache the path points to avoid expensive getPointAtLength calls on scroll
  const pathSamplesRef = useRef<{x: number, y: number}[]>([]);

  /* ──────────────────────────────────────
     Calculate path geometry from DOM
     ────────────────────────────────────── */
  const calculate = useCallback(() => {
    const container = containerRef.current;
    const steps = stepRefs.current;
    if (!container || !steps) return;

    const valid = steps.filter(Boolean);
    if (valid.length < 2) return;

    const cRect = container.getBoundingClientRect();
    const w = cRect.width;
    const h = container.offsetHeight;
    const vw = window.innerWidth;
    const offsetX = cRect.left;
    const isMobile = vw <= 768;

    const nodes: { x: number; y: number }[] = [];

    // ─── Per-node position offsets ───────────────────────────────
    // Adjust individual bulb positions here.
    // Format: { dx: horizontal pixels, dy: vertical pixels }
    // Positive dx = right, negative dx = left
    // Positive dy = down,  negative dy = up
    const mobileOffsets: Record<number, { dx: number; dy: number }> = {
      0: { dx: 0, dy: 0 },    // Node 1 (Verify Identity)
      1: { dx: 0, dy: 0 },    // Node 2 (Blind Match)
      2: { dx: -18, dy: -54 }, // Node 3 (Chat Blind) — shifted left & up
      3: { dx: 0, dy: 0 },    // Node 4 (The Reveal)
    };
    const desktopOffsets: Record<number, { dx: number; dy: number }> = {
      0: { dx: 0, dy: 0 },    // Node 1 (Verify Identity)
      1: { dx: 0, dy: 0 },    // Node 2 (Blind Match)
      2: { dx: 0, dy: 0 },    // Node 3 (Chat Blind)
      3: { dx: 0, dy: 0 },    // Node 4 (The Reveal)
    };
    // ─────────────────────────────────────────────────────────────

    steps.forEach((step, i) => {
      if (!step) return;
      const sRect = step.getBoundingClientRect();
      const y = sRect.top - cRect.top + sRect.height * 0.5;

      let x: number;
      if (isMobile) {
        x = i % 2 === 0 ? vw * 0.22 : vw * 0.78;
      } else {
        x = offsetX + (i % 2 === 0 ? w * 0.22 : w * 0.85);
      }

      // Apply per-node offsets
      const offsets = isMobile ? mobileOffsets : desktopOffsets;
      const o = offsets[i] || { dx: 0, dy: 0 };
      nodes.push({ x: x + o.dx, y: y + o.dy });
    });

    if (nodes.length < 2) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    let d: string;

    if (isMobile) {
      // ── Mobile: entry from left screen edge, arcing well above node 1 ──
      // cp2 is directly above node so arrival tangent is vertical,
      // matching the S-curve's vertical departure = 180° continuity
      const entryY = first.y - 320;
      d = `M 0 ${entryY}`;
      d += ` C ${first.x * 0.5} ${entryY + 40}, ${first.x} ${first.y - 120}, ${first.x} ${first.y}`;

      for (let i = 1; i < nodes.length; i++) {
        const prev = nodes[i - 1];
        const curr = nodes[i];
        const dy = curr.y - prev.y;
        const cp1x = prev.x;
        const cp1y = prev.y + dy * 0.5;
        const cp2x = curr.x;
        const cp2y = curr.y - dy * 0.5;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      }

      const exitY = last.y + 160;
      const gapRight = vw - last.x;
      d += ` C ${last.x} ${last.y + 50}, ${vw - gapRight * 0.5} ${exitY}, ${vw} ${exitY}`;
    } else {
      // ── Desktop: wide S-curves from screen edge to screen edge ──
      const entryY = first.y - 240;
      d = `M 0 ${entryY}`;
      d += ` C ${first.x * 0.5} ${entryY}, ${first.x} ${entryY + 20}, ${first.x} ${first.y}`;

      for (let i = 1; i < nodes.length; i++) {
        const prev = nodes[i - 1];
        const curr = nodes[i];
        const dy = curr.y - prev.y;
        const cp1x = prev.x;
        const cp1y = prev.y + dy * 0.5;
        const cp2x = curr.x;
        const cp2y = curr.y - dy * 0.5;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      }

      const exitY = last.y + 200;
      d += ` C ${last.x} ${last.y + 70}, ${last.x + (vw - last.x) * 0.5} ${exitY}, ${vw} ${exitY}`;
    }

    setSvgData({ width: vw, height: h, pathD: d, nodes });
  }, [containerRef, stepRefs]);

  /* ──────────────────────────────────────
     Observer / resize setup
     ────────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Delay initial calc slightly to let layout settle
    const timer = setTimeout(calculate, 200);

    let resizeTimeout: NodeJS.Timeout;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(calculate);
      }, 150);
    });
    ro.observe(container);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimeout);
      ro.disconnect();
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [calculate]);

  /* ──────────────────────────────────────
     Scroll-driven path draw animation
     ────────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    const pathEl = pathDrawRef.current;
    if (!container || !pathEl || !svgData) return;

    // Respect reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      pathEl.style.strokeDasharray = "none";
      pathEl.style.strokeDashoffset = "0";
      // Mark all nodes as reached
      nodeRingsRef.current.forEach((r) => r?.classList.add(s.nodeReached));
      nodeDotsRef.current.forEach((d) => d?.classList.add(s.nodeDotReached));
      if (glowRef.current) glowRef.current.style.opacity = "0";
      return;
    }

    const totalLength = pathEl.getTotalLength();
    pathLengthRef.current = totalLength;
    pathEl.style.strokeDasharray = `${totalLength}`;
    pathEl.style.strokeDashoffset = `${totalLength}`;

    // OPTIMIZATION: Pre-compute path points into an array so we don't call getPointAtLength on scroll
    const samples = 400;
    const cachedSamples: { x: number; y: number }[] = [];
    for (let i = 0; i <= samples; i++) {
      const pt = pathEl.getPointAtLength(totalLength * (i / samples));
      cachedSamples.push({ x: pt.x, y: pt.y });
    }
    pathSamplesRef.current = cachedSamples;

    // Pre-compute the exact path-length fraction at each node
    // by sampling the path geometry — this ensures perfect glow/bulb sync
    const nodePathFractions = svgData.nodes.map((node) => {
      let bestT = 0;
      let bestDist = Infinity;
      for (let si = 0; si <= samples; si++) {
        const t = si / samples;
        const pt = cachedSamples[si];
        const dx = pt.x - node.x;
        const dy = pt.y - node.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestT = t;
        }
      }
      return bestT;
    });

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;

        const cRect = container.getBoundingClientRect();
        const wh = window.innerHeight;

        // Map: progress 0 when container top reaches 85% viewport height
        //       progress 1 when container bottom approaches viewport center
        const isMobileScroll = window.innerWidth <= 768;
        const scrollStart = wh * 0.85;
        const scrollEnd = isMobileScroll ? wh * 0.44 : wh * 0.55;
        const traveled = scrollStart - cRect.top;
        const totalTravel = scrollStart - scrollEnd + cRect.height;
        const progress = Math.max(0, Math.min(1, traveled / totalTravel));

        // Animate stroke draw
        pathEl.style.strokeDashoffset = `${totalLength * (1 - progress)}`;

        // Animate glow dot at the leading edge
        const glow = glowRef.current;
        const samplesArray = pathSamplesRef.current;
        if (glow && totalLength > 0 && samplesArray.length > 0) {
          if (progress > 0.005 && progress < 0.995) {
            try {
              // Map progress to cached array index
              const sampleIdx = Math.min(
                samplesArray.length - 1, 
                Math.max(0, Math.floor(progress * (samplesArray.length - 1)))
              );
              const pt = samplesArray[sampleIdx];
              glow.setAttribute("cx", `${pt.x}`);
              glow.setAttribute("cy", `${pt.y}`);
              glow.style.opacity = "1";
            } catch {
              glow.style.opacity = "0";
            }
          } else {
            glow.style.opacity = "0";
          }
        }

        // Activate node markers — synced to actual path position
        nodePathFractions.forEach((fraction, i) => {
          const reached = progress >= fraction;
          nodeRingsRef.current[i]?.classList.toggle(s.nodeReached, reached);
          nodeDotsRef.current[i]?.classList.toggle(s.nodeDotReached, reached);
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initial state

    return () => window.removeEventListener("scroll", onScroll);
  }, [svgData, containerRef]);

  /* ──────────────────────────────────────
     Render
     ────────────────────────────────────── */
  if (!svgData) return null;

  return (
    <svg
      className={s.svg}
      viewBox={`0 0 ${svgData.width} ${svgData.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="jpGrad"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.85" />
        </linearGradient>
        <filter
          id="jpGlow"
          x="-200%"
          y="-200%"
          width="500%"
          height="500%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
        </filter>
      </defs>

      {/* Faint background guide path */}
      <path
        d={svgData.pathD}
        fill="none"
        className={s.pathBg}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Animated drawn path */}
      <path
        ref={pathDrawRef}
        d={svgData.pathD}
        fill="none"
        stroke="url(#jpGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        className={s.pathDraw}
      />

      {/* Glow at pen-tip */}
      <circle
        ref={glowRef}
        r="20"
        className={s.glowDot}
        filter="url(#jpGlow)"
      />

      {/* Step node markers */}
      {svgData.nodes.map((node, i) => (
        <g key={i}>
          <circle
            ref={(el) => {
              nodeRingsRef.current[i] = el;
            }}
            cx={node.x}
            cy={node.y}
            r="16"
            fill="none"
            strokeWidth="2"
            className={s.nodeRing}
          />
          <circle
            ref={(el) => {
              nodeDotsRef.current[i] = el;
            }}
            cx={node.x}
            cy={node.y}
            r="5"
            className={s.nodeDot}
          />
        </g>
      ))}
    </svg>
  );
}
