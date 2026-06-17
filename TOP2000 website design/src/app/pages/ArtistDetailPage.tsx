import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Music, Globe, Edit, AlertCircle, Loader2, Award, MapPin, BarChart3, Calendar, ChevronRight } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-16 flex items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Artiest wordt geladen...</span>
      </div>
    );
  }

  if (fetchState === 'error' || !artist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 text-destructive">
          <AlertCircle className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Artiest niet gevonden</h1>
        </div>
        {errorMessage && <p className="text-zinc-400 mb-4">{errorMessage}</p>}
        <Link to="/artiesten" className="text-primary hover:underline">
          Terug naar artiesten
        </Link>
      </div>
    );
  }

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

  const yearsSet = new Set<number>();
  songs.forEach(song => {
    song.top2000Entries?.forEach(entry => {
      yearsSet.add(entry.year);
    });
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

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
    <div className="pb-12 text-zinc-100">
      {/* Hero Section with Dynamic Blurred Backdrop */}
      <section className="relative overflow-hidden py-16 border-b border-zinc-800/80 bg-zinc-950 text-white">
        {/* Blurred backdrop image decoration */}
        {(artist.photoUrl || artist.photo) && (
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-105 pointer-events-none transform-gpu"
            style={{ backgroundImage: `url(${artist.photoUrl ?? artist.photo})` }}
          />
        )}
        {/* Red gradient overlay mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 via-red-650/85 to-red-900/90" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* Photo column */}
              <div className="md:col-span-1 flex justify-center">
                <div className="aspect-square w-64 md:w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md relative group">
                  {artist.photoUrl || artist.photo ? (
                    <img
                      src={artist.photoUrl ?? artist.photo}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <Music className="w-24 h-24 text-zinc-700" />
                    </div>
                  )}
                </div>
              </div>

              {/* Detail info column */}
              <div className="md:col-span-2 flex flex-col justify-center text-center md:text-left">
                <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
                  Top 2000 Artiest
                </span>
                <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 leading-tight">
                  {artist.name}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                  <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    <span className="font-bold text-white">{songs.length}</span> {songs.length === 1 ? 'nummer' : 'nummers'} in TOP 2000
                  </div>
                  {countryInfo && (
                    <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                      {countryInfo.flag} {countryInfo.name}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {artist.wikiUrl && (
                    <a
                      href={artist.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800/60 border border-zinc-800 rounded-xl transition-all text-sm font-medium text-zinc-300 hover:text-white shadow-sm"
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800/60 border border-zinc-800 rounded-xl transition-all text-sm font-medium text-zinc-300 hover:text-white shadow-sm"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {isAdmin() && (
                    <Link
                      to="/admin/artiesten"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl transition-all text-sm font-semibold shadow-md"
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
      <section className="py-8 bg-zinc-950 border-b border-zinc-900 shadow-inner">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Land van herkomst */}
              <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 hover:border-zinc-700/30 transition-all">
                <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Herkomst</p>
                  <p className="text-sm font-bold text-zinc-200 truncate">
                    {countryInfo ? `${countryInfo.name} ${countryInfo.flag}` : 'Zie biografie'}
                  </p>
                </div>
              </div>

              {/* Beste positie */}
              <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 hover:border-zinc-700/30 transition-all">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Beste Positie</p>
                  <p className="text-sm font-bold text-zinc-200 truncate" title={bestPosition !== Infinity ? `#${bestPosition} (${bestSongTitle})` : 'Niet genoteerd'}>
                    {bestPosition !== Infinity ? `#${bestPosition}` : 'Niet genoteerd'}
                  </p>
                </div>
              </div>

              {/* Totaal nummers */}
              <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 hover:border-zinc-700/30 transition-all">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Top 2000 Songs</p>
                  <p className="text-sm font-bold text-zinc-200 truncate">{totalSongs}</p>
                </div>
              </div>

              {/* Totaal noteringen */}
              <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 flex items-center gap-3 hover:border-zinc-700/30 transition-all">
                <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Totale Noteringen</p>
                  <p className="text-sm font-bold text-zinc-200 truncate">{totalListings}×</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Biography & Infobox Section */}
      <section className="py-12 bg-zinc-950 border-b border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Biography (Left 2/3) */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  Biografie
                </h2>
                {artist.bio ? (
                  <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-md">
                    <p className="text-base leading-relaxed text-zinc-350 whitespace-pre-line">
                      {artist.bio}
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 border border-dashed border-zinc-850 rounded-2xl p-8 text-center text-zinc-500">
                    Er is momenteel nog geen biografie beschikbaar voor {artist.name}.
                  </div>
                )}
              </div>

              {/* Infobox / Facts (Right 1/3) */}
              <div className="md:col-span-1">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                  Feiten & Details
                </h2>
                <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-md space-y-4">
                  
                  {/* Land van herkomst */}
                  <div className="border-b border-zinc-800/60 pb-3">
                    <p className="text-xs text-zinc-550 font-semibold uppercase tracking-wider mb-1">Land van herkomst</p>
                    <p className="text-sm md:text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      {countryInfo ? `${countryInfo.name} ${countryInfo.flag}` : 'Zie biografie / Onbekend'}
                    </p>
                  </div>

                  {/* Actieve periode */}
                  <div className="border-b border-zinc-800/60 pb-3">
                    <p className="text-xs text-zinc-550 font-semibold uppercase tracking-wider mb-1">Actieve periode (Releases)</p>
                    <p className="text-sm md:text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                      {activeEra}
                    </p>
                  </div>

                  {/* Debuutjaar in Top 2000 */}
                  <div className="border-b border-zinc-800/60 pb-3">
                    <p className="text-xs text-zinc-550 font-semibold uppercase tracking-wider mb-1">Debuut in Top 2000</p>
                    <p className="text-sm md:text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      {debutYearText}
                    </p>
                  </div>

                  {/* Gemiddelde positie */}
                  <div className="border-b border-zinc-800/60 pb-3">
                    <p className="text-xs text-zinc-550 font-semibold uppercase tracking-wider mb-1">Gemiddelde Positie</p>
                    <p className="text-sm md:text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-500 shrink-0" />
                      {averagePositionText}
                    </p>
                  </div>

                  {/* Best presterende song */}
                  <div>
                    <p className="text-xs text-zinc-550 font-semibold uppercase tracking-wider mb-1">Meest Succesvolle Song</p>
                    <p className="text-sm md:text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="truncate text-primary font-bold" title={bestSongTitle || 'Geen'}>
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
        <section className="py-12 bg-zinc-950 border-b border-zinc-900">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Populariteitsverloop (Top 5 nummers)
              </h2>
              <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-md">
                <p className="text-zinc-400 text-sm mb-6">
                  Hieronder zie je het verloop van de posities van de populairste {topSongsForChart.length === 1 ? 'song' : 'songs'} in de Top 2000. Een hogere lijn betekent een betere positie in de lijst.
                </p>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={artistChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                      <XAxis dataKey="jaar" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                      <YAxis
                        domain={[0, 2001]}
                        ticks={[2000, 1500, 1000, 500, 1]}
                        tickFormatter={(value) => (2001 - value).toString()}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(9, 9, 11, 0.95)',
                          borderColor: '#27272a',
                          borderRadius: '12px',
                          color: '#e4e4e7',
                        }}
                        formatter={(value: number) => [(2001 - value).toString(), "Positie"]}
                      />
                      <Legend verticalAlign="top" height={36} />
                      {topSongsForChart.map((song, idx) => {
                        const colors = ["#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];
                        const color = colors[idx % colors.length];
                        return (
                          <Line
                            key={song.songId}
                            type="monotone"
                            dataKey={song.title}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ fill: color, stroke: "#18181b", strokeWidth: 1.5, r: 4 }}
                            activeDot={{ fill: color, stroke: "#fff", strokeWidth: 2, r: 6 }}
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
      <section className="py-12 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Liedjes in de TOP 2000 ({songs.length})
            </h2>

            {songs.length === 0 ? (
              <div className="bg-zinc-900/30 border border-dashed border-zinc-850 rounded-2xl p-8 text-center text-zinc-500">
                Geen nummers gevonden voor deze artiest.
              </div>
            ) : (
              <div className="space-y-3">
                {songs.map((song) => {
                  const bestPos = getBestPositionForSong(song);
                  return (
                    <div
                      key={song.songId}
                      className="bg-zinc-900/30 backdrop-blur-md border border-zinc-850 rounded-xl p-4 hover:shadow-lg hover:border-primary/40 hover:bg-zinc-800/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {song.albumCover ? (
                          <img
                            src={song.albumCover}
                            alt={song.title}
                            className="w-16 h-16 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
                            <Music className="w-6 h-6 text-zinc-700" />
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <Link
                            to={`/nummer/${song.songId}`}
                            className="hover:text-primary transition-colors inline-block max-w-full"
                          >
                            <h3 className="font-bold text-base md:text-lg text-white group-hover:text-primary transition-colors truncate">
                              {song.title}
                            </h3>
                          </Link>
                          <div className="text-zinc-400 text-xs md:text-sm flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 font-medium">
                            <span className="flex items-center gap-1 bg-zinc-850/60 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-350">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              {song.releaseYear}
                            </span>
                            {typeof song.timesListed === 'number' && song.timesListed > 0 && (
                              <>
                                <span className="text-zinc-650">•</span>
                                <span className="bg-zinc-850/60 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                                  {song.timesListed}× genoteerd
                                </span>
                              </>
                            )}
                            {bestPos && (
                              <>
                                <span className="text-zinc-650">•</span>
                                <span className="text-amber-400 font-bold flex items-center gap-0.5">
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
                            className="inline-flex items-center justify-center w-10 h-10 bg-zinc-950/40 border border-zinc-800 rounded-xl hover:bg-zinc-800/40 hover:text-white transition-all text-zinc-400"
                            title="Details bekijken"
                          >
                            <Music className="w-4 h-4" />
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
