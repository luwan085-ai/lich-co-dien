import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import {
  CalendarIcon,
  GridIcon,
  ProfileIcon,
  SparklesIcon,
} from './SvgIcons';

export type TabId = 'today' | 'month' | 'horoscope' | 'profile';

const TABS: {
  id: TabId;
  label: string;
}[] = [
  { id: 'today', label: 'HÔM NAY' },
  { id: 'month', label: 'THÁNG' },
  { id: 'horoscope', label: 'TỬ VI' },
  { id: 'profile', label: 'CÁ NHÂN' },
];

type Props = {
  active: TabId;
  fontFamily?: string;
  onPressTab: (id: TabId) => void;
};

export function BottomNav({ active, fontFamily, onPressTab }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const color = isActive ? colors.crimson : '#5C534A';
        return (
          <Pressable
            key={tab.id}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => onPressTab(tab.id)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            hitSlop={8}
          >
            {tab.id === 'today' ? <CalendarIcon size={23} color={color} /> : null}
            {tab.id === 'month' ? <GridIcon size={23} color={color} /> : null}
            {tab.id === 'horoscope' ? <SparklesIcon size={23} color={color} /> : null}
            {tab.id === 'profile' ? <ProfileIcon size={23} color={color} /> : null}
            <Text
              style={[
                styles.label,
                { color },
                fontFamily ? { fontFamily } : null,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minHeight: 50,
    justifyContent: 'center',
    paddingVertical: 3,
    borderTopWidth: 2.5,
    borderTopColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as object)
      : null),
  },
  itemActive: {
    borderTopColor: colors.crimson,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
