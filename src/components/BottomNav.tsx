import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export type TabId = 'today' | 'month' | 'horoscope' | 'profile';

const TABS: {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'today', label: 'HÔM NAY', icon: 'calendar-outline', iconActive: 'calendar' },
  { id: 'month', label: 'THÁNG', icon: 'grid-outline', iconActive: 'grid' },
  { id: 'horoscope', label: 'TỬ VI', icon: 'sparkles-outline', iconActive: 'sparkles' },
  { id: 'profile', label: 'CÁ NHÂN', icon: 'person-outline', iconActive: 'person' },
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
        const color = isActive ? colors.crimson : colors.navInactive;
        return (
          <Pressable
            key={tab.id}
            style={styles.item}
            onPress={() => onPressTab(tab.id)}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={20}
              color={color}
            />
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
    paddingBottom: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
