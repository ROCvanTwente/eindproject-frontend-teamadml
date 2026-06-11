import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Edit, Music as MusicIcon, AlertCircle, Loader2 } from "lucide-react";
import {
  fetchSongForDetail,
  fetchSongRankings,
  fetchArtists,
  type BackendSong,
  type SongRanking,
  type BackendArtist,
} from "../data/api";
import { InlineSongPlayer } from "../components/InlineSongPlayer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
          const artistsResult = await fetchArtists();
          if (isMounted && artistsResult.ok) {
            const foundArtist = artistsResult.data.find(
              (item) => item.artistId === loadedSong.artistId,
            );
            setArtist(foundArtist ?? null);
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
      <div className="container mx-auto px-4 py-16 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Nummer wordt geladen...</span>
      </div>
    );
  }

  if (fetchState === 'error' || !song) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <h1 className="text-3xl font-bold">Nummer niet gevonden</h1>
        </div>
        {errorMessage && <p className="text-muted-foreground mb-4">{errorMessage}</p>}
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
    <div className="pb-12">
      <section className="bg-gradient-to-r from-red-700 via-red-500 to-red-700 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="aspect-square rounded-xl overflow-hidden shadow-lg border border-border">
                  {song.albumCover ? (
                    <img
                      src={song.albumCover}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <MusicIcon className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{song.title}</h1>
                <Link
                  to={`/artiest/${song.artistId}`}
                  className="text-2xl text-primary hover:underline mb-4"
                >
                  {artistName}
                </Link>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg">
                    Jaar: <span className="font-bold">{song.year ?? song.releaseYear}</span>
                  </div>
                  <div className="bg-card border border-border px-4 py-2 rounded-lg">
                    <span className="font-bold">{song.timesListed ?? rankings.length}</span> keer genoteerd
                  </div>
                  {isEveryYearClassic && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-bold">
                      ⭐ Klassieke Evergreen
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <h2 className="text-lg font-semibold text-white">Luister nu</h2>
                  <InlineSongPlayer
                    title={song.title}
                    artist={artistName}
                    youtubeUrl={song.youtube}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/admin/nummer/${song.songId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Bewerken (Admin)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {song.lyricsPreview && (
            <section>
              <h2 className="text-3xl font-bold mb-6">Songtekst (preview)</h2>
              <div className="bg-card border border-border rounded-lg p-8 shadow-md">
                <p className="text-lg italic text-muted-foreground">
                  {song.lyricsPreview}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  © Volledige songtekst beschikbaar via officiële bronnen
                </p>
              </div>
            </section>
          )}

          {rankings.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-6">Noteringen door de jaren</h2>
              <div className="bg-card border border-border rounded-lg p-8 shadow-md">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jaar" />
                    <YAxis
                      domain={[0, 2001]}
                      ticks={[2000, 1500, 1000, 500, 1]}
                      tickFormatter={(value) => (2001 - value).toString()}
                    />
                    <Tooltip
                      formatter={(value: number) => [(2001 - value).toString(), "Positie"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="positie"
                      stroke="#E85D00"
                      strokeWidth={3}
                      dot={{ fill: "#E85D00", r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Alle Noteringen</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {rankings.map(ranking => (
                      <div
                        key={ranking.year}
                        className="bg-secondary rounded-lg p-4 text-center hover:bg-primary/20 transition-colors"
                      >
                        <div className="text-sm text-muted-foreground mb-1">
                          {ranking.year}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          #{ranking.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {artist && (
            <section>
              <h2 className="text-3xl font-bold mb-6">Over de artiest</h2>
              <Link
                to={`/artiest/${artist.artistId}`}
                className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-6">
                  {artist.photoUrl && (
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors mb-2">
                      {artist.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {artist.numberOfSongs ?? 0} nummers in de TOP 2000
                    </p>
                    {artist.bio && (
                      <p className="text-muted-foreground mt-2 line-clamp-2">
                        {artist.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </section>
          )}

          {artist && (
            <section>
              <h2 className="text-3xl font-bold mb-6">Andere nummers van {artist.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                  <p className="text-sm">
                    Ontdek alle nummers van deze artiest
                  </p>
                  <Link
                    to={`/artiesten?filter=${encodeURIComponent(artist.name)}`}
                    className="text-primary hover:underline mt-2 inline-block"
                  >
                    Bekijk artiest →
                  </Link>
                </div>
              </div>
            </section>
          )}

          <section className="bg-secondary rounded-lg p-8 border border-border">
            <h2 className="text-2xl font-bold mb-4">Over dit nummer</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-foreground mb-2">Basisinformatie</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Origineel jaar:</strong> {song.year ?? song.releaseYear}</li>
                    <li><strong>Totaal noteringen:</strong> {song.timesListed ?? rankings.length}</li>
                    {rankings.length > 0 && (
                      <li><strong>Laatst genoteerd:</strong> {Math.max(...rankings.map(r => r.year))}</li>
                    )}
                    {rankings.length > 0 && (
                      <li><strong>Beste positie:</strong> #{Math.min(...rankings.map(r => r.position))}</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Statistieken</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Huidige positie:</strong> #{rankings.find(r => r.year === 2024)?.position ?? "Niet genoteerd"}</li>
                    <li><strong>Jaren in TOP 2000:</strong> {allRankingYears.size}</li>
                    {isEveryYearClassic && (
                      <li className="text-primary font-bold">⭐ In ALLE jaren genoteerd!</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
