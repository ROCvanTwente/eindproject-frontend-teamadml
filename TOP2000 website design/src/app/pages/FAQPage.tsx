import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqData = [
  {
    question: 'Wanneer is de Top 2000?',
    answer: 'De Top 2000 wordt jaarlijks uitgezonden van eerste kerstdag (25 december) 00:00 uur tot en met oudejaarsavond (31 december) 24:00 uur op NPO Radio 2.'
  },
  {
    question: 'Hoe kan ik stemmen?',
    answer: 'Stemmen kan tijdens de officiële stemmaand (meestal eind november/begin december) via deze website. Registreer eerst een gratis account en selecteer vervolgens jouw persoonlijke Top 5 favoriete klassiekers in onze stemmodule.'
  },
  {
    question: 'Kan ik mijn stembiljet naderhand nog aanpassen?',
    answer: 'Ja, als je al een stembiljet hebt verstuurd, kun je later tijdens de stemperiode gewoon opnieuw inloggen en een nieuw stembiljet opsturen. Jouw eerdere stemmen worden dan automatisch overschreven in de database.'
  },
  {
    question: 'Waarom is er een account vereist om te stemmen?',
    answer: 'Om stemmanipulatie, bots en dubbel stemmen tegen te gaan, is het verplicht om een geverifieerd account te gebruiken. Zo garanderen we een eerlijke lijst der lijsten.'
  },
  {
    question: 'Waarom staat Bohemian Rhapsody bijna altijd op nummer 1?',
    answer: 'Bohemian Rhapsody van Queen is historisch gezien het meest geliefde nummer onder de Nederlandse luisteraars door de unieke opbouw van opera, rock en ballads. Het nummer heeft op vier edities na altijd de top van de lijst gesierd.'
  },
  {
    question: 'Kan ik de live tussenstand bekijken?',
    answer: 'Jazeker! Zodra de stemming live is, kun je op onze Statistieken pagina onder het tabblad "Tussenstand Stemmen" de live data direct uit onze database inzien.'
  },
  {
    question: 'Hoe worden de posities in de definitieve lijst berekend?',
    answer: 'De positie van elk nummer wordt berekend op basis van de hoeveelheid stemmen en de individuele ranking (plek 1 t/m 5) die stemmers aan het nummer hebben toegekend.'
  }
];

export function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="pb-16 text-white">
      {/* Page Header */}
      <section className="relative overflow-hidden py-12 border-b border-zinc-800 bg-gradient-to-r from-red-900 via-red-655 to-red-900 text-white text-center">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-red-200 bg-white/10 border border-white/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Veelgestelde Vragen
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 leading-tight">
            Vragen & Antwoorden
          </h1>
          <p className="text-red-100 text-sm md:text-base leading-relaxed">
            Heb je een vraag over de werking van de stemmodule, de uitzending of de statistieken? Hier vind je antwoorden op de meest gestelde vragen.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12 max-w-4xl">
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = expandedIndex === index;
            return (
              <div
                key={index}
                className={`bg-card/25 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-primary/40 bg-white/5' : 'border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <span className="font-bold text-base md:text-lg text-white pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 text-muted-foreground text-sm md:text-base leading-relaxed border-t border-white/5 pt-4 bg-black/10">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-primary/25 to-accent/25 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="w-24 h-24 text-white" />
          </div>
          <h3 className="text-2xl font-black mb-2">Vraag nog niet beantwoord?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Geen probleem! Ons support team staat voor je klaar. Neem gerust contact met ons op via ons contactformulier.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg cursor-pointer"
          >
            Neem Contact Op
          </Link>
        </div>
      </div>
    </div>
  );
}
