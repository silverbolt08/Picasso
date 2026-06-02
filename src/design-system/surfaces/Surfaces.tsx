import React, { type ReactNode, useState } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';
import { ambientBreath } from '../motion/presets';
import type { SurfaceMode } from '../../theme/themeTypes';

interface SurfaceProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  isHoverable?: boolean;
}

// ─── Scanline Overlay ────────────────────────────────────────────────────
// CRT-style scanline effect for terminal surface modes.

function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        opacity: 0.5,
        mixBlendMode: 'multiply',
      }}
    />
  );
}

// ─── Paper Texture Overlay ───────────────────────────────────────────────
// Warm grain texture for editorial surface modes.

function PaperTextureOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }}
    />
  );
}

// ─── Hover Behavior Router ───────────────────────────────────────────────
// Reads theme.motion.hoverBehavior to determine card interaction style.

function useHoverBehavior(
  _accent: string,
  isLight: boolean,
  isHoverable: boolean,
) {
  const { theme } = useTheme();
  const behavior = theme.motion.hoverBehavior ?? 'tilt';
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (behavior !== 'tilt' && behavior !== 'glow') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (behavior === 'tilt') {
      const maxTilt = isLight ? 0.8 : 1.8;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      setTilt({
        x: ((y - centerY) / centerY) * -maxTilt,
        y: ((x - centerX) / centerX) * maxTilt,
      });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Build transform based on behavior
  let transformStyle = 'none';
  if (isHovered && isHoverable) {
    switch (behavior) {
      case 'tilt':
        transformStyle = `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isLight ? '-3px' : '-6px'})`;
        break;
      case 'lift':
        transformStyle = `translateY(${isLight ? '-3px' : '-6px'})`;
        break;
      case 'scale':
        transformStyle = `scale(${theme.motion.hoverScale ?? 1.015})`;
        break;
      case 'glow':
      case 'none':
        transformStyle = 'none';
        break;
    }
  }

  return {
    isHovered,
    coords,
    transformStyle,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    behavior,
  };
}

// ─── Surface Mode Style Builder ──────────────────────────────────────────
// Computes styles based on surfaceMode for radically different visual structures.

function useSurfaceModeStyles(
  _tier: 'hero' | 'primary' | 'secondary',
  isHovered: boolean,
) {
  const { theme } = useTheme();
  const mode: SurfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';
  const isLight = theme.meta.appearance === 'light';

  const base = {
    backgroundColor: theme.colors.cardBackground || theme.colors.surface,
    borderRadius: theme.cardStyle.borderRadius,
    padding: theme.spacing.cardPadding,
    border: `${theme.cardStyle.borderWidth ?? '1px'} solid ${theme.colors.border}`,
    boxShadow: isHovered ? (theme.cardStyle.hoverEffect || theme.cardStyle.shadow) : theme.cardStyle.shadow,
    backdropFilter: undefined as string | undefined,
    WebkitBackdropFilter: undefined as string | undefined,
  };

  switch (mode) {
    // ── Elevated (Apple): deep shadows, no borders ──────────────────────
    case 'elevated':
      return {
        ...base,
        border: 'none',
        boxShadow: isHovered
          ? (theme.cardStyle.hoverEffect || '0 30px 60px -15px rgba(0,0,0,0.6)')
          : (theme.cardStyle.shadow || '0 20px 50px -15px rgba(0,0,0,0.5)'),
      };

    // ── Glass (Cyberpunk/Luxury): translucent + blur ────────────────────
    case 'glass':
      return {
        ...base,
        backgroundColor: isLight
          ? 'rgba(255, 255, 255, 0.6)'
          : `${theme.colors.cardBackground || 'rgba(10,15,30,0.6)'}`,
        backdropFilter: `blur(${theme.cardStyle.backdropBlur || '20px'})`,
        WebkitBackdropFilter: `blur(${theme.cardStyle.backdropBlur || '20px'})`,
      };

    // ── Bordered (Default): standard borders + shadows ──────────────────
    case 'bordered':
      return base;

    // ── Invisible: no chrome, data floats ────────────────────────────────
    case 'invisible':
      return {
        ...base,
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        borderRadius: '0px',
      };

    // ── Terminal: sharp corners, opaque, heavy borders ───────────────────
    case 'terminal':
      return {
        ...base,
        borderRadius: '0px',
        border: `${theme.cardStyle.borderWidth || '1px'} solid ${theme.colors.border}`,
        boxShadow: 'none',
        backgroundColor: theme.colors.cardBackground || theme.colors.surface,
        backdropFilter: undefined,
        WebkitBackdropFilter: undefined,
      };

    // ── Editorial: paper-like, subtle shadows, generous padding ─────────
    case 'editorial': {
      const editorialShadow = isLight
        ? '0 1px 4px rgba(0,0,0,0.02), 0 8px 24px -8px rgba(0,0,0,0.04)'
        : '0 2px 8px rgba(0,0,0,0.1)';
      return {
        ...base,
        backgroundColor: isLight ? '#ffffff' : theme.colors.cardBackground,
        boxShadow: isHovered
          ? (theme.cardStyle.hoverEffect || editorialShadow)
          : editorialShadow,
        borderRadius: theme.cardStyle.borderRadius || '8px',
      };
    }

    default:
      return base;
  }
}

// ─── HeroSurface ─────────────────────────────────────────────────────────

export const HeroSurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', glowColor, isHoverable = true, style, ...props }, ref) => {
    const { theme } = useTheme();
    const accent = glowColor || theme.colors.accentPrimary;
    const isLight = theme.meta.appearance === 'light';
    const hover = useHoverBehavior(accent, isLight, isHoverable);
    const transitionSpeed = theme.motion.transitionSpeed ?? '300ms';
    const easing = theme.motion.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';
    const surfaceStyles = useSurfaceModeStyles('hero', hover.isHovered);
    const surfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';

    return (
      <motion.div
        ref={ref}
        onMouseMove={hover.handleMouseMove}
        onMouseEnter={hover.handleMouseEnter}
        onMouseLeave={hover.handleMouseLeave}
        style={{
          ...surfaceStyles,
          position: 'relative',
          overflow: 'hidden',
          transform: hover.transformStyle,
          transition: `transform ${transitionSpeed} ${easing}, box-shadow ${transitionSpeed} ${easing}`,
          ...style,
        }}
        className={`relative ${className}`}
        {...props}
      >
        {/* Glow flare — suppressed for flat/none/terminal/invisible modes */}
        {surfaceMode !== 'terminal' && surfaceMode !== 'invisible' && theme.cardStyle.elevationModel !== 'flat' && (
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
              opacity: isLight ? 0.04 : 0.20,
            }}
          />
        )}

        {/* Glow hover overlay — only for glow/tilt behavior */}
        {hover.isHovered && (hover.behavior === 'glow' || hover.behavior === 'tilt') && surfaceMode !== 'terminal' && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: isLight
                ? `radial-gradient(400px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}06, transparent 80%)`
                : `radial-gradient(400px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}15, transparent 80%)`,
            }}
          />
        )}

        {/* Inner glass highlight — controlled by DNA */}
        {theme.cardStyle.innerGlow && surfaceMode !== 'terminal' && surfaceMode !== 'invisible' && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: surfaceStyles.borderRadius,
              boxShadow: isLight
                ? 'inset 0 1px 0px rgba(255, 255, 255, 0.9)'
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
            }}
          />
        )}

        {/* Scanline overlay for terminal mode */}
        {theme.cardStyle.scanlineEffect && <ScanlineOverlay />}

        {/* Paper texture for editorial mode */}
        {theme.cardStyle.paperTexture && <PaperTextureOverlay />}

        {children}
      </motion.div>
    );
  }
);

HeroSurface.displayName = 'HeroSurface';

// ─── PrimarySurface ──────────────────────────────────────────────────────

export const PrimarySurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', glowColor, isHoverable = true, style, ...props }, ref) => {
    const { theme } = useTheme();
    const accent = glowColor || theme.colors.accentPrimary;
    const isLight = theme.meta.appearance === 'light';
    const hover = useHoverBehavior(accent, isLight, isHoverable);
    const transitionSpeed = theme.motion.transitionSpeed ?? '300ms';
    const easing = theme.motion.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';
    const surfaceStyles = useSurfaceModeStyles('primary', hover.isHovered);
    const surfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';

    return (
      <motion.div
        ref={ref}
        onMouseMove={hover.handleMouseMove}
        onMouseEnter={hover.handleMouseEnter}
        onMouseLeave={hover.handleMouseLeave}
        style={{
          ...surfaceStyles,
          position: 'relative',
          overflow: 'hidden',
          transform: hover.transformStyle,
          transition: `transform ${transitionSpeed} ${easing}, box-shadow ${transitionSpeed} ${easing}`,
          ...style,
        }}
        className={`relative ${className}`}
        {...props}
      >
        {hover.isHovered && (hover.behavior === 'glow' || hover.behavior === 'tilt') && surfaceMode !== 'terminal' && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: isLight
                ? `radial-gradient(350px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}04, transparent 80%)`
                : `radial-gradient(350px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}12, transparent 80%)`,
            }}
          />
        )}

        {theme.cardStyle.innerGlow && surfaceMode !== 'terminal' && surfaceMode !== 'invisible' && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: surfaceStyles.borderRadius,
              boxShadow: isLight
                ? 'inset 0 1px 0px rgba(255, 255, 255, 0.8)'
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.02)',
            }}
          />
        )}

        {theme.cardStyle.scanlineEffect && <ScanlineOverlay />}
        {theme.cardStyle.paperTexture && <PaperTextureOverlay />}

        {children}
      </motion.div>
    );
  }
);

PrimarySurface.displayName = 'PrimarySurface';

// ─── SecondarySurface ────────────────────────────────────────────────────

export const SecondarySurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', glowColor, isHoverable = true, style, ...props }, ref) => {
    const { theme } = useTheme();
    const accent = glowColor || theme.colors.accentPrimary;
    const isLight = theme.meta.appearance === 'light';
    const hover = useHoverBehavior(accent, isLight, isHoverable);
    const transitionSpeed = theme.motion.transitionSpeed ?? '300ms';
    const easing = theme.motion.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';
    const surfaceStyles = useSurfaceModeStyles('secondary', hover.isHovered);
    const surfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';

    return (
      <motion.div
        ref={ref}
        onMouseMove={hover.handleMouseMove}
        onMouseEnter={hover.handleMouseEnter}
        onMouseLeave={hover.handleMouseLeave}
        style={{
          ...surfaceStyles,
          position: 'relative',
          overflow: 'hidden',
          transform: hover.transformStyle,
          transition: `transform ${transitionSpeed} ${easing}, box-shadow ${transitionSpeed} ${easing}`,
          ...style,
        }}
        className={`relative ${className}`}
        {...props}
      >
        {hover.isHovered && hover.behavior !== 'none' && surfaceMode !== 'terminal' && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: isLight
                ? `radial-gradient(300px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}03, transparent 80%)`
                : `radial-gradient(300px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}08, transparent 80%)`,
            }}
          />
        )}

        {theme.cardStyle.scanlineEffect && <ScanlineOverlay />}
        {theme.cardStyle.paperTexture && <PaperTextureOverlay />}

        {children}
      </motion.div>
    );
  }
);

SecondarySurface.displayName = 'SecondarySurface';

// ─── AmbientSurface ─────────────────────────────────────────────────────
// The page-level background surface. Morphs based on surfaceMode.

export const AmbientSurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', style, ...props }, ref) => {
    const { theme } = useTheme();
    const isLight = theme.meta.appearance === 'light';
    const surfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';
    const hasMotion = theme.motion.sectionEntrance !== 'none' && theme.motion.transitionSpeed !== '0ms';

    // ── Terminal ambient: scanline grid, no gradient spheres ──────────────
    if (surfaceMode === 'terminal') {
      return (
        <motion.div
          ref={ref}
          style={{
            backgroundColor: theme.colors.background,
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden',
            ...style,
          }}
          className={`relative ${className}`}
          {...props}
        >
          {/* CRT edge glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: `inset 0 0 120px 40px ${theme.colors.background}`,
              opacity: 0.6,
            }}
          />
          {/* Scanline grid */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
              opacity: 0.4,
            }}
          />
          <div className="relative z-10">{children}</div>
        </motion.div>
      );
    }

    // ── Editorial ambient: clean paper, warm subtle grain ─────────────────
    if (surfaceMode === 'editorial') {
      return (
        <motion.div
          ref={ref}
          style={{
            backgroundColor: theme.colors.background,
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden',
            ...style,
          }}
          className={`relative ${className}`}
          {...props}
        >
          {theme.cardStyle.paperTexture && (
            <div className="pointer-events-none absolute inset-0">
              <PaperTextureOverlay />
            </div>
          )}
          <div className="relative z-10">{children}</div>
        </motion.div>
      );
    }

    // ── Elevated/Apple ambient: minimal, near-invisible gradient ──────────
    if (surfaceMode === 'elevated') {
      return (
        <motion.div
          ref={ref}
          style={{
            backgroundColor: theme.colors.background,
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden',
            ...style,
          }}
          className={`relative ${className}`}
          {...props}
        >
          {hasMotion && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute top-0 left-1/3 h-[400px] w-[600px] rounded-full blur-[160px]"
                style={{
                  background: `radial-gradient(circle, ${theme.colors.accentPrimary}08 0%, transparent 70%)`,
                }}
              />
            </div>
          )}
          <div className="relative z-10">{children}</div>
        </motion.div>
      );
    }

    // ── Default / Glass ambient: gradient spheres + dot grid ──────────────
    const sphere1Variants = (isLight ? {
      animate: {
        scale: [1, 1.03, 0.97, 1],
        opacity: [0.04, 0.07, 0.04],
        transition: { duration: 35, repeat: Infinity, ease: 'easeInOut' }
      }
    } : ambientBreath) as any;

    const sphere2Variants = (isLight ? {
      animate: {
        scale: [1, 0.98, 1.02, 1],
        opacity: [0.03, 0.05, 0.03],
        transition: { duration: 25, repeat: Infinity, ease: 'easeInOut' }
      }
    } : {
      animate: {
        scale: [1, 0.95, 1.05, 1],
        opacity: [0.05, 0.1, 0.05],
        transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' }
      }
    }) as any;

    // Glass mode gets more saturated gradient spheres
    const glassBoost = surfaceMode === 'glass' ? 1.5 : 1;

    return (
      <motion.div
        ref={ref}
        style={{
          backgroundColor: theme.colors.background,
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          overflow: 'hidden',
          ...style,
        }}
        className={`relative ${className}`}
        {...props}
      >
        {/* Living gradient spheres — suppressed for flat themes */}
        {hasMotion && theme.cardStyle.elevationModel !== 'flat' && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              variants={sphere1Variants}
              animate="animate"
              className="absolute -top-40 left-1/4 h-[600px] w-[800px] rounded-full blur-[120px]"
              style={{
                background: isLight 
                  ? `radial-gradient(circle, ${theme.colors.accentPrimary}06 0%, ${theme.colors.accentSecondary}03 60%, transparent 80%)`
                  : `radial-gradient(circle, ${theme.colors.accentPrimary}${Math.round(0x25 * glassBoost).toString(16)} 0%, ${theme.colors.accentSecondary}10 50%, transparent 70%)`,
                transformOrigin: 'center center',
              }}
            />
            <motion.div
              variants={sphere2Variants}
              animate="animate"
              className="absolute -bottom-60 right-1/4 h-[500px] w-[700px] rounded-full blur-[100px]"
              style={{
                background: isLight
                  ? `radial-gradient(circle, ${theme.colors.accentSecondary}05 0%, ${theme.colors.accentPrimary}02 60%, transparent 80%)`
                  : `radial-gradient(circle, ${theme.colors.accentSecondary}${Math.round(0x20 * glassBoost).toString(16)} 0%, ${theme.colors.accentPrimary}05 50%, transparent 70%)`,
              }}
            />

            {/* Dot Grid Layer */}
            {theme.cardStyle.surfaceTexture !== 'clean' || !isLight ? (
              <div
                className="absolute inset-0"
                style={{
                  opacity: isLight ? 0.015 : 0.03,
                  backgroundImage: `radial-gradient(${isLight ? theme.colors.border : theme.colors.textPrimary} 1.5px, transparent 1.5px)`,
                  backgroundSize: '24px 24px',
                }}
              />
            ) : null}
          </div>
        )}
        
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

AmbientSurface.displayName = 'AmbientSurface';
export type { SurfaceProps };