export type IdentyfikatorWskaznika = 'POLSTR_1M' | 'WIBOR_3M';
export type TypRat = 'rowne' | 'malejace';
export type TypNadplaty = 'obniz_rate' | 'skroc_okres';

export interface WpisSerii {
  od: string;
  stopa: number;
}

export interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb: TypNadplaty;
}

export interface ParametryKredytu {
  /** Kwota kredytu w groszach (liczba całkowita). */
  kwotaGr: number;
  liczbaRat: number;
  /** Marża banku jako ułamek, np. 0.0211 dla 2,11 pp. */
  marza: number;
  typRat: TypRat;
  wskaznik?: IdentyfikatorWskaznika;
  /** Data pierwszej raty w formacie YYYY-MM-DD. */
  pierwszaRata: string;
  nadplaty?: Nadplata[];
}

export interface Rata {
  numer: number;
  data: string;
  kapitalGr: number;
  odsetkiGr: number;
  nadplataGr: number;
  rataGr: number;
  saldoPoSplacieGr: number;
  stopaRoczna: number;
}

export interface Harmonogram {
  raty: Rata[];
  sumaOdsetekGr: number;
  sumaKapitaluGr: number;
}

const MIESIACE_W_ROKU = 12;

function parsujDateUTC(data: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error('pierwszaRata: wymagana istniejąca data YYYY-MM-DD');
  }

  const [rokRaw, miesiacRaw, dzienRaw] = data.split('-');
  const rok = Number(rokRaw);
  const miesiac = Number(miesiacRaw);
  const dzien = Number(dzienRaw);

  const dataObj = new Date(Date.UTC(rok, miesiac - 1, dzien));

  if (dataObj.getUTCFullYear() !== rok || dataObj.getUTCMonth() !== miesiac - 1 || dataObj.getUTCDate() !== dzien) {
    throw new Error('pierwszaRata: wymagana istniejąca data YYYY-MM-DD');
  }

  return dataObj;
}

function dataMiesieczna(dataPoczatkowa: string, numerRat: number): string {
  const data = parsujDateUTC(dataPoczatkowa);
  const indeksMiesiaca = data.getUTCMonth() + numerRat;
  const rok = data.getUTCFullYear() + Math.floor(indeksMiesiaca / MIESIACE_W_ROKU);
  const miesiac = indeksMiesiaca % MIESIACE_W_ROKU;
  const dzien = Math.min(data.getUTCDate(), new Date(Date.UTC(rok, miesiac + 1, 0)).getUTCDate());
  return new Date(Date.UTC(rok, miesiac, dzien)).toISOString().slice(0, 10);
}

function znajdzStopeRoczna(seria: WpisSerii[], dataRaty: string): number {
  let pasujacy: WpisSerii | undefined;
  for (const wpis of seria) {
    if (wpis.od > dataRaty) {
      break;
    }
    pasujacy = wpis;
  }

  if (!pasujacy) {
    throw new Error(`brak danych wskaźnika dla daty ${dataRaty}`);
  }

  return pasujacy.stopa;
}

function walidujParametry(parametry: ParametryKredytu): void {
  if (!Number.isInteger(parametry.kwotaGr) || parametry.kwotaGr <= 0) {
    throw new Error('kwotaGr: dodatnia liczba całkowita w groszach');
  }

  if (!Number.isInteger(parametry.liczbaRat) || parametry.liczbaRat <= 0) {
    throw new Error('liczbaRat: dodatnia liczba całkowita');
  }

  if (!Number.isFinite(parametry.marza) || parametry.marza < 0 || Number.isNaN(parametry.marza)) {
    throw new Error('marza: nieujemna liczba punktów procentowych');
  }

  if (parametry.typRat !== 'rowne' && parametry.typRat !== 'malejace') {
    throw new Error('typRat: rowne albo malejace');
  }

  parsujDateUTC(parametry.pierwszaRata);

  const trybyPoMiesiacu = new Map<number, Set<TypNadplaty>>();
  for (const nadplata of parametry.nadplaty ?? []) {
    if (!Number.isInteger(nadplata.miesiac) || nadplata.miesiac < 1 || nadplata.miesiac > parametry.liczbaRat) {
      throw new Error('nadplata: miesiąc musi być liczbą całkowitą od 1 do liczby rat');
    }
    if (!Number.isInteger(nadplata.kwotaGr) || nadplata.kwotaGr <= 0) {
      throw new Error('nadplata: kwota musi być dodatnią liczbą całkowitą w groszach');
    }
    if (nadplata.tryb !== 'obniz_rate' && nadplata.tryb !== 'skroc_okres') {
      throw new Error('nadplata: tryb musi być obniz_rate albo skroc_okres');
    }

    const tryby = trybyPoMiesiacu.get(nadplata.miesiac) ?? new Set<TypNadplaty>();
    if (tryby.size > 0 && tryby.has('obniz_rate') && nadplata.tryb === 'skroc_okres') {
      throw new Error('nadplata: w tym samym miesiącu nie można mieszać trybów obniz_rate i skroc_okres');
    }
    if (tryby.size > 0 && tryby.has('skroc_okres') && nadplata.tryb === 'obniz_rate') {
      throw new Error('nadplata: w tym samym miesiącu nie można mieszać trybów obniz_rate i skroc_okres');
    }
    tryby.add(nadplata.tryb);
    trybyPoMiesiacu.set(nadplata.miesiac, tryby);
  }
}

function obliczRataRowna(kwotaGr: number, stopaRoczna: number, liczbaRat: number): number {
  if (liczbaRat <= 0) {
    throw new Error('liczbaRat: dodatnia liczba całkowita');
  }

  if (stopaRoczna <= 0) {
    return Math.round(kwotaGr / liczbaRat);
  }

  const stopaMiesieczna = stopaRoczna / 12;
  const czynnik = Math.pow(1 + stopaMiesieczna, liczbaRat);
  return Math.round((kwotaGr * stopaMiesieczna * czynnik) / (czynnik - 1));
}

function walidujSerie(seria: WpisSerii[]): void {
  if (seria.length === 0) {
    throw new Error('seriaWskaznika: wymagana niepusta seria wskaźnika');
  }

  for (let indeks = 0; indeks < seria.length; indeks += 1) {
    const wpis = seria[indeks];
    if (!wpis || !/^\d{4}-\d{2}-\d{2}$/.test(wpis.od)) {
      throw new Error('seriaWskaznika: niepoprawny wpis');
    }
    parsujDateUTC(wpis.od);
    if (!Number.isFinite(wpis.stopa) || wpis.stopa < 0) {
      throw new Error('seriaWskaznika: niepoprawny wpis');
    }
    if (indeks > 0 && seria[indeks - 1]!.od >= wpis.od) {
      throw new Error('seriaWskaznika: wpisy muszą być rosnące po dacie');
    }
  }
}

function grupujNadplaty(nadplaty: Nadplata[] = []): Map<number, { obniz_rate: number; skroc_okres: number }> {
  const mapa = new Map<number, { obniz_rate: number; skroc_okres: number }>();

  for (const nadplata of nadplaty) {
    const wpis = mapa.get(nadplata.miesiac) ?? { obniz_rate: 0, skroc_okres: 0 };
    if (nadplata.tryb === 'obniz_rate') {
      wpis.obniz_rate += nadplata.kwotaGr;
    } else {
      wpis.skroc_okres += nadplata.kwotaGr;
    }
    mapa.set(nadplata.miesiac, wpis);
  }

  return mapa;
}

export function policzHarmonogram(
  parametry: ParametryKredytu,
  seriaWskaznika: WpisSerii[] = [],
): Harmonogram {
  walidujParametry(parametry);

  const seria = [...seriaWskaznika].sort((a, b) => a.od.localeCompare(b.od));
  walidujSerie(seria);

  const raty: Rata[] = [];
  let saldo = parametry.kwotaGr;
  let sumaOdsetekGr = 0;
  let sumaKapitaluGr = 0;
  let poprzedniaStopaRoczna: number | undefined;
  let rataRowna: number | undefined;
  const nadplaty = grupujNadplaty(parametry.nadplaty ?? []);

  for (let numer = 1; numer <= parametry.liczbaRat; numer += 1) {
    if (saldo <= 0) {
      break;
    }

    const data = dataMiesieczna(parametry.pierwszaRata, numer - 1);
    const stopaRoczna = znajdzStopeRoczna(seria, data) + parametry.marza;
    const odsetkiGr = Math.round((saldo * stopaRoczna) / 12);

    const nadplataMiesiac = nadplaty.get(numer) ?? { obniz_rate: 0, skroc_okres: 0 };
    const planowanaNadplataGr = nadplataMiesiac.obniz_rate + nadplataMiesiac.skroc_okres;
    let kapitalGr: number;
    if (parametry.typRat === 'rowne') {
      if (rataRowna === undefined || poprzedniaStopaRoczna !== stopaRoczna || planowanaNadplataGr > 0) {
        rataRowna = obliczRataRowna(saldo, stopaRoczna, parametry.liczbaRat - numer + 1);
      }
      const rataPlanowana = rataRowna;
      kapitalGr = Math.max(0, rataPlanowana - odsetkiGr);
    } else {
      const pozostaleRaty = Math.max(1, parametry.liczbaRat - numer + 1);
      kapitalGr = Math.max(0, Math.round(saldo / pozostaleRaty));
    }

    if (numer === parametry.liczbaRat) {
      kapitalGr = saldo;
    }

    const kapitalDoSplacenia = Math.min(kapitalGr, saldo);
    const nadplataGr = Math.min(planowanaNadplataGr, Math.max(0, saldo - kapitalDoSplacenia));
    const rataGr = odsetkiGr + kapitalDoSplacenia + nadplataGr;
    saldo = Math.max(0, saldo - kapitalDoSplacenia - nadplataGr);
    sumaOdsetekGr += odsetkiGr;
    sumaKapitaluGr += kapitalDoSplacenia + nadplataGr;
    poprzedniaStopaRoczna = stopaRoczna;
    if (nadplataMiesiac.obniz_rate > 0) {
      rataRowna = undefined;
    }

    if (numer === parametry.liczbaRat || saldo === 0) {
      raty.push({
        numer,
        data,
        kapitalGr: kapitalDoSplacenia,
        odsetkiGr,
        nadplataGr,
        rataGr,
        saldoPoSplacieGr: 0,
        stopaRoczna,
      });
      break;
    }

    raty.push({
      numer,
      data,
      kapitalGr: kapitalDoSplacenia,
      odsetkiGr,
      nadplataGr,
      rataGr,
      saldoPoSplacieGr: saldo,
      stopaRoczna,
    });
  }

  return {
    raty,
    sumaOdsetekGr,
    sumaKapitaluGr,
  };
}
