'use client';

import { useState } from 'react';

type TypRat = 'rowne' | 'malejace';
type TypWskaznika = 'POLSTR_1M' | 'WIBOR_3M';

type Rata = {
  numer: number;
  data: string;
  kapitalGr: number;
  odsetkiGr: number;
  nadplataGr: number;
  rataGr: number;
  saldoPoSplacieGr: number;
  stopaRoczna: number;
};

type Harmonogram = {
  raty: Rata[];
  sumaOdsetekGr: number;
  sumaKapitaluGr: number;
};

const domyslnyFormularz = {
  kwota: '400000',
  liczbaRat: '300',
  pierwszaRata: '2026-10-01',
  marza: '2.11',
  typRat: 'rowne' as TypRat,
  wskaznik: 'POLSTR_1M' as TypWskaznika,
  nadplata: '',
};

function formatujGrosze(kwotaGr: number): string {
  return (kwotaGr / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
}

export default function Strona() {
  const [formularz, setFormularz] = useState(domyslnyFormularz);
  const [wynik, setWynik] = useState<Harmonogram | null>(null);
  const [blad, setBlad] = useState('');
  const [ladowanie, setLadowanie] = useState(false);

  const oblicz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLadowanie(true);
    setBlad('');
    setWynik(null);

    const parametry = new URLSearchParams();
    parametry.set('kwota', formularz.kwota);
    parametry.set('liczbaRat', formularz.liczbaRat);
    parametry.set('pierwszaRata', formularz.pierwszaRata);
    parametry.set('marza', formularz.marza);
    parametry.set('typRat', formularz.typRat);
    parametry.set('wskaznik', formularz.wskaznik);

    if (formularz.nadplata.trim()) {
      for (const wpis of formularz.nadplata.split(',')) {
        const wartosc = wpis.trim();
        if (wartosc) {
          parametry.append('nadplata', wartosc);
        }
      }
    }

    try {
      const odpowiedz = await fetch(`/api/harmonogram?${parametry.toString()}`);
      const dane = await odpowiedz.json();

      if (!odpowiedz.ok) {
        throw new Error(dane?.blad ?? 'Nieprawidłowe dane wejściowe.');
      }

      setWynik(dane as Harmonogram);
    } catch (error) {
      setBlad(error instanceof Error ? error.message : 'Nie udało się obliczyć harmonogramu.');
    } finally {
      setLadowanie(false);
    }
  };

  const eksportujCsv = () => {
    if (!wynik) {
      return;
    }

    const naglowki = ['numer', 'data', 'kapitalGr', 'odsetkiGr', 'rataGr', 'saldoPoSplacieGr'];
    const wiersze = wynik.raty.map((rata) => [
      rata.numer,
      rata.data,
      rata.kapitalGr,
      rata.odsetkiGr,
      rata.rataGr,
      rata.saldoPoSplacieGr,
    ]);

    const csv = [naglowki, ...wiersze]
      .map((wiersz) => wiersz.map((pole) => `"${String(pole).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'harmonogram.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const pierwszaRata = wynik?.raty[0];
  const ostatniaRata = wynik?.raty.at(-1);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Kalkulator kredytowy</p>
        <h1 className="text-3xl font-semibold text-slate-900">Harmonogram na POLSTR</h1>
      </header>

      <form onSubmit={oblicz} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Kwota kredytu (zł)</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={formularz.kwota}
            onChange={(event) => setFormularz((poprzednia) => ({ ...poprzednia, kwota: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Liczba rat</span>
          <input
            type="number"
            min="1"
            step="1"
            value={formularz.liczbaRat}
            onChange={(event) => setFormularz((poprzednia) => ({ ...poprzednia, liczbaRat: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Data pierwszej raty</span>
          <input
            type="date"
            value={formularz.pierwszaRata}
            onChange={(event) => setFormularz((poprzednia) => ({ ...poprzednia, pierwszaRata: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Marża (pp)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formularz.marza}
            onChange={(event) => setFormularz((poprzednia) => ({ ...poprzednia, marza: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Typ rat</span>
          <select
            value={formularz.typRat}
            onChange={(event) => setFormularz((poprzednia) => ({ ...poprzednia, typRat: event.target.value as TypRat }))}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          >
            <option value="rowne">Równe</option>
            <option value="malejace">Malejące</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Wskaźnik</span>
          <select
            value={formularz.wskaznik}
            onChange={(event) => setFormularz((poprzednia) => ({ ...poprzednia, wskaznik: event.target.value as TypWskaznika }))}
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          >
            <option value="POLSTR_1M">POLSTR 1M</option>
            <option value="WIBOR_3M">WIBOR 3M</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Nadpłaty (opcjonalnie, format: miesiac:kwota:tryb; np. 12:10000:obniz_rate)</span>
          <input
            type="text"
            value={formularz.nadplata}
            onChange={(event) => setFormularz((poprzednia) => ({ ...poprzednia, nadplata: event.target.value }))}
            placeholder="12:10000:obniz_rate,24:5000:skroc_okres"
            className="rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-sky-500"
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={ladowanie}
            className="rounded-xl bg-sky-600 px-5 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {ladowanie ? 'Liczenie…' : 'Policz harmonogram'}
          </button>
        </div>
      </form>

      {blad && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {blad}
        </div>
      )}

      {wynik && (
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Pierwsza rata</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{pierwszaRata ? formatujGrosze(pierwszaRata.rataGr) : '—'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ostatnia rata</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{ostatniaRata ? formatujGrosze(ostatniaRata.rataGr) : '—'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Suma odsetek</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{formatujGrosze(wynik.sumaOdsetekGr)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm text-slate-500">Kwota kredytu</p>
              <p className="text-lg font-semibold text-slate-900">{formatujGrosze(Number(formularz.kwota) * 100)}</p>
            </div>
            <button
              type="button"
              onClick={eksportujCsv}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700"
            >
              Eksportuj CSV
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">L.p.</th>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Kapitał</th>
                  <th className="px-3 py-2">Odsetki</th>
                  <th className="px-3 py-2">Nadpłata</th>
                  <th className="px-3 py-2">Rata</th>
                  <th className="px-3 py-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {wynik.raty.map((rata) => (
                  <tr key={rata.numer} className="border-t border-slate-200">
                    <td className="px-3 py-2">{rata.numer}</td>
                    <td className="px-3 py-2">{rata.data}</td>
                    <td className="px-3 py-2">{formatujGrosze(rata.kapitalGr)}</td>
                    <td className="px-3 py-2">{formatujGrosze(rata.odsetkiGr)}</td>
                    <td className="px-3 py-2">{formatujGrosze(rata.nadplataGr)}</td>
                    <td className="px-3 py-2">{formatujGrosze(rata.rataGr)}</td>
                    <td className="px-3 py-2">{formatujGrosze(rata.saldoPoSplacieGr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
