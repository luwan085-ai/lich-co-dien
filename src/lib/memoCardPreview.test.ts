import { describe, expect, it } from 'vitest';
import { buildMemoCardPreview } from './memoCardPreview';

describe('buildMemoCardPreview', () => {
  it('prompts first giỗ when no upcoming and empty memo', () => {
    const preview = buildMemoCardPreview(null, '');
    expect(preview.headline).toBe('Bắt đầu: thêm giỗ hoặc sinh nhật âm');
    expect(preview.detail).toContain('chạm để mở');
  });
});
