import { describe, expect, it } from 'vitest';
import { policzHarmonogram } from '../src/domena/harmonogram';

describe('wydajność harmonogramu', () => {
  it('oblicza 300 rat w mniej niż 2 sekundy', () => {
    const poczatek = performance.now();
    const harmonogram = policzHarmonogram(
      {
        kwotaGr: 40_000_000,
        liczbaRat: 300,
        marza: 0.0211,
        typRat: 'rowne',
        wskaznik: 'POLSTR_1M',
        pierwszaRata: '2026-10-01',
      },
      [{ od: '2026-10-01', stopa: 0.0355 }],
    );
    const czasMs = performance.now() - poczatek;

    expect(harmonogram.raty).toHaveLength(300);
    expect(czasMs).toBeLessThan(2_000);
  });
});