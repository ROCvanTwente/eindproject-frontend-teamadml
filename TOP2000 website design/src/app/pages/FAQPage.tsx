import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqData = [
  {
    question: 'Wanneer is de Top 2000?',
    answer: 'De Top 2000 wordt jaarlijks uitgezonden van 25 december tot en met 31 december op NPO Radio 2.'
  },
  {
    question: 'Hoe kan ik stemmen?',
    answer: 'Stemmen kan via de officiële website van NPO Radio 2. De stemperiode wordt elk jaar aangekondigd, meestal enkele weken voor de uitzending.'
  },
  {
    question: 'Kan ik meerdere nummers stemmen?',
    answer: 'Ja, je kunt maximaal 35 nummers stemmen per stemronde. Je mag voor elk nummer maar één keer stemmen.'
  },
  {
    question: 'Waarom staat Bohemian Rhapsody altijd op nummer 1?',
    answer: 'Bohemian Rhapsody van Queen is een van de meest geliefde nummers bij de luisteraars en staat al jaren op de eerste plaats. Het nummer combineert verschillende muziekstijlen en wordt gezien als een meesterwerk.'
  },
  {
    question: 'Kan ik de Top 2000 terugluisteren?',
    answer: 'Ja, de volledige Top 2000 is beschikbaar via NPO Radio 2 online en via de NPO Radio app. Ook is er een Spotify playlist beschikbaar.'
  },
  {
    question: 'Hoe worden de posities bepaald?',
    answer: 'De posities worden bepaald door de stemmen van luisteraars. Elk nummer krijgt punten op basis van het aantal stemmen en de positie waarop mensen het nummer zetten in hun lijst.'
  },
  {
    question: 'Kunnen nieuwe nummers direct in de lijst komen?',
    answer: 'Ja, nieuwe nummers kunnen direct in de lijst komen als ze genoeg stemmen krijgen. Er zijn elk jaar wel enkele nieuwkomers in de Top 2000.'
  },
  {
    question: 'Waar kan ik de volledige lijst vinden?',
    answer: 'De volledige lijst is beschikbaar op deze website onder "TOP 2000 Lijst" en op de officiële website van NPO Radio 2.'
  },
  {
    question: 'Kan ik de lijst filteren op artiest?',
    answer: 'Ja, op onze website kun je de lijst filteren op artiest, jaar en positie. Ook kun je zoeken op titel of artiest.'
  },
  {
    question: 'Wat is de geschiedenis van de Top 2000?',
    answer: 'De Top 2000 bestaat sinds 1999 en werd oorspronkelijk uitgezonden als eenmalig evenement om het millennium te vieren. Door het grote succes werd besloten het jaarlijks te herhalen.'
  }
];

export function FAQPage() {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Veelgestelde vragen</h1>
          <p className="text-muted-foreground text-lg">
            Vind antwoorden op de meest gestelde vragen over de TOP 2000
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-6 hover:bg-secondary transition-colors text-left"
                >
                  <span className="font-semibold text-lg pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      expandedItems[index] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedItems[index] && (
                  <div className="px-6 pb-6 text-muted-foreground">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-gradient-to-br from-primary to-accent text-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-3">Vraag niet beantwoord?</h3>
            <p className="mb-6 opacity-90">
              Neem contact met ons op en we helpen je graag verder.
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Contacteer ons
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
