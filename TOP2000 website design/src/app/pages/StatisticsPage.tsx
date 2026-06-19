import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, Star, Users, Loader2, ThumbsUp, Music } from 'lucide-react';
import {
  fetchVoteResults,
  fetchStijgers,
  fetchDalers,
  fetchNieuwkomers,
  fetchInAlleEdities,
  fetchVerdwenenNummers,
  fetchTopArtiesten,
  type VoteResultEntry,
  type StijgerDto,
  type DalerDto,
  type NieuwkomerDto,
  type InAlleEditiesDto,
  type VerdwenenNummerDto,
  type TopArtiestDto
} from '../data/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs space-y-1 font-sans text-white">
        <p className="font-semibold text-zinc-100">{data.name || data.artistName}</p>
        {data.artist && <p className="text-zinc-400">{data.artist}</p>}
        {data.change !== undefined && (
          <p className={`${data.isDaler ? 'text-red-500' : 'text-emerald-500'} font-semibold`}>
            {data.isDaler ? 'Daling' : 'Stijging'}: {data.isDaler ? '-' : '+'}{data.change} {data.change === 1 ? 'plek' : 'plekken'}
          </p>
        )}
        {data.current !== undefined && (
          <p className="text-zinc-400">
            Huidige positie: <span className="text-zinc-200 font-medium">#{data.current}</span> (was #{data.previous})
          </p>
        )}
        {data.songCount !== undefined && (
          <p className="text-blue-400 font-semibold">Aantal nummers: {data.songCount}</p>
        )}
        {data.votes !== undefined && (
          <p className="text-amber-500 font-semibold">Aantal stemmen: {data.votes}</p>
        )}
      </div>
    );
  }
  return null;
};


type StatType = 'stijgers' | 'dalers' | 'newcomers' | 'disappeared' | 'all-editions' | 'top-artists' | 'voting-results';

export function StatisticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedStat, setSelectedStat] = useState<StatType>('stijgers');

  const [stijgersData, setStijgersData] = useState<StijgerDto[]>([]);
  const [dalersData, setDalersData] = useState<DalerDto[]>([]);
  const [nieuwkomersData, setNieuwkomersData] = useState<NieuwkomerDto[]>([]);
  const [allEditionsData, setAllEditionsData] = useState<InAlleEditiesDto[]>([]);
  const [verdwenenData, setVerdwenenData] = useState<VerdwenenNummerDto[]>([]);
  const [topArtiestenData, setTopArtiestenData] = useState<TopArtiestDto[]>([]);
  const [votingResultsData, setVotingResultsData] = useState<VoteResultEntry[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 26 }, (_, i) => 2024 - i);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const handleResult = <T,>(
      promise: Promise<any>,
      setter: (data: T) => void,
      errorMessage: string
    ) => {
      promise
        .then(res => {
          if (!res.ok) throw new Error(res.message ?? errorMessage);
          setter(res.data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setter([] as unknown as T);
          setIsLoading(false);
        });
    };

    if (selectedStat === 'stijgers') {
      handleResult(fetchStijgers(selectedYear), setStijgersData, 'Geen stijgers gevonden');
    }
    else if (selectedStat === 'dalers') {
      handleResult(fetchDalers(selectedYear), setDalersData, 'Geen dalers gevonden');
    }
    else if (selectedStat === 'newcomers') {
      handleResult(fetchNieuwkomers(selectedYear), setNieuwkomersData, 'Geen nieuwkomers gevonden');
    }
    else if (selectedStat === 'all-editions') {
      handleResult(fetchInAlleEdities(selectedYear), setAllEditionsData, 'Data ophalen mislukt');
    }
    else if (selectedStat === 'disappeared') {
      handleResult(fetchVerdwenenNummers(selectedYear), setVerdwenenData, 'Geen verdwenen nummers gevonden');
    }
    else if (selectedStat === 'top-artists') {
      handleResult(fetchTopArtiesten(selectedYear), setTopArtiestenData, 'Geen top artiesten gevonden');
    }
    else if (selectedStat === 'voting-results') {
      handleResult(fetchVoteResults(), setVotingResultsData, 'Geen stemresultaten gevonden');
    }
    else if (selectedStat === 'artists-all-editions') {
      fetch(`http://localhost:5174/api/top2000/statistics/artiesten-in-alle-edities`)
        .then(res => { if (!res.ok) throw new Error('Geen artiesten gevonden'); return res.json(); })
        .then(data => { setArtiestenInAlleEditiesData(data); setIsLoading(false); })
        .catch(err => { setError(err.message); setArtiestenInAlleEditiesData([]); setIsLoading(false); });
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
    { id: 'top-artists', label: 'Top artiesten', icon: Users, requiresYear: true },
    { id: 'artists-all-editions', label: 'Artiesten in alle edities', icon: Users, requiresYear: false }
  ] as const;

  const currentStatOption = statOptions.find(opt => opt.id === selectedStat);

  const getAvatarUrl = (primaryUrl: string | null, secondaryUrl: string | null, name: string) => {
    if (primaryUrl && primaryUrl.trim() !== '') return primaryUrl;
    if (secondaryUrl && secondaryUrl.trim() !== '') return secondaryUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ef4444&color=fff&rounded=true&size=32`;
  };

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden py-12 border-b border-zinc-800 bg-gradient-to-r from-red-900 via-red-655 to-red-900 text-white">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 leading-tight">
            Statistieken
          </h1>
          <p className="text-red-100 text-lg">Ontdek interessante statistieken en trends van de TOP 2000</p>
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={getAvatarUrl(song.songImgUrl, song.artistPhoto, song.artistName)} alt="" className="w-8 h-8 rounded-full shadow-sm object-cover" />
                              {song.artistName}
                            </div>
                          </td>
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={getAvatarUrl(song.songImgUrl, song.artistPhoto, song.artistName)} alt="" className="w-8 h-8 rounded-full shadow-sm object-cover" />
                              {song.artistName}
                            </div>
                          </td>
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={getAvatarUrl(song.songImgUrl, song.artistPhoto, song.artistName)} alt="" className="w-8 h-8 rounded-full shadow-sm object-cover" />
                              {song.artistName}
                            </div>
                          </td>
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={getAvatarUrl(song.songImgUrl, song.artistPhoto, song.artistName)} alt="" className="w-8 h-8 rounded-full shadow-sm object-cover" />
                              {song.artistName}
                            </div>
                          </td>
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={getAvatarUrl(song.songImgUrl, song.artistPhoto, song.artistName)} alt="" className="w-8 h-8 rounded-full shadow-sm object-cover" />
                              {song.artistName}
                            </div>
                          </td>
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 font-medium">
                              <img src={getAvatarUrl(artist.artistPhoto, null, artist.artistName)} alt="" className="w-8 h-8 rounded-full shadow-sm object-cover" />
                              {artist.artistName}
                            </div>
                          </td>
                          <td className="px-4 py-3">{artist.songCount} nummers</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data gevonden.</p>)}
            </div>
          )}

          {selectedStat === 'artists-all-editions' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" /> Artiesten die in elke editie staan
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && artiestenInAlleEditiesData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-secondary">
                      <tr><th className="px-4 py-3">Plek</th><th className="px-4 py-3">Artiest</th><th className="px-4 py-3">Unieke nummers in Top 2000</th></tr>
                    </thead>
                    <tbody>
                      {artiestenInAlleEditiesData.map((artist, index) => (
                        <tr key={artist.artistName} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold text-primary">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 font-medium">
                              <img src={getAvatarUrl(artist.artistPhoto, null, artist.artistName)} alt="" className="w-8 h-8 rounded-full shadow-sm object-cover" />
                              {artist.artistName}
                            </div>
                          </td>
                          <td className="px-4 py-3">{artist.songCount} nummers</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground">Geen data gevonden.</p>)}
            </div>
          )}

          {selectedStat === 'voting-results' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ThumbsUp className="w-6 h-6 text-primary" /> Live Tussenstand TOP 2000 Stemming
              </h2>
              {isLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Laden...</span></div>}
              {!isLoading && error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}
              {!isLoading && !error && votingResultsData.length > 0 ? (
                <div>
                  {/* Chart */}
                  <div className="mb-8 bg-zinc-950/20 border border-border/50 rounded-xl p-4 md:p-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Top 10 Meeste Stemmen</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={votingResultsData.slice(0, 10).map(item => ({
                            name: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
                            artist: item.artistName,
                            votes: item.voteCount
                          }))}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--muted-foreground, #71717a)" fontSize={11} tickLine={false} />
                          <YAxis stroke="var(--muted-foreground, #71717a)" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                          <Bar dataKey="votes" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                            {votingResultsData.slice(0, 10).map((_, index) => (
                              <Cell key={`cell-${index}`} fill="url(#votingGrad)" />
                            ))}
                          </Bar>
                          <defs>
                            <linearGradient id="votingGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.15}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-4 py-3">Plek</th>
                          <th className="px-4 py-3">Cover</th>
                          <th className="px-4 py-3">Nummer</th>
                          <th className="px-4 py-3">Artiest</th>
                          <th className="px-4 py-3">Aantal Stemmen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {votingResultsData.map((result, index) => (
                          <tr key={result.songId} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                            <td className="px-4 py-3 font-extrabold text-primary text-lg">#{index + 1}</td>
                            <td className="px-4 py-2">
                              {result.imgUrl ? (
                                <img
                                  src={result.imgUrl}
                                  alt={result.title}
                                  className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                  <Music className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold">{result.title}</td>
                            <td className="px-4 py-3 text-muted-foreground">{result.artistName}</td>
                            <td className="px-4 py-3 font-semibold text-white">
                              <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                                {result.voteCount} stemmen
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (!isLoading && !error && <p className="text-muted-foreground text-center py-6">Er zijn nog geen stemmen uitgebracht.</p>)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}