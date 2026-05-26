import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { mockArtists } from '../data/mockData';

export function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArtists = mockArtists
    .filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Artiesten</h1>
          <p className="text-muted-foreground">
            Alle artiesten die ooit in de TOP 2000 hebben gestaan
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Zoek een artiest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 text-muted-foreground text-center">
          {filteredArtists.length} {filteredArtists.length === 1 ? 'artiest' : 'artiesten'} gevonden
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredArtists.map(artist => (
            <div
              key={artist.id}
              className="bg-card border border-border overflow-hidden hover:shadow-md transition-all group"
            >
              <Link to={`/artiest/${artist.id}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  {artist.photoUrl ? (
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/artiest/${artist.id}`}>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors truncate cursor-pointer">
                    {artist.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {artist.numberOfSongs} {artist.numberOfSongs === 1 ? 'nummer' : 'nummers'}
                  </span>
                  <span className="text-primary hover:underline cursor-pointer">
                    Bekijk alle
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Geen artiesten gevonden</h3>
            <p className="text-muted-foreground">
              Probeer een andere zoekterm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
