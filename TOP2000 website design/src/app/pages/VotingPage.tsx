export function VotingPage() {
  return (
    <div className="pb-12">
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl mb-4">Stemmen</h1>
          <p className="text-muted-foreground text-lg">
            De stemmodule is nog niet live, maar deze pagina is alvast beschikbaar.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-3xl bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Binnenkort stemmen op jouw favorieten</h2>
          <p className="text-muted-foreground leading-7">
            Hier komt straks de pagina waar bezoekers hun favoriete nummers voor de Top 2000 kunnen kiezen.
            Tot die tijd kun je de lijst, artiesten en statistieken alvast bekijken.
          </p>
        </div>
      </div>
    </div>
  );
}