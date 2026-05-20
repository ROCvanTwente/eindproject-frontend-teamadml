import { FileText, AlertCircle, Scale, Ban } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Algemene Voorwaarden</h1>
          <p className="text-muted-foreground text-lg">
            Gebruiksvoorwaarden voor de TOP 2000 website
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">1. Algemeen</h2>
                <p className="text-muted-foreground mb-4">
                  Deze algemene voorwaarden zijn van toepassing op het gebruik van de TOP 2000 website en alle daarop aangeboden diensten. Door gebruik te maken van onze website gaat u akkoord met deze voorwaarden.
                </p>
                <p className="text-muted-foreground">
                  TOP 2000 is een onderdeel van NPO Radio 2 en behoudt zich het recht voor om deze algemene voorwaarden te allen tijde te wijzigen. Wijzigingen worden op deze pagina gepubliceerd en treden in werking op het moment van publicatie.
                </p>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">2. Account en registratie</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>2.1</strong> Voor bepaalde diensten, zoals het stemmen op de TOP 2000 en het aanmaken van playlists, is een account vereist.
              </p>
              <p>
                <strong>2.2</strong> Bij registratie bent u verplicht correcte en volledige informatie te verstrekken.
              </p>
              <p>
                <strong>2.3</strong> U bent zelf verantwoordelijk voor het geheimhouden van uw inloggegevens. Alle activiteiten die plaatsvinden via uw account worden geacht door u te zijn verricht.
              </p>
              <p>
                <strong>2.4</strong> U dient ons onmiddellijk op de hoogte te stellen indien u vermoedt dat uw account onbevoegd wordt gebruikt.
              </p>
              <p>
                <strong>2.5</strong> Wij behouden ons het recht voor om accounts te blokkeren of te verwijderen bij misbruik of schending van deze voorwaarden.
              </p>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ban className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">3. Gebruik van de website</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>3.1</strong> Het is niet toegestaan om de website te gebruiken voor onwettige doeleinden of op een manier die inbreuk maakt op de rechten van anderen.
                  </p>
                  <p>
                    <strong>3.2</strong> U mag geen handelingen verrichten die de werking van de website kunnen verstoren of schade kunnen toebrengen aan onze systemen.
                  </p>
                  <p>
                    <strong>3.3</strong> Het is verboden om:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Virussen, malware of andere schadelijke software te uploaden of te verspreiden</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Ongeautoriseerde toegang tot onze systemen te verkrijgen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Automatische systemen (bots) te gebruiken zonder onze toestemming</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Stemfraude te plegen of het stemsysteem te manipuleren</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Beledigende, discriminerende of anderszins ongepaste content te plaatsen</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Voting */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">4. Stemmen TOP 2000</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>4.1</strong> Tijdens de stemperiode kunt u stemmen op uw favoriete nummers voor de TOP 2000.
              </p>
              <p>
                <strong>4.2</strong> Per account mag u maximaal één keer stemmen per stemronde. Het maximum aantal stemmen per stemronde wordt voorafgaand aan de stemming bekend gemaakt.
              </p>
              <p>
                <strong>4.3</strong> Wij behouden ons het recht voor om stemmen te weigeren of te verwijderen indien deze in strijd zijn met deze voorwaarden.
              </p>
              <p>
                <strong>4.4</strong> Manipulatie van het stemsysteem is verboden en kan leiden tot uitsluiting en aangifte bij de politie.
              </p>
              <p>
                <strong>4.5</strong> De definitieve TOP 2000 lijst wordt samengesteld op basis van de ontvangen stemmen. Wij behouden ons het recht voor om de lijst aan te passen indien er sprake is van fraude of technische problemen.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">5. Intellectueel eigendom</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>5.1</strong> Alle rechten van intellectueel eigendom met betrekking tot de website en de daarop aangeboden content berusten bij NPO Radio 2 of haar licentiegevers.
                  </p>
                  <p>
                    <strong>5.2</strong> Het is niet toegestaan om content van de website te kopiëren, te verveelvoudigen of te verspreiden zonder voorafgaande schriftelijke toestemming.
                  </p>
                  <p>
                    <strong>5.3</strong> De naam "TOP 2000", het logo en andere merken zijn eigendom van NPO en mogen niet zonder toestemming worden gebruikt.
                  </p>
                  <p>
                    <strong>5.4</strong> Door content te uploaden (zoals playlists of reacties) verleent u ons een niet-exclusieve, wereldwijde licentie om deze content te gebruiken, tonen en verspreiden op onze website.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Liability */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">6. Aansprakelijkheid</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>6.1</strong> Wij streven ernaar om de website altijd beschikbaar te houden, maar kunnen niet garanderen dat de website te allen tijde zonder onderbrekingen beschikbaar is.
                  </p>
                  <p>
                    <strong>6.2</strong> Wij zijn niet aansprakelijk voor schade die voortvloeit uit het gebruik van de website, tenzij deze schade het gevolg is van opzet of grove schuld van onze kant.
                  </p>
                  <p>
                    <strong>6.3</strong> Wij zijn niet verantwoordelijk voor de inhoud van websites van derden waarnaar wij linken.
                  </p>
                  <p>
                    <strong>6.4</strong> Wij doen ons best om de informatie op de website actueel en correct te houden, maar kunnen niet garanderen dat alle informatie te allen tijde juist en volledig is.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">7. Privacy</h2>
            <p className="text-muted-foreground">
              Voor informatie over hoe wij omgaan met uw persoonlijke gegevens verwijzen wij u naar onze{' '}
              <a href="/privacy" className="text-primary hover:underline font-semibold">
                privacyverklaring
              </a>
              .
            </p>
          </div>

          {/* Changes and Termination */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">8. Wijzigingen en beëindiging</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>8.1</strong> Wij behouden ons het recht voor om de website, diensten of deze voorwaarden op ieder moment te wijzigen of te beëindigen.
              </p>
              <p>
                <strong>8.2</strong> U kunt uw account op ieder moment verwijderen via de accountinstellingen.
              </p>
              <p>
                <strong>8.3</strong> Bij beëindiging van uw account kunnen wij uw gegevens bewaren voor zover wij daartoe wettelijk verplicht zijn.
              </p>
            </div>
          </div>

          {/* Applicable Law */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">9. Toepasselijk recht</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>9.1</strong> Op deze algemene voorwaarden is Nederlands recht van toepassing.
              </p>
              <p>
                <strong>9.2</strong> Geschillen die voortvloeien uit deze voorwaarden zullen worden voorgelegd aan de bevoegde rechter in het arrondissement Noord-Holland.
              </p>
            </div>
          </div>

          {/* Version Info */}
          <div className="bg-card border border-border rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-3">10. Slotbepalingen</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>10.1</strong> Indien een bepaling uit deze voorwaarden nietig wordt verklaard, blijven de overige bepalingen onverminderd van kracht.
              </p>
              <p>
                <strong>10.2</strong> Deze algemene voorwaarden zijn voor het laatst gewijzigd op 20 mei 2026.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-br from-primary to-accent text-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-3">Contact</h2>
            <p className="mb-4 opacity-90">
              Heeft u vragen over deze algemene voorwaarden? Neem dan contact met ons op:
            </p>
            <div className="space-y-2 opacity-90">
              <p>E-mail: info@top2000.nl</p>
              <p>Telefoon: 035 - 677 33 33</p>
              <p>Adres: NPO Radio 2, Postbus 26444, 1202 JJ Hilversum</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
