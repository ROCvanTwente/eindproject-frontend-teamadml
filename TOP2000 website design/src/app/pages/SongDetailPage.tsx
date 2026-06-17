import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Edit, Music as MusicIcon, AlertCircle, Loader2, Calendar, TrendingUp, Award, ChevronRight } from "lucide-react";
import { jwtDecode } from 'jwt-decode';
import {
  fetchSongForDetail,
  fetchSongRankings,
  fetchArtists,
  fetchArtistForDetail,
  type BackendSong,
  type SongRanking,
  type BackendArtist,
} from "../data/api";
import { PlayButton } from '../components/PlayButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

type FetchState = 'idle' | 'loading' | 'success' | 'error';

interface DisplaySong extends BackendSong {
  year?: number;
}

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const songId = parseInt(id || "0", 10);

  const [song, setSong] = useState<DisplaySong | null>(null);
  const [rankings, setRankings] = useState<SongRanking[]>([]);
  const [artist, setArtist] = useState<BackendArtist | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSongData = async () => {
      if (!songId || Number.isNaN(songId)) {
        setFetchState('error');
        setErrorMessage('Ongeldig nummer-ID.');
        return;
      }

      try {
        setFetchState('loading');
        setErrorMessage('');

        const songResult = await fetchSongForDetail(songId);
        if (!isMounted) {
          return;
        }

        if (!songResult.ok) {
          setFetchState('error');
          setErrorMessage('Nummer kon niet worden geladen uit de database.');
          return;
        }

        const loadedSong: DisplaySong = {
          ...songResult.data,
          year: songResult.data.releaseYear,
        };

        setSong(loadedSong);

        if (songResult.rankings && songResult.rankings.length > 0) {
          setRankings(songResult.rankings);
          setSong((current) => current ? {
            ...current,
            timesListed: songResult.rankings!.length,
          } : current);
        } else {
          const rankingsResult = await fetchSongRankings(songId);
          if (isMounted && rankingsResult.ok && rankingsResult.data.length > 0) {
            setRankings(rankingsResult.data);
            setSong((current) => current ? {
              ...current,
              timesListed: rankingsResult.data.length,
            } : current);
          }
        }

        try {
          const artistDetailResult = await fetchArtistForDetail(loadedSong.artistId);
          if (isMounted && artistDetailResult.ok) {
            setArtist(artistDetailResult.data);
          } else {
            const artistsResult = await fetchArtists();
            if (isMounted && artistsResult.ok) {
              const foundArtist = artistsResult.data.find(
                (item) => item.artistId === loadedSong.artistId,
              );
              setArtist(foundArtist ?? null);
            }
          }
        } catch {
          // Artiest-info is optioneel; nummerpagina moet blijven werken
        }

        setFetchState('success');
      } catch {
        if (isMounted) {
          setFetchState('error');
          setErrorMessage('Er is een fout opgetreden bij het laden van het nummer.');
        }
      }
    };

    void loadSongData();

    return () => {
      isMounted = false;
    };
  }, [songId]);

  if (fetchState === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Nummer wordt geladen...</span>
      </div>
    );
  }

  if (fetchState === 'error' || !song) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 text-destructive">
          <AlertCircle className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Nummer niet gevonden</h1>
        </div>
        {errorMessage && <p className="text-zinc-400 mb-4">{errorMessage}</p>}
        <Link to="/nummers" className="text-primary hover:underline">
          Terug naar nummers
        </Link>
      </div>
    );
  }

  const artistName = song.artistName ?? `Artiest ${song.artistId}`;
  const chartData = rankings.map(r => ({
    jaar: r.year.toString(),
    positie: 2001 - r.position
  }));

  const allRankingYears = new Set(rankings.map(r => r.year));
  const isEveryYearClassic = rankings.length > 0 && rankings.length === allRankingYears.size;

  return (
    <div className="pb-12 text-zinc-100">
      {/* Hero Section with Dynamic Blurred Backdrop */}
      <section className="relative overflow-hidden py-16 border-b border-zinc-800/80 bg-zinc-950 text-white">
        {/* Blurred backdrop image decoration */}
        {song.albumCover && (
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-15 scale-105 pointer-events-none transform-gpu"
            style={{ backgroundImage: `url(${song.albumCover})` }}
          />
        )}
        {/* Red gradient overlay mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 via-red-600/85 to-red-900/90" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* Album cover column */}
              <div className="md:col-span-1 flex justify-center">
                <div className="aspect-square w-64 md:w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md relative group">
                  {song.albumCover ? (
                    <img
                      src={song.albumCover}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <MusicIcon className="w-24 h-24 text-zinc-700" />
                    </div>
                  )}
                </div>
              </div>

              {/* Detail info column */}
              <div className="md:col-span-2 flex flex-col justify-center text-center md:text-left">
                <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
                  Top 2000 Catalogus
                </span>
                <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 leading-tight">
                  {song.title}
                </h1>
                
                <Link
                  to={`/artiest/${song.artistId}`}
                  className="text-xl md:text-2xl text-zinc-300 hover:text-primary transition-colors mb-6 inline-block font-medium"
                >
                  {artistName}
                </Link>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                  <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    Jaar: <span className="font-bold text-white">{song.year ?? song.releaseYear}</span>
                  </div>
                  <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    <span className="font-bold text-white">{song.timesListed ?? rankings.length}</span>x genoteerd
                  </div>
                  {isEveryYearClassic && (
                    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/5">
                      ⭐ Klassieke Evergreen
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                  <PlayButton
                    youtubeUrl={song.youtube}
                    title={song.title}
                    artist={artistName}
                    variant="default"
                  />
                  
                  {isAdmin() && (
                    <Link
                      to="/admin/nummers"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl hover:bg-amber-500/25 transition-all text-sm font-semibold"
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

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Song lyrics preview */}
          {song.lyricsPreview && (
            <section>
              <h2 className="text-2xl font-bold mb-5 text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Songtekst (preview)
              </h2>
              <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-lg">
                <p className="text-lg italic text-zinc-300 leading-relaxed whitespace-pre-line">
                  "{song.lyricsPreview}"
                </p>
                <p className="text-xs text-zinc-500 mt-6 border-t border-zinc-800/60 pt-4">
                  © Volledige songtekst beschikbaar via officiële muziekbronnen.
                </p>
              </div>
            </section>
          )}

          {/* Rankings Chart */}
          {rankings.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5 text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Noteringen door de jaren heen
              </h2>
              <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-lg">
                <p className="text-sm text-zinc-400 mb-6">
                  Dit overzicht laat het positieverloop zien in de jaarlijkse Top 2000 lijst. Een stijging van de lijn staat voor een hogere populariteit.
                </p>
                
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.4} />
                      <XAxis dataKey="jaar" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                      <YAxis
                        domain={[0, 2001]}
                        ticks={[2000, 1500, 1000, 500, 1]}
                        tickFormatter={(value) => (2001 - value).toString()}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const year = payload[0].payload.jaar;
                            const pos = 2001 - (payload[0].value as number);
                            return (
                              <div className="bg-zinc-950/95 border border-zinc-800 backdrop-blur px-3.5 py-2.5 rounded-xl shadow-xl text-xs font-semibold text-zinc-200">
                                <p className="text-zinc-500 mb-1">Top 2000 in {year}</p>
                                <p className="text-primary font-bold text-sm">Positie: <span className="text-white">#{pos}</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="positie"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: "#ef4444", stroke: "#18181b", strokeWidth: 1.5, r: 5 }}
                        activeDot={{ fill: "#ef4444", stroke: "#fff", strokeWidth: 2, r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-10">
                  <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-wider text-xs text-zinc-400">Alle Noteringen</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {rankings.map(ranking => (
                      <div
                        key={ranking.year}
                        className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4 text-center hover:bg-zinc-800/20 hover:border-primary/30 transition-all shadow"
                      >
                        <div className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">
                          {ranking.year}
                        </div>
                        <div className="text-2xl font-extrabold text-primary">
                          #{ranking.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Unified Artist spotlight section */}
          {artist && (
            <section>
              <h2 className="text-2xl font-bold mb-5 text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Over de artiest
              </h2>
              <Link
                to={`/artiest/${artist.artistId}`}
                className="block bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Artist photo */}
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-950 border-2 border-zinc-800 shrink-0 relative shadow-md">
                    {artist.photoUrl || artist.photo ? (
                      <img
                        src={artist.photoUrl ?? artist.photo}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <MusicIcon className="w-10 h-10 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  
                  {/* Artist info details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Artiest profiel</span>
                    <h3 className="text-2xl font-black group-hover:text-primary transition-colors mb-1 text-white">
                      {artist.name}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {artist.numberOfSongs ?? 0} {artist.numberOfSongs === 1 ? 'nummer' : 'nummers'} in de TOP 2000
                    </p>
                    {artist.bio && (
                      <p className="text-zinc-500 mt-2 line-clamp-2 text-sm leading-relaxed">
                        {artist.bio}
                      </p>
                    )}
                  </div>

                  <span className="text-primary font-semibold text-sm flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
                    Profiel bekijken <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </section>
          )}

          {/* Technical Info & Facts grid */}
          <section className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Over dit nummer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-400">
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-5 shadow-inner">
                <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-primary">Basisinformatie</h3>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex justify-between border-b border-zinc-800 pb-2">
                    <strong className="text-zinc-500 font-medium">Origineel jaar:</strong> 
                    <span className="text-zinc-200 font-semibold">{song.year ?? song.releaseYear}</span>
                  </li>
                  <li className="flex justify-between border-b border-zinc-800 pb-2">
                    <strong className="text-zinc-500 font-medium">Totaal noteringen:</strong> 
                    <span className="text-zinc-200 font-semibold">{song.timesListed ?? rankings.length}×</span>
                  </li>
                  {rankings.length > 0 && (
                    <>
                      <li className="flex justify-between border-b border-zinc-800 pb-2">
                        <strong className="text-zinc-500 font-medium">Laatst genoteerd:</strong> 
                        <span className="text-zinc-200 font-semibold">{Math.max(...rankings.map(r => r.year))}</span>
                      </li>
                      <li className="flex justify-between pb-1">
                        <strong className="text-zinc-500 font-medium">Beste positie:</strong> 
                        <span className="text-amber-400 font-bold">#{Math.min(...rankings.map(r => r.position))}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-5 shadow-inner">
                <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-orange-450">Statistieken</h3>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex justify-between border-b border-zinc-800 pb-2">
                    <strong className="text-zinc-500 font-medium">Huidige positie (2024):</strong> 
                    <span className="text-zinc-200 font-semibold">
                      {rankings.find(r => r.year === 2024) ? `#${rankings.find(r => r.year === 2024)?.position}` : 'Niet genoteerd'}
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-zinc-800 pb-2">
                    <strong className="text-zinc-500 font-medium">Jaren in TOP 2000:</strong> 
                    <span className="text-zinc-200 font-semibold">{allRankingYears.size}</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <strong className="text-zinc-500 font-medium">Evergreen status:</strong> 
                    {isEveryYearClassic ? (
                      <span className="text-primary font-bold flex items-center gap-1">⭐ Ja, klassieker</span>
                    ) : (
                      <span className="text-zinc-400">Nee</span>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
