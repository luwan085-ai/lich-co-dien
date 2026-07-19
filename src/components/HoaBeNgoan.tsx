import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export type FlowerFace = 'happy' | 'sad';

type Props = {
  size: number;
  color: string;
  face?: FlowerFace;
  paperColor?: string;
};

/**
 * Two catalog faces:
 * - happy: smile reference (brows · dots · big crescent mouth)
 * - sad: average/bad day (worried brows · dots · frown)
 */
export function HoaBeNgoan({
  size,
  color,
  face = 'happy',
  paperColor = '#FFFFFF',
}: Props) {
  const brow = Math.max(2.6, size * 0.058);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ flexShrink: 0 }}
    >
      {[0, 72, 144, 216, 288].map((deg) => (
        <G key={deg} transform={`rotate(${deg} 50 50)`}>
          <Ellipse cx={50} cy={25} rx={17} ry={23} fill={color} />
        </G>
      ))}

      <Circle cx={50} cy={50} r={23} fill={paperColor} />

      {face === 'happy' ? (
        <>
          <Path
            d="M35 41.5 Q41.5 38.5 47.5 41.5"
            fill="none"
            stroke={color}
            strokeWidth={brow}
            strokeLinecap="round"
          />
          <Path
            d="M52.5 41.5 Q58.5 38.5 65 41.5"
            fill="none"
            stroke={color}
            strokeWidth={brow}
            strokeLinecap="round"
          />
          <Circle cx={41} cy={48.5} r={3.4} fill={color} />
          <Circle cx={59} cy={48.5} r={3.4} fill={color} />
          <Circle cx={50} cy={55} r={2.4} fill={color} />
          <Path
            d="M34 60
               L66 60
               Q66 62 64 65
               Q50 78 36 65
               Q34 62 34 60
               Z"
            fill={color}
          />
        </>
      ) : (
        <>
          {/* Worried brows — slant down outward */}
          <Path
            d="M34 40 Q41 43 48 41"
            fill="none"
            stroke={color}
            strokeWidth={brow}
            strokeLinecap="round"
          />
          <Path
            d="M52 41 Q59 43 66 40"
            fill="none"
            stroke={color}
            strokeWidth={brow}
            strokeLinecap="round"
          />
          <Circle cx={41} cy={49} r={3.2} fill={color} />
          <Circle cx={59} cy={49} r={3.2} fill={color} />
          <Circle cx={50} cy={56} r={2.2} fill={color} />
          {/* Frown */}
          <Path
            d="M38 68 Q50 58 62 68"
            fill="none"
            stroke={color}
            strokeWidth={brow * 1.05}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}
