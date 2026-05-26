export function VotingPage() {
  return (
    <div className="pb-12 text-white">
      <section className="border-b border-white/15 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0))] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-white/20 px-4 py-1 text-sm uppercase tracking-[0.2em] text-white/80">
              Top 2000
            </p>
            <h1 className="text-4xl md:text-5xl mb-4 text-white">Stemmen</h1>
            <p className="text-lg text-white/85">
            De stemmodule is nog niet live, maar deze pagina is alvast beschikbaar.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-3xl rounded-2xl border border-white/20 p-8 text-foreground shadow-2xl shadow-black/20 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-semibold text-primary">Binnenkort stemmen op jouw favorieten</h2>
          <p className="leading-7 text-muted-foreground">
            Hier komt straks de pagina waar bezoekers hun favoriete nummers voor de Top 2000 kunnen kiezen.
            Tot die tijd kun je de lijst, artiesten en statistieken alvast bekijken.
          </p>
        </div>
      </div>
    </div>
  );
}