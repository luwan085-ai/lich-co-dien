import { describe, expect, it } from 'vitest';
import { personalEventLine } from './monthDaySummary';

describe('personalEventLine', () => {
  it('shows empty copy when no personal event', () => {
    expect(
      personalEventLine(null, { year: 2026, month: 7, day: 20 }),
    ).toBe('Không có giỗ/sinh nhật trong ngày này');
  });

  it('labels giỗ with custom text', () => {
    expect(
      personalEventLine(
        { kind: 'gio', label: 'ông nội' },
        { year: 2025, month: 3, day: 12 },
      ),
    ).toBe('Giỗ ông nội');
  });
});
