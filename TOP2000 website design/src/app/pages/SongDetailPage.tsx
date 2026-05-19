import { useParams, Link } from 'react-router-dom';
import { Play, Edit, ExternalLink, Music as MusicIcon } from 'lucide-react';
import { getSongById, getArtistById, getRankingsForSong } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const song = getSongById(parseInt(id || '0'));
  const artist = song ? getArtistById(song.artistId) : undefined;
  const rankings = song ? getRankingsForSong(song.id) : [];

  if (!song) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Nummer niet gevonden</h1>
        <Link to="/nummers" className="text-primary hover:underline">
          Terug naar nummers
        </Link>
      </div>
    );
  }

  // Prepare chart data (inverted so #1 is at top)
  const chartData = rankings.map(r => ({
    jaar: r.year.toString(),
    positie: 2001 - r.position // Invert so lower number (better position) is higher on chart
  }));

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Album Cover */}
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

              {/* Song Info */}
              <div className="md:col-span-2 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{song.title}</h1>
                <Link
                  to={`/artiest/${song.artistId}`}
                  className="text-2xl text-primary hover:underline mb-4"
                >
                  {song.artistName}
                </Link>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg">
                    Jaar: <span className="font-bold">{song.year}</span>
                  </div>
                  <div className="bg-card border border-border px-4 py-2 rounded-lg">
                    <span className="font-bold">{song.timesListed}</span> keer genoteerd
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-xl transition-all font-semibold cursor-pointer">
                    <Play className="w-5 h-5 fill-current" />
                    Afspelen
                  </button>
                  {song.youtubeUrl && (
                    <a
                      href={song.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      YouTube
                    </a>
                  )}
                  <Link
                    to={`/admin/nummer/${song.id}`}
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
          {/* Lyrics Preview */}
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

          {/* Rankings Chart */}
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
                      formatter={(value: number) => [(2001 - value).toString(), 'Positie']}
                    />
                    <Line
                      type="monotone"
                      dataKey="positie"
                      stroke="#E85D00"
                      strokeWidth={3}
                      dot={{ fill: '#E85D00', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Rankings Table */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {rankings.map(ranking => (
                    <div
                      key={ranking.year}
                      className="bg-secondary rounded-lg p-4 text-center"
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
            </section>
          )}

          {/* Artist Info */}
          {artist && (
            <section>
              <h2 className="text-3xl font-bold mb-6">Over de artiest</h2>
              <Link
                to={`/artiest/${artist.id}`}
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
                      {artist.numberOfSongs} nummers in de TOP 2000
                    </p>
                  </div>
                </div>
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
