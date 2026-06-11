import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, Star, Users, Loader2 } from 'lucide-react';

type StatType = 'stijgers' | 'dalers' | 'newcomers' | 'disappeared' | 'all-editions' | 'top-artists';

interface StijgerDto { songId: number; title: string; artistName: string; currentPosition: number; previousPosition: number; change: number; }
interface DalerDto { songId: number; title: string; artistName: string; currentPosition: number; previousPosition: number; change: number; }
interface NieuwkomerDto { songId: number; title: string; artistName: string; position: number; }
interface InAlleEditiesDto { songId: number; title: string; artistName: string; position: number; }
interface VerdwenenNummerDto { songId: number; title: string; artistName: string; previousPosition: number; }
interface TopArtiestDto { artistName: string; songCount: number; }

export function StatisticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedStat, setSelectedStat] = useState<StatType>('stijgers');

  const [stijgersData, setStijgersData] = useState<StijgerDto[]>([]);
  const [dalersData, setDalersData] = useState<DalerDto[]>([]);
  const [nieuwkomersData, setNieuwkomersData] = useState<NieuwkomerDto[]>([]);
  const [allEditionsData, setAllEditionsData] = useState<InAlleEditiesDto[]>([]);
  const [verdwenenData, setVerdwenenData] = useState<VerdwenenNummerDto[]>([]);
  const [topArtiestenData, setTopArtiestenData] = useState<TopArtiestDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 26 }, (_, i) => 2024 - i);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (selectedStat === 'stijgers') {
      fetch(`/api/top2000/statistics/stijgers/${selectedYear}`)
        .then(res => { if (!res.ok) throw new Error('Geen stijgers gevonden'); return res.json(); })
        .then(data => { setStijgersData(data); setIsLoading(false); })
        .catch(err => { setError(err.message); setStijgersData([]); setIsLoading(false); });
    }
    else if (selectedStat === 'dalers') {
      fetch(`/api/top2000/statistics/dalers/${selectedYear}`)
        .then(res => { if (!res.ok) throw new Error('Geen dalers gevonden'); return res.json(); })
        .then(data => { setDalersData(data); setIsLoading(false); })
        .catch(err => { setError(err.message); setDalersData([]); setIsLoading(false); });
    }
    else if (selectedStat === 'newcomers') {
      fetch(`/api/top2000/statistics/nieuwkomers/${selectedYear}`)
        .then(res => { if (!res.ok) throw new Error('Geen nieuwkomers gevonden'); return res.json(); })
        .then(data => { setNieuwkomersData(data); setIsLoading(false); })
        .catch(err => { setError(err.message); setNieuwkomersData([]); setIsLoading(false); });
    }
    else if (selectedStat === 'all-editions') {
      fetch(`/api/top2000/statistics/in-alle-edities/${selectedYear}`)
        .then(res => { if (!res.ok) throw new Error('Data ophalen mislukt'); return res.json(); })
        .then(data => { setAllEditionsData(data); setIsLoading(false); })
        .catch(err => { setError(err.message); setAllEditionsData([]); setIsLoading(false); });
    }
    else if (selectedStat === 'disappeared') {
      fetch(`/api/top2000/statistics/verdwenen-nummers/${selectedYear}`)
        .then(res => { if (!res.ok) throw new Error('Geen verdwenen nummers gevonden'); return res.json(); })
        .then(data => { setVerdwenenData(data); setIsLoading(false); })
        .catch(err => { setError(err.message); setVerdwenenData([]); setIsLoading(false); });
    }
    else if (selectedStat === 'top-artists') {
      fetch(`/api/top2000/statistics/top-artiesten/${selectedYear}`)
        .then(res => { if (!res.ok) throw new Error('Geen top artiesten gevonden'); return res.json(); })
        .then(data => { setTopArtiestenData(data); setIsLoading(false); })
        .catch(err => { setError(err.message); setTopArtiestenData([]); setIsLoading(false); });
    }
    else {
      setIsLoading(false);
    }
  }, [selectedYear, selectedStat]);

  const statOptions = [
    { id: 'stijgers', label: 'Stijgers', icon: TrendingUp, requiresYear: true },
    { id: 'dalers', label: 'Dalers', icon: TrendingDown, requiresYear: true },
    { id: 'newcomers', label: 'Nieuwkomers', icon: Star, requiresYear: true },
    { id: 'all-editions', label: 'In alle edities', icon: Award, requiresYear: true },
    { id: 'disappeared', label: 'Verdwenen nummers', icon: TrendingDown, requiresYear: true },
    { id: 'top-artists', label: 'Top artiesten', icon: Users, requiresYear: true }
  ] as const;

  const currentStatOption = statOptions.find(opt => opt.id === selectedStat);

  return (
    <div className="pb-12">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Statistieken</h1>
          <p className="text-muted-foreground text-lg">Ontdek interessante statistieken en trends van de TOP 2000</p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label htmlFor="stat-type" className="block mb-2">Statistiek</label>
            <select
              id="stat-type"
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value as StatType)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
            >
              {statOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>

          {currentStatOption?.requiresYear && (
            <div className="w-full md:w-48">
              <label htmlFor="year" className="block mb-2">Jaar</label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden">

          {selectedStat === 'stijgers' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" /> Grootste stijgers naar {selectedYear}
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && stijgersData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary">
                      <tr><th className="px-4 py-3">Stijging</th><th className="px-4 py-3">Positie {selectedYear}</th><th className="px-4 py-3">Positie {selectedYear - 1}</th><th className="px-4 py-3">Nummer</th><th className="px-4 py-3">Artiest</th></tr>
                    </thead>
                    <tbody>
                      {stijgersData.map((song, index) => (
                        <tr key={song.songId} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-green-600 font-bold"><TrendingUp className="w-4 h-4" />+{song.change}</span></td>
                          <td className="px-4 py-3 font-semibold text-primary">{song.currentPosition}</td>
                          <td className="px-4 py-3 text-muted-foreground">{song.previousPosition}</td>
                          <td className="px-4 py-3 font-medium">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data.</p>)}
            </div>
          )}

          {selectedStat === 'dalers' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-destructive" /> Grootste dalers naar {selectedYear}
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && dalersData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary">
                      <tr><th className="px-4 py-3">Daling</th><th className="px-4 py-3">Positie {selectedYear}</th><th className="px-4 py-3">Positie {selectedYear - 1}</th><th className="px-4 py-3">Nummer</th><th className="px-4 py-3">Artiest</th></tr>
                    </thead>
                    <tbody>
                      {dalersData.map((song, index) => (
                        <tr key={song.songId} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-destructive font-bold"><TrendingDown className="w-4 h-4" />-{song.change}</span></td>
                          <td className="px-4 py-3 font-semibold text-primary">{song.currentPosition}</td>
                          <td className="px-4 py-3 text-muted-foreground">{song.previousPosition}</td>
                          <td className="px-4 py-3 font-medium">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data.</p>)}
            </div>
          )}

          {selectedStat === 'newcomers' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" /> Nieuwkomers in {selectedYear}
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && nieuwkomersData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary">
                      <tr><th className="px-4 py-3">Positie</th><th className="px-4 py-3">Nummer</th><th className="px-4 py-3">Artiest</th></tr>
                    </thead>
                    <tbody>
                      {nieuwkomersData.map((song, index) => (
                        <tr key={song.songId} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold text-primary">{song.position}</td>
                          <td className="px-4 py-3 font-medium">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data.</p>)}
            </div>
          )}

          {selectedStat === 'all-editions' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" /> In alle edities
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && allEditionsData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary">
                      <tr><th className="px-4 py-3">Huidige positie in {selectedYear}</th><th className="px-4 py-3">Nummer</th><th className="px-4 py-3">Artiest</th></tr>
                    </thead>
                    <tbody>
                      {allEditionsData.map((song, index) => (
                        <tr key={song.songId} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold text-primary">{song.position}</td>
                          <td className="px-4 py-3 font-medium">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data gevonden.</p>)}
            </div>
          )}

          {selectedStat === 'disappeared' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-destructive" /> Verdwenen uit de lijst sinds {selectedYear - 1}
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && verdwenenData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary">
                      <tr><th className="px-4 py-3">Positie in {selectedYear - 1}</th><th className="px-4 py-3">Nummer</th><th className="px-4 py-3">Artiest</th></tr>
                    </thead>
                    <tbody>
                      {verdwenenData.map((song, index) => (
                        <tr key={song.songId} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold text-destructive">{song.previousPosition}</td>
                          <td className="px-4 py-3 font-medium">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data gevonden.</p>)}
            </div>
          )}

          {selectedStat === 'top-artists' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" /> Top artiesten met de meeste nummers in {selectedYear}
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && topArtiestenData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary">
                      <tr><th className="px-4 py-3">Plek</th><th className="px-4 py-3">Artiest</th><th className="px-4 py-3">Aantal nummers</th></tr>
                    </thead>
                    <tbody>
                      {topArtiestenData.map((artist, index) => (
                        <tr key={artist.artistName} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold text-primary">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{artist.artistName}</td>
                          <td className="px-4 py-3">{artist.songCount} nummers</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data gevonden.</p>)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}