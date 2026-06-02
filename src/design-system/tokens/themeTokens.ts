export const themeTokens = {
  spacing: {
    pagePadding: 'clamp(2rem, 5vw, 6rem)',
    sectionGap: 'clamp(2.5rem, 5vw, 5rem)',
    gridGap: 'clamp(1.5rem, 3vw, 3rem)',
    cardPadding: {
      hero: 'clamp(2rem, 3.5vw, 3rem)',
      primary: 'clamp(1.5rem, 2.5vw, 2rem)',
      secondary: '1.5rem',
      supporting: '1.25rem',
    },
    elementGap: '1rem',
  },
  radius: {
    card: '24px',
    inner: '14px',
    pill: '9999px',
    input: '12px',
    chartBar: 8,
  },
  typography: {
    fonts: {
      display: 'Syne, sans-serif',
      heading: '"Inter Tight", sans-serif',
      body: '"DM Sans", sans-serif',
      mono: '"Space Grotesk", monospace',
    },
    tracking: {
      tightest: '-0.04em',
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.02em',
      widest: '0.1em',
    },
    lineHeight: {
      none: '1',
      tight: '1.1',
      snug: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    },
  },
  glow: {
    heroIntensity: '0 0 25px rgba(var(--accent-primary-rgb), 0.15)',
    primaryIntensity: '0 0 15px rgba(var(--accent-primary-rgb), 0.08)',
    borderGlow: '0 0 20px rgba(var(--accent-primary-rgb), 0.25)',
  },
  surfaces: {
    opacity: {
      glassBackground: 0.45,
      glassBorder: 0.08,
      hoverBorder: 0.15,
    },
    blur: {
      glass: '20px',
      tooltip: '16px',
    },
  },
  depth: {
    hero: {
      shadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 50px -10px rgba(var(--accent-primary-rgb), 0.15)',
      borderWidth: '2px',
      borderOpacity: 0.2,
      blur: '24px',
    },
    primary: {
      shadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4)',
      borderWidth: '1px',
      borderOpacity: 0.08,
      blur: '16px',
    },
    secondary: {
      shadow: '0 10px 25px -8px rgba(0, 0, 0, 0.2)',
      borderWidth: '1px',
      borderOpacity: 0.06,
      blur: '12px',
    },
    supporting: {
      shadow: '0 6px 16px -6px rgba(0, 0, 0, 0.15)',
      borderWidth: '1px',
      borderOpacity: 0.04,
      blur: '8px',
    },
  },
  transitions: {
    duration: {
      slow: '450ms',
      normal: '300ms',
      fast: '180ms',
    },
    easing: {
      spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      kinetic: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  },
  layout: {
    maxWidth: '1680px',
    headerHeight: '80px',
  },
};
