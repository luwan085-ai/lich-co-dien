import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CollapsibleStampPanel } from './CollapsibleStampPanel';
import { rescheduleGioIfEnabled } from '../lib/gioNotifications';
import {
  formatSolarShort,
  nextOccurrence,
} from '../lib/gioSchedule';
import { nearestPersonalLunarEvent } from '../lib/lunarUpcoming';
import {
  inferAnnivKind,
  loadMemo,
  saveMemo,
  type AnnivKind,
} from '../lib/localMemos';
import { buildMemoCardPreview } from '../lib/memoCardPreview';
import { colors } from '../theme/tokens';

type Props = {
  dateKey: string;
  fontFamily?: string;
  onGioChanged?: () => void;
  gioRefreshKey?: number;
};

function lunarAnnivLabel(kind: AnnivKind, day: number, month: number, leap: boolean): string {
  const prefix = kind === 'birthday' ? 'Sinh nhật âm' : 'Giỗ âm';
  const leapSuffix = leap ? ' nhuận' : '';
  return `${prefix} ${day}/${month}${leapSuffix}`;
}

export function DayMemoCard({
  dateKey,
  fontFamily,
  onGioChanged,
  gioRefreshKey = 0,
}: Props) {
  const [text, setText] = useState('');
  const [isAnniversary, setIsAnniversary] = useState(false);
  const [annivKind, setAnnivKind] = useState<AnnivKind | null>(null);
  const [lunarLabel, setLunarLabel] = useState<string | null>(null);
  const [nextLine, setNextLine] = useState<string | null>(null);
  const [nearestGio, setNearestGio] = useState<
    Awaited<ReturnType<typeof nearestPersonalLunarEvent>>
  >(null);
  const [savedHint, setSavedHint] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const nearest = await nearestPersonalLunarEvent();
      if (!alive) return;
      setNearestGio(nearest);
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
      const ann = Boolean(memo?.isAnniversary);
      setIsAnniversary(ann);
      const kind = ann
        ? (memo?.annivKind ?? inferAnnivKind(memo?.text ?? ''))
        : null;
      setAnnivKind(kind);
      if (ann && memo?.lunar && kind) {
        setLunarLabel(
          lunarAnnivLabel(
            kind,
            memo.lunar.day,
            memo.lunar.month,
            memo.lunar.leapMonth,
          ),
        );
        const next = nextOccurrence(memo.lunar);
        setNextLine(
          next
            ? `Lần tới: ${formatSolarShort(next.solar)} dương · Còn ${next.daysUntil} ngày`
            : null,
        );
      } else {
        setLunarLabel(null);
        setNextLine(null);
      }
      setSavedHint(false);
      setSaveFailed(false);
    })();
    return () => {
      alive = false;
    };
  }, [dateKey]);

  const preview = useMemo(
    () => buildMemoCardPreview(nearestGio, text),
    [nearestGio, text],
  );

  const applySavedMemo = async (saved: Awaited<ReturnType<typeof saveMemo>>) => {
    if (saved.isAnniversary && saved.lunar) {
      const kind = saved.annivKind ?? inferAnnivKind(saved.text);
      setAnnivKind(kind);
      setLunarLabel(
        lunarAnnivLabel(
          kind,
          saved.lunar.day,
          saved.lunar.month,
          saved.lunar.leapMonth,
        ),
      );
      const next = nextOccurrence(saved.lunar);
      setNextLine(
        next
          ? `Lần tới: ${formatSolarShort(next.solar)} dương · Còn ${next.daysUntil} ngày`
          : null,
      );
    } else {
      setAnnivKind(null);
      setLunarLabel(null);
      setNextLine(null);
    }
    setSavedHint(true);
    setSaveFailed(false);
    setTimeout(() => setSavedHint(false), 1200);
    void rescheduleGioIfEnabled();
    if (saved.isAnniversary) {
      onGioChanged?.();
      const nearest = await nearestPersonalLunarEvent();
      setNearestGio(nearest);
    }
  };

  const persist = async (
    nextText: string,
    nextAnn: boolean,
    nextKind: AnnivKind | null,
  ) => {
    const prevText = text;
    const prevAnn = isAnniversary;
    const prevKind = annivKind;
    try {
      const saved = await saveMemo(
        dateKey,
        nextText,
        nextAnn,
        nextKind ?? undefined,
      );
      await applySavedMemo(saved);
    } catch {
      setText(prevText);
      setIsAnniversary(prevAnn);
      setAnnivKind(prevKind);
      setSaveFailed(true);
      Alert.alert(
        'Chưa lưu được',
        'Không ghi được ghi chú. Kiểm tra bộ nhớ thiết bị và thử lại.',
      );
    }
  };

  const selectKind = (kind: AnnivKind) => {
    const active = isAnniversary && annivKind === kind;
    const nextAnn = !active;
    const nextKind = nextAnn ? kind : null;
    setIsAnniversary(nextAnn);
    setAnnivKind(nextKind);
    void persist(text, nextAnn, nextKind);
  };

  return (
    <CollapsibleStampPanel
      panelId="memo"
      title="GHI CHÚ / GIỖ LỄ"
      sub="Ghi chú ngày · chọn Giỗ âm hoặc Sinh nhật âm"
      summaryHeadline={preview.headline}
      summaryDetail={preview.detail}
      fontFamily={fontFamily}
    >
      {saveFailed ? (
        <Text style={styles.saveFailed}>Chưa lưu được · thử lại</Text>
      ) : savedHint ? (
        <Text style={styles.saved}>Đã lưu</Text>
      ) : null}

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        onBlur={() => {
          void persist(text, isAnniversary, annivKind);
        }}
        placeholder="Nhập ghi chú cho ngày này…"
        placeholderTextColor={colors.inkFaint}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.row}>
        <Pressable
          style={[
            styles.chip,
            isAnniversary && annivKind === 'gio' && styles.chipOn,
          ]}
          onPress={() => selectKind('gio')}
        >
          <Text
            style={[
              styles.chipText,
              isAnniversary && annivKind === 'gio' && styles.chipTextOn,
            ]}
          >
            Giỗ âm
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.chip,
            isAnniversary && annivKind === 'birthday' && styles.chipOn,
          ]}
          onPress={() => selectKind('birthday')}
        >
          <Text
            style={[
              styles.chipText,
              isAnniversary && annivKind === 'birthday' && styles.chipTextOn,
            ]}
          >
            Sinh nhật âm
          </Text>
        </Pressable>
        <Pressable
          style={styles.saveBtn}
          onPress={() => {
            void persist(text, isAnniversary, annivKind);
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
  saveFailed: {
    fontSize: 11,
    color: colors.crimson,
    fontWeight: '700',
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
    paddingHorizontal: 8,
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
    textAlign: 'center',
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
