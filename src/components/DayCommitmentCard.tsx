import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  countStreakEndingAt,
  loadCommitment,
  pickPraiseForCompletion,
  saveCommitment,
} from '../lib/commitments';
import { freshInkSeed } from '../lib/stampInk';
import { playStampFeedback } from '../lib/localMoods';
import { PRAISE_STAMPS, type Praise } from '../types/mood';
import type { SolarDate } from '../lunar/solar';
import { colors } from '../theme/tokens';

const MIN_LEN = 10;

type Props = {
  dateKey: string;
  solar: SolarDate;
  isToday: boolean;
  fontFamily?: string;
  /** Nested inside a collapsible — skip outer title/card chrome */
  embedded?: boolean;
  /** Mirror draft / saved text to parent (lacquer bar preview) */
  onTextChange?: (text: string) => void;
  onStamped: (praise: Praise, inkSeed: number) => void;
};

export function DayCommitmentCard({
  dateKey,
  solar,
  isToday,
  fontFamily,
  embedded = false,
  onTextChange,
  onStamped,
}: Props) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const [praiseId, setPraiseId] = useState<Praise | null>(null);
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const entry = await loadCommitment(dateKey);
      const s = await countStreakEndingAt(solar);
      if (!alive) return;
      if (entry) {
        setText(entry.text);
        setDone(true);
        setPraiseId(entry.praiseId);
        onTextChange?.(entry.text);
      } else {
        setText('');
        setDone(false);
        setPraiseId(null);
        onTextChange?.('');
      }
      setStreak(s);
    })();
    return () => {
      alive = false;
    };
  }, [dateKey, solar.year, solar.month, solar.day, onTextChange]);

  const setTextAndNotify = (next: string) => {
    setText(next);
    onTextChange?.(next);
  };

  const len = text.trim().length;
  const canSubmit = isToday && !done && len >= MIN_LEN && !busy;

  const complete = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const trimmed = text.trim();
      // streak after today counts as previous + 1
      const prev = await countStreakEndingAt(solar);
      const already = await loadCommitment(dateKey);
      const streakAfter = already ? prev : prev + 1;
      const praise = pickPraiseForCompletion({
        now: new Date(),
        streakAfter,
      });
      const seed = freshInkSeed();
      await saveCommitment(dateKey, {
        text: trimmed,
        completedAt: new Date().toISOString(),
        praiseId: praise,
      });
      await playStampFeedback();
      onStamped(praise, seed);
      setDone(true);
      setPraiseId(praise);
      setStreak(streakAfter);
    } finally {
      setBusy(false);
    }
  };

  const stampMeta = praiseId
    ? PRAISE_STAMPS.find((p) => p.id === praiseId)
    : null;

  return (
    <View style={embedded ? styles.embedded : styles.card}>
      {!embedded ? (
        <>
          <Text style={[styles.title, fontFamily ? { fontFamily } : null]}>
            CAM KẾT NGÀY · 10 CHỮ
          </Text>
          <Text style={styles.sub}>
            Viết ít nhất {MIN_LEN} ký tự → đóng dấu tự động (Làm tốt lắm / Giỏi
            lắm / Cô khen)
          </Text>
        </>
      ) : null}

      <TextInput
        style={[styles.input, embedded && styles.inputEmbedded]}
        value={text}
        onChangeText={setTextAndNotify}
        editable={isToday && !done}
        placeholder="Viết điều ước…"
        placeholderTextColor={colors.inkFaint}
        multiline
        maxLength={120}
      />

      <View style={styles.meta}>
        <Text style={styles.counter}>
          {len}/{MIN_LEN}
          {len >= MIN_LEN ? ' ✓' : ''}
        </Text>
        <Text style={styles.streak}>Chuỗi {streak} ngày</Text>
      </View>

      {!isToday ? (
        <Text style={styles.hint}>Chỉ hoàn thành được lời hứa của hôm nay.</Text>
      ) : done ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneTitle}>Đã đóng dấu!</Text>
          <Text style={styles.doneBody}>
            {stampMeta?.lines.join(' ') ?? '—'} · chuỗi {streak} ngày
          </Text>
        </View>
      ) : (
        <Pressable
          style={[styles.cta, !canSubmit && styles.ctaOff]}
          disabled={!canSubmit}
          onPress={() => void complete()}
        >
          <Text style={[styles.ctaText, fontFamily ? { fontFamily } : null]}>
            {busy ? 'Đang đóng dấu…' : 'Hoàn thành · đóng dấu'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 14,
  },
  embedded: {
    paddingTop: 4,
  },
  inputEmbedded: {
    marginTop: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  sub: {
    marginTop: 4,
    fontSize: 11,
    color: colors.inkFaint,
    lineHeight: 16,
  },
  input: {
    marginTop: 12,
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    padding: 10,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  meta: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counter: { fontSize: 11, fontWeight: '700', color: colors.inkMuted },
  streak: { fontSize: 11, fontWeight: '700', color: colors.goldDeep },
  hint: { marginTop: 10, fontSize: 11, color: colors.inkFaint },
  cta: {
    marginTop: 12,
    backgroundColor: colors.crimson,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaOff: { opacity: 0.45 },
  ctaText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  doneBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF5F4',
    borderWidth: 1,
    borderColor: '#F5B4AE',
  },
  doneTitle: { fontWeight: '800', color: colors.crimson, fontSize: 13 },
  doneBody: { marginTop: 4, color: colors.ink, fontSize: 13 },
});
