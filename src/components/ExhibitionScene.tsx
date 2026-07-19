import React, { useEffect, useRef, useState } from 'react';
import { AgentIdea } from '../types/idea';
import IdeaEntity from './IdeaEntity';
import { getIdeaVisualConfig, VisualConfig } from '../utils/ideaVisualMapper';

interface ExhibitionSceneProps {
  ideas: AgentIdea[];
  isPaused: boolean;
  newlyDiscoveredIds: string[];
  onSelectIdea: (idea: AgentIdea) => void;
  selectedIdeaId?: string | null;
}

interface PhysicsEntity {
  id: string;
  idea: AgentIdea;
  config: VisualConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;       // Current animated size
  targetSize: number; // Target size based on focus tier
  isNew: boolean;
  anchorX: number;
  anchorY: number;
}

interface Firefly {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  phase: number;
}

interface GatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

// Spatially groups bubbles in specific invisible coordinate zones of the screen based on category
function getCategoryAnchor(
  category: string,
  index: number,
  width: number,
  height: number
): { x: number; y: number } {
  const cat = (category || '').trim().toLowerCase();
  
  // Base percentage positions for invisible regions:
  // - 진료 / 의료: 좌측 상단 (Top-Left)
  // - 간호 / 진료지원: 좌측 하단 (Bottom-Left)
  // - 연구: 우측 상단 (Top-Right)
  // - 행정: 중앙 하단 (Bottom-Center)
  // - IT / 정보기술 / 보안: 우측 하단 (Bottom-Right)
  // - 환자서비스 / 기타: 중앙 주변 (Around Center)
  let basePercentX = 0.50;
  let basePercentY = 0.45;

  if (cat.includes('진료') && !cat.includes('지원')) {
    basePercentX = 0.22;
    basePercentY = 0.28;
  } else if (cat.includes('간호') || cat.includes('진료지원') || cat.includes('의료지원')) {
    basePercentX = 0.22;
    basePercentY = 0.68;
  } else if (cat.includes('연구')) {
    basePercentX = 0.78;
    basePercentY = 0.28;
  } else if (cat.includes('행정') || cat.includes('문서') || cat.includes('회의') || cat.includes('결재')) {
    basePercentX = 0.50;
    basePercentY = 0.76;
  } else if (cat.includes('정보기술') || cat.includes('it') || cat.includes('tech') || cat.includes('보안')) {
    basePercentX = 0.78;
    basePercentY = 0.68;
  } else {
    // Patient services / Others: Around Center
    basePercentX = 0.50;
    basePercentY = 0.45;
  }

  // Golden angle distribution for a beautiful organic spread around the category zone anchor
  const angle = index * 2.39996; // Golden angle in radians
  const spreadRadius = 55 + (index % 6) * 20; // spread between 55px and 175px
  
  const offsetX = Math.cos(angle) * spreadRadius;
  const offsetY = Math.sin(angle) * spreadRadius * 0.8; // flatter ellipse profile for widescreen aspect ratios

  return {
    x: Math.max(90, Math.min(width - 90, basePercentX * width + offsetX)),
    y: Math.max(100, Math.min(height - 130, basePercentY * height + offsetY))
  };
}

// Determines the baseline bubble diameter based on the total active ideas count
function getBaseBackgroundSize(count: number): number {
  if (count <= 10) return 200;
  if (count <= 25) return 140;
  if (count <= 40) return 105;
  return 80; // default for 41-60+ ideas
}

export default function ExhibitionScene({
  ideas,
  isPaused,
  newlyDiscoveredIds,
  onSelectIdea,
  selectedIdeaId,
}: ExhibitionSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const entitiesRef = useRef<PhysicsEntity[]>([]);
  const [renderedEntities, setRenderedEntities] = useState<PhysicsEntity[]>([]);

  // 1. Focus Cycling & Interaction State
  const [activeFocusId, setActiveFocusId] = useState<string | null>(null);
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);

  // 2. New Arrival Sequence State
  const [newArrivalId, setNewArrivalId] = useState<string | null>(null);
  const [gatheringState, setGatheringState] = useState<'idle' | 'gathering' | 'birth'>('idle');
  const gatheringParticlesRef = useRef<GatherParticle[]>([]);
  const birthWaveRef = useRef<{ radius: number; maxRadius: number; alpha: number; active: boolean }>({
    radius: 0,
    maxRadius: 200,
    alpha: 0,
    active: false,
  });
  
  // Track already processed new IDs to avoid double-triggering sequence
  const processedNewIdsRef = useRef<Set<string>>(new Set());
  const [activeNewIds, setActiveNewIds] = useState<Set<string>>(new Set());
  const newArrivalQueueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef<boolean>(false);

  // 3. Resize Handling with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      const w = width || window.innerWidth;
      const h = height || window.innerHeight;
      setDimensions({ width: w, height: h });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Synchronize external selection with focus
  useEffect(() => {
    if (selectedIdeaId) {
      setActiveFocusId(selectedIdeaId);
    }
  }, [selectedIdeaId]);

  // 4. Automatic Focus Rotation Loop (7.5 seconds cycle: 5.5s centered spotlight, 2s return)
  useEffect(() => {
    if (ideas.length === 0 || isPaused || !!newArrivalId || !!selectedIdeaId) {
      return;
    }

    let index = 0;
    // Fisher-Yates shuffle sequence so every idea is spotlit exactly once per cycle, in a lush non-repetitive sequence
    const sequence = Array.from({ length: ideas.length }, (_, i) => i);
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }

    const cycleSpotlight = () => {
      if (ideas.length === 0) return;
      
      const targetIdx = sequence[index];
      const idea = ideas[targetIdx];
      if (idea) {
        setActiveFocusId(idea.id);
      }

      // Display centered and enlarged for 5.5 seconds
      const clearTimer = setTimeout(() => {
        if (!selectedIdeaId) {
          setActiveFocusId(null);
        }
      }, 5500);

      index = (index + 1) % sequence.length;
      return clearTimer;
    };

    // Trigger initial spotlight
    let clearTimer = cycleSpotlight();

    const interval = setInterval(() => {
      clearTimer = cycleSpotlight();
    }, 7500);

    return () => {
      clearInterval(interval);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [ideas, isPaused, newArrivalId, selectedIdeaId]);

  // 5. Detect and Trigger New Arrival Spectacle (Sequential Queue)
  const triggerNextInQueue = React.useCallback(() => {
    if (isProcessingQueueRef.current || newArrivalQueueRef.current.length === 0) {
      return;
    }

    const nextId = newArrivalQueueRef.current.shift()!;
    isProcessingQueueRef.current = true;
    
    // Kick off the New Arrival Spectacle!
    setNewArrivalId(nextId);
    setGatheringState('gathering');
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height * 0.45;
    
    // Initialize converging light particles
    const particles: GatherParticle[] = Array.from({ length: 70 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 220 + Math.random() * 100;
      const speed = 2.5 + Math.random() * 3.5;
      
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: -Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.1,
        color: Math.random() > 0.4 ? '#38bdf8' : '#f59e0b',
      };
    });
    
    gatheringParticlesRef.current = particles;

    // Phase 1: Light gathering lasts 2.6 seconds
    const birthTimeout = setTimeout(() => {
      setGatheringState('birth');
      setActiveFocusId(nextId); // Focuses the bubble at center

      // Shockwave burst ripple
      birthWaveRef.current = {
        radius: 10,
        maxRadius: 280,
        alpha: 1.0,
        active: true,
      };

      // Phase 2: Central spotlight stay for 3.0 seconds
      const idleTimeout = setTimeout(() => {
        setGatheringState('idle');
        setNewArrivalId(null); // Release physics special behavior
        setActiveFocusId(null);

        // Add to activeNewIds for exactly 10 seconds
        setActiveNewIds((prev) => {
          const next = new Set(prev);
          next.add(nextId);
          return next;
        });

        // Setup timer to remove the NEW label after 10 seconds
        setTimeout(() => {
          setActiveNewIds((prev) => {
            const next = new Set(prev);
            next.delete(nextId);
            return next;
          });
        }, 10000);

        // Little breather space of 1 second before starting next queue item
        setTimeout(() => {
          isProcessingQueueRef.current = false;
          triggerNextInQueue();
        }, 1000);

      }, 3000); // 3 seconds showing at the center

    }, 2600); // 2.6 seconds converging light

  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    const freshNewIds = newlyDiscoveredIds.filter(id => !processedNewIdsRef.current.has(id));
    if (freshNewIds.length === 0) return;

    const mappedNewIdeas = freshNewIds
      .map(id => ideas.find(idea => idea.id === id))
      .filter((idea): idea is AgentIdea => !!idea);

    // Sort ascending by timestamp so they arrive oldest to newest
    mappedNewIdeas.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    mappedNewIdeas.forEach((idea) => {
      processedNewIdsRef.current.add(idea.id);
      if (!newArrivalQueueRef.current.includes(idea.id)) {
        newArrivalQueueRef.current.push(idea.id);
      }
    });

    triggerNextInQueue();
  }, [newlyDiscoveredIds, ideas, triggerNextInQueue]);

  // 6. Synchronize ideas list changes with physics engine entity store
  useEffect(() => {
    const currentMap = new Map<string, PhysicsEntity>(entitiesRef.current.map((e) => [e.id, e]));
    const nextEntities: PhysicsEntity[] = [];
    const count = ideas.length;

    if (count === 0) {
      entitiesRef.current = [];
      return;
    }

    const baseBackgroundSize = getBaseBackgroundSize(count);

    ideas.forEach((idea, index) => {
      const config = getIdeaVisualConfig(idea, index);
      const isNew = activeNewIds.has(idea.id);
      const isFocused = idea.id === activeFocusId;
      const isNewArrival = idea.id === newArrivalId;
      
      // Determine the target size based on 2-tier structure:
      // - Focused/Spotlit (large): 280~360px
      // - Hidden during gathering phase of new arrival: 0
      // - Regular background bubbles: base background size with small organic variance factors
      let targetSize = baseBackgroundSize;
      
      if (isFocused) {
        targetSize = dimensions.width < 768 ? 290 : 340;
      } else if (isNewArrival && gatheringState === 'gathering') {
        targetSize = 0;
      } else {
        const varianceFactor = 0.88 + (index % 5) * 0.06;
        targetSize = baseBackgroundSize * varianceFactor;
      }

      // Default home anchors within category spatial zones
      const homeAnchor = getCategoryAnchor(idea.category, index, dimensions.width, dimensions.height);
      const targetAnchorX = isFocused ? dimensions.width / 2 : homeAnchor.x;
      const targetAnchorY = isFocused ? dimensions.height * 0.45 : homeAnchor.y;

      if (currentMap.has(idea.id)) {
        const existing = currentMap.get(idea.id)!;
        nextEntities.push({
          ...existing,
          idea,
          config,
          targetSize,
          anchorX: targetAnchorX,
          anchorY: targetAnchorY,
          isNew,
        });
      } else {
        // New item spawn physics
        let startX = targetAnchorX;
        let startY = targetAnchorY;

        if (isNewArrival || isNew) {
          // Spawns beautifully right at the center focus point
          startX = dimensions.width / 2;
          startY = dimensions.height * 0.45;
        } else {
          // Slight startup coordinate jitter so they don't overlay
          startX = targetAnchorX + (Math.random() - 0.5) * 60;
          startY = targetAnchorY + (Math.random() - 0.5) * 60;
        }

        const angle = Math.random() * Math.PI * 2;
        const initialSpeed = 0.05 + Math.random() * 0.05;

        nextEntities.push({
          id: idea.id,
          idea,
          config,
          x: startX,
          y: startY,
          vx: Math.cos(angle) * initialSpeed,
          vy: Math.sin(angle) * initialSpeed,
          size: (isNewArrival || isNew) ? 0 : targetSize * 0.5, // starts tiny and inflates gracefully
          targetSize,
          isNew,
          anchorX: targetAnchorX,
          anchorY: targetAnchorY,
        });
      }
    });

    entitiesRef.current = nextEntities;
  }, [ideas, activeFocusId, activeNewIds, newArrivalId, gatheringState, dimensions.width, dimensions.height]);

  // 7. Ambient Physics Simulation & Art Canvas Rendering Frame Loops
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    // Configure 30 cozy background bioluminescent fireflies
    const fireflies: Firefly[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: 1.2 + Math.random() * 2.5,
      alpha: 0.15 + Math.random() * 0.45,
      speed: 0.06 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
    }));

    const updatePhysicsFrame = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 16.666, 2.5);
      lastTime = now;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      // Clear frame first
      if (canvas && ctx) {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // A. Draw ambient backdrop gradient spot lanterns (Teal, Indigo, Cyan mists)
        const gradientsList = [
          { x: dimensions.width * 0.22, y: dimensions.height * 0.3, r: 380, color: 'rgba(20, 184, 166, 0.05)' },
          { x: dimensions.width * 0.78, y: dimensions.height * 0.6, r: 420, color: 'rgba(99, 102, 241, 0.045)' },
          { x: dimensions.width * 0.5, y: dimensions.height * 0.45, r: 320, color: 'rgba(6, 182, 212, 0.05)' },
        ];

        gradientsList.forEach((g) => {
          const radialGlow = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
          radialGlow.addColorStop(0, g.color);
          radialGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = radialGlow;
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // B. Draw slow undulating tranquil water ripple pathways
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.03)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        const wavePhase = performance.now() * 0.0006;
        for (let yPct = 0.22; yPct <= 0.78; yPct += 0.22) {
          const yLevel = dimensions.height * yPct;
          ctx.moveTo(0, yLevel);
          for (let px = 0; px <= dimensions.width; px += 20) {
            const waveY = yLevel + Math.sin(px * 0.003 + wavePhase + yPct * 10) * 10;
            ctx.lineTo(px, waveY);
          }
        }
        ctx.stroke();

        // C. Update and Draw floating starry fireflies
        fireflies.forEach((ff) => {
          if (!isPaused) {
            ff.y -= ff.speed * dt;
            ff.phase += 0.01 * dt;
            ff.x += Math.sin(ff.phase) * 0.1 * dt;

            // wrap around bounds
            if (ff.y < -15) {
              ff.y = dimensions.height + 15;
              ff.x = Math.random() * dimensions.width;
            }
          }

          const pulsate = (Math.sin(ff.phase) + 1) / 2;
          const alpha = 0.1 + pulsate * ff.alpha;

          ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(103, 232, 249, 0.4)';
          ctx.beginPath();
          ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        });

        // D. Update & Draw Gathering Particles for Birth Sequence
        if (gatheringState === 'gathering') {
          const particles = gatheringParticlesRef.current;
          const targetX = dimensions.width / 2;
          const targetY = dimensions.height * 0.45;

          particles.forEach((p) => {
            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 6) {
              // pull towards center spot
              const accel = 0.08 * dt;
              p.vx += (dx / dist) * accel;
              p.vy += (dy / dist) * accel;

              p.x += p.vx * dt;
              p.y += p.vy * dt;

              p.vx *= 0.95;
              p.vy *= 0.95;

              p.alpha = Math.min(0.85, p.alpha + 0.02 * dt);
            } else {
              p.alpha *= 0.88; // dissolve at arrival center
            }

            // Draw particle
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }

        // E. Birth Circular shockwave effect
        const shockwave = birthWaveRef.current;
        if (shockwave.active) {
          shockwave.radius += 4.5 * dt;
          shockwave.alpha -= 0.025 * dt;

          if (shockwave.alpha <= 0) {
            shockwave.active = false;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${shockwave.alpha})`;
            ctx.lineWidth = 3.0;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
            ctx.beginPath();
            ctx.arc(dimensions.width / 2, dimensions.height * 0.45, shockwave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Physics Engine calculations
      if (!isPaused) {
        const entities = entitiesRef.current;
        const len = entities.length;
        const bounceDamping = -0.4;
        const speedLimit = 0.42; // calm, peaceful, legible
        const edgeSafety = 75;

        // A. Handle Spring-Restores and Interpolate Size Smoothly
        entities.forEach((entity) => {
          // Smoothly animate current size to target size
          entity.size += (entity.targetSize - entity.size) * 0.08 * dt;

          // spring force pulling to designated anchor
          const dx = entity.anchorX - entity.x;
          const dy = entity.anchorY - entity.y;
          const distFromAnchor = Math.sqrt(dx * dx + dy * dy);
          
          // Dynamic spring constant getting stronger if pushed further
          let springK = 0.0016;
          if (distFromAnchor > 120) {
            springK = 0.005;
          } else if (distFromAnchor > 60) {
            springK = 0.0028;
          }

          if (entity.id !== activeFocusId) {
            entity.vx += dx * springK * dt;
            entity.vy += dy * springK * dt;
          } else {
            // Focused bubble pulls very strongly to center anchor
            entity.vx += dx * 0.015 * dt;
            entity.vy += dy * 0.015 * dt;
          }

          // Organic low-frequency brownian float drift
          const driftAngle = Math.random() * Math.PI * 2;
          const driftIntensity = 0.0035;
          entity.vx += Math.cos(driftAngle) * driftIntensity * dt;
          entity.vy += Math.sin(driftAngle) * driftIntensity * dt;

          // Friction damping (viscous drag)
          entity.vx *= 0.965;
          entity.vy *= 0.965;

          // Apply velocities
          entity.x += entity.vx * dt;
          entity.y += entity.vy * dt;

          // Limit speed to maintain legibility
          const currentVelocity = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
          if (currentVelocity > speedLimit) {
            entity.vx = (entity.vx / currentVelocity) * speedLimit;
            entity.vy = (entity.vy / currentVelocity) * speedLimit;
          }

          // Simple wall boundaries bouncing
          if (entity.x < edgeSafety) {
            entity.x = edgeSafety;
            entity.vx *= bounceDamping;
          } else if (entity.x > dimensions.width - edgeSafety) {
            entity.x = dimensions.width - edgeSafety;
            entity.vx *= bounceDamping;
          }

          if (entity.y < edgeSafety) {
            entity.y = edgeSafety;
            entity.vy *= bounceDamping;
          } else if (entity.y > dimensions.height - edgeSafety - 75) {
            entity.y = dimensions.height - edgeSafety - 75;
            entity.vy *= bounceDamping;
          }
        });

        // B. Clear Spotlight/Focus Zone (Push non-focused bubbles away from the center focus area ALWAYS)
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height * 0.45;
        const keepClearRadius = 250; // clear focus region radius

        entities.forEach((entity) => {
          if (entity.id !== activeFocusId) {
            const dx = entity.x - centerX;
            const dy = entity.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < keepClearRadius) {
              const pushForce = (1.0 - dist / keepClearRadius) * 0.16 * dt;
              const angle = dist > 1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
              entity.vx += Math.cos(angle) * pushForce;
              entity.vy += Math.sin(angle) * pushForce;
            }
          }
        });

        // C. Bubble-to-Bubble Gentle Collision Repulsion and Positional Correction (No overlaps!)
        for (let i = 0; i < len; i++) {
          const e1 = entities[i];
          for (let j = i + 1; j < len; j++) {
            const e2 = entities[j];
            const dx = e2.x - e1.x;
            const dy = e2.y - e1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Add a tiny extra margin (4px) for beautiful visual padding between soap bubble shells
            const minDist = (e1.size + e2.size) * 0.5 + 4; 

            if (dist < minDist && dist > 0.1) {
              const overlap = minDist - dist;
              
              // 1. Immediate positional correction to solve overlaps completely
              let e1Ratio = 0.5;
              let e2Ratio = 0.5;
              if (e1.id === activeFocusId) {
                e1Ratio = 0.04; // Focused bubble behaves as heavy/anchored
                e2Ratio = 0.96;
              } else if (e2.id === activeFocusId) {
                e1Ratio = 0.96;
                e2Ratio = 0.04;
              }

              const correctionX = (dx / dist) * overlap;
              const correctionY = (dy / dist) * overlap;

              e1.x -= correctionX * e1Ratio;
              e1.y -= correctionY * e1Ratio;
              e2.x += correctionX * e2Ratio;
              e2.y += correctionY * e2Ratio;

              // 2. Physical bounce momentum exchange impulse along normal vector
              const nx = dx / dist;
              const ny = dy / dist;
              
              const rvx = e2.vx - e1.vx;
              const rvy = e2.vy - e1.vy;
              
              const velAlongNormal = rvx * nx + rvy * ny;
              
              // Only resolve if moving towards each other
              if (velAlongNormal < 0) {
                const restitution = 0.45; // bounciness coefficient
                let impulse = -(1 + restitution) * velAlongNormal;
                impulse /= 2; // Equal weight base representation

                e1.vx -= impulse * nx * e1Ratio * 2;
                e1.vy -= impulse * ny * e1Ratio * 2;
                e2.vx += impulse * nx * e2Ratio * 2;
                e2.vy += impulse * ny * e2Ratio * 2;
              }
            }
          }
        }
      }

      setRenderedEntities([...entitiesRef.current]);
      animationId = requestAnimationFrame(updatePhysicsFrame);
    };

    animationId = requestAnimationFrame(updatePhysicsFrame);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, isPaused, activeFocusId, gatheringState]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full min-h-[480px] overflow-hidden select-none"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #0d1e36 0%, #071326 50%, #020612 100%)',
      }}
    >
      {/* Background canvas of starry fireflies, ripples, and spotlights */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-90"
      />

      {/* Interactive Soap Bubble Elements layer */}
      <div className="absolute top-0 left-0 w-full h-full z-10">
        {renderedEntities.map((entity) => {
          // Hide newborn bubble entirely during its light gathering sequence to create the beautiful pop birth effect!
          const isHiddenDuringGathering = (entity.id === newArrivalId && gatheringState === 'gathering');
          
          if (isHiddenDuringGathering) return null;

          return (
            <IdeaEntity
              key={entity.id}
              idea={entity.idea}
              config={entity.config}
              x={entity.x}
              y={entity.y}
              size={entity.size}
              isNewlyAdded={entity.isNew}
              isFocused={entity.id === activeFocusId}
              onClick={() => onSelectIdea(entity.idea)}
            />
          );
        })}
      </div>
    </div>
  );
}
