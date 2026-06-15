import { FileText, AlertCircle, Scale, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsPage() {
  const terms = [
    {
      title: '1. Algemeen & Toepasselijkheid',
      icon: FileText,
      content: 'Deze algemene voorwaarden zijn van toepassing op alle gebruikers en bezoekers van het platform van de NPO Radio 2 Top 2000. Door gebruik te maken van de website en de stemmodule stemt u uitdrukkelijk in met deze voorwaarden. Wij behouden ons het recht voor deze voorwaarden op elk moment aan te passen.'
    },
    {
      title: '2. Accountregistratie & Veiligheid',
      icon: Scale,
      content: 'Het aanmaken van een account is noodzakelijk om stemmen uit te brengen en afspeellijsten te maken. U bent verplicht correcte, waarheidsgetrouwe gegevens op te geven. U bent zelf verantwoordelijk voor de vertrouwelijkheid van uw inloggegevens. Bij constatering van misbruik of fraude hebben wij het recht uw account per direct op te schorten.'
    },
    {
      title: '3. Stemregels & Preventie van Fraude',
      icon: Ban,
      content: 'Elke gebruiker mag maximaal één stembiljet per stemperiode verzenden. U mag uitsluitend voor uzelf stemmen. Het gebruik van automatische scripts, bots, of stemgeneratoren is ten strengste verboden. Bij vermoeden van stemmanipulatie zullen alle geassocieerde stemmen ongeldig worden verklaard.'
    },
    {
      title: '4. Aansprakelijkheid & Beschikbaarheid',
      icon: AlertCircle,
      content: 'Hoewel wij streven naar een foutloze werking en 100% beschikbaarheid van het platform (zowel tijdens de stemperiode als tijdens de uitzending), kunnen wij dit niet garanderen. Wij zijn niet aansprakelijk voor eventuele downtime, database-storingen, of verlies van stemgegevens door externe factoren.'
    }
  ];

  return (
    <div className="pb-16 text-white">
      {/* Page Header */}
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] py-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 mb-3">
            <Scale className="w-3.5 h-3.5" />
            Gebruiksvoorwaarden
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Algemene Voorwaarden</h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Lees hier de voorwaarden en richtlijnen die gelden voor het gebruik van de NPO Radio 2 Top 2000 website, stemmodule en playlists.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12 max-w-4xl">
        
        {/* Dynamic terms list */}
        <div className="space-y-6">
          {terms.map((term, index) => {
            const IconComp = term.icon;
            return (
              <div key={index} className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3">
                  <IconComp className="w-5 h-5 text-primary" />
                  {term.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {term.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Link to Privacy */}
        <div className="bg-card/25 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl mt-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Privacybeleid</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Benieuwd hoe we jouw account- en stemgegevens beschermen? Lees er alles over in onze privacyverklaring.
          </p>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg cursor-pointer text-sm"
          >
            Lees Privacyverklaring
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Laatst bijgewerkt op: 15 juni 2026 • NPO Radio 2 Legal Department</p>
        </div>
      </div>
    </div>
  );
}
