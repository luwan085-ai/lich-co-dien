import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCalendarDay } from '../lunar/today';
import { colors } from '../theme/tokens';

const LOTS = [
  {
    name: 'Đại Cát',
    meaning: 'Việc lớn hanh thông, nên thuận thế mà làm.',
  },
  {
    name: 'Trung Bình',
    meaning: 'Không vội không chậm — làm chắc từng bước.',
  },
  {
    name: 'Tiểu Cát',
    meaning: 'Có quý nhân phụ trợ nếu giữ lòng chân thành.',
  },
  {
    name: 'Nên lánh',
    meaning: 'Hôm nay hợp tĩnh dưỡng, tránh khẩu thiệt.',
  },
  {
    name: 'Được lộc',
    meaning: 'Có tin vui nhỏ liên quan tiền bạc hoặc giấy tờ.',
  },
  {
    name: 'Cầu an',
    meaning: 'Nên thành tâm cầu an, việc sẽ dần sáng.',
  },
] as const;

type Props = {
  fontFamily?: string;
};

export function BoiQueCard({ fontFamily }: Props) {
  const day = useMemo(() => getCalendarDay(), []);
  const [result, setResult] = useState<(typeof LOTS)[number] | null>(null);
  const [shaking, setShaking] = useState(false);

  const draw = () => {
    setShaking(true);
    setTimeout(() => {
      const seed =
        day.solar.year * 10000 +
        day.solar.month * 100 +
        day.solar.day +
        day.canChi.day.length +
        Date.now() % 17;
      setResult(LOTS[Math.abs(seed) % LOTS.length]);
      setShaking(false);
    }, 900);
  };

  return (
    <View style={styles.card}>
      <Text style={[styles.title, fontFamily ? { fontFamily } : null]}>
        BÓI QUẺ (DEMO)
      </Text>
      <Text style={styles.sub}>
        Rút quẻ nhanh theo ngày {day.canChi.day} · không phải bản sao Zagome
      </Text>

      <Pressable
        style={[styles.btn, shaking && styles.btnDisabled]}
        onPress={draw}
        disabled={shaking}
      >
        <Text style={styles.btnText}>
          {shaking ? 'Đang gieo quẻ…' : result ? 'Rút lại' : 'Gieo quẻ Khổng Minh'}
        </Text>
      </Pressable>

      {result ? (
        <View style={styles.result}>
          <Text style={styles.resultName}>{result.name}</Text>
          <Text style={styles.resultBody}>{result.meaning}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 14,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sub: {
    marginTop: 4,
    color: colors.inkFaint,
    fontSize: 11,
    lineHeight: 16,
  },
  btn: {
    marginTop: 12,
    backgroundColor: colors.lacquer,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  result: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  resultBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkMuted,
  },
});
