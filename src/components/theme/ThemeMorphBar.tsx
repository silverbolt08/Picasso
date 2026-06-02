import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { presetRegistry } from '../../theme/presets';

// ─── Preset Icons ────────────────────────────────────────────────────────
// Minimal visual identifiers for each preset.

const PRESET_ICONS: Record<string, string> = {
  'apple-executive': '◉',
  'bloomberg-terminal': '▣',
  'editorial-magazine': '◈',
  'cyberpunk-neon': '◆',
  'luxury-fintech': '◇',
  'military-command': '▥',
  'scientific-research': '○',
};

// Primary 5 presets to show by default
const PRIMARY_PRESET_IDS = [
  'apple-executive',
  'bloomberg-terminal',
  'editorial-magazine',
  'cyberpunk-neon',
  'luxury-fintech',
];

export default function ThemeMorphBar() {
  const { theme, source, applyPreset } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const currentPresetId = source.type === 'preset' ? source.presetId : null;
  const surfaceMode = theme.cardStyle.surfaceMode ?? 'bordered';
  const isTerminal = surfaceMode === 'terminal';

  const visiblePresets = showAll
    ? presetRegistry
    : presetRegistry.filter(p => PRIMARY_PRESET_IDS.includes(p.id));

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: isTerminal ? '0px' : '12px',
          backgroundColor: theme.meta.appearance === 'dark'
            ? 'rgba(20, 20, 30, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: isTerminal ? 'none' : '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: isTerminal ? 'none' : 'blur(16px)',
          color: theme.colors.accentPrimary,
          cursor: 'pointer',
          fontSize: '18px',
          fontFamily: theme.typography.monoFont,
        }}
        title="Open Theme Morph Bar"
        id="theme-morph-toggle"
      >
        🎨
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50"
      style={{
        transform: 'translateX(-50%)',
        borderRadius: isTerminal ? '0px' : '16px',
        backgroundColor: theme.meta.appearance === 'dark'
          ? 'rgba(12, 14, 20, 0.92)'
          : 'rgba(255, 255, 255, 0.92)',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: isTerminal
          ? `0 0 0 1px ${theme.colors.border}`
          : '0 12px 48px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        backdropFilter: isTerminal ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: isTerminal ? 'none' : 'blur(20px)',
        padding: '12px 16px',
        maxWidth: '90vw',
      }}
      id="theme-morph-bar"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Label */}
        <span
          style={{
            fontFamily: isTerminal ? theme.typography.monoFont : theme.typography.bodyFont,
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: theme.colors.textMuted,
            marginRight: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          {isTerminal ? '> THEME' : 'Theme'}
        </span>

        {/* Preset buttons */}
        {visiblePresets.map((preset) => {
          const isActive = currentPresetId === preset.id;
          const icon = PRESET_ICONS[preset.id] || '●';

          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id, preset.name, preset.tokens)}
              className="flex items-center gap-1.5 transition-all"
              style={{
                padding: '6px 12px',
                borderRadius: isTerminal ? '0px' : '8px',
                backgroundColor: isActive
                  ? `${theme.colors.accentPrimary}20`
                  : 'transparent',
                border: isActive
                  ? `1px solid ${theme.colors.accentPrimary}40`
                  : `1px solid transparent`,
                color: isActive
                  ? theme.colors.accentPrimary
                  : theme.colors.textSecondary,
                fontFamily: isTerminal ? theme.typography.monoFont : theme.typography.bodyFont,
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: isTerminal ? '0.05em' : '0',
                transition: 'all 150ms ease',
              }}
              title={preset.description}
              id={`morph-preset-${preset.id}`}
            >
              <span style={{ fontSize: '10px' }}>{icon}</span>
              <span>{isTerminal ? preset.name.toUpperCase() : preset.name}</span>
            </button>
          );
        })}

        {/* Show more / less */}
        {!showAll && presetRegistry.length > PRIMARY_PRESET_IDS.length && (
          <button
            onClick={() => setShowAll(true)}
            style={{
              padding: '6px 8px',
              borderRadius: isTerminal ? '0px' : '8px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: theme.colors.textMuted,
              fontFamily: theme.typography.bodyFont,
              fontSize: '9px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            +{presetRegistry.length - PRIMARY_PRESET_IDS.length} more
          </button>
        )}
        {showAll && presetRegistry.length > PRIMARY_PRESET_IDS.length && (
          <button
            onClick={() => setShowAll(false)}
            style={{
              padding: '6px 8px',
              borderRadius: isTerminal ? '0px' : '8px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: theme.colors.textMuted,
              fontFamily: theme.typography.bodyFont,
              fontSize: '9px',
              cursor: 'pointer',
            }}
          >
            Less
          </button>
        )}

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: theme.colors.divider,
            marginLeft: '4px',
            marginRight: '4px',
          }}
        />

        {/* Collapse */}
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            padding: '4px 8px',
            borderRadius: isTerminal ? '0px' : '6px',
            backgroundColor: 'transparent',
            border: 'none',
            color: theme.colors.textMuted,
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: theme.typography.monoFont,
          }}
          title="Minimize"
        >
          ✕
        </button>
      </div>

      {/* Active preset description */}
      {currentPresetId && (
        <p
          className="mt-2"
          style={{
            fontFamily: isTerminal ? theme.typography.monoFont : theme.typography.bodyFont,
            fontSize: '9px',
            color: theme.colors.textMuted,
            textAlign: 'center',
            opacity: 0.7,
            fontStyle: surfaceMode === 'editorial' ? 'italic' : 'normal',
          }}
        >
          {presetRegistry.find(p => p.id === currentPresetId)?.description}
        </p>
      )}
    </div>
  );
}
