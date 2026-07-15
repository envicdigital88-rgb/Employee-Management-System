import React, { useEffect, useState } from 'react';

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'fade-out'>('loading');

  useEffect(() => {
    // Minimum display time for branding + let everything load
    const timer = setTimeout(() => {
      setPhase('fade-out');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'fade-out') {
      const exitTimer = setTimeout(onComplete, 600);
      return () => clearTimeout(exitTimer);
    }
  }, [phase, onComplete]);

  return (
    <div
      className={`preloader ${phase === 'fade-out' ? 'preloader--exit' : ''}`}
      role="status"
      aria-label="Loading application"
    >
      {/* Ambient glow backdrop */}
      <div className="preloader__glow" />

      {/* Orbiting ring of dots */}
      <div className="preloader__orbit">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="preloader__dot"
            style={{
              '--dot-index': i,
              '--dot-total': 12,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Logo image */}
      <div className="preloader__logo-wrap">
        <img
          src="/images/envic-logo.png"
          alt="ENVIC Digital"
          className="preloader__logo"
          draggable={false}
        />
      </div>

      {/* Progress bar */}
      <div className="preloader__progress-track">
        <div className="preloader__progress-bar" />
      </div>

      {/* Subtext */}
      <p className="preloader__text">Loading&nbsp;your&nbsp;workspace&hellip;</p>
    </div>
  );
}
