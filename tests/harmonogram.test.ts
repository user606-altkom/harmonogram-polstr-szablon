import { describe, expect, it } from 'vitest';
import { policzHarmonogram } from '../src/domena/harmonogram';

describe('harmonogram', () => {
  it('liczy raty równe dla stałej stopy i zgodnie z kontrolną liczbą', () => {
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

    expect(harmonogram.raty[0]?.rataGr).toBeGreaterThanOrEqual(249_467);
    expect(harmonogram.raty[0]?.rataGr).toBeLessThanOrEqual(249_477);
    expect(harmonogram.raty.at(-1)?.rataGr).toBeGreaterThanOrEqual(249_248);
    expect(harmonogram.raty.at(-1)?.rataGr).toBeLessThanOrEqual(249_258);
    expect(harmonogram.sumaKapitaluGr).toBe(40_000_000);
    expect(harmonogram.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('liczy raty malejące z równym podziałem kapitału', () => {
    const harmonogram = policzHarmonogram(
      {
        kwotaGr: 12_000_000,
        liczbaRat: 12,
        marza: 0.02,
        typRat: 'malejace',
        wskaznik: 'WIBOR_3M',
        pierwszaRata: '2026-10-01',
      },
      [{ od: '2026-10-01', stopa: 0.04 }],
    );

    expect(harmonogram.raty).toHaveLength(12);
    expect(harmonogram.raty.every((rata) => rata.kapitalGr > 0)).toBe(true);
    expect(harmonogram.sumaKapitaluGr).toBe(12_000_000);
    expect(harmonogram.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('odrzuca nieprawidłowe dane wejściowe', () => {
    expect(() =>
      policzHarmonogram({
        kwotaGr: 0,
        liczbaRat: 12,
        marza: 0.02,
        typRat: 'rowne',
        wskaznik: 'POLSTR_1M',
        pierwszaRata: '2026-10-01',
      }),
    ).toThrow('kwotaGr: dodatnia liczba całkowita w groszach');

    expect(() =>
      policzHarmonogram({
        kwotaGr: 1_000_000,
        liczbaRat: 0,
        marza: 0.02,
        typRat: 'malejace',
        wskaznik: 'WIBOR_3M',
        pierwszaRata: '2026-10-01',
      }),
    ).toThrow('liczbaRat: dodatnia liczba całkowita');

    expect(() =>
      policzHarmonogram(
        {
          kwotaGr: 1_000_000,
          liczbaRat: 2,
          marza: 0.02,
          typRat: 'rowne',
          wskaznik: 'POLSTR_1M',
          pierwszaRata: '2026-02-30',
        },
        [{ od: '2026-01-01', stopa: 0.04 }],
      ),
    ).toThrow('pierwszaRata: wymagana istniejąca data YYYY-MM-DD');

    expect(() =>
      policzHarmonogram(
        {
          kwotaGr: 1_000_000,
          liczbaRat: 2,
          marza: -0.01,
          typRat: 'rowne',
          wskaznik: 'POLSTR_1M',
          pierwszaRata: '2026-10-01',
        },
        [{ od: '2026-01-01', stopa: 0.04 }],
      ),
    ).toThrow('marza: nieujemna liczba punktów procentowych');

    expect(() =>
      policzHarmonogram(
        {
          kwotaGr: 1_000_000,
          liczbaRat: 2,
          marza: 0.02,
          typRat: 'rowne',
          wskaznik: 'POLSTR_1M',
          pierwszaRata: '2026-10-01',
        },
        [],
      ),
    ).toThrow('seriaWskaznika: wymagana niepusta seria wskaźnika');

    expect(() =>
      policzHarmonogram(
        {
          kwotaGr: 1_000_000,
          liczbaRat: 2,
          marza: 0.02,
          typRat: 'rowne',
          wskaznik: 'POLSTR_1M',
          pierwszaRata: '2026-10-01',
        },
        [{ od: '2026-10-01', stopa: Number.POSITIVE_INFINITY }],
      ),
    ).toThrow('seriaWskaznika: niepoprawny wpis');
  });

  it('zmienia stopę od daty wpisu i zachowuje ostatnią wartość serii', () => {
    const harmonogram = policzHarmonogram(
      {
        kwotaGr: 1_200_000,
        liczbaRat: 3,
        marza: 0,
        typRat: 'rowne',
        wskaznik: 'POLSTR_1M',
        pierwszaRata: '2026-10-31',
      },
      [
        { od: '2026-10-01', stopa: 0.12 },
        { od: '2026-11-01', stopa: 0.24 },
      ],
    );

    expect(harmonogram.raty.map((rata) => rata.data)).toEqual(['2026-10-31', '2026-11-30', '2026-12-31']);
    expect(harmonogram.raty.map((rata) => rata.stopaRoczna)).toEqual([0.12, 0.24, 0.24]);
  });

  it('przelicza kolejne raty po nadpłacie obniżającej ratę', () => {
    const harmonogram = policzHarmonogram(
      {
        kwotaGr: 1_200_000,
        liczbaRat: 3,
        marza: 0,
        typRat: 'rowne',
        wskaznik: 'POLSTR_1M',
        pierwszaRata: '2026-10-01',
        nadplaty: [{ miesiac: 1, kwotaGr: 200_000, tryb: 'obniz_rate' }],
      },
      [{ od: '2026-10-01', stopa: 0 }],
    );

    expect(harmonogram.raty[0]?.nadplataGr).toBe(200_000);
    expect(harmonogram.raty[0]?.rataGr).toBe(600_000);
    expect(harmonogram.raty[1]?.rataGr).toBe(300_000);
    expect(harmonogram.sumaKapitaluGr).toBe(1_200_000);
    expect(harmonogram.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('zachowuje ratę i skraca okres po nadpłacie skracającej okres', () => {
    const harmonogram = policzHarmonogram(
      {
        kwotaGr: 1_200_000,
        liczbaRat: 3,
        marza: 0,
        typRat: 'rowne',
        wskaznik: 'POLSTR_1M',
        pierwszaRata: '2026-10-01',
        nadplaty: [{ miesiac: 1, kwotaGr: 200_000, tryb: 'skroc_okres' }],
      },
      [{ od: '2026-10-01', stopa: 0 }],
    );

    expect(harmonogram.raty).toHaveLength(3);
    expect(harmonogram.raty[0]?.rataGr).toBe(600_000);
    expect(harmonogram.raty[1]?.rataGr).toBe(400_000);
    expect(harmonogram.sumaKapitaluGr).toBe(1_200_000);
    expect(harmonogram.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('sumuje nadpłaty jednego trybu i ogranicza je do salda', () => {
    const harmonogram = policzHarmonogram(
      {
        kwotaGr: 500_000,
        liczbaRat: 2,
        marza: 0,
        typRat: 'malejace',
        wskaznik: 'POLSTR_1M',
        pierwszaRata: '2026-10-01',
        nadplaty: [
          { miesiac: 1, kwotaGr: 200_000, tryb: 'skroc_okres' },
          { miesiac: 1, kwotaGr: 400_000, tryb: 'skroc_okres' },
        ],
      },
      [{ od: '2026-10-01', stopa: 0 }],
    );

    expect(harmonogram.raty).toHaveLength(1);
    expect(harmonogram.raty[0]?.nadplataGr).toBe(250_000);
    expect(harmonogram.sumaKapitaluGr).toBe(500_000);
    expect(harmonogram.raty[0]?.saldoPoSplacieGr).toBe(0);
  });
});
