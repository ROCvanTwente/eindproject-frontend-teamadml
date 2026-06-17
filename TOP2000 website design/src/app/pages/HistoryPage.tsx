import { Calendar, Award, Music, Clock, Sparkles, Milestone, HelpCircle, Flame } from 'lucide-react';
import { useState } from 'react';

const historyData = [
  {
    year: 1999,
    description: 'De allereerste editie van de Top 2000 wordt uitgezonden op NPO Radio 2. Het was oorspronkelijk bedacht als eenmalig millennium-evenement, maar de massale stroom van luisteraarsreacties veranderde de radiogeschiedenis.',
    highlight: 'Bohemian Rhapsody op nummer 1 gevestigd',
    stat: '1e Editie'
  },
  {
    year: 2000,
    description: 'Wegens het overweldigende succes van de eerste editie besluit Radio 2 om de Top 2000 om te dopen tot een jaarlijkse traditie tijdens de kerstdagen, eindigend vlak voor de jaarwisseling.',
    highlight: 'Start van de legendarische traditie',
    stat: 'Jaarlijks evenement'
  },
  {
    year: 2005,
    description: 'Luisteraars kunnen nu volledig online stemmen op hun favoriete nummers. Dit zorgde voor een exponentiële stijging van het aantal uitgebrachte stemmen.',
    highlight: 'Meer dan 500.000 stemmen geregistreerd',
    stat: 'Online Stemmen'
  },
  {
    year: 2010,
    description: 'De Top 2000 groeit uit tot een uniek Nederlands cultureel fenomeen. Het Top 2000 Café in Beeld en Geluid opent haar deuren voor publiek.',
    highlight: 'Opening van het live Top 2000 Café',
    stat: 'Miljoenen luisteraars'
  },
  {
    year: 2015,
    description: 'Introductie van de officiële Top 2000 app en live visualisatie. Luisteraars kunnen statistieken, verschuivingen en songteksten live in de app volgen.',
    highlight: 'Digitale transformatie & app integratie',
    stat: 'Live App Launch'
  },
  {
    year: 2020,
    description: 'Tijdens de pandemie bleek de Top 2000 een ongekende bron van verbinding en warmte. Luisteraars brachten een recordaantal stemmen uit.',
    highlight: 'Record van meer dan 2 miljoen stemmen',
    stat: '2M+ Stemmen'
  },
  {
    year: 2026,
    description: 'De huidige editie viert de evolutie van muziek met geavanceerde statistieken, live stemming tussenstanden en een premium interactief platform.',
    highlight: 'Volledig vernieuwde interactieve web-app',
    stat: '28e Editie'
  }
];

const funFacts = [
  {
    title: 'Langste nummer in de lijst',
    description: 'Het langste nummer dat ooit de Top 2000 heeft gehaald is "Thick as a Brick" van Jethro Tull, met een lengte van maar liefst 22 minuten.',
    icon: Clock,
    color: 'from-amber-500/10 to-orange-500/10 border-orange-500/20'
  },
  {
    title: 'Meeste noteringen ooit',
    description: 'The Beatles, Queen en Coldplay voeren traditioneel de lijst aan met de meeste gelijktijdige nummers in één editie.',
    icon: Music,
    color: 'from-rose-500/10 to-red-500/10 border-red-500/20'
  },
  {
    title: 'De Eeuwige Nummer 1',
    description: 'Queen\'s "Bohemian Rhapsody" heeft op vier edities na (in 2005, 2010, 2014 en 2021) altijd op de absolute eerste plek gestaan.',
    icon: Award,
    color: 'from-yellow-500/10 to-amber-500/10 border-amber-500/20'
  },
  {
    title: 'Snelste Stijger',
    description: 'Bepaalde klassiekers stijgen soms honderden plekken per jaar door actuele gebeurtenissen of hernieuwde media-aandacht.',
    icon: Flame,
    color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20'
  }
];

export function HistoryPage() {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  return (
    <div className="pb-16 text-white">
      {/* Page Header */}
      <section className="relative overflow-hidden py-12 border-b border-zinc-800 bg-gradient-to-r from-red-900 via-red-655 to-red-900 text-white text-center">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-red-200 bg-white/10 border border-white/20 mb-3">
            <Milestone className="w-3.5 h-3.5 text-red-300" />
            25+ Jaar Traditie
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 leading-tight">
            Onze Geschiedenis
          </h1>
          <p className="text-red-100 text-sm md:text-base leading-relaxed">
            Van een gedurfd eenmalig idee in 1999 tot de meest geliefde radiotraditie van Nederland: ontdek de reis en mijlpalen van de NPO Radio 2 Top 2000 door de jaren heen.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Intro */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="text-lg text-muted-foreground/90 leading-relaxed">
            Elk jaar tussen Kerst en Oud & Nieuw luisteren miljoenen mensen naar de lijst der lijsten. Hieronder blikken we terug op de historische momenten die deze magische muziekweek hebben gevormd tot wat het nu is.
          </p>
        </div>

        {/* Interactive Timeline */}
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical central timeline line */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-white/10 -translate-x-1/2"></div>

          <div className="space-y-12">
            {historyData.map((item, index) => {
              const isEven = index % 2 === 0;
              const isHovered = hoveredYear === item.year;

              return (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                  onMouseEnter={() => setHoveredYear(item.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  {/* Glowing central dot */}
                  <div
                    className={`absolute left-8 md:left-1/2 w-5 h-5 rounded-full -translate-x-1/2 mt-6 z-10 transition-all duration-300 ${
                      isHovered
                        ? 'bg-primary ring-[6px] ring-primary/20 scale-125'
                        : 'bg-zinc-800 border-2 border-white/20 ring-4 ring-black/30'
                    }`}
                  ></div>

                  {/* Spacer to push content to correct side */}
                  <div className="hidden md:block md:w-1/2"></div>

                  {/* Card Container */}
                  <div className="pl-16 md:pl-0 md:w-1/2 w-full pr-0 md:px-8">
                    <div
                      className={`bg-card/25 backdrop-blur-md border rounded-3xl p-6 shadow-xl transition-all duration-300 ${
                        isHovered
                          ? 'border-primary/40 bg-white/5 shadow-primary/5 scale-[1.02]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-5 h-5 transition-colors ${isHovered ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="text-2xl font-black text-white">{item.year}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                          {item.stat}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs font-semibold text-white/90 leading-normal">
                          {item.highlight}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fun Facts Section */}
        <section className="max-w-6xl mx-auto mt-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold flex items-center justify-center gap-2 mb-3">
              <HelpCircle className="w-7 h-7 text-primary" />
              Leuke Weetjes
            </h2>
            <p className="text-sm text-muted-foreground">
              Een greep uit de meest opvallende feitjes en statistische rariteiten uit de rijke historie van de lijst.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {funFacts.map((fact, index) => {
              const IconComp = fact.icon;
              return (
                <div
                  key={index}
                  className={`bg-card/20 backdrop-blur-sm border rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] group ${fact.color}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {fact.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {fact.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
