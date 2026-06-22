import { Shield, Lock, Eye, Database, UserCheck, CheckCircle2 } from 'lucide-react';

export function PrivacyPage() {
  const sections = [
    {
      title: '1. Welke gegevens verzamelen wij?',
      icon: Database,
      items: [
        'Accountgegevens: gebruikersnaam en wachtwoord-hash bij registratie.',
        'Stemgegevens: uw uitgebrachte Top 5 stemmen en stembiljet geschiedenis.',
        'Playlistgegevens: door u gecreëerde persoonlijke playlists en favorieten.',
        'Gebruiksstatistieken: anonieme logbestanden voor prestatie-optimalisaties.'
      ]
    },
    {
      title: '2. Waarvoor gebruiken wij uw gegevens?',
      icon: Eye,
      items: [
        'Het veilig opslaan en registreren van uw stemmen voor de Top 2000.',
        'Het beheren van uw playlists en profielinstellingen.',
        'Het tonen van geanonimiseerde live statistieken op de website.',
        'Het beveiligen en controleren van onze API endpoints tegen misbruik (zoals stemfraude).'
      ]
    },
    {
      title: '3. Hoe beveiligen wij uw gegevens?',
      icon: Lock,
      items: [
        'Wachtwoorden worden altijd versleuteld opgeslagen met sterke hashes.',
        'Alle communicatie verloopt via beveiligde HTTPS verbindingen.',
        'Gegevensbescherming door beperkte toegang van beheerders en rollen.',
        'Beveiligde SQL Server databases met regelmatige scans en updates.'
      ]
    },
    {
      title: '4. Uw rechten',
      icon: UserCheck,
      items: [
        'Inzage: u kunt opvragen welke accountgegevens bij ons bekend zijn.',
        'Rectificatie: u kunt uw inloggegevens en account te allen tijde bewerken.',
        'Verwijdering: u kunt uw account en alle bijbehorende stemmen permanent laten wissen.',
        'Recht op bezwaar: bezwaar maken tegen specifieke verwerkingen.'
      ]
    }
  ];

  return (
    <div className="pb-16 text-white">
      {/* Page Header */}
      <section className="relative overflow-hidden py-12 border-b border-zinc-800 bg-gradient-to-r from-red-900 via-red-655 to-red-900 text-white text-center">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-red-200 bg-white/10 border border-white/20 mb-3">
            <Shield className="w-3.5 h-3.5" />
            Veiligheid & Privacy
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 leading-tight">
            Privacyverklaring
          </h1>
          <p className="text-red-100 text-sm md:text-base leading-relaxed">
            Bij NPO Radio 2 TOP 2000 hechten we grote waarde aan de bescherming van uw persoonsgegevens. Hier leest u transparant en duidelijk hoe wij uw gegevens beveiligen en verwerken.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12 max-w-4xl">
        {/* Intro card */}
        <div className="bg-card/25 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl mb-8 flex gap-5 items-start">
          <div className="p-3 bg-primary/15 border border-primary/25 rounded-2xl text-primary flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Algemene toezegging</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Wij verzamelen uitsluitend gegevens die nodig zijn voor het goed functioneren van de stemmodule en playlists. Uw gegevens worden nooit gedeeld met derden voor commerciële doeleinden en worden uiterst beveiligd opgeslagen.
            </p>
          </div>
        </div>

        {/* Dynamic sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComp = section.icon;
            return (
              <div key={index} className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-3">
                  <IconComp className="w-5 h-5 text-primary" />
                  {section.title}
                </h3>
                <ul className="space-y-3.5">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Additional information */}
        <div className="mt-8 bg-card/10 border border-white/5 rounded-3xl p-6 text-center text-xs text-muted-foreground leading-relaxed">
          <p className="mb-2"><strong>Laatste update:</strong> 15 juni 2026</p>
          <p>Voor vragen omtrent deze privacyverklaring kunt u mailen naar privacy@top2000.nl of contact opnemen met de functionaris gegevensbescherming via onze contactpagina.</p>
        </div>
      </div>
    </div>
  );
}
