import { Calendar } from 'lucide-react';

const historyData = [
  {
    year: 1999,
    description: 'De eerste Top 2000 werd uitgezonden op Radio 2. Het was bedoeld als eenmalig evenement om het millennium te vieren.',
    highlight: 'Bohemian Rhapsody stond al op nummer 1'
  },
  {
    year: 2000,
    description: 'Door het grote succes werd besloten de Top 2000 jaarlijks uit te zenden tijdens de kerstdagen.',
    highlight: 'Start van een traditie'
  },
  {
    year: 2005,
    description: 'Voor het eerst konden luisteraars online stemmen op hun favoriete nummers.',
    highlight: 'Meer dan 500.000 stemmen'
  },
  {
    year: 2010,
    description: 'De Top 2000 groeide uit tot een Nederlands cultureel fenomeen met miljoenen luisteraars.',
    highlight: 'Record aantal luisteraars'
  },
  {
    year: 2015,
    description: 'Introductie van de Top 2000 app en uitgebreide online statistieken.',
    highlight: 'Digitale transformatie'
  },
  {
    year: 2020,
    description: 'Ondanks de pandemie bleef de Top 2000 een bron van verbinding voor miljoenen Nederlanders.',
    highlight: 'Meer dan 2 miljoen stemmen'
  },
  {
    year: 2024,
    description: 'De 26e editie van de Top 2000 met nog meer interactieve mogelijkheden en een vernieuwd design.',
    highlight: 'Record aantal online luisteraars'
  }
];

export function HistoryPage() {
  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl mb-4">Geschiedenis</h1>
          <p className="text-muted-foreground text-lg">
            Van 1999 tot nu: de ontwikkeling van de Top 2000
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            De Top 2000 is uitgegroeid tot een onmisbaar onderdeel van de Nederlandse kerstdagen.
            Wat begon als een eenmalig evenement om het millennium te vieren, is nu een jaarlijkse
            traditie waar miljoenen Nederlanders naar uitkijken.
          </p>
          <p className="text-lg text-muted-foreground">
            Ontdek hieronder de belangrijkste mijlpalen uit meer dan 25 jaar Top 2000.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border md:left-1/2"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {historyData.map((item, index) => (
                <div
                  key={item.year}
                  className={`relative flex items-start ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-primary rounded-full -ml-2 mt-6 z-10 ring-4 ring-background"></div>

                  {/* Content Card */}
                  <div className={`ml-20 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-primary">{item.year}</span>
                      </div>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      <div className="bg-primary/10 border-l-4 border-primary pl-4 py-2">
                        <span className="font-medium text-sm">{item.highlight}</span>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fun Facts Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl mb-8 text-center">Leuke weetjes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#E85D00] to-[#FF6B35] text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Langste nummer</h3>
              <p className="opacity-90">
                Het langste nummer dat ooit in de Top 2000 heeft gestaan is meer dan 20 minuten lang.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Meeste nummers</h3>
              <p className="opacity-90">
                Sommige artiesten hebben meer dan 50 nummers in de lijst door de jaren heen.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#FF8C42] to-[#FFA500] text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Oudste nummer</h3>
              <p className="opacity-90">
                Het oudste nummer in de lijst komt uit de jaren '50 en staat er nog steeds in.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#FFA500] to-[#FFB84D] text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Nieuwste toevoeging</h3>
              <p className="opacity-90">
                Elk jaar komen er nieuwe nummers bij, vaak uit het voorgaande jaar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
