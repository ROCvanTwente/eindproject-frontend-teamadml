import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Music, Globe, Edit, AlertCircle, Loader2, Award, MapPin, BarChart3, Calendar } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchArtistForDetail,
  fetchSongsByArtist,
  type BackendArtist,
  type BackendSong,
} from '../data/api';
import { PlayButton } from '../components/PlayButton';

function isAdmin(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const decoded: any = jwtDecode(token);
    const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role === 'Admin';
  } catch {
    return false;
  }
}

function detectCountry(bio: string | undefined): { name: string; flag: string } | null {
  if (!bio) return null;
  const lower = bio.toLowerCase();
  
  const rules = [
    { keys: ['nederlandse', 'nederland', 'dutch', 'nederlands', 'nederlander', 'amsterdam', 'rotterdam', 'den haag', 'utrecht'], name: 'Nederland', flag: '🇳🇱' },
    { keys: ['amerikaanse', 'amerikaans', 'verenigde staten', 'united states', ' us ', 'usa', 'new york', 'los angeles', 'californië'], name: 'Verenigde Staten', flag: '🇺🇸' },
    { keys: ['britse', 'brits', 'engelse', 'engels', 'verenigd koninkrijk', 'united kingdom', ' uk ', 'groot-brittannië', 'london', 'londen', 'engeland', 'schotse', 'schots', 'schotland'], name: 'Verenigd Koninkrijk', flag: '🇬🇧' },
    { keys: ['duitse', 'duits', 'duitsland', 'berlijn', 'munchen'], name: 'Duitsland', flag: '🇩🇪' },
    { keys: ['franse', 'frans', 'frankrijk', 'parijs'], name: 'Frankrijk', flag: '🇫🇷' },
    { keys: ['belgische', 'belgisch', 'belgië', 'brussel', 'antwerpen'], name: 'België', flag: '🇧🇪' },
    { keys: ['zweedse', 'zweeds', 'zweden', 'stockholm'], name: 'Zweden', flag: '🇸🇪' },
    { keys: ['canadese', 'canadees', 'canada', 'toronto', 'montreal'], name: 'Canada', flag: '🇨🇦' },
    { keys: ['australische', 'australisch', 'australië', 'sydney', 'melbourne'], name: 'Australië', flag: '🇦🇺' },
    { keys: ['ierse', 'iers', 'ierland', 'dublin'], name: 'Ierland', flag: '🇮🇪' },
    { keys: ['italiaanse', 'italiaans', 'italië', 'rome', 'milaan'], name: 'Italië', flag: '🇮🇹' },
    { keys: ['spaanse', 'spaans', 'spanje', 'madrid', 'barcelona'], name: 'Spanje', flag: '🇪🇸' },
    { keys: ['jamaicaanse', 'jamaicaans', 'jamaica', 'kingston'], name: 'Jamaica', flag: '🇯🇲' }
  ];

  for (const rule of rules) {
    if (rule.keys.some(key => lower.includes(key))) {
      return { name: rule.name, flag: rule.flag };
    }
  }
  return null;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const artistId = parseInt(id || '0', 10);

  const [artist, setArtist] = useState<BackendArtist | null>(null);
  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadArtistData = async () => {
      if (!artistId || Number.isNaN(artistId)) {
        setFetchState('error');
        setErrorMessage('Ongeldig artiest-ID.');
        return;
      }

      try {
        setFetchState('loading');
        setErrorMessage('');

        const artistResult = await fetchArtistForDetail(artistId);
        if (!isMounted) {
          return;
        }

        if (!artistResult.ok) {
          setFetchState('error');
          setErrorMessage('Artiest kon niet worden geladen uit de database.');
          return;
        }

        const loadedArtist = artistResult.data;
        
        // Use songs returned directly by the artist detail API response if available
        let artistSongs = loadedArtist.songs || [];
        if (artistSongs.length === 0) {
          artistSongs = await fetchSongsByArtist(artistId, loadedArtist.name);
        }

        if (!isMounted) {
          return;
        }

        setArtist({
          ...loadedArtist,
          numberOfSongs: artistSongs.length,
          songs: artistSongs,
        });
        setSongs(artistSongs);
        setFetchState('success');
      } catch {
        if (isMounted) {
          setFetchState('error');
          setErrorMessage('Er is een fout opgetreden bij het laden van de artiest.');
        }
      }
    };

    void loadArtistData();

    return () => {
      isMounted = false;
    };
  }, [artistId]);

  if (fetchState === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Artiest wordt geladen...</span>
      </div>
    );
  }

  if (fetchState === 'error' || !artist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <h1 className="text-3xl font-bold">Artiest niet gevonden</h1>
        </div>
        {errorMessage && <p className="text-muted-foreground mb-4">{errorMessage}</p>}
        <Link to="/artiesten" className="text-primary hover:underline">
          Terug naar artiesten
        </Link>
      </div>
    );
  }

  // Calculate facts/statistics
  const totalSongs = songs.length;
  let bestPosition = Infinity;
  let bestSongTitle = "";
  let totalListings = 0;

  songs.forEach(song => {
    const listingsCount = song.timesListed ?? song.top2000Entries?.length ?? 0;
    totalListings += listingsCount;

    if (song.top2000Entries && song.top2000Entries.length > 0) {
      song.top2000Entries.forEach(entry => {
        if (entry.position < bestPosition) {
          bestPosition = entry.position;
          bestSongTitle = song.title;
        }
      });
    }
  });

  const countryInfo = detectCountry(artist.bio || artist.biography);

  const getBestPositionForSong = (song: BackendSong) => {
    if (song.top2000Entries && song.top2000Entries.length > 0) {
      const positions = song.top2000Entries.map(e => e.position);
      return Math.min(...positions);
    }
    return null;
  };

  // Prepare chart data for the artist's songs
  const yearsSet = new Set<number>();
  songs.forEach(song => {
    song.top2000Entries?.forEach(entry => {
      yearsSet.add(entry.year);
    });
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  // We only want to plot up to top 5 songs to avoid a crowded chart
  const songsWithBestPos = songs.map(song => {
    const best = song.top2000Entries && song.top2000Entries.length > 0
      ? Math.min(...song.top2000Entries.map(e => e.position))
      : Infinity;
    return { song, best };
  }).sort((a, b) => a.best - b.best);

  const topSongsForChart = songsWithBestPos.slice(0, 5).map(item => item.song);

  const artistChartData = sortedYears.map(year => {
    const dataPoint: { [key: string]: any } = { jaar: year };
    topSongsForChart.forEach(song => {
      const entry = song.top2000Entries?.find(e => e.year === year);
      if (entry) {
        dataPoint[song.title] = 2001 - entry.position;
      }
    });
    return dataPoint;
  });

  // Extra Interesting Facts calculations
  const releaseYears = songs.map(s => s.releaseYear).filter(y => typeof y === 'number' && y > 0);
  const minReleaseYear = releaseYears.length > 0 ? Math.min(...releaseYears) : null;
  const maxReleaseYear = releaseYears.length > 0 ? Math.max(...releaseYears) : null;
  const activeEra = minReleaseYear && maxReleaseYear
    ? minReleaseYear === maxReleaseYear
      ? `${minReleaseYear}`
      : `${minReleaseYear} – ${maxReleaseYear}`
    : 'Onbekend';

  let firstTop2000Year = Infinity;
  let totalPositionsSum = 0;
  let totalPositionsCount = 0;

  songs.forEach(song => {
    song.top2000Entries?.forEach(entry => {
      if (entry.year < firstTop2000Year) {
        firstTop2000Year = entry.year;
      }
      totalPositionsSum += entry.position;
      totalPositionsCount++;
    });
  });

  const debutYearText = firstTop2000Year !== Infinity ? firstTop2000Year.toString() : 'Onbekend';
  const averagePositionText = totalPositionsCount > 0 ? `#${Math.round(totalPositionsSum / totalPositionsCount)}` : 'Onbekend';

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-700 via-red-500 to-red-700 py-12 border-b border-border text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/20">
                  {artist.photoUrl || artist.photo ? (
                    <img
                      src={artist.photoUrl ?? artist.photo}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-800/50 flex items-center justify-center">
                      <Music className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">{artist.name}</h1>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-lg font-medium shadow-sm">
                    <span className="font-bold">{songs.length}</span> {songs.length === 1 ? 'nummer' : 'nummers'} in TOP 2000
                  </div>
                  {countryInfo && (
                    <div className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-lg font-medium shadow-sm">
                      {countryInfo.flag} {countryInfo.name}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {artist.wikiUrl && (
                    <a
                      href={artist.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all font-medium text-white shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Wikipedia
                    </a>
                  )}
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all font-medium text-white shadow-sm"
                    >
                      <Globe className="w-4 h-4" />
                      Officiële website
                    </a>
                  )}
                  {isAdmin() && (
                    <Link
                      to="/admin/artiesten"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white border border-amber-600 rounded-lg hover:bg-amber-600 transition-all font-medium shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                      Bewerken (Admin)
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts & Statistics Grid */}
      <section className="py-8 bg-card border-b border-border shadow-inner">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Land van herkomst */}
              <div className="bg-secondary/40 border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all">
                <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Herkomst</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {countryInfo ? `${countryInfo.name} ${countryInfo.flag}` : 'Zie biografie'}
                  </p>
                </div>
              </div>

              {/* Beste positie */}
              <div className="bg-secondary/40 border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Beste Positie</p>
                  <p className="text-sm font-bold text-foreground truncate" title={bestPosition !== Infinity ? `#${bestPosition} (${bestSongTitle})` : 'Niet genoteerd'}>
                    {bestPosition !== Infinity ? `#${bestPosition}` : 'Niet genoteerd'}
                  </p>
                </div>
              </div>

              {/* Totaal nummers */}
              <div className="bg-secondary/40 border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Top 2000 Songs</p>
                  <p className="text-sm font-bold text-foreground truncate">{totalSongs}</p>
                </div>
              </div>

              {/* Totaal noteringen */}
              <div className="bg-secondary/40 border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all">
                <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Totale Noteringen</p>
                  <p className="text-sm font-bold text-foreground truncate">{totalListings}x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biography & Infobox Section */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Biography (Left 2/3) */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  Biografie
                </h2>
                {artist.bio ? (
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                    <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                      {artist.bio}
                    </p>
                  </div>
                ) : (
                  <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                    Er is momenteel nog geen biografie beschikbaar voor {artist.name}.
                  </div>
                )}
              </div>

              {/* Infobox / Facts (Right 1/3) */}
              <div className="md:col-span-1">
                <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                  Feiten & Details
                </h2>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                  
                  {/* Land van herkomst */}
                  <div className="border-b border-border pb-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Land van herkomst</p>
                    <p className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      {countryInfo ? `${countryInfo.name} ${countryInfo.flag}` : 'Zie biografie / Onbekend'}
                    </p>
                  </div>

                  {/* Actieve periode */}
                  <div className="border-b border-border pb-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Actieve periode (Releases)</p>
                    <p className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                      {activeEra}
                    </p>
                  </div>

                  {/* Debuutjaar in Top 2000 */}
                  <div className="border-b border-border pb-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Debuut in Top 2000</p>
                    <p className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      {debutYearText}
                    </p>
                  </div>

                  {/* Gemiddelde positie */}
                  <div className="border-b border-border pb-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Gemiddelde Positie</p>
                    <p className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-500 shrink-0" />
                      {averagePositionText}
                    </p>
                  </div>

                  {/* Best presterende song */}
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Meest Succesvolle Song</p>
                    <p className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="truncate" title={bestSongTitle || 'Geen'}>
                        {bestSongTitle ? `${bestSongTitle} (${bestPosition !== Infinity ? `#${bestPosition}` : ''})` : 'Geen'}
                      </span>
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Populariteitsverloop Section */}
      {sortedYears.length > 0 && (
        <section className="py-12 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Populariteitsverloop
              </h2>
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                <p className="text-muted-foreground text-sm mb-6">
                  Hieronder zie je het verloop van de posities van de populairste {topSongsForChart.length === 1 ? 'song' : 'songs'} in de Top 2000. Een hogere lijn betekent een betere positie in de lijst.
                </p>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={artistChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="jaar" tick={{ fill: 'currentColor', opacity: 0.7 }} />
                      <YAxis
                        domain={[0, 2001]}
                        ticks={[2000, 1500, 1000, 500, 1]}
                        tickFormatter={(value) => (2001 - value).toString()}
                        tick={{ fill: 'currentColor', opacity: 0.7 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-card, #1e1e2e)',
                          borderColor: 'var(--color-border, #3c3c5c)',
                          borderRadius: '8px',
                          color: 'var(--color-foreground, #cdd6f4)',
                        }}
                        formatter={(value: number) => [(2001 - value).toString(), "Positie"]}
                      />
                      <Legend verticalAlign="top" height={36} />
                      {topSongsForChart.map((song, idx) => {
                        const colors = ["#E85D00", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];
                        const color = colors[idx % colors.length];
                        return (
                          <Line
                            key={song.songId}
                            type="monotone"
                            dataKey={song.title}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ fill: color, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Songs Section */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Liedjes in de TOP 2000 ({songs.length})
            </h2>

            {songs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                Geen nummers gevonden voor deze artiest.
              </div>
            ) : (
              <div className="space-y-3">
                {songs.map((song) => {
                  const bestPos = getBestPositionForSong(song);
                  return (
                    <div
                      key={song.songId}
                      className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {song.albumCover ? (
                          <img
                            src={song.albumCover}
                            alt={song.title}
                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                            <Music className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <Link
                            to={`/nummer/${song.songId}`}
                            className="hover:text-primary transition-colors inline-block max-w-full"
                          >
                            <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors truncate">
                              {song.title}
                            </h3>
                          </Link>
                          <div className="text-muted-foreground text-xs md:text-sm flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {song.releaseYear}
                            </span>
                            {typeof song.timesListed === 'number' && song.timesListed > 0 && (
                              <>
                                <span className="text-muted-foreground/50">•</span>
                                <span>{song.timesListed}x in de lijst</span>
                              </>
                            )}
                            {bestPos && (
                              <>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="text-amber-500 font-medium flex items-center gap-0.5">
                                  <Award className="w-3.5 h-3.5" /> Hoogste: #{bestPos}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <PlayButton
                            youtubeUrl={song.youtube}
                            title={song.title}
                            artist={song.artistName ?? artist.name}
                            variant="icon"
                          />
                          <Link
                            to={`/nummer/${song.songId}`}
                            className="inline-flex items-center justify-center w-10 h-10 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Details bekijken"
                          >
                            <Music className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
