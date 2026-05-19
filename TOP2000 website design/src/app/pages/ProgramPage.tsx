import { Radio, Clock, Users } from 'lucide-react';

const schedule = [
  {
    day: 'Maandag 25 december',
    date: '2024-12-25',
    timeSlots: [
      { time: '08:00 - 12:00', dj: 'Rob Stenders', positions: 'Positie 2000 - 1800' },
      { time: '12:00 - 16:00', dj: 'Ruud de Wild', positions: 'Positie 1800 - 1600' },
      { time: '16:00 - 20:00', dj: 'Frank van \'t Hof', positions: 'Positie 1600 - 1400' },
      { time: '20:00 - 00:00', dj: 'Bart Arens', positions: 'Positie 1400 - 1200' }
    ]
  },
  {
    day: 'Dinsdag 26 december',
    date: '2024-12-26',
    timeSlots: [
      { time: '08:00 - 12:00', dj: 'Jan-Willem Roodbeen', positions: 'Positie 1200 - 1000' },
      { time: '12:00 - 16:00', dj: 'Wouter van der Goes', positions: 'Positie 1000 - 800' },
      { time: '16:00 - 20:00', dj: 'Jeroen van Inkel', positions: 'Positie 800 - 600' },
      { time: '20:00 - 00:00', dj: 'Bart Arens', positions: 'Positie 600 - 400' }
    ]
  },
  {
    day: 'Woensdag 27 december',
    date: '2024-12-27',
    timeSlots: [
      { time: '08:00 - 12:00', dj: 'Rob Stenders', positions: 'Positie 400 - 300' },
      { time: '12:00 - 16:00', dj: 'Ruud de Wild', positions: 'Positie 300 - 200' },
      { time: '16:00 - 20:00', dj: 'Frank van \'t Hof', positions: 'Positie 200 - 100' },
      { time: '20:00 - 00:00', dj: 'Bart Arens', positions: 'Positie 100 - 50' }
    ]
  }
];

const djProfiles = [
  {
    name: 'Rob Stenders',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    bio: 'Radio veteraan en muziekkenner'
  },
  {
    name: 'Ruud de Wild',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Energieke presentator met passie voor muziek'
  },
  {
    name: 'Jan-Willem Roodbeen',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Specialist in klassiekers en verhalen'
  },
  {
    name: 'Bart Arens',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    bio: 'Nachtelijke stem van de Top 2000'
  }
];

export function ProgramPage() {
  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl mb-4">Programmering</h1>
          <p className="text-muted-foreground text-lg">
            De complete uitzendschema van de Top 2000
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Radio className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Live op Radio 2</h3>
            <p className="text-sm text-muted-foreground">
              Luister live via 93.1 FM of online via nporadio2.nl
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">7 dagen non-stop</h3>
            <p className="text-sm text-muted-foreground">
              Van 25 december 08:00 tot 31 december 24:00
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Bekende DJ's</h3>
            <p className="text-sm text-muted-foreground">
              De beste Radio 2 presentatoren begeleiden je door de lijst
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl mb-8">Uitzendschema</h2>
          <div className="space-y-6">
            {schedule.map((day) => (
              <div key={day.date} className="bg-card border border-border rounded-lg overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-4">
                  <h3 className="text-xl font-semibold">{day.day}</h3>
                </div>
                <div className="divide-y divide-border">
                  {day.timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0 md:w-40">
                          <div className="flex items-center gap-2 text-primary">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">{slot.time}</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-semibold mb-1">{slot.dj}</div>
                          <div className="text-sm text-muted-foreground">{slot.positions}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DJ Profiles */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl mb-8">Ontmoet de DJ's</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {djProfiles.map((dj) => (
              <div
                key={dj.name}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={dj.image}
                    alt={dj.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{dj.name}</h3>
                  <p className="text-sm text-muted-foreground">{dj.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
