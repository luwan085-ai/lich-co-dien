import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/tokens';

const KEY = 'lich_stamp_panels_v1';

type PanelId = 'mood' | 'praise' | 'commitment' | 'glance';

type PanelState = Record<PanelId, boolean>;

const DEFAULT: PanelState = {
  mood: true,
  praise: true,
  commitment: false,
  glance: false,
};

async function loadPanels(): Promise<PanelState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as PanelState) };
  } catch {
    return DEFAULT;
  }
}

async function savePanels(state: PanelState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

type Props = {
  panelId: PanelId;
  title: string;
  sub: string;
  /** Shown on the collapsed strip */
  summary?: string;
  fontFamily?: string;
  children: ReactNode;
};

export function CollapsibleStampPanel({
  panelId,
  title,
  sub,
  summary,
  fontFamily,
  children,
}: Props) {
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const panels = await loadPanels();
      if (!alive) return;
      setOpen(panels[panelId] ?? true);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [panelId]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      void (async () => {
        const panels = await loadPanels();
        await savePanels({ ...panels, [panelId]: next });
      })();
      return next;
    });
  };

  if (!ready) {
    return <View style={[styles.wrap, styles.loading]} />;
  }

  if (!open) {
    return (
      <Pressable style={styles.strip} onPress={toggle}>
        <View style={styles.stripAccent} />
        <View style={styles.stripBody}>
          <Text style={[styles.stripTitle, fontFamily ? { fontFamily } : null]}>
            {title}
          </Text>
          <Text style={styles.stripSub} numberOfLines={1}>
            {summary || sub}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.inkFaint} />
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.header} onPress={toggle}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, fontFamily ? { fontFamily } : null]}>
            {title}
          </Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>
        <Ionicons name="chevron-up" size={18} color={colors.inkFaint} />
      </Pressable>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  loading: {
    minHeight: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  sub: {
    marginTop: 3,
    fontSize: 11,
    color: colors.inkFaint,
    paddingRight: 4,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  stripAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.crimson,
  },
  stripBody: {
    flex: 1,
    paddingLeft: 4,
  },
  stripTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.6,
  },
  stripSub: {
    marginTop: 2,
    fontSize: 11,
    color: colors.inkMuted,
  },
});
