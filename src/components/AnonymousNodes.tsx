"use client";

import React, { useEffect, useRef } from "react";

export default function AnonymousNodes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("AnonymousNodes mounted - high-res tracking version");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pairs: Pair[] = [];
    let animationFrameId: number;
    
    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;

    const resize = () => {
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;
      
      const pixelRatio = window.devicePixelRatio || 1;
      // Actual pixels
      canvas.width = logicalWidth * pixelRatio;
      canvas.height = logicalHeight * pixelRatio;
      // CSS display pixels
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      
      // Scale context so drawing commands use CSS pixels but render in High-DPI
      ctx.scale(pixelRatio, pixelRatio);
      
      initPairs();
    };

    class Node {
      x: number;
      y: number;
      radius: number;

      constructor(startX: number, startY: number) {
        this.x = startX;
        this.y = startY;
        this.radius = 1.5; // crisp solid dot
      }

      update(targetX: number, targetY: number) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
           // Move directly towards the other node constantly. 
           // They will never sit still waiting.
           const speed = 0.6; 
           this.x += (dx / dist) * speed;
           this.y += (dy / dist) * speed;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.fill();
      }
    }

    class Pair {
      nodeA!: Node;
      nodeB!: Node;
      state!: 'approaching' | 'connected';
      driftVx!: number;
      driftVy!: number;
      timeOffsets!: { a: number, b: number };

      constructor() {
        this.reset();
        // Fast forward so the screen isn't empty on load
        this.fastForward(Math.random() * 800);
      }

      reset() {
        // Spawn far apart on opposite edges
        const padding = 50;
        let startAx, startAy, startBx, startBy;

        if (Math.random() > 0.5) {
          // Horizontal edge spawn
          startAx = -padding;
          startAy = Math.random() * logicalHeight;
          startBx = logicalWidth + padding;
          startBy = Math.random() * logicalHeight;
        } else {
          // Vertical edge spawn
          startAx = Math.random() * logicalWidth;
          startAy = -padding;
          startBx = Math.random() * logicalWidth;
          startBy = logicalHeight + padding;
        }

        this.nodeA = new Node(startAx, startAy);
        this.nodeB = new Node(startBx, startBy);
        this.state = 'approaching';
        
        // Pick a drift direction for after they meet
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.15 + Math.random() * 0.15;
        this.driftVx = Math.cos(angle) * speed;
        this.driftVy = Math.sin(angle) * speed;
        
        this.timeOffsets = { a: Math.random() * 1000, b: Math.random() * 1000 };
      }

      fastForward(frames: number) {
        for (let i = 0; i < frames; i++) {
          this.update(true);
        }
      }

      update(isFastForward = false) {
        if (this.state === 'approaching') {
          // Both nodes constantly seek each other
          this.nodeA.update(this.nodeB.x, this.nodeB.y);
          this.nodeB.update(this.nodeA.x, this.nodeA.y);
          
          const dx = this.nodeA.x - this.nodeB.x;
          const dy = this.nodeA.y - this.nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Meet when very close
          if (distance < 2) {
             this.state = 'connected';
             const midX = (this.nodeA.x + this.nodeB.x) / 2;
             const midY = (this.nodeA.y + this.nodeB.y) / 2;
             const angle = Math.atan2(dy, dx);
             
             // Lock them slightly apart so a solid connection line is visible
             this.nodeA.x = midX + Math.cos(angle) * 2;
             this.nodeA.y = midY + Math.sin(angle) * 2;
             this.nodeB.x = midX - Math.cos(angle) * 2;
             this.nodeB.y = midY - Math.sin(angle) * 2;
          }
        } else if (this.state === 'connected') {
          // Drift endlessly
          this.nodeA.x += this.driftVx;
          this.nodeA.y += this.driftVy;
          this.nodeB.x += this.driftVx;
          this.nodeB.y += this.driftVy;
          
          // Organic orbiting motion if not fast forwarding
          if (!isFastForward) {
             const time = Date.now() / 600;
             this.nodeA.x += Math.sin(time + this.timeOffsets.a) * 0.15;
             this.nodeA.y += Math.cos(time + this.timeOffsets.a) * 0.15;
             this.nodeB.x -= Math.sin(time + this.timeOffsets.b) * 0.15;
             this.nodeB.y -= Math.cos(time + this.timeOffsets.b) * 0.15;
          }

          // Reset only when completely off screen bounds
          const margin = 100;
          if (
            this.nodeA.x < -margin || this.nodeA.x > logicalWidth + margin ||
            this.nodeA.y < -margin || this.nodeA.y > logicalHeight + margin
          ) {
            this.reset();
          }
        }
      }

      draw() {
        if (!ctx) return;
        
        this.nodeA.draw();
        this.nodeB.draw();

        if (this.state === 'approaching') {
          const dx = this.nodeA.x - this.nodeB.x;
          const dy = this.nodeA.y - this.nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const connectThreshold = 250;
          if (distance < connectThreshold) {
            const connectIntensity = 1 - (distance / connectThreshold);
            ctx.beginPath();
            ctx.moveTo(this.nodeA.x, this.nodeA.y);
            ctx.lineTo(this.nodeB.x, this.nodeB.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${connectIntensity * 0.7})`;
            // Fix low res look by explicitly ensuring subpixel rendering for lines
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        } else if (this.state === 'connected') {
            ctx.beginPath();
            ctx.moveTo(this.nodeA.x, this.nodeA.y);
            ctx.lineTo(this.nodeB.x, this.nodeB.y);
            ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
      }
    }

    const initPairs = () => {
      pairs = [];
      const numPairs = logicalWidth > 768 ? 15 : 8; 
      for (let i = 0; i < numPairs; i++) {
        pairs.push(new Pair());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      
      pairs.forEach((pair) => {
        pair.update();
        pair.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.8,
      }}
      aria-hidden="true"
    />
  );
}
