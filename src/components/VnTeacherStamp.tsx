import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { HoaBeNgoan, type FlowerFace } from './HoaBeNgoan';
import {
  buildInkVariance,
  INK_RED,
  type InkVariance,
} from '../lib/stampInk';
import { PRAISE_STAMPS, type Praise } from '../types/mood';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  praiseId: Praise;
  inkSeed?: number;
  size?: Size;
  rotate?: number;
  fontFamily?: string;
  face?: FlowerFace;
  inkColor?: string;
  style?: StyleProp<ViewStyle>;
};

const DIM: Record<
  Size,
  {
    flower: number;
    text: number;
    lineHeight: number;
    gap: number;
    padV: number;
    padH: number;
  }
> = {
  sm: { flower: 32, text: 18, lineHeight: 22, gap: 8, padV: 4, padH: 4 },
  md: { flower: 40, text: 24, lineHeight: 28, gap: 10, padV: 4, padH: 4 },
  lg: { flower: 56, text: 36, lineHeight: 42, gap: 14, padV: 6, padH: 6 },
};

const FALLBACK_INK: InkVariance = {
  opacity: 0.92,
  tiltJitter: 0,
  blotches: [],
  misses: [],
  rimAlpha: 0.85,
  washOpacity: 0.05,
};

function safeInk(seed: number): InkVariance {
  try {
    if (typeof buildInkVariance !== 'function') return FALLBACK_INK;
    const ink = buildInkVariance(seed);
    return {
      ...FALLBACK_INK,
      ...ink,
      blotches: ink?.blotches ?? [],
      misses: ink?.misses ?? [],
    };
  } catch {
    return FALLBACK_INK;
  }
}

function EdgeInk({ ink, color }: { ink: InkVariance; color: string }) {
  const blotches = ink.blotches ?? [];
  return (
    <View style={[StyleSheet.absoluteFill, styles.noHit]}>
      {blotches.map((b, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: b.left,
            top: b.top,
            width: b.width,
            height: b.height,
            borderRadius: 8,
            backgroundColor: color,
            opacity: b.opacity,
            transform: [{ rotate: `${b.rotate}deg` }],
          }}
        />
      ))}
    </View>
  );
}

/**
 * Catalog layout [hoa bé ngoan] + handwriting — M.166 style.
 */
export function VnTeacherStamp({
  praiseId,
  inkSeed = 1,
  size = 'md',
  rotate = 0,
  fontFamily,
  face = 'happy',
  inkColor = INK_RED,
  style,
}: Props) {
  const meta = PRAISE_STAMPS.find((p) => p.id === praiseId);
  if (!meta) return null;

  const d = DIM[size];
  const ink = safeInk(inkSeed);
  const color = inkColor;
  const tilt = rotate + (ink.tiltJitter ?? 0);

  return (
    <View
      style={[
        styles.wrap,
        {
          opacity: ink.opacity ?? 1,
          transform: [{ rotate: `${tilt}deg` }],
          paddingVertical: d.padV,
          paddingHorizontal: d.padH,
          gap: d.gap,
        },
        style,
      ]}
    >
      <HoaBeNgoan size={d.flower} color={color} face={face} />
      <View style={styles.textCol}>
        {meta.grade === 'premium' ? (
          <Text style={[styles.stars, { color }]} allowFontScaling={false}>
            ★ ★ ★
          </Text>
        ) : null}
        {meta.lines.map((line) => (
          <Text
            key={line}
            style={[
              styles.script,
              {
                color,
                fontSize: d.text,
                lineHeight: d.lineHeight,
              },
              fontFamily ? { fontFamily } : null,
            ]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            {line}
          </Text>
        ))}
      </View>
      <EdgeInk ink={ink} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  noHit: {
    pointerEvents: 'none',
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textCol: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  stars: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 1,
    textAlign: 'center',
  },
  script: {
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 0.15,
    includeFontPadding: false,
  },
});
