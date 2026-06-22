import { ChevronRight } from 'lucide-react';

const newsArticles = [
  {
    id: 1,
    title: 'Stemmen voor Top 2000 van 2025 geopend',
    excerpt: 'Vanaf vandaag kun je stemmen op jouw favoriete nummers voor de Top 2000 van 2025.',
    date: '1 november 2024',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=500&fit=crop',
    category: 'Algemeen'
  },
  {
    id: 2,
    title: 'Nieuwe records gebroken in de lijst van 2024',
    excerpt: 'De Top 2000 van 2024 heeft meerdere records gebroken, waaronder het aantal stemmen.',
    date: '28 december 2024',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop',
    category: 'Statistieken'
  },
  {
    id: 3,
    title: 'Interview met de DJ\'s van de Top 2000',
    excerpt: 'We spraken met de presentatoren over hun favoriete nummers en herinneringen.',
    date: '20 december 2024',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=500&fit=crop',
    category: 'Interviews'
  },
  {
    id: 4,
    title: 'De grootste klimbers van dit jaar',
    excerpt: 'Deze nummers maakten de grootste sprong in de lijst van 2024.',
    date: '26 december 2024',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&h=500&fit=crop',
    category: 'Statistieken'
  },
  {
    id: 5,
    title: 'Behind the scenes van de Top 2000 studio',
    excerpt: 'Een kijkje achter de schermen bij de uitzending van de Top 2000.',
    date: '25 december 2024',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&h=500&fit=crop',
    category: 'Behind the scenes'
  },
  {
    id: 6,
    title: 'De meest gedraaide artiesten in de geschiedenis',
    excerpt: 'Deze artiesten hebben de meeste nummers in de Top 2000 door de jaren heen.',
    date: '15 december 2024',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=500&fit=crop',
    category: 'Statistieken'
  }
];

export function NewsPage() {
  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="relative overflow-hidden py-12 border-b border-zinc-800 bg-gradient-to-r from-red-900 via-red-655 to-red-900 text-white">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 leading-tight">
            Nieuws
          </h1>
          <p className="text-red-100 text-lg">
            Het laatste nieuws over de Top 2000
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Featured Article */}
        <article className="mb-12 bg-card border-2 border-primary/10 rounded-xl overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="aspect-video md:aspect-auto overflow-hidden">
              <img
                src={newsArticles[0].image}
                alt={newsArticles[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="text-sm text-primary font-medium mb-2">{newsArticles[0].category}</div>
              <h2 className="text-3xl font-bold mb-4">{newsArticles[0].title}</h2>
              <p className="text-muted-foreground mb-4">{newsArticles[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{newsArticles[0].date}</span>
                <button className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
                  Lees meer
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles.slice(1).map(article => (
            <article
              key={article.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-primary font-medium mb-2">{article.category}</div>
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{article.date}</span>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    Lees meer
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
