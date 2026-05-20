import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacyverklaring</h1>
          <p className="text-muted-foreground text-lg">
            Hoe wij omgaan met jouw persoonlijke gegevens
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Inleiding</h2>
                <p className="text-muted-foreground">
                  TOP 2000 respecteert de privacy van alle gebruikers van haar website en draagt er zorg voor dat de persoonlijke informatie die u ons verschaft vertrouwelijk wordt behandeld. Deze privacyverklaring is van toepassing op het gebruik van de website en de daarop ontsloten diensten van TOP 2000.
                </p>
              </div>
            </div>
          </div>

          {/* Data Collection */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Welke gegevens verzamelen wij?</h2>
                <p className="text-muted-foreground mb-4">
                  Wij verzamelen de volgende persoonlijke gegevens wanneer u onze diensten gebruikt:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Accountgegevens:</strong> naam, e-mailadres en wachtwoord wanneer u een account aanmaakt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Stemgegevens:</strong> uw voorkeuren en stemmen voor de TOP 2000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Playlistgegevens:</strong> door u aangemaakte playlists en favorieten</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Gebruiksgegevens:</strong> IP-adres, browsertype, bezochte pagina's en tijdstip van bezoek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Contactgegevens:</strong> informatie die u verstrekt via contactformulieren</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage of Data */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Waarvoor gebruiken wij uw gegevens?</h2>
                <p className="text-muted-foreground mb-4">
                  Wij gebruiken uw persoonlijke gegevens voor de volgende doeleinden:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Het beheren en onderhouden van uw account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Het verwerken van uw stemmen voor de TOP 2000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Het opslaan van uw persoonlijke playlists en voorkeuren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Het verbeteren van onze website en dienstverlening</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Het verzenden van nieuwsbrieven en updates (alleen met uw toestemming)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Het beantwoorden van uw vragen en verzoeken</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Beveiliging van uw gegevens</h2>
                <p className="text-muted-foreground mb-4">
                  Wij nemen de bescherming van uw gegevens serieus en nemen passende technische en organisatorische maatregelen om uw persoonlijke gegevens te beschermen tegen verlies of onrechtmatige verwerking. Deze maatregelen omvatten onder andere:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Versleuteling van gevoelige gegevens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Beveiligde servers en databases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Regelmatige beveiligingsupdates en monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Beperkte toegang tot persoonlijke gegevens</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Uw rechten</h2>
                <p className="text-muted-foreground mb-4">
                  U heeft de volgende rechten met betrekking tot uw persoonlijke gegevens:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Recht op inzage:</strong> u kunt opvragen welke gegevens wij van u hebben</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Recht op rectificatie:</strong> u kunt onjuiste gegevens laten corrigeren</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Recht op verwijdering:</strong> u kunt verzoeken om verwijdering van uw gegevens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Recht op beperking:</strong> u kunt verzoeken om beperking van de verwerking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Recht op overdraagbaarheid:</strong> u kunt uw gegevens in een gestructureerd formaat opvragen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Recht van bezwaar:</strong> u kunt bezwaar maken tegen de verwerking van uw gegevens</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Onze website maakt gebruik van cookies om de functionaliteit van de website te verbeteren en uw bezoek gemakkelijker te maken. Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen.
            </p>
            <p className="text-muted-foreground mb-4">
              Wij gebruiken de volgende soorten cookies:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Functionele cookies:</strong> noodzakelijk voor het functioneren van de website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Analytische cookies:</strong> om het gebruik van de website te analyseren</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Voorkeurscookies:</strong> om uw voorkeuren te onthouden</span>
              </li>
            </ul>
            <p className="text-muted-foreground">
              U kunt cookies uitschakelen via uw browserinstellingen, maar dit kan invloed hebben op de functionaliteit van onze website.
            </p>
          </div>

          {/* Third Parties */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">Delen met derden</h2>
            <p className="text-muted-foreground mb-4">
              Wij delen uw persoonlijke gegevens niet met derden, behalve:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Wanneer wij wettelijk verplicht zijn om dit te doen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Met dienstverleners die ons helpen bij het leveren van onze diensten (bijvoorbeeld hostingproviders)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Wanneer u hier toestemming voor heeft gegeven</span>
              </li>
            </ul>
          </div>

          {/* Retention Period */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">Bewaartermijn</h2>
            <p className="text-muted-foreground">
              Wij bewaren uw persoonlijke gegevens niet langer dan noodzakelijk voor de doeleinden waarvoor de gegevens zijn verzameld. Accountgegevens worden bewaard zolang uw account actief is. Na verwijdering van uw account worden uw gegevens binnen 30 dagen permanent verwijderd, tenzij wij wettelijk verplicht zijn deze langer te bewaren.
            </p>
          </div>

          {/* Changes */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">Wijzigingen</h2>
            <p className="text-muted-foreground">
              Wij behouden ons het recht voor om wijzigingen aan te brengen in deze privacyverklaring. De meest recente versie is altijd te vinden op deze pagina. Wij adviseren u om deze privacyverklaring regelmatig te raadplegen, zodat u op de hoogte bent van eventuele wijzigingen.
            </p>
            <p className="text-muted-foreground mt-4">
              <strong>Laatste update:</strong> 20 mei 2026
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-br from-primary to-accent text-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-3">Contact</h2>
            <p className="mb-4 opacity-90">
              Heeft u vragen over deze privacyverklaring of over de verwerking van uw persoonlijke gegevens? Of wilt u gebruik maken van uw rechten? Neem dan contact met ons op:
            </p>
            <div className="space-y-2 opacity-90">
              <p>E-mail: privacy@top2000.nl</p>
              <p>Telefoon: 035 - 677 33 33</p>
              <p>Adres: NPO Radio 2, Postbus 26444, 1202 JJ Hilversum</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
