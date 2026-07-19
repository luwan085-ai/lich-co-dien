import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CollapsibleStampPanel } from './CollapsibleStampPanel';
import { rescheduleGioIfEnabled } from '../lib/gioNotifications';
import {
  dDayLabel,
  formatSolarShort,
  nextOccurrence,
} from '../lib/gioSchedule';
import { nearestPersonalLunarEvent } from '../lib/lunarUpcoming';
import { loadMemo, saveMemo } from '../lib/localMemos';
import { colors } from '../theme/tokens';

type Props = {
  dateKey: string;
  fontFamily?: string;
  onGioChanged?: () => void;
  gioRefreshKey?: number;
};

export function DayMemoCard({
  dateKey,
  fontFamily,
  onGioChanged,
  gioRefreshKey = 0,
}: Props) {
  const [text, setText] = useState('');
  const [isAnniversary, setIsAnniversary] = useState(false);
  const [lunarLabel, setLunarLabel] = useState<string | null>(null);
  const [nextLine, setNextLine] = useState<string | null>(null);
  const [gioPreview, setGioPreview] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const nearest = await nearestPersonalLunarEvent();
      if (!alive) return;
      if (nearest) {
        const prefix =
          nearest.kind === 'birthday' ? 'Sinh nhật âm' : 'Sắp giỗ';
        setGioPreview(
          `${prefix}: ${nearest.label} · ${dDayLabel(nearest.daysUntil).toLowerCase()}`,
        );
      } else {
        setGioPreview(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [gioRefreshKey]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const memo = await loadMemo(dateKey);
      if (!alive) return;
      setText(memo?.text ?? '');
      setIsAnniversary(Boolean(memo?.isAnniversary));
      if (memo?.isAnniversary && memo.lunar) {
        const leap = memo.lunar.leapMonth ? ' nhuận' : '';
        setLunarLabel(`Giỗ âm ${memo.lunar.day}/${memo.lunar.month}${leap}`);
        const next = nextOccurrence(memo.lunar);
        setNextLine(
          next
            ? `Lần tới: ${formatSolarShort(next.solar)} dương · ${dDayLabel(next.daysUntil).toLowerCase()}`
            : null,
        );
      } else {
        setLunarLabel(null);
        setNextLine(null);
      }
      setSavedHint(false);
    })();
    return () => {
      alive = false;
    };
  }, [dateKey]);

  const persist = async (nextText: string, nextAnn: boolean) => {
    const saved = await saveMemo(dateKey, nextText, nextAnn);
    if (saved.isAnniversary && saved.lunar) {
      const leap = saved.lunar.leapMonth ? ' nhuận' : '';
      setLunarLabel(`Giỗ âm ${saved.lunar.day}/${saved.lunar.month}${leap}`);
      const next = nextOccurrence(saved.lunar);
      setNextLine(
        next
          ? `Lần tới: ${formatSolarShort(next.solar)} dương · ${dDayLabel(next.daysUntil).toLowerCase()}`
          : null,
      );
    } else {
      setLunarLabel(null);
      setNextLine(null);
    }
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 1200);
    void rescheduleGioIfEnabled();
    if (saved.isAnniversary) onGioChanged?.();
  };

  const summary = lunarLabel
    ? nextLine
      ? `${lunarLabel} · ${nextLine.replace('Lần tới: ', '')} · chạm để mở`
      : `${lunarLabel} · chạm để mở`
    : gioPreview
      ? `${gioPreview} · chạm để mở`
      : text.trim()
        ? `${text.trim().slice(0, 36)}${text.trim().length > 36 ? '…' : ''} · chạm để mở`
        : 'Ghi chú / đánh dấu giỗ · chạm để mở';

  return (
    <CollapsibleStampPanel
      panelId="memo"
      title="GHI CHÚ / GIỖ LỄ"
      sub="Ghi chú ngày · giỗ / sinh nhật âm (ghi “sinh nhật …”)"
      summary={summary}
      fontFamily={fontFamily}
    >
      {savedHint ? <Text style={styles.saved}>Đã lưu</Text> : null}

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        onBlur={() => {
          void persist(text, isAnniversary);
        }}
        placeholder="Nhập ghi chú cho ngày này…"
        placeholderTextColor={colors.inkFaint}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.row}>
        <Pressable
          style={[styles.chip, isAnniversary && styles.chipOn]}
          onPress={() => {
            const next = !isAnniversary;
            setIsAnniversary(next);
            void persist(text, next);
          }}
        >
          <Text style={[styles.chipText, isAnniversary && styles.chipTextOn]}>
            Đánh dấu giỗ / kỷ niệm
          </Text>
        </Pressable>
        <Pressable
          style={styles.saveBtn}
          onPress={() => {
            void persist(text, isAnniversary);
          }}
        >
          <Text style={styles.saveText}>Lưu</Text>
        </Pressable>
      </View>
      {lunarLabel ? (
        <>
          <Text style={styles.lunarHint}>
            {lunarLabel} · nhắc theo âm lịch (bật trong Cá nhân)
          </Text>
          {nextLine ? <Text style={styles.nextLine}>{nextLine}</Text> : null}
        </>
      ) : null}
    </CollapsibleStampPanel>
  );
}

const styles = StyleSheet.create({
  saved: {
    fontSize: 11,
    color: colors.inkFaint,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 4,
  },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.paper,
  },
  chipOn: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF1F2',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  chipTextOn: {
    color: colors.crimson,
  },
  saveBtn: {
    backgroundColor: colors.lacquer,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  lunarHint: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    color: colors.crimson,
    fontWeight: '600',
  },
  nextLine: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
