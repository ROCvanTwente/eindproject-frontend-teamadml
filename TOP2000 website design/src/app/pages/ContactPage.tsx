import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success('Jouw bericht is succesvol verzonden! We nemen zo snel mogelijk contact op.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div className="pb-16 text-white">
      {/* Page Header */}
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] py-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 mb-3">
            <Mail className="w-3.5 h-3.5" />
            Vragen & Support
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Neem Contact Op</h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Heb je vragen over de stemming, artiesten catalogus of suggesties voor ons? We horen het graag. Vul het formulier in of gebruik onze directe kanalen.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Email Card */}
              <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/25 rounded-3xl p-6 shadow-xl flex items-start gap-4 transition-all hover:scale-[1.01] hover:bg-white/5">
                <div className="w-12 h-12 bg-primary/15 border border-primary/25 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">E-mail</h3>
                  <p className="text-muted-foreground text-sm mt-1">top2000@nporadio2.nl</p>
                  <span className="text-[10px] text-primary font-bold uppercase mt-2 block">Direct antwoord</span>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/25 rounded-3xl p-6 shadow-xl flex items-start gap-4 transition-all hover:scale-[1.01] hover:bg-white/5">
                <div className="w-12 h-12 bg-primary/15 border border-primary/25 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Telefoon</h3>
                  <p className="text-muted-foreground text-sm mt-1">035 - 677 33 33</p>
                  <span className="text-[10px] text-muted-foreground font-semibold mt-2 block">Bereikbaar tijdens kantooruren</span>
                </div>
              </div>

              {/* Map Card */}
              <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/25 rounded-3xl p-6 shadow-xl flex items-start gap-4 transition-all hover:scale-[1.01] hover:bg-white/5">
                <div className="w-12 h-12 bg-primary/15 border border-primary/25 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Adres</h3>
                  <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                    NPO Radio 2<br />
                    Postbus 26444<br />
                    1202 JJ Hilversum
                  </p>
                </div>
              </div>

              {/* Follow Us Card */}
              <div className="bg-gradient-to-br from-primary/25 to-accent/25 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 -mr-6 -mb-6">
                  <Heart className="w-32 h-32 text-white fill-current" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">Volg de TOP 2000</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Blijf verbonden en mis geen enkele update via onze sociale kanalen.
                </p>
                <div className="flex gap-2">
                  <a
                    href="https://www.facebook.com/nporadio2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/nporadio2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/nporadio2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262(c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>)
                    </svg>
                  </a>
                </div>
              </div>

            </div>

            {/* Contact Form */}
            <div className="lg:col-span-8">
              <div className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Stuur ons een bericht
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Naam *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3.5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/5 text-white placeholder-muted-foreground/50 transition-all shadow-inner"
                        placeholder="Jouw naam"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        E-mailadres *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3.5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/5 text-white placeholder-muted-foreground/50 transition-all shadow-inner"
                        placeholder="jouw@email.nl"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Onderwerp *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3.5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/5 text-white placeholder-muted-foreground/50 transition-all shadow-inner"
                      placeholder="Waar gaat je bericht over?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Bericht *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3.5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/5 text-white placeholder-muted-foreground/50 transition-all resize-none shadow-inner"
                      placeholder="Typ hier je bericht..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sending ? (
                      <span className="flex items-center gap-2">Versturen...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Verstuur Bericht
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
