import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Award, Star, BarChart3, Users } from 'lucide-react';
import { mockSongs, mockRankings, mockArtists } from '../data/mockData';

type StatType =
  | 'dalers'
  | 'stijgers'
  | 'all-editions'
  | 'newcomers'
  | 'disappeared'
  | 'reentries'
  | 'same-position'
  | 'consecutive'
  | 'single-appearance'
  | 'top-artists';

export function StatisticsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedStat, setSelectedStat] = useState<StatType>('stijgers');

  const years = Array.from({ length: 26 }, (_, i) => 2024 - i);

  const statistics = useMemo(() => {
    // Dalers - songs that dropped in ranking
    const dalers = mockSongs
      .map(song => {
        const currentYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear);
        const previousYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear - 1);

        if (currentYear && previousYear && currentYear.position > previousYear.position) {
          return {
            ...song,
            currentPosition: currentYear.position,
            previousPosition: previousYear.position,
            change: currentYear.position - previousYear.position
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.change - a!.change);

    // Stijgers - songs that rose in ranking
    const stijgers = mockSongs
      .map(song => {
        const currentYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear);
        const previousYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear - 1);

        if (currentYear && previousYear && currentYear.position < previousYear.position) {
          return {
            ...song,
            currentPosition: currentYear.position,
            previousPosition: previousYear.position,
            change: previousYear.position - currentYear.position
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.change - a!.change);

    // Songs in ALL editions (simplified - checking available years)
    const allEditions = mockSongs
      .map(song => {
        const appearances = mockRankings.filter(r => r.songId === song.id);
        const uniqueYears = new Set(appearances.map(r => r.year)).size;

        if (uniqueYears >= 5) { // At least 5 years (simplified)
          return {
            ...song,
            appearances: uniqueYears,
            avgPosition: Math.round(appearances.reduce((sum, r) => sum + r.position, 0) / appearances.length)
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.appearances - a!.appearances);

    // Nieuwkomers - new entries
    const newcomers = mockSongs
      .map(song => {
        const currentYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear);
        const previousYears = mockRankings.filter(r => r.songId === song.id && r.year < selectedYear);

        if (currentYear && previousYears.length === 0) {
          return {
            ...song,
            position: currentYear.position
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.position - b!.position);

    // Verdwenen nummers - songs that disappeared
    const disappeared = mockSongs
      .map(song => {
        const previousYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear - 1);
        const currentYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear);

        if (previousYear && !currentYear) {
          return {
            ...song,
            lastPosition: previousYear.position,
            lastYear: selectedYear - 1
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.lastPosition - b!.lastPosition);

    // Opnieuw binnenkomers - re-entries
    const reentries = mockSongs
      .map(song => {
        const currentYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear);
        const previousYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear - 1);
        const beforePrevious = mockRankings.filter(r => r.songId === song.id && r.year < selectedYear - 1);

        if (currentYear && !previousYear && beforePrevious.length > 0) {
          return {
            ...song,
            currentPosition: currentYear.position,
            yearsAbsent: 1 // Simplified
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.currentPosition - b!.currentPosition);

    // Songs on same position
    const samePosition = mockSongs
      .map(song => {
        const currentYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear);
        const previousYear = mockRankings.find(r => r.songId === song.id && r.year === selectedYear - 1);

        if (currentYear && previousYear && currentYear.position === previousYear.position) {
          return {
            ...song,
            position: currentYear.position
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.position - b!.position);

    // Artists with 2+ consecutive positions
    const consecutivePositions = mockArtists
      .map(artist => {
        const artistSongs = mockSongs.filter(s => s.artistId === artist.id);
        const currentYearRankings = mockRankings
          .filter(r => r.year === selectedYear && artistSongs.some(s => s.id === r.songId))
          .sort((a, b) => a.position - b.position);

        const consecutive = [];
        for (let i = 0; i < currentYearRankings.length - 1; i++) {
          if (currentYearRankings[i + 1].position - currentYearRankings[i].position === 1) {
            const song1 = mockSongs.find(s => s.id === currentYearRankings[i].songId);
            const song2 = mockSongs.find(s => s.id === currentYearRankings[i + 1].songId);
            consecutive.push({
              position1: currentYearRankings[i].position,
              position2: currentYearRankings[i + 1].position,
              song1: song1?.title,
              song2: song2?.title
            });
          }
        }

        if (consecutive.length > 0) {
          return {
            ...artist,
            consecutive
          };
        }
        return null;
      })
      .filter(Boolean);

    // Songs that appeared only once
    const singleAppearance = mockSongs
      .map(song => {
        const appearances = mockRankings.filter(r => r.songId === song.id);

        if (appearances.length === 1) {
          return {
            ...song,
            year: appearances[0].year,
            position: appearances[0].position
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.year - a!.year);

    // Top N artists with most songs per year
    const topArtists = mockArtists
      .map(artist => {
        const artistSongs = mockSongs.filter(s => s.artistId === artist.id);
        const songsInYear = mockRankings.filter(
          r => r.year === selectedYear && artistSongs.some(s => s.id === r.songId)
        );

        if (songsInYear.length > 0) {
          return {
            ...artist,
            songsCount: songsInYear.length,
            highestPosition: Math.min(...songsInYear.map(r => r.position))
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.songsCount - a!.songsCount || a!.highestPosition - b!.highestPosition);

    return {
      dalers,
      stijgers,
      allEditions,
      newcomers,
      disappeared,
      reentries,
      samePosition,
      consecutivePositions,
      singleAppearance,
      topArtists
    };
  }, [selectedYear]);

  const statOptions = [
    { id: 'stijgers', label: 'Stijgers', icon: TrendingUp, requiresYear: true },
    { id: 'dalers', label: 'Dalers', icon: TrendingDown, requiresYear: true },
    { id: 'all-editions', label: 'In alle edities', icon: Award, requiresYear: false },
    { id: 'newcomers', label: 'Nieuwkomers', icon: Star, requiresYear: true },
    { id: 'disappeared', label: 'Verdwenen nummers', icon: TrendingDown, requiresYear: true },
    { id: 'reentries', label: 'Opnieuw binnenkomers', icon: TrendingUp, requiresYear: true },
    { id: 'same-position', label: 'Zelfde positie', icon: BarChart3, requiresYear: true },
    { id: 'consecutive', label: 'Opeenvolgende posities', icon: Users, requiresYear: true },
    { id: 'single-appearance', label: 'Eén keer in de lijst', icon: Star, requiresYear: false },
    { id: 'top-artists', label: 'Top artiesten', icon: Users, requiresYear: true }
  ] as const;

  const currentStatOption = statOptions.find(opt => opt.id === selectedStat);

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Statistieken</h1>
          <p className="text-muted-foreground text-lg">
            Ontdek interessante statistieken en trends van de TOP 2000
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label htmlFor="stat-type" className="block mb-2">
              Statistiek
            </label>
            <select
              id="stat-type"
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value as StatType)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
            >
              {statOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {currentStatOption?.requiresYear && (
            <div className="w-full md:w-48">
              <label htmlFor="year" className="block mb-2">
                Jaar
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Statistics Display */}
        <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
          {/* Stijgers */}
          {selectedStat === 'stijgers' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Stijgers in {selectedYear}
              </h2>
              {statistics.stijgers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Positie {selectedYear}</th>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Positie {selectedYear - 1}</th>
                        <th className="px-4 py-3 text-left">Stijging</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.stijgers.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.currentPosition}</td>
                          <td className="px-4 py-3">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                          <td className="px-4 py-3">{song.previousPosition}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                              <TrendingUp className="w-4 h-4" />
                              +{song.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen stijgers gevonden voor {selectedYear}</p>
              )}
            </div>
          )}

          {/* Dalers */}
          {selectedStat === 'dalers' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-destructive" />
                Dalers in {selectedYear}
              </h2>
              {statistics.dalers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Positie {selectedYear}</th>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Positie {selectedYear - 1}</th>
                        <th className="px-4 py-3 text-left">Daling</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.dalers.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.currentPosition}</td>
                          <td className="px-4 py-3">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                          <td className="px-4 py-3">{song.previousPosition}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                              <TrendingDown className="w-4 h-4" />
                              -{song.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen dalers gevonden voor {selectedYear}</p>
              )}
            </div>
          )}

          {/* All Editions */}
          {selectedStat === 'all-editions' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Nummers in alle edities
              </h2>
              {statistics.allEditions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Aantal edities</th>
                        <th className="px-4 py-3 text-left">Gemiddelde positie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.allEditions.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                          <td className="px-4 py-3">{song.appearances}</td>
                          <td className="px-4 py-3">{song.avgPosition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen nummers gevonden die in alle edities voorkomen</p>
              )}
            </div>
          )}

          {/* Newcomers */}
          {selectedStat === 'newcomers' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Nieuwkomers in {selectedYear}
              </h2>
              {statistics.newcomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Positie</th>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Jaar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.newcomers.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.position}</td>
                          <td className="px-4 py-3">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                          <td className="px-4 py-3">{song.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen nieuwkomers gevonden voor {selectedYear}</p>
              )}
            </div>
          )}

          {/* Disappeared */}
          {selectedStat === 'disappeared' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-muted-foreground" />
                Verdwenen nummers in {selectedYear}
              </h2>
              {statistics.disappeared.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Laatste positie</th>
                        <th className="px-4 py-3 text-left">Laatste jaar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.disappeared.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                          <td className="px-4 py-3">{song.lastPosition}</td>
                          <td className="px-4 py-3">{song.lastYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen verdwenen nummers gevonden voor {selectedYear}</p>
              )}
            </div>
          )}

          {/* Re-entries */}
          {selectedStat === 'reentries' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Opnieuw binnenkomers in {selectedYear}
              </h2>
              {statistics.reentries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Positie</th>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Jaren afwezig</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.reentries.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.currentPosition}</td>
                          <td className="px-4 py-3">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                          <td className="px-4 py-3">{song.yearsAbsent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen opnieuw binnenkomers gevonden voor {selectedYear}</p>
              )}
            </div>
          )}

          {/* Same Position */}
          {selectedStat === 'same-position' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Zelfde positie in {selectedYear}
              </h2>
              {statistics.samePosition.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Positie</th>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.samePosition.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.position}</td>
                          <td className="px-4 py-3">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen nummers op dezelfde positie gevonden voor {selectedYear}</p>
              )}
            </div>
          )}

          {/* Consecutive Positions */}
          {selectedStat === 'consecutive' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Artiesten met opeenvolgende posities in {selectedYear}
              </h2>
              {statistics.consecutivePositions.length > 0 ? (
                <div className="space-y-4">
                  {statistics.consecutivePositions.map((artist) => (
                    <div key={artist.id} className="bg-secondary/30 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{artist.name}</h3>
                      <div className="space-y-1">
                        {artist.consecutive.map((cons, idx) => (
                          <p key={idx} className="text-sm">
                            <span className="font-semibold">#{cons.position1}</span> {cons.song1} → <span className="font-semibold">#{cons.position2}</span> {cons.song2}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Geen artiesten met opeenvolgende posities gevonden voor {selectedYear}</p>
              )}
            </div>
          )}

          {/* Single Appearance */}
          {selectedStat === 'single-appearance' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Nummers die maar één keer in de lijst stonden
              </h2>
              {statistics.singleAppearance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Nummer</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Jaar</th>
                        <th className="px-4 py-3 text-left">Positie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.singleAppearance.map((song, index) => (
                        <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{song.title}</td>
                          <td className="px-4 py-3">{song.artistName}</td>
                          <td className="px-4 py-3">{song.year}</td>
                          <td className="px-4 py-3">{song.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen nummers met één verschijning gevonden</p>
              )}
            </div>
          )}

          {/* Top Artists */}
          {selectedStat === 'top-artists' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Top artiesten in {selectedYear}
              </h2>
              {statistics.topArtists.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left">Rang</th>
                        <th className="px-4 py-3 text-left">Artiest</th>
                        <th className="px-4 py-3 text-left">Aantal nummers</th>
                        <th className="px-4 py-3 text-left">Hoogste positie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.topArtists.map((artist, index) => (
                        <tr key={artist.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                          <td className="px-4 py-3 font-semibold">{index + 1}</td>
                          <td className="px-4 py-3">{artist.name}</td>
                          <td className="px-4 py-3">{artist.songsCount}</td>
                          <td className="px-4 py-3">#{artist.highestPosition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Geen artiesten gevonden voor {selectedYear}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
