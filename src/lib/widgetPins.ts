import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = 'lich_widget_pins_v1';

export type WidgetId = 'news' | 'markets' | 'steps' | 'horoscope';

export type WidgetPinState = {
  /** Expanded = true */
  expanded: Record<WidgetId, boolean>;
  pinned: Record<WidgetId, boolean>;
};

const DEFAULT: WidgetPinState = {
  expanded: { news: true, markets: true, steps: false, horoscope: false },
  pinned: { news: false, markets: false, steps: false, horoscope: false },
};

export async function loadWidgetPins(): Promise<WidgetPinState> {
  try {
    const raw = await AsyncStorage.getItem(PIN_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as WidgetPinState;
    return {
      expanded: { ...DEFAULT.expanded, ...parsed.expanded },
      pinned: { ...DEFAULT.pinned, ...parsed.pinned },
    };
  } catch {
    return DEFAULT;
  }
}

export async function saveWidgetPins(state: WidgetPinState) {
  await AsyncStorage.setItem(PIN_KEY, JSON.stringify(state));
}

/** Free tier: unpinned widgets snap open again when the calendar day changes. */
export function resetUnpinnedExpanded(state: WidgetPinState): WidgetPinState {
  const expanded = { ...state.expanded };
  (Object.keys(expanded) as WidgetId[]).forEach((id) => {
    if (!state.pinned[id]) {
      expanded[id] = DEFAULT.expanded[id] ?? true;
    }
  });
  return { ...state, expanded };
}
