import { describe, expect, it } from 'vitest';
import { seriaWskaznika } from '../src/dane/wskazniki';

describe('serie wskaźników', () => {
  it.each(['POLSTR_1M', 'WIBOR_3M'] as const)('importuje serię %s', (wskaznik) => {
    const seria = seriaWskaznika(wskaznik);

    expect(seria.length).toBeGreaterThan(0);
    expect(seria[0]?.od).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(seria.every((wpis) => Number.isFinite(wpis.stopa))).toBe(true);
  });

  it('wybiera serię według identyfikatora', () => {
    expect(seriaWskaznika('POLSTR_1M')).not.toEqual(seriaWskaznika('WIBOR_3M'));
  });
});