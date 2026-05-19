import { Link, Outlet } from 'react-router-dom';
import { Music, Search, Menu, X, ChevronDown, User, LogIn, ListMusic, Shield } from 'lucide-react';
import { useState } from 'react';

const djList = [
  { name: 'Bart Arens', wiki: 'https://nl.wikipedia.org/wiki/Bart_Arens' },
  { name: 'Rob Stenders', wiki: 'https://nl.wikipedia.org/wiki/Rob_Stenders' },
  { name: 'Ruud de Wild', wiki: 'https://nl.wikipedia.org/wiki/Ruud_de_Wild' },
  { name: 'Jan-Willem Roodbeen', wiki: 'https://nl.wikipedia.org/wiki/Jan-Willem_Roodbeen' },
  { name: 'Wouter van der Goes', wiki: 'https://nl.wikipedia.org/wiki/Wouter_van_der_Goes' },
  { name: 'Frank van \'t Hof', wiki: 'https://nl.wikipedia.org/wiki/Frank_van_%27t_Hof' },
  { name: 'Jeroen van Inkel', wiki: 'https://nl.wikipedia.org/wiki/Jeroen_van_Inkel' },
];

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [djMenuOpen, setDjMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex flex-col">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">NPO Radio 2</div>
                <div className="text-primary text-2xl font-bold tracking-tight">
                  Top 2000
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">
                Home
              </Link>
              <Link to="/lijst" className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">
                De Lijst
              </Link>
              <Link to="/artiesten" className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">
                Artiesten
              </Link>
              <Link to="/nummers" className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">
                Nummers
              </Link>

              {/* DJ Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setDjMenuOpen(true)}
                onMouseLeave={() => setDjMenuOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">
                  DJ's
                  <ChevronDown className="w-3 h-3" />
                </button>
                {djMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-border shadow-xl py-2 w-56 z-50">
                    <a
                      href="https://nl.wikipedia.org/wiki/Bart_Arens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 hover:bg-secondary transition-colors text-sm font-semibold text-primary"
                    >
                      Openingsact: Bart Arens
                    </a>
                    <div className="border-t border-border my-1"></div>
                    {djList.map(dj => (
                      <a
                        key={dj.name}
                        href={dj.wiki}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 hover:bg-secondary transition-colors text-sm"
                      >
                        {dj.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/geschiedenis" className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">
                Geschiedenis
              </Link>
              <Link to="/statistieken" className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">
                Statistieken
              </Link>
            </nav>

            {/* User Menu & Search */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                <Search className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-xl py-2 w-56 z-50">
                    <Link
                      to="/playlists"
                      className="block px-4 py-2 hover:bg-secondary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <ListMusic className="w-4 h-4" />
                        Mijn Playlists
                      </div>
                    </Link>
                    <div className="border-t border-border my-1"></div>
                    <Link
                      to="/admin/artiesten"
                      className="block px-4 py-2 hover:bg-secondary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin: Artiesten
                      </div>
                    </Link>
                    <Link
                      to="/admin/nummers"
                      className="block px-4 py-2 hover:bg-secondary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin: Nummers
                      </div>
                    </Link>
                    <div className="border-t border-border my-1"></div>
                    <Link
                      to="/login"
                      className="block px-4 py-2 hover:bg-secondary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Inloggen
                      </div>
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 hover:bg-secondary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Account aanmaken
                    </Link>
                  </div>
                )}
              </div>

              <button
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-border">
              <Link
                to="/"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/lijst"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                TOP 2000 Lijst
              </Link>
              <Link
                to="/artiesten"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Artiesten
              </Link>
              <Link
                to="/nummers"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nummers
              </Link>
              <div className="py-2">
                <div className="font-semibold mb-2">DJ's</div>
                <a
                  href="https://nl.wikipedia.org/wiki/Bart_Arens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1 pl-4 text-sm hover:text-primary transition-colors"
                >
                  Openingsact: Bart Arens
                </a>
                {djList.map(dj => (
                  <a
                    key={dj.name}
                    href={dj.wiki}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1 pl-4 text-sm hover:text-primary transition-colors"
                  >
                    {dj.name}
                  </a>
                ))}
              </div>
              <Link
                to="/geschiedenis"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Geschiedenis
              </Link>
              <Link
                to="/statistieken"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Statistieken
              </Link>
              <Link
                to="/faq"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                to="/contact"
                className="block py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/playlists"
                className="block py-2 hover:text-primary transition-colors mt-2 pt-4 border-t border-border"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mijn Playlists
              </Link>
              <div className="py-2 mt-2 pt-4 border-t border-border">
                <div className="font-semibold mb-2">Admin</div>
                <Link
                  to="/admin/artiesten"
                  className="block py-1 pl-4 text-sm hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Artiesten Beheer
                </Link>
                <Link
                  to="/admin/nummers"
                  className="block py-1 pl-4 text-sm hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nummers Beheer
                </Link>
              </div>
              <Link
                to="/login"
                className="block py-2 hover:text-primary transition-colors mt-2 pt-4 border-t border-border"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inloggen
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-6 h-6 text-primary" />
                <span className="font-bold">NPO Radio 2</span>
              </div>
              <p className="text-sm text-muted-foreground">
                De grootste muzieklijst van Nederland
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Top 2000</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/lijst" className="hover:text-foreground transition-colors">De Lijst</Link></li>
                <li><Link to="/geschiedenis" className="hover:text-foreground transition-colors">Geschiedenis</Link></li>
                <li><Link to="/statistieken" className="hover:text-foreground transition-colors">Statistieken</Link></li>
                <li><Link to="/stemmen" className="hover:text-foreground transition-colors">Stemmen</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">NPO Radio 2</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Live luisteren</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Programma's</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">DJ's</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Podcasts</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Service</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Voorwaarden</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NPO Radio 2. Onderdeel van de Nederlandse Publieke Omroep.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
