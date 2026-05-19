import { Play, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';

const top5Songs2024 = [
  {
    position: 1,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: 1975,
    previousPosition: 1,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'
  },
  {
    position: 2,
    title: 'Hotel California',
    artist: 'Eagles',
    year: 1977,
    previousPosition: 3,
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop'
  },
  {
    position: 3,
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    year: 1971,
    previousPosition: 2,
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'
  },
  {
    position: 4,
    title: 'Imagine',
    artist: 'John Lennon',
    year: 1971,
    previousPosition: 5,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
  },
  {
    position: 5,
    title: 'Child in Time',
    artist: 'Deep Purple',
    year: 1970,
    previousPosition: 4,
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop'
  }
];

export function Top5List() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Top 5 van 2024</h2>
          <p className="text-muted-foreground text-base">De meest geliefde nummers van dit jaar</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {top5Songs2024.map((song, index) => {
            const change = song.previousPosition - song.position;

            return (
              <motion.div
                key={song.position}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-border group"
              >
                <div className="flex items-center gap-4 p-4 md:p-6">
                  {/* Position Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary flex items-center justify-center">
                      <span className="text-white text-2xl md:text-3xl font-bold">
                        {song.position}
                      </span>
                    </div>
                  </div>

                  {/* Album Art */}
                  <div className="hidden md:block flex-shrink-0">
                    <img
                      src={song.imageUrl}
                      alt={`${song.title} album art`}
                      className="w-20 h-20 rounded-lg object-cover shadow-md"
                    />
                  </div>

                  {/* Song Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg md:text-2xl font-bold truncate group-hover:text-primary transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      {song.artist} • {song.year}
                    </p>
                  </div>

                  {/* Change Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-2">
                        {change > 0 ? (
                          <>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <span className="text-green-600 font-semibold text-lg">
                              +{change}
                            </span>
                          </>
                        ) : change < 0 ? (
                          <>
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            <span className="text-red-600 font-semibold text-lg">
                              {change}
                            </span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-5 h-5 text-muted-foreground" />
                            <span className="text-muted-foreground font-semibold">-</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Play Button */}
                    <button className="bg-primary text-primary-foreground p-4 rounded-full hover:bg-accent transition-colors shadow-lg hover:shadow-xl hover:scale-110 duration-300 cursor-pointer">
                      <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <a
            href="/lijst"
            className="inline-block bg-primary text-white px-8 py-3 hover:bg-primary/90 transition-colors font-semibold uppercase tracking-wide text-sm cursor-pointer"
          >
            Bekijk de volledige TOP 2000
          </a>
        </div>
      </div>
    </section>
  );
}
