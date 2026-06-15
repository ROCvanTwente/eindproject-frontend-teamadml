import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Play, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { fetchTop2000Years, loadTop2000ByYear, type BackendTop2000Entry } from '../data/api';

export function ListPage() {
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);

  const [years, setYears] = useState<string[]>([]);
  const [entries, setEntries] = useState<BackendTop2000Entry[]>([]);
  const [previousEntriesMap, setPreviousEntriesMap] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallbackNotice, setFallbackNotice] = useState('');

  // Fetch available years from database
  useEffect(() => {
    let isMounted = true;
    const loadYears = async () => {
      try {
        const result = await fetchTop2000Years();
        if (result.ok && result.data && result.data.length > 0) {
          const sortedYears = [...result.data].sort((a, b) => b - a).map(y => y.toString());
          const displayYears: string[] = [];
          if (!sortedYears.includes("2026")) displayYears.push("2026");
          if (!sortedYears.includes("2025")) displayYears.push("2025");
          displayYears.push(...sortedYears);

          if (isMounted) {
            setYears(displayYears);
            setSelectedYear("2026"); // Default to current year 2026
          }
        }
      } catch (err) {
        console.error('Failed to load years:', err);
      }
    };
    void loadYears();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch entries for the selected year and the previous year
  useEffect(() => {
    if (!selectedYear) return;
    let isMounted = true;
    const loadEntries = async () => {
      setLoading(true);
      setError('');
      try {
        const yearInt = parseInt(selectedYear, 10);
        
        // Find latest year in DB
        const yearsResult = await fetchTop2000Years();
        let dbLatestYear = 2024;
        if (yearsResult.ok && yearsResult.data && yearsResult.data.length > 0) {
          dbLatestYear = Math.max(...yearsResult.data);
        }

        let queryYear = yearInt;
        let showNotice = '';

        if (yearInt > dbLatestYear) {
          queryYear = dbLatestYear;
          showNotice = `Editie ${selectedYear} is nog niet gestart. We tonen de meest recente lijst van ${dbLatestYear}.`;
        }

        const [currentRes, prevRes] = await Promise.all([
          loadTop2000ByYear(queryYear),
          loadTop2000ByYear(queryYear - 1)
        ]);

        if (!currentRes.ok) {
          throw new Error(currentRes.message || 'Kon de Top 2000 lijst niet ophalen.');
        }

        const prevMap = new Map<number, number>();
        if (prevRes.ok && prevRes.data) {
          prevRes.data.forEach(entry => {
            prevMap.set(entry.songId, entry.position);
          });
        }

        if (isMounted) {
          setEntries(currentRes.data);
          setPreviousEntriesMap(prevMap);
          setFallbackNotice(showNotice);
          setLoading(false);
          setVisibleCount(20); // Reset scroll position pagination count
        }
      } catch (err: any) {
        console.error('Failed to load entries:', err);
        if (isMounted) {
          setError(err.message || 'Fout bij het laden van data uit de database.');
          setLoading(false);
        }
      }
    };
    void loadEntries();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  // Compute filtered list first without allocating unnecessary mapped objects (optimizes CPU/GC lag)
  const filteredRawEntries = useMemo(() => {
    return entries.filter(entry => {
      const title = entry.song.title;
      const artist = entry.song.artistName || entry.song.artist?.name || 'Onbekende artiest';
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (positionFilter === 'all') return true;
      if (positionFilter === 'top10') return entry.position <= 10;
      if (positionFilter === 'top100') return entry.position <= 100;
      if (positionFilter === 'top500') return entry.position <= 500;

      return true;
    });
  }, [entries, searchTerm, positionFilter]);

  // Only map the visible subset of entries (reduces memory from 2000 items to 20 on render)
  const visibleSongs = useMemo(() => {
    return filteredRawEntries.slice(0, visibleCount).map(entry => {
      const prevPos = previousEntriesMap.get(entry.songId);
      let change: number | 'new' | 0 = 0;
      if (prevPos === undefined) {
        change = 'new';
      } else {
        change = prevPos - entry.position;
      }
      return {
        position: entry.position,
        title: entry.song.title,
        artist: entry.song.artistName || entry.song.artist?.name || 'Onbekende artiest',
        year: entry.song.releaseYear || 0,
        change
      };
    });
  }, [filteredRawEntries, visibleCount, previousEntriesMap]);

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">De Top 2000</h1>
          <p className="text-muted-foreground">
            Bekijk de volledige lijst van alle 2000 nummers
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8">
        {/* Filters */}
        <div className="bg-card border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year Selector */}
            <div>
              <label className="block text-sm mb-2">Jaar</label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={years.length === 0}
                  className="w-full px-4 py-2 border border-border rounded-lg appearance-none bg-input-background focus:outline-none focus:ring-2 focus:ring-primary pr-10 disabled:opacity-55"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-sm mb-2">Positie</label>
              <div className="relative">
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg appearance-none bg-input-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                >
                  <option value="all">Alle posities</option>
                  <option value="top10">Top 10</option>
                  <option value="top100">Top 100</option>
                  <option value="top500">Top 500</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm mb-2">Zoeken</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Zoek op titel of artiest..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fallback year warning banner */}
        {fallbackNotice && !loading && (
          <div className="bg-primary/10 border border-primary/25 text-foreground px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm font-medium">{fallbackNotice}</span>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4 text-muted-foreground">
          {loading ? 'Laden...' : `${filteredRawEntries.length} ${filteredRawEntries.length === 1 ? 'nummer' : 'nummers'} gevonden`}
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div
                key={i}
                className="bg-card border border-border p-4 animate-pulse flex items-center gap-4"
              >
                <div className="w-12 h-8 bg-zinc-800 rounded"></div>
                <div className="flex-grow space-y-2">
                  <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 mb-8 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-destructive mb-1">Muzieklijst kon niet worden geladen</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        ) : (
          /* Songs List */
          <div className="space-y-2">
            {visibleSongs.map((song, index) => (
              <div
                key={index}
                className="bg-card border border-border p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Position */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className={`text-2xl font-bold ${song.position <= 10 ? 'text-primary' : ''}`}>
                      {song.position}
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-lg truncate">{song.title}</h3>
                    <p className="text-muted-foreground">{song.artist} {song.year > 0 && `• ${song.year}`}</p>
                  </div>

                  {/* Change Indicator */}
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    {song.change === 'new' ? (
                      <span className="text-primary font-semibold text-xs bg-primary/10 px-2 py-0.5 border border-primary/20 rounded">
                        Nieuw
                      </span>
                    ) : typeof song.change === 'number' && song.change > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">+{song.change}</span>
                      </>
                    ) : typeof song.change === 'number' && song.change < 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">{song.change}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  {/* Play Button */}
                  <button className="flex-shrink-0 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors cursor-pointer">
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}

            {/* Load More */}
            {visibleCount < filteredRawEntries.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Laad meer nummers
                </button>
              </div>
            )}

            {filteredRawEntries.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">Geen nummers gevonden</h3>
                <p className="text-muted-foreground">Probeer een andere filter of zoekterm</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
