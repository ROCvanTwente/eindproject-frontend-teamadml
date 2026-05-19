import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Music, Globe, Edit } from 'lucide-react';
import { getArtistById, getSongsByArtistId } from '../data/mockData';

export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const artist = getArtistById(parseInt(id || '0'));
  const songs = getSongsByArtistId(parseInt(id || '0'));

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Artiest niet gevonden</h1>
        <Link to="/artiesten" className="text-primary hover:underline">
          Terug naar artiesten
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Artist Photo */}
              <div className="md:col-span-1">
                <div className="aspect-square rounded-xl overflow-hidden shadow-lg border border-border">
                  {artist.photoUrl ? (
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Music className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Artist Info */}
              <div className="md:col-span-2 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{artist.name}</h1>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg">
                    <span className="font-bold">{artist.numberOfSongs}</span> nummers in TOP 2000
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {artist.wikiUrl && (
                    <a
                      href={artist.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Officiële website
                    </a>
                  )}
                  <Link
                    to={`/admin/artiest/${artist.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Bewerken (Admin)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biography */}
      {artist.bio && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Biografie</h2>
              <div className="bg-card border border-border rounded-lg p-8 shadow-md">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {artist.bio}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Songs List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Nummers in de TOP 2000 ({songs.length})
            </h2>
            <div className="space-y-3">
              {songs.map(song => (
                <Link
                  key={song.id}
                  to={`/nummer/${song.id}`}
                  className="block bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {song.albumCover && (
                      <img
                        src={song.albumCover}
                        alt={song.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {song.year} • {song.timesListed}x in de lijst
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
