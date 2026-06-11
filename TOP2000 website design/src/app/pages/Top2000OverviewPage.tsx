import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Trophy, TrendingUp, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { mockSongs, mockRankings } from '../data/mockData';

export function Top2000OverviewPage() {
  const currentYear = 2024;

  // Get all rankings for current year and sort by position
  const currentYearRankings = mockRankings
    .filter(ranking => ranking.year === currentYear)
    .sort((a, b) => a.position - b.position)
    .slice(0, 10); // Top 10

  // Get song details for current rankings
  const topSongs = currentYearRankings.map(ranking => ({
    ...mockSongs.find(song => song.id === ranking.songId),
    position: ranking.position,
  }));

  // Story 58: Artiesten met meeste nummers in de Top 2000
  const artistSongCounts = mockSongs.reduce((acc, song) => {
    const artist = acc.find(a => a.artistId === song.artistId);
    if (artist) {
      artist.count++;
    } else {
      acc.push({ artistId: song.artistId, artistName: song.artistName, count: 1 });
    }
    return acc;
  }, [] as Array<{ artistId: number; artistName: string; count: number }>);

  const topArtists = artistSongCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Story 57: Liedjes die elk jaar in de lijst stonden
  const allYears = Array.from(new Set(mockRankings.map(r => r.year))).sort((a, b) => b - a);
  const yearlySongCounts = {} as Record<number, number>;

  mockSongs.forEach(song => {
    const yearsPresent = new Set(mockRankings.filter(r => r.songId === song.id).map(r => r.year)).size;
    yearlySongCounts[song.id] = yearsPresent;
  });

  const everySongIds = mockSongs
    .filter(song => yearlySongCounts[song.id] === allYears.length)
    .map(s => s.id);

  // Story 53 & 54: Grootste stijgers en dalers
  const previousYear = currentYear - 1;
  const currentPositions = mockRankings.filter(r => r.year === currentYear);
  const previousPositions = mockRankings.filter(r => r.year === previousYear);

  const rankingChanges = currentPositions.map(current => {
    const previous = previousPositions.find(p => p.songId === current.songId);
    const change = previous ? previous.position - current.position : 0;
    return { songId: current.songId, change, position: current.position };
  });

  const biggestRisers = rankingChanges
    .filter(r => r.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 3)
    .map(r => ({
      ...mockSongs.find(s => s.id === r.songId),
      change: r.change,
      position: r.position
    }));

  const biggestFallers = rankingChanges
    .filter(r => r.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 3)
    .map(r => ({
      ...mockSongs.find(s => s.id === r.songId),
      change: Math.abs(r.change),
      position: r.position
    }));

  // Story 55: Nieuwkomers in de lijst
  const newcomers = currentPositions
    .filter(current => !previousPositions.some(p => p.songId === current.songId))
    .slice(0, 3)
    .map(r => ({
      ...mockSongs.find(s => s.id === r.songId),
      position: r.position
    }));

  // Story 56: Verdwenen liedjes uit de lijst
  const disappeared = previousPositions
    .filter(previous => !currentPositions.some(c => c.songId === previous.songId))
    .slice(0, 3)
    .map(r => ({
      ...mockSongs.find(s => s.id === r.songId),
      previousPosition: r.position
    }));

  // Statistics
  const totalSongs = mockSongs.length;
  const totalYears = allYears.length;
  const averagePosition = (
    mockRankings.reduce((sum, r) => sum + r.position, 0) / mockRankings.length
  ).toFixed(1);

  return (
    <div className="pb-12">
      {/* Hero Section - Story 73: Modern interface-ontwerp */}
      <section className="bg-gradient-to-r from-primary via-accent to-secondary text-white py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">TOP 2000</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-4">
              Overzicht van de ultieme muziekuitzending
            </p>
            <p className="text-lg opacity-80">
              Jaarlijks stellen luisteraars van NPO Radio 2 hun favoriete nummers samen
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Stats Grid - Story 72: Responsive design */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-md text-center">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">{totalSongs}</h3>
              <p className="text-muted-foreground">Nummers in database</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 shadow-md text-center">
              <Calendar className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">{totalYears}</h3>
              <p className="text-muted-foreground">Jaren gegevens</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 shadow-md text-center">
              <TrendingUp className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">{averagePosition}</h3>
              <p className="text-muted-foreground">Gemiddelde positie</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 shadow-md text-center">
              <Music className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">{currentYear}</h3>
              <p className="text-muted-foreground">Huidge TOP 2000</p>
            </div>
          </section>

          {/* Current Top 10 - Story 41: Top 2000-lijst per jaar bekijken */}
          <section>
            <h2 className="text-3xl font-bold mb-8">TOP 10 van {currentYear}</h2>

            <div className="space-y-3">
              {topSongs.map((song, index) => (
                <Link
                  key={song?.id}
                  to={`/nummer/${song?.id}`}
                  className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    {/* Position Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                        'bg-primary text-white'
                      }`}>
                        #{song?.position}
                      </div>
                    </div>

                    {/* Song Cover */}
                    {song?.albumCover && (
                      <img
                        src={song.albumCover}
                        alt={song.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}

                    {/* Song Info */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                        {song?.title}
                      </h3>
                      <Link
                        to={`/artiest/${song?.artistId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {song?.artistName}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Origineel uit {song?.year} • {song?.timesListed} keer genoteerd
                      </p>
                    </div>

                    {/* View Icon */}
                    <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Story 58: Artiesten met meeste nummers in de Top 2000 */}
          <section>
            <h2 className="text-3xl font-bold mb-8">Top Artiesten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topArtists.map(artist => (
                <Link
                  key={artist.artistId}
                  to={`/artiest/${artist.artistId}`}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/30 transition-all text-center group"
                >
                  <Trophy className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate mb-2">
                    {artist.artistName}
                  </h3>
                  <p className="text-2xl font-bold text-primary">{artist.count}</p>
                  <p className="text-sm text-muted-foreground">nummers in TOP 2000</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Story 53: Grootste stijgers */}
          {biggestRisers.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8">Grootste Stijgers van {currentYear}</h2>
              <div className="space-y-3">
                {biggestRisers.map(song => (
                  <Link
                    key={song?.id}
                    to={`/nummer/${song?.id}`}
                    className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-green-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {song?.title}
                        </h3>
                        <p className="text-muted-foreground">{song?.artistName}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Nu positie</p>
                          <p className="text-2xl font-bold">{song?.position}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                          <ArrowUp className="w-5 h-5" />
                          <span className="font-bold">{song?.change}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Story 54: Grootste dalers */}
          {biggestFallers.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8">Grootste Dalers van {currentYear}</h2>
              <div className="space-y-3">
                {biggestFallers.map(song => (
                  <Link
                    key={song?.id}
                    to={`/nummer/${song?.id}`}
                    className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-red-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {song?.title}
                        </h3>
                        <p className="text-muted-foreground">{song?.artistName}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Nu positie</p>
                          <p className="text-2xl font-bold">{song?.position}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg">
                          <ArrowDown className="w-5 h-5" />
                          <span className="font-bold">{song?.change}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Story 55: Nieuwkomers in de lijst */}
          {newcomers.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8">Nieuwkomers in {currentYear}</h2>
              <div className="space-y-3">
                {newcomers.map(song => (
                  <Link
                    key={song?.id}
                    to={`/nummer/${song?.id}`}
                    className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {song?.title}
                        </h3>
                        <p className="text-muted-foreground">{song?.artistName}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                          <p className="text-sm">Positie</p>
                          <p className="text-2xl font-bold">#{song?.position}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Story 56: Verdwenen liedjes uit de lijst */}
          {disappeared.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8">Verdwenen uit de TOP 2000</h2>
              <div className="space-y-3">
                {disappeared.map(song => (
                  <Link
                    key={song?.id}
                    to={`/nummer/${song?.id}`}
                    className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-gray-500/30 transition-all group opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {song?.title}
                        </h3>
                        <p className="text-muted-foreground">{song?.artistName}</p>
                      </div>
                      <div className="text-center bg-gray-100 text-gray-600 px-4 py-2 rounded-lg">
                        <p className="text-sm">Vorige positie</p>
                        <p className="text-2xl font-bold">#{song?.previousPosition}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Info Section */}
          <section className="bg-secondary rounded-lg p-8 border border-border">
            <h2 className="text-2xl font-bold mb-4">Over de TOP 2000</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                De TOP 2000 is een jaarlijks terugkerend radioprogramma van NPO Radio 2 dat plaatsvindt tussen Kerstmis en Nieuwjaarsdag. Het programma bestaat uit een countdown van de 2000 beste nummers aller tijden, samengesteld uit stemmen van luisteraars.
              </p>
              <p>
                Elk jaar stemmen honderdduizenden luisteraars op hun favoriete nummers. De voorkeur voor bepaalde nummers is opmerkelijk consistent, met klassiekers die jaar na jaar hoge posities behalen.
              </p>
              {everySongIds.length > 0 && (
                <p>
                  <strong>{everySongIds.length}</strong> nummers stonden in alle jaren van onze database - echte klassiekers!
                </p>
              )}
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border-2 border-primary/20 text-center">
            <h3 className="text-2xl font-bold mb-4">Verken de volledige TOP 2000</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Bekijk alle nummers die in de TOP 2000 hebben gestaan, volg hun positie door de jaren heen en ontdek de geschiedenis van deze iconische radiouitzending.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/nummers"
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Bekijk alle nummers
              </Link>
              <Link
                to="/artiesten"
                className="px-8 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
              >
                Bekijk alle artiesten
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
