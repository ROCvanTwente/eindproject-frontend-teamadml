import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  Music,
  Search,
  Lock,
  Plus,
  Check,
  Trash2,
  ThumbsUp,
  Sparkles,
  ArrowRight,
  Music4
} from 'lucide-react';
import { loadSongsCatalog, fetchMyVotes, submitVotes, type BackendSong } from '../data/api';
import { toast } from 'sonner';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function VotingPage() {
  const navigate = useNavigate();

  // Authentication State
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // Search & Ballot State
  const [searchTerm, setSearchTerm] = useState('');
  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [ballot, setBallot] = useState<number[]>([]); // Array of SongIds
  const [visibleCount, setVisibleCount] = useState(30);

  // Status flags
  const [songsFetchState, setSongsFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  // Load songs catalog and existing votes if logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const loadData = async () => {
      setSongsFetchState('loading');
      setErrorMessage('');

      try {
        // Parallel load of songs catalog and user's current votes
        const [songsRes, votesRes] = await Promise.all([
          loadSongsCatalog(),
          fetchMyVotes()
        ]);

        if (!isMounted) return;

        // Set songs catalog
        if (songsRes.ok) {
          setSongs(songsRes.data);
        } else {
          setSongsFetchState('error');
          setErrorMessage(songsRes.message ?? 'De songcatalogus kon niet geladen worden.');
          return;
        }

        // Set existing votes
        if (votesRes.ok && Array.isArray(votesRes.data)) {
          setBallot(votesRes.data);
        }

        setSongsFetchState('success');
      } catch (err) {
        if (!isMounted) return;
        setSongsFetchState('error');
        setErrorMessage('Er is een fout opgetreden bij het laden van de gegevens.');
        console.error(err);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Filter songs based on search input
  const filteredSongs = useMemo(() => {
    if (!searchTerm.trim()) {
      // If search is empty, return top listed/alphabetical subset
      return songs.slice(0, 15);
    }
    return songs.filter(song =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artistName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [songs, searchTerm]);

  // Handle song selection
  const handleToggleSelect = (songId: number) => {
    if (ballot.includes(songId)) {
      // Remove from ballot
      setBallot(prev => prev.filter(id => id !== songId));
      toast.info('Nummer verwijderd van je stembiljet.');
    } else {
      // Check limit
      if (ballot.length >= 5) {
        toast.warning('Je kunt maximaal 5 favoriete nummers selecteren!');
        return;
      }
      // Add to ballot
      setBallot(prev => [...prev, songId]);
      toast.success('Nummer toegevoegd aan je stembiljet.');
    }
  };

  // Submit votes to backend
  const handleSubmitVotes = async () => {
    if (ballot.length === 0) {
      toast.error('Kies minstens 1 nummer om te kunnen stemmen.');
      return;
    }

    setSaving(true);
    try {
      const res = await submitVotes(ballot);
      if (res.ok) {
        setVoteSubmitted(true);
        toast.success('Je stemmen zijn succesvol verwerkt!');
      } else {
        toast.error(res.message ?? 'Fout bij het opslaan van je stemmen.');
      }
    } catch (err) {
      toast.error('Netwerkfout bij het versturen van je stemmen.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Maps ballot IDs to actual Song entities for rendering
  const selectedSongs = useMemo(() => {
    return ballot
      .map(id => songs.find(s => s.songId === id))
      .filter((s): s is BackendSong => !!s);
  }, [ballot, songs]);

  // Render registration lock if not logged in
  if (!isAuthenticated) {
    return (
      <div className="pb-16 text-white min-h-[80vh] flex flex-col justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-2xl">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Stemmen voor de <span className="text-primary font-black">TOP 2000</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Om misbruik en dubbele stemmen te voorkomen, is een account verplicht om te kunnen stemmen op jouw favoriete nummers. Log in of registreer nu om jouw persoonlijke stembiljet samen te stellen.
          </p>

          <div className="bg-card/25 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              Inloggen
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              Registreren
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Success/Completion screen
  if (voteSubmitted) {
    return (
      <div className="pb-16 text-white min-h-[85vh] flex flex-col justify-center">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex p-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 text-emerald-400">
            <ThumbsUp className="w-16 h-16 animate-bounce" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4">Bedankt voor je stemmen!</h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Jouw stemmen zijn succesvol opgeslagen in de database. Hieronder zie je jouw persoonlijke Top 5.
          </p>

          {/* Success Ballot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {selectedSongs.map((song, idx) => (
              <div
                key={song.songId}
                className="bg-card/20 border border-white/10 p-4 rounded-2xl backdrop-blur-sm relative group flex flex-col items-center text-center shadow-lg"
              >
                <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center shadow-md">
                  {idx + 1}
                </span>

                {song.albumCover ? (
                  <img
                    src={song.albumCover}
                    alt={song.title}
                    className="w-16 h-16 rounded-xl object-cover shadow-md mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-3">
                    <Music className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                <h4 className="font-bold text-sm line-clamp-1 text-white">{song.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{song.artistName}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/statistieken"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              Bekijk Statistieken
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-white/10 cursor-pointer"
            >
              Naar de Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 text-white">
      {/* Page header banner */}
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Live Stemmodule
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Kies jouw Top 5</h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Stel jouw favoriete stembiljet samen. Zoek en selecteer de 5 nummers die volgens jou absoluut in de lijst thuishoren!
            </p>
          </div>

          {/* Active stembiljet counter */}
          <div className="bg-card/25 border border-white/10 rounded-2xl p-5 md:w-64 backdrop-blur-md shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Music4 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-bold">Geselecteerd</span>
              <span className="text-2xl font-black text-white">{ballot.length} / 5</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center search & choose area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search input card */}
            <div className="bg-card/20 border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Zoek in de catalogus
              </h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Zoek op nummer, titel of artiest..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(30);
                  }}
                  className="w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-muted-foreground transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Error Message */}
            {songsFetchState === 'error' && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 flex gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-destructive">Catalogus laden mislukt</h3>
                  <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Loading spinner */}
            {songsFetchState === 'loading' && (
              <div className="bg-card/10 border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span>Muziekcatalogus laden...</span>
              </div>
            )}

            {/* Songs search results list */}
            {songsFetchState === 'success' && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold pl-2">
                  {searchTerm.trim() ? `Zoekresultaten (${filteredSongs.length})` : 'Aanbevolen Nummers'}
                </h3>

                {filteredSongs.slice(0, visibleCount).map(song => {
                  const isSelected = ballot.includes(song.songId);
                  return (
                    <div
                      key={song.songId}
                      className={`flex items-center gap-4 bg-card/25 border p-4 rounded-2xl hover:shadow-lg transition-all duration-200 group ${isSelected
                        ? 'border-primary/50 bg-primary/5 shadow-md shadow-primary/5'
                        : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                      {/* Album Cover */}
                      {song.albumCover ? (
                        <img
                          src={song.albumCover}
                          alt={song.title}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Music className="w-7 h-7 text-muted-foreground" />
                        </div>
                      )}

                      {/* Song Details */}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-extrabold text-white text-base md:text-lg group-hover:text-primary transition-colors truncate">
                          {song.title}
                        </h4>
                        <p className="text-muted-foreground text-sm truncate mt-0.5">
                          {song.artistName} • {song.releaseYear}
                        </p>
                      </div>

                      {/* Selection Toggle button */}
                      <button
                        onClick={() => handleToggleSelect(song.songId)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                          }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            Gekozen
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Kies
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Load More */}
                {visibleCount < filteredSongs.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 30)}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Laad meer nummers
                    </button>
                  </div>
                )}

                {filteredSongs.length === 0 && (
                  <div className="bg-card/10 border border-white/5 rounded-3xl p-12 text-center text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto text-white/25 mb-3" />
                    <h4 className="font-bold text-white mb-1">Geen nummers gevonden</h4>
                    <p className="text-sm">Probeer een andere titel of artiestennaam in te voeren.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar ballot details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card/20 border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Jouw Stembiljet
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Hier zie je jouw geselecteerde topnummers.
                </p>
              </div>

              {/* Selected songs vertical items list */}
              <div className="space-y-3">
                {selectedSongs.map((song, index) => (
                  <div
                    key={song.songId}
                    className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl relative shadow-md"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{song.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{song.artistName}</p>
                    </div>
                    <button
                      onClick={() => handleToggleSelect(song.songId)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-white/5 rounded-lg cursor-pointer"
                      aria-label="Verwijder nummer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {ballot.length === 0 && (
                  <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center text-muted-foreground">
                    <Music className="w-8 h-8 mx-auto text-white/20 mb-2" />
                    <p className="text-xs">Je hebt nog geen nummers gekozen. Voeg nummers toe via de lijst links.</p>
                  </div>
                )}
              </div>

              <hr className="border-white/10" />

              {/* Submit Button */}
              <button
                onClick={handleSubmitVotes}
                disabled={ballot.length === 0 || saving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Stemmen Opslaan...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Stemmen Versturen
                  </>
                )}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}