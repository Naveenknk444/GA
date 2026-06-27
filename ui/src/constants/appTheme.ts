/**
 * App-specific colors pulled from the mockups (the dark mountain-sunrise look).
 * Kept separate from the template's `theme.ts` so our design lives in one place.
 */

export const AppColors = {
  text: '#FFFFFF',
  textMuted: '#9AA4B2',
  accent: '#3B82F6', // the blue used for the active tab + "Create a Post" button

  // surfaces (warm near-black for a subtle Arizona desert base)
  screen: '#0B0908',
  tabBar: '#0C0A08',
  hairline: 'rgba(255,255,255,0.08)',
  tile: 'rgba(16,22,33,0.55)', // translucent dark card over the gradient
  tileBorder: 'rgba(255,255,255,0.09)',

  // tile accent colors (one per feature, matching the mockup)
  talk: '#4F8CFF',
  meetings: '#3FCF8E',
  recovery: '#9B8CFF',
  share: '#E0A53E',
} as const;

/**
 * Subtle Arizona desert gradient — a soft, muted clay/terracotta warmth that
 * fades into the dark base. Kept very light/low-intensity (not a strong sunset).
 * (Named SunsetGradient for backwards-compat; swap a real desert photo in later.)
 */
export const SunsetGradient = ['#1C1A20', '#2B2018', '#4A3526', '#15100C', '#0B0908'] as const;
export const SunsetLocations = [0, 0.34, 0.52, 0.72, 1] as const;
