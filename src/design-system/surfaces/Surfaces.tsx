import React, { type ReactNode, useState } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';
import { ambientBreath } from '../motion/presets';

interface SurfaceProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  isHoverable?: boolean;
}

// ─── Hover Behavior Router ───────────────────────────────────────────────────
// Reads theme.motion.hoverBehavior to determine card interaction style.

function useHoverBehavior(
  accent: string,
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

// ─── HeroSurface ─────────────────────────────────────────────────────────────

export const HeroSurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', glowColor, isHoverable = true, style, ...props }, ref) => {
    const { theme } = useTheme();
    const accent = glowColor || theme.colors.accentPrimary;
    const isLight = theme.meta.appearance === 'light';
    const hover = useHoverBehavior(accent, isLight, isHoverable);
    const transitionSpeed = theme.motion.transitionSpeed ?? '300ms';
    const easing = theme.motion.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

    const cardShadow = hover.isHovered
      ? (theme.cardStyle.hoverEffect || theme.cardStyle.shadow)
      : theme.cardStyle.shadow;

    // Border based on DNA
    const borderWidth = theme.cardStyle.borderWidth ?? '1px';
    const cardBorder = theme.cardStyle.borderStyle === 'none'
      ? 'none'
      : `${borderWidth} solid ${isLight ? theme.colors.border : theme.colors.accentPrimary}`;

    return (
      <motion.div
        ref={ref}
        onMouseMove={hover.handleMouseMove}
        onMouseEnter={hover.handleMouseEnter}
        onMouseLeave={hover.handleMouseLeave}
        style={{
          backgroundColor: theme.colors.cardBackground || theme.colors.surface,
          borderRadius: theme.cardStyle.borderRadius,
          border: cardBorder,
          boxShadow: cardShadow,
          padding: theme.spacing.cardPadding,
          position: 'relative',
          overflow: 'hidden',
          transform: hover.transformStyle,
          transition: `transform ${transitionSpeed} ${easing}, box-shadow ${transitionSpeed} ${easing}`,
          backdropFilter: theme.cardStyle.glassmorphism > 0 ? `blur(${theme.cardStyle.backdropBlur})` : undefined,
          WebkitBackdropFilter: theme.cardStyle.glassmorphism > 0 ? `blur(${theme.cardStyle.backdropBlur})` : undefined,
          ...style,
        }}
        className={`relative ${className}`}
        {...props}
      >
        {/* Glow flare — suppressed for flat/none border style */}
        {theme.cardStyle.elevationModel !== 'flat' && (
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
              opacity: isLight ? 0.04 : 0.20,
            }}
          />
        )}

        {/* Glow hover overlay — only for glow behavior or general hover */}
        {hover.isHovered && (hover.behavior === 'glow' || hover.behavior === 'tilt') && (
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
        {theme.cardStyle.innerGlow && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: theme.cardStyle.borderRadius,
              boxShadow: isLight
                ? 'inset 0 1px 0px rgba(255, 255, 255, 0.9)'
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
            }}
          />
        )}

        {children}
      </motion.div>
    );
  }
);

HeroSurface.displayName = 'HeroSurface';

// ─── PrimarySurface ──────────────────────────────────────────────────────────

export const PrimarySurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', glowColor, isHoverable = true, style, ...props }, ref) => {
    const { theme } = useTheme();
    const accent = glowColor || theme.colors.accentPrimary;
    const isLight = theme.meta.appearance === 'light';
    const hover = useHoverBehavior(accent, isLight, isHoverable);
    const transitionSpeed = theme.motion.transitionSpeed ?? '300ms';
    const easing = theme.motion.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

    const cardShadow = hover.isHovered
      ? (theme.cardStyle.hoverEffect || theme.cardStyle.shadow)
      : theme.cardStyle.shadow;

    return (
      <motion.div
        ref={ref}
        onMouseMove={hover.handleMouseMove}
        onMouseEnter={hover.handleMouseEnter}
        onMouseLeave={hover.handleMouseLeave}
        style={{
          backgroundColor: theme.colors.cardBackground || theme.colors.surface,
          borderRadius: theme.cardStyle.borderRadius,
          border: theme.cardStyle.borderStyle === 'none' ? 'none' : `${theme.cardStyle.borderWidth ?? '1px'} solid ${theme.colors.border}`,
          boxShadow: cardShadow,
          padding: theme.spacing.cardPadding,
          position: 'relative',
          overflow: 'hidden',
          transform: hover.transformStyle,
          transition: `transform ${transitionSpeed} ${easing}, box-shadow ${transitionSpeed} ${easing}`,
          backdropFilter: theme.cardStyle.glassmorphism > 0 ? `blur(${theme.cardStyle.backdropBlur})` : undefined,
          WebkitBackdropFilter: theme.cardStyle.glassmorphism > 0 ? `blur(${theme.cardStyle.backdropBlur})` : undefined,
          ...style,
        }}
        className={`relative ${className}`}
        {...props}
      >
        {hover.isHovered && (hover.behavior === 'glow' || hover.behavior === 'tilt') && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: isLight
                ? `radial-gradient(350px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}04, transparent 80%)`
                : `radial-gradient(350px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}12, transparent 80%)`,
            }}
          />
        )}

        {theme.cardStyle.innerGlow && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: theme.cardStyle.borderRadius,
              boxShadow: isLight
                ? 'inset 0 1px 0px rgba(255, 255, 255, 0.8)'
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.02)',
            }}
          />
        )}

        {children}
      </motion.div>
    );
  }
);

PrimarySurface.displayName = 'PrimarySurface';

// ─── SecondarySurface ────────────────────────────────────────────────────────

export const SecondarySurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', glowColor, isHoverable = true, style, ...props }, ref) => {
    const { theme } = useTheme();
    const accent = glowColor || theme.colors.accentPrimary;
    const isLight = theme.meta.appearance === 'light';
    const hover = useHoverBehavior(accent, isLight, isHoverable);
    const transitionSpeed = theme.motion.transitionSpeed ?? '300ms';
    const easing = theme.motion.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)';

    const cardShadow = hover.isHovered
      ? (theme.cardStyle.hoverEffect || theme.cardStyle.shadow)
      : theme.cardStyle.shadow;

    return (
      <motion.div
        ref={ref}
        onMouseMove={hover.handleMouseMove}
        onMouseEnter={hover.handleMouseEnter}
        onMouseLeave={hover.handleMouseLeave}
        style={{
          backgroundColor: theme.colors.cardBackground || theme.colors.surface,
          borderRadius: theme.cardStyle.borderRadius,
          border: theme.cardStyle.borderStyle === 'none' ? 'none' : `${theme.cardStyle.borderWidth ?? '1px'} solid ${theme.colors.border}`,
          boxShadow: cardShadow,
          padding: theme.spacing.cardPadding,
          position: 'relative',
          overflow: 'hidden',
          transform: hover.transformStyle,
          transition: `transform ${transitionSpeed} ${easing}, box-shadow ${transitionSpeed} ${easing}`,
          backdropFilter: theme.cardStyle.glassmorphism > 0 ? `blur(${theme.cardStyle.backdropBlur})` : undefined,
          WebkitBackdropFilter: theme.cardStyle.glassmorphism > 0 ? `blur(${theme.cardStyle.backdropBlur})` : undefined,
          ...style,
        }}
        className={`relative ${className}`}
        {...props}
      >
        {hover.isHovered && hover.behavior !== 'none' && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: isLight
                ? `radial-gradient(300px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}03, transparent 80%)`
                : `radial-gradient(300px circle at ${hover.coords.x}px ${hover.coords.y}px, ${accent}08, transparent 80%)`,
            }}
          />
        )}

        {children}
      </motion.div>
    );
  }
);

SecondarySurface.displayName = 'SecondarySurface';

// ─── AmbientSurface ─────────────────────────────────────────────────────────

export const AmbientSurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, className = '', style, ...props }, ref) => {
    const { theme } = useTheme();
    const isLight = theme.meta.appearance === 'light';
    const hasMotion = theme.motion.sectionEntrance !== 'none' && theme.motion.transitionSpeed !== '0ms';

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
                  : `radial-gradient(circle, ${theme.colors.accentPrimary}25 0%, ${theme.colors.accentSecondary}10 50%, transparent 70%)`,
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
                  : `radial-gradient(circle, ${theme.colors.accentSecondary}20 0%, ${theme.colors.accentPrimary}05 50%, transparent 70%)`,
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