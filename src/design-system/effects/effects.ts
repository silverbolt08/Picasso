import { type CSSProperties } from 'react';
import type { ThemeTokens } from '../../theme/themeTypes';

/**
 * Generates custom visual inline styles for premium chart tooltips.
 * V2 — reads from Theme DNA chartStyle.tooltipStyle to produce different treatments.
 */
export function getPremiumTooltipStyle(theme: ThemeTokens, accentColor: string): CSSProperties {
  const isDark = theme.meta.appearance === 'dark';
  const tooltipStyle = theme.chartStyle.tooltipStyle ?? 'glass';
  const borderRadius = theme.cardStyle.borderRadius ?? '14px';
  const blur = theme.chartStyle.tooltipBlur ?? '12px';

  const base: CSSProperties = {
    padding: '0.75rem 1.125rem',
    fontFamily: theme.typography.bodyFont,
    transition: `all ${theme.motion.transitionSpeed ?? '200ms'} ${theme.motion.easing ?? 'cubic-bezier(0.16, 1, 0.3, 1)'}`,
  };

  switch (tooltipStyle) {
    case 'glass':
      return {
        ...base,
        backgroundColor: isDark ? 'rgba(17, 20, 27, 0.82)' : 'rgba(255, 255, 255, 0.88)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        borderRadius,
        boxShadow: isDark
          ? `0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 25px -5px ${accentColor}20, inset 0 1px 0px rgba(255, 255, 255, 0.04)`
          : `0 16px 36px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0px rgba(255, 255, 255, 0.6)`,
        backdropFilter: `blur(${blur})`,
        WebkitBackdropFilter: `blur(${blur})`,
      };

    case 'solid':
      return {
        ...base,
        backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius,
        boxShadow: isDark
          ? '0 12px 24px -8px rgba(0,0,0,0.5)'
          : '0 8px 20px -6px rgba(0,0,0,0.08)',
      };

    case 'minimal':
      return {
        ...base,
        backgroundColor: isDark ? 'rgba(20,20,30,0.95)' : 'rgba(255,255,255,0.98)',
        border: 'none',
        borderRadius: '4px',
        boxShadow: isDark
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        padding: '0.5rem 0.875rem',
      };

    case 'bordered':
      return {
        ...base,
        backgroundColor: isDark ? '#111111' : '#ffffff',
        border: `2px solid ${isDark ? theme.colors.border : 'rgba(0,0,0,0.12)'}`,
        borderRadius: '0px',
        boxShadow: 'none',
      };

    default:
      return {
        ...base,
        backgroundColor: isDark ? 'rgba(17, 20, 27, 0.82)' : 'rgba(255, 255, 255, 0.92)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        borderRadius,
        boxShadow: isDark
          ? `0 20px 40px -10px rgba(0, 0, 0, 0.7)`
          : `0 16px 36px -10px rgba(0, 0, 0, 0.08)`,
        backdropFilter: `blur(${blur})`,
        WebkitBackdropFilter: `blur(${blur})`,
      };
  }
}
