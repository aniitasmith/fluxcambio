export const COLORS = {
  primary: {
    orange: '#F7931A',
    gold: '#FFD700',
  },
  semantic: {
    success: 'emerald',
    info: 'blue',
    warning: 'amber',
    error: 'red',
  },
  background: {
    dark: '#0f0f1a',
    card: '#1a1a2e',
  },
} as const;

export const INPUT_STYLES = {
  base: 'glass-input h-14 text-2xl font-bold text-white placeholder:text-white/30 border-white/10',
  focus: {
    orange: 'focus:border-flux-orange/50 focus:ring-flux-orange/20',
    gold: 'focus:border-flux-gold/50 focus:ring-flux-gold/20',
    blue: 'focus:border-blue-400/50 focus:ring-blue-400/20',
  },
} as const;

export const TAB_TRIGGER_STYLES = {
  base: 'rounded-lg transition-all',
  active: 'data-[state=active]:bg-flux-orange data-[state=active]:text-black',
} as const;

export const GLOW_CLASSES = {
  orange: 'glow-orange',
  gold: 'glow-gold',
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;
