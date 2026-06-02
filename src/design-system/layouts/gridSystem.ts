import { themeTokens } from '../tokens/themeTokens';

export const gridSystem = {
  container: {
    maxWidth: themeTokens.layout.maxWidth,
    mx: 'auto',
    px: themeTokens.spacing.pagePadding,
  },
  section: {
    className: 'flex flex-col',
    gap: themeTokens.spacing.sectionGap,
  },
  grids: {
    containerClass: 'grid grid-cols-1 md:grid-cols-12 w-full',
    hero: 'col-span-12',
    primary: 'col-span-12 md:col-span-6',
    supporting: 'col-span-12 sm:col-span-6 lg:col-span-4',
  },
};

export function getGridTierLayout(placement: 'hero' | 'primary' | 'supporting'): string {
  switch (placement) {
    case 'hero':
      return gridSystem.grids.hero;
    case 'primary':
      return gridSystem.grids.primary;
    case 'supporting':
      return gridSystem.grids.supporting;
    default:
      return gridSystem.grids.primary;
  }
}