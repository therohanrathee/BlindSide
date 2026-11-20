"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import s from "./PrivacyPath.module.css";

interface PrivacyPathProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  stepRefs: React.RefObject<(HTMLDivElement | null)[]>;
}

export default function PrivacyPath({
  containerRef,
  stepRefs,
}: PrivacyPathProps) {
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
  const pathSamplesRef = useRef<{ x: number; y: number }[]>([]);

  /* ──────────────────────────────────────
     Calculate path geometry from DOM
     The line starts coming out of the RIGHT side of the screen
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

    // Step 0 (stepLeft): card on right -> node at w * 0.85
    // Step 1 (stepRight): card on left -> node at w * 0.18
    // Step 2 (stepLeft): card on right -> node at w * 0.85
    // Step 3 (stepRight): card on left -> node at w * 0.18
    steps.forEach((step, i) => {
      if (!step) return;
      const sRect = step.getBoundingClientRect();
      const y = sRect.top - cRect.top + sRect.height * 0.5;

      let x: number;
      if (isMobile) {
        x = i % 2 === 0 ? vw * 0.78 : vw * 0.22;
      } else {
        x = offsetX + (i % 2 === 0 ? w * 0.85 : w * 0.18);
      }

      nodes.push({ x, y });
    });

    if (nodes.length < 2) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    let d: string;

    if (isMobile) {
      // ── Mobile: Starts coming out of the RIGHT edge of the screen (vw) ──
      const entryY = first.y - 240;
      d = `M ${vw} ${entryY}`;
      d += ` C ${vw - (vw - first.x) * 0.5} ${entryY + 40}, ${first.x} ${first.y - 100}, ${first.x} ${first.y}`;

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
      d += ` C ${last.x} ${last.y + 50}, ${last.x * 0.5} ${exitY}, 0 ${exitY}`;
    } else {
      // ── Desktop: Starts coming out of the RIGHT side of the screen (vw) ──
      const entryY = first.y - 220;
      d = `M ${vw} ${entryY}`;
      d += ` C ${vw - (vw - first.x) * 0.5} ${entryY}, ${first.x} ${entryY + 20}, ${first.x} ${first.y}`;

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
      d += ` C ${last.x} ${last.y + 70}, ${last.x * 0.5} ${exitY}, 0 ${exitY}`;
    }

    setSvgData({ width: vw, height: h, pathD: d, nodes });
  }, [containerRef, stepRefs]);

  /* ──────────────────────────────────────
     Observer / resize setup
     ────────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      pathEl.style.strokeDasharray = "none";
      pathEl.style.strokeDashoffset = "0";
      nodeRingsRef.current.forEach((r) => r?.classList.add(s.nodeReached));
      nodeDotsRef.current.forEach((d) => d?.classList.add(s.nodeDotReached));
      if (glowRef.current) glowRef.current.style.opacity = "0";
      return;
    }

    const totalLength = pathEl.getTotalLength();
    pathLengthRef.current = totalLength;
    pathEl.style.strokeDasharray = `${totalLength}`;
    pathEl.style.strokeDashoffset = `${totalLength}`;

    const samples = 400;
    const cachedSamples: { x: number; y: number }[] = [];
    for (let i = 0; i <= samples; i++) {
      const pt = pathEl.getPointAtLength(totalLength * (i / samples));
      cachedSamples.push({ x: pt.x, y: pt.y });
    }
    pathSamplesRef.current = cachedSamples;

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

        const isMobileScroll = window.innerWidth <= 768;
        const scrollStart = wh * 0.85;
        const scrollEnd = isMobileScroll ? wh * 0.44 : wh * 0.55;
        const traveled = scrollStart - cRect.top;
        const totalTravel = scrollStart - scrollEnd + cRect.height;
        const progress = Math.max(0, Math.min(1, traveled / totalTravel));

        pathEl.style.strokeDashoffset = `${totalLength * (1 - progress)}`;

        const glow = glowRef.current;
        const samplesArray = pathSamplesRef.current;
        if (glow && totalLength > 0 && samplesArray.length > 0) {
          if (progress > 0.005 && progress < 0.995) {
            try {
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

        nodePathFractions.forEach((fraction, i) => {
          const reached = progress >= fraction;
          nodeRingsRef.current[i]?.classList.toggle(s.nodeReached, reached);
          nodeDotsRef.current[i]?.classList.toggle(s.nodeDotReached, reached);
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [svgData, containerRef]);

  if (!svgData) return null;

  return (
    <svg
      className={s.svg}
      viewBox={`0 0 ${svgData.width} ${svgData.height}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="ppGrad"
          gradientUnits="userSpaceOnUse"
          x1="100%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.9" />
          <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.85" />
        </linearGradient>
        <filter
          id="ppGlow"
          x="-200%"
          y="-200%"
          width="500%"
          height="500%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
        </filter>
      </defs>

      {/* Guide background path */}
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
        stroke="url(#ppGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        className={s.pathDraw}
      />

      {/* Glowing pen tip */}
      <circle
        ref={glowRef}
        r="20"
        className={s.glowDot}
        filter="url(#ppGlow)"
      />

      {/* Step nodes */}
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
