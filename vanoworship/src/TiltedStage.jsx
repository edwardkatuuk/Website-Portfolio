import { useCallback, useEffect, useRef, useState } from 'react';
import { m, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

const tiltSpring = { stiffness: 220, damping: 26, mass: 0.65 };

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== 'undefined' && (window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ?? false)
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(hover: none) and (pointer: coarse)');
    if (!mq) return;
    const sync = () => setCoarse(mq.matches);
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return coarse;
}

/**
 * Interactive 3D perspective stage inspired by React Bits TiltedCard & SpotlightCard.
 * Uses GPU-only rotateX/rotateY springs and custom CSS pointer light tracking.
 */
export function TiltedStage3D({ children, className = '', maxTilt = 3.2, disabled = false }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, tiltSpring);
  const rotateY = useSpring(rawY, tiltSpring);

  const canTilt = !reduced && !disabled && !coarse;

  const handleMove = useCallback(
    e => {
      if (e.pointerType === 'touch') return;
      const el = ref.current;
      if (!el || !canTilt) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rawX.set((0.5 - py) * 2 * maxTilt);
      rawY.set((px - 0.5) * 2 * maxTilt);
      el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);
    },
    [canTilt, maxTilt, rawX, rawY]
  );

  const handleLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <div className="vw-tilt-perspective">
      <m.div
        ref={ref}
        className={`vw-tilt-surface ${className}`.trim()}
        style={canTilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        onPointerMove={canTilt ? handleMove : undefined}
        onPointerLeave={canTilt ? handleLeave : undefined}
      >
        {children}
      </m.div>
    </div>
  );
}

/**
 * Surface container with optional smooth scroll-reveal entrance.
 */
const spotlightEase = [0.22, 1, 0.36, 1];

export function SpotlightSurface({ as: Tag = 'article', children, className = '', delay = null }) {
  const MotionTag = Tag === 'div' ? m.div : m.article;

  if (delay === null) {
    return (
      <Tag className={`vw-spotlight-surface ${className}`.trim()}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={`vw-spotlight-surface ${className}`.trim()}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 1.3, delay, ease: spotlightEase }}
    >
      {children}
    </MotionTag>
  );
}
