import { EasyMenuSection, PageRoute } from '../types/sentinel';

export type AppPanelId =
  | 'helper-drawer'
  | 'alerts-training'
  | 'settings-tech'
  | 'home-flare'
  | 'home-kp'
  | 'home-wind'
  | 'home-gps';

export interface AppNavState {
  __sentinelNav: true;
  depth: number;
  route: PageRoute;
  easySection: EasyMenuSection | null;
  panel: AppPanelId | null;
}

const VALID_ROUTES: readonly PageRoute[] = [
  'welcome',
  'easy',
  'home',
  'weather',
  'helper',
  'alerts',
  'settings',
];

const VALID_EASY_SECTIONS: readonly EasyMenuSection[] = [
  'today',
  'sun',
  'earth',
  'warnings',
  'all-voice',
  'ai',
];

const VALID_PANELS: readonly AppPanelId[] = [
  'helper-drawer',
  'alerts-training',
  'settings-tech',
  'home-flare',
  'home-kp',
  'home-wind',
  'home-gps',
];

export function isValidRoute(value: unknown): value is PageRoute {
  return typeof value === 'string' && (VALID_ROUTES as readonly string[]).includes(value);
}

export function isValidEasySection(value: unknown): value is EasyMenuSection {
  return typeof value === 'string' && (VALID_EASY_SECTIONS as readonly string[]).includes(value);
}

export function isValidPanel(value: unknown): value is AppPanelId {
  return typeof value === 'string' && (VALID_PANELS as readonly string[]).includes(value);
}

export function isPanelValidForRoute(panel: AppPanelId | null, route: PageRoute): boolean {
  if (!panel) return false;
  if (panel === 'helper-drawer') return route === 'helper';
  if (panel === 'alerts-training') return route === 'alerts';
  if (panel === 'settings-tech') return route === 'settings';
  return route === 'home';
}

export function parseHashToNavLocation(hash: string): {
  route: PageRoute;
  easySection: EasyMenuSection | null;
} {
  const cleaned = hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (!cleaned) {
    return { route: 'welcome', easySection: null };
  }

  const parts = cleaned.split('/').filter(Boolean);
  const first = parts[0];
  if (!isValidRoute(first)) {
    return { route: 'welcome', easySection: null };
  }

  if (first === 'easy') {
    const second = parts[1];
    return {
      route: 'easy',
      easySection: isValidEasySection(second) ? second : null,
    };
  }

  return { route: first, easySection: null };
}

export function buildNavHash(state: Pick<AppNavState, 'route' | 'easySection'>): string {
  if (state.route === 'welcome') {
    return '';
  }
  if (state.route === 'easy') {
    return state.easySection ? `#/easy/${state.easySection}` : '#/easy';
  }
  return `#/${state.route}`;
}

export function buildNavUrl(
  state: Pick<AppNavState, 'route' | 'easySection'>,
  basePathname?: string,
  baseSearch?: string
): string {
  const pathname =
    basePathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const search =
    baseSearch ?? (typeof window !== 'undefined' ? window.location.search : '');
  const hash = buildNavHash(state);
  return `${pathname}${search}${hash}`;
}

export function normalizeHistoryState(rawState: unknown, fallbackHash: string): AppNavState {
  if (rawState && typeof rawState === 'object') {
    const candidate = rawState as Partial<AppNavState>;
    if (candidate.__sentinelNav === true && isValidRoute(candidate.route)) {
      const route = candidate.route;
      const easySection =
        route === 'easy' && isValidEasySection(candidate.easySection)
          ? candidate.easySection
          : null;
      const rawPanel = isValidPanel(candidate.panel) ? candidate.panel : null;
      const panel = isPanelValidForRoute(rawPanel, route) ? rawPanel : null;
      const depth =
        typeof candidate.depth === 'number' &&
        Number.isFinite(candidate.depth) &&
        candidate.depth >= 0
          ? Math.floor(candidate.depth)
          : 0;

      return {
        __sentinelNav: true,
        depth,
        route,
        easySection,
        panel,
      };
    }
  }

  const fromHash = parseHashToNavLocation(fallbackHash);
  return {
    __sentinelNav: true,
    depth: 0,
    route: fromHash.route,
    easySection: fromHash.easySection,
    panel: null,
  };
}

export function readInitialNavState(): AppNavState {
  if (typeof window === 'undefined') {
    return {
      __sentinelNav: true,
      depth: 0,
      route: 'welcome',
      easySection: null,
      panel: null,
    };
  }
  return normalizeHistoryState(window.history.state, window.location.hash);
}
