import { Carousel } from '../components/Carousel';
import { Top5List } from '../components/Top5List';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTop2000Years, fetchSongs } from '../data/api';

const articleData = [
  {
    id: 1,
    title: 'Het verhaal achter Bohemian Rhapsody',
    description: 'Ontdek waarom dit Queen-nummer al jaren de lijst aanvoert',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop',
    date: '15 december 2026'
  },
  {
    id: 2,
    title: 'De ontwikkeling van de Top 2000 door de jaren heen',
    description: 'Van 1999 tot nu: hoe de lijst is veranderd',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop',
    date: '12 december 2026'
  },
  {
    id: 3,
    title: 'Nieuwkomers in de lijst van 2026',
    description: 'Deze nieuwe nummers maken hun debuut',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop',
    date: '10 december 2026'
  }
];

export function HomePage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [yearsCount, setYearsCount] = useState<number>(26);
  const [songsCount, setSongsCount] = useState<number>(2000);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const [yearsRes, songsRes] = await Promise.all([
          fetchTop2000Years(),
          fetchSongs()
        ]);
        if (isMounted) {
          if (yearsRes.ok && yearsRes.data) {
            setYearsCount(yearsRes.data.length);
          }
          if (songsRes.ok && songsRes.data) {
            setSongsCount(songsRes.data.length);
          }
        }
      } catch (err) {
        console.warn('Failed to load homepage dynamic stats, using fallback defaults:', err);
      }
    };
    void loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="pb-12">
      {/* Carousel */}
      <Carousel />

      {/* Top 5 List */}
      <Top5List />

      <div className="container mx-auto px-4 mt-16">
        {/* Collapsible Sections */}
        <div className="max-w-4xl mx-auto space-y-3 mb-12">
          {/* Statistics Section */}
          <div className="bg-card border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('stats')}
              className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors"
            >
              <span className="font-semibold text-lg">Statistieken en weetjes</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections['stats'] ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections['stats'] && (
              <div className="px-6 pb-6 space-y-3 text-muted-foreground">
                <p>• De Top 2000 bestaat sinds 1999</p>
                <p>• Meer dan 15.000 nummers zijn genomineerd door de jaren heen</p>
                <p>• Bohemian Rhapsody van Queen staat al meer dan 15 jaar op nummer 1</p>
                <p>• Jaarlijks stemmen meer dan 2 miljoen mensen</p>
              </div>
            )}
          </div>

          {/* Newsletter Section */}
          <div className="bg-card border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('newsletter')}
              className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors"
            >
              <span className="font-semibold text-lg">Blijf op de hoogte</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections['newsletter'] ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections['newsletter'] && (
              <div className="px-6 pb-6">
                <p className="text-muted-foreground mb-4">
                  Ontvang updates over de Top 2000, stem-mogelijkheden en exclusieve content.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Jouw e-mailadres"
                    className="flex-grow px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  />
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Aanmelden
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spotify Playlist Section */}
          <div className="bg-card border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('spotify')}
              className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors"
            >
              <span className="font-semibold text-lg">Luister de Top 2000 op Spotify</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections['spotify'] ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections['spotify'] && (
              <div className="px-6 pb-6">
                <p className="text-muted-foreground mb-4">
                  De volledige Top 2000 is ook beschikbaar als Spotify playlist. Luister je favoriete nummers wanneer je maar wilt!
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Open Spotify playlist
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Articles Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Verhalen achter de muziek</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articleData.map(article => (
              <article
                key={article.id}
                className="bg-card border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">{article.date}</div>
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-muted-foreground mb-4">{article.description}</p>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    Lees meer
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Top 2000 in cijfers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">{yearsCount}</div>
              <div className="text-sm opacity-90">Jaren Top 2000</div>
            </div>
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">{songsCount}</div>
              <div className="text-sm opacity-90">Nummers</div>
            </div>
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">2M+</div>
              <div className="text-sm opacity-90">Stemmen</div>
            </div>
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">7</div>
              <div className="text-sm opacity-90">Dagen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
