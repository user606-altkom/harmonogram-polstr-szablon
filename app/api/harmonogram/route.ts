import { NextResponse } from 'next/server';
import { seriaWskaznika } from '../../../src/dane/wskazniki';
import { policzHarmonogram, type ParametryKredytu } from '../../../src/domena/harmonogram';

function czyKwotaZlotowa(value: string): boolean {
  return /^\d+(?:\.\d{1,2})?$/.test(value.trim());
}

function parsujNadplaty(szukane: URLSearchParams, liczbaRat: number): ParametryKredytu['nadplaty'] {
  const wpisy = szukane.getAll('nadplata');
  return wpisy
    .map((wartosc) => {
      const [miesiacRaw, kwotaRaw, trybRaw] = wartosc.split(':');
      if (!miesiacRaw || !kwotaRaw || !trybRaw) {
        throw new Error('nadplata: wymagany format miesiac:kwota:tryb');
      }

      const miesiac = Number(miesiacRaw);
      const kwota = Number(kwotaRaw);
      if (!Number.isInteger(miesiac) || miesiac < 1 || miesiac > liczbaRat) {
        throw new Error('nadplata: miesiąc musi być liczbą całkowitą od 1 do liczby rat');
      }
      if (!czyKwotaZlotowa(kwotaRaw) || !Number.isFinite(kwota) || kwota <= 0) {
        throw new Error('nadplata: kwota musi być dodatnią liczbą w złotych z maksymalnie 2 miejscami po przecinku');
      }
      if (trybRaw !== 'obniz_rate' && trybRaw !== 'skroc_okres') {
        throw new Error('nadplata: tryb musi być obniz_rate albo skroc_okres');
      }

      return {
        miesiac,
        kwotaGr: Math.round(kwota * 100),
        tryb: trybRaw,
      };
    })
    .filter((nadplata): nadplata is Exclude<ParametryKredytu['nadplaty'], undefined>[number] => Boolean(nadplata));
}

function parsujParametry(szukane: URLSearchParams): ParametryKredytu | string {
  const kwotaRaw = szukane.get('kwota');
  const liczbaRatRaw = szukane.get('liczbaRat');
  const marzaRaw = szukane.get('marza');
  const wskaznikParam = szukane.get('wskaznik');
  const typRat = szukane.get('typRat');
  const pierwszaRata = szukane.get('pierwszaRata') ?? '';

  if (kwotaRaw === null || !czyKwotaZlotowa(kwotaRaw)) {
    return 'kwota: liczba dodatnia w złotych, maksymalnie 2 miejsca po przecinku, np. 400000';
  }

  const kwota = Number(kwotaRaw);
  const liczbaRat = Number(liczbaRatRaw);
  const marza = Number(marzaRaw);

  if (!Number.isFinite(kwota) || kwota <= 0) return 'kwota: liczba dodatnia w złotych, np. 400000';
  if (!Number.isInteger(liczbaRat) || liczbaRat <= 0) return 'liczbaRat: liczba całkowita dodatnia, np. 300';
  if (!Number.isFinite(marza) || marza < 0) return 'marza: punkty procentowe, np. 2.11';
  if (wskaznikParam !== 'POLSTR_1M' && wskaznikParam !== 'WIBOR_3M') return 'wskaznik: POLSTR_1M albo WIBOR_3M';
  if (typRat !== 'rowne' && typRat !== 'malejace') return 'typRat: rowne albo malejace';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pierwszaRata)) return 'pierwszaRata: data YYYY-MM-DD';

  try {
    return {
      kwotaGr: Math.round(kwota * 100),
      liczbaRat,
      marza: marza / 100,
      wskaznik: wskaznikParam,
      typRat,
      pierwszaRata,
      nadplaty: parsujNadplaty(szukane, liczbaRat),
    };
  } catch (blad) {
    const komunikat = blad instanceof Error ? blad.message : String(blad);
    return komunikat;
  }
}

export function GET(request: Request) {
  try {
    const parametry = parsujParametry(new URL(request.url).searchParams);
    if (typeof parametry === 'string') {
      return NextResponse.json({ blad: parametry }, { status: 400 });
    }

    if (!parametry.wskaznik) {
      return NextResponse.json({ blad: 'wskaznik: POLSTR_1M albo WIBOR_3M' }, { status: 400 });
    }

    const harmonogram = policzHarmonogram(parametry, seriaWskaznika(parametry.wskaznik));
    return NextResponse.json(harmonogram);
  } catch (blad) {
    if (blad instanceof Error && (blad.message.includes(':') || blad.message.startsWith('brak danych'))) {
      return NextResponse.json({ blad: blad.message }, { status: 400 });
    }
    return NextResponse.json({ blad: 'nieoczekiwany błąd serwera' }, { status: 500 });
  }
}
