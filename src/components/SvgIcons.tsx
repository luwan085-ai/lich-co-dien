import Svg, { Path, Rect, Circle } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

/** Calendar SVG Icon — HÔM NAY */
export function CalendarIcon({ size = 22, color = '#635A52' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2.5"
        stroke={color}
        strokeWidth="2"
      />
      <Path d="M3 9.5H21" stroke={color} strokeWidth="2" />
      <Path d="M7 3V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M17 3V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1.2" fill={color} />
      <Circle cx="12" cy="14" r="1.2" fill={color} />
      <Circle cx="16" cy="14" r="1.2" fill={color} />
    </Svg>
  );
}

/** Grid SVG Icon — THÁNG */
export function GridIcon({ size = 22, color = '#635A52' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <Rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <Rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <Rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

/** Sparkles SVG Icon — TỬ VI */
export function SparklesIcon({ size = 22, color = '#635A52' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L14.2 9.2L21.4 11.4L14.2 13.6L12 20.8L9.8 13.6L2.6 11.4L9.8 9.2L12 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M19 2L20 5L23 6L20 7L19 10L18 7L15 6L18 5L19 2Z"
        fill={color}
      />
    </Svg>
  );
}

/** Profile SVG Icon — CÁ NHÂN */
export function ProfileIcon({ size = 22, color = '#635A52' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7.5" r="4.5" stroke={color} strokeWidth="2" />
      <Path
        d="M4.5 20C4.5 16.4 7.9 13.5 12 13.5C16.1 13.5 19.5 16.4 19.5 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Funnel SVG Icon — 깔때기 버튼 */
export function FunnelIcon({ size = 20, color = '#8F7328' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 4.5H20.5L13.5 12.8V18.5L10.5 20.5V12.8L3.5 4.5Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
