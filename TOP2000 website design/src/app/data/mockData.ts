// Mock data for artists and songs
export interface Artist {
  id: number;
  name: string;
  bio?: string;
  photoUrl?: string;
  website?: string;
  wikiUrl?: string;
  numberOfSongs: number;
}

export interface Song {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  year: number;
  albumCover?: string;
  youtubeUrl?: string;
  lyricsPreview?: string;
  timesListed: number;
}

export interface SongRanking {
  songId: number;
  year: number;
  position: number;
}

export const mockArtists: Artist[] = [
  {
    id: 1,
    name: 'Queen',
    bio: 'Queen is een Britse rockband opgericht in 1970 in Londen. De groep bestaat uit gitarist Brian May, drummer Roger Taylor, zanger Freddie Mercury (overleden in 1991) en bassist John Deacon.',
    photoUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
    website: 'https://www.queenonline.com',
    wikiUrl: 'https://nl.wikipedia.org/wiki/Queen',
    numberOfSongs: 15
  },
  {
    id: 2,
    name: 'Eagles',
    bio: 'Eagles is een Amerikaanse rockband uit Los Angeles, opgericht in 1971. De band is vooral bekend van hun countryrock en hits als Hotel California.',
    photoUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=600&fit=crop',
    website: 'https://eagles.com',
    wikiUrl: 'https://nl.wikipedia.org/wiki/Eagles',
    numberOfSongs: 12
  },
  {
    id: 3,
    name: 'Led Zeppelin',
    bio: 'Led Zeppelin was een Engelse rockband, opgericht in Londen in 1968. De groep wordt beschouwd als een van de meest invloedrijke rockbands aller tijden.',
    photoUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop',
    wikiUrl: 'https://nl.wikipedia.org/wiki/Led_Zeppelin',
    numberOfSongs: 18
  },
  {
    id: 4,
    name: 'John Lennon',
    bio: 'John Lennon was een Engels muzikant, zanger, songwriter en vredesactivist. Hij verwierf wereldwijde bekendheid als oprichter en leadzanger van The Beatles.',
    photoUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop',
    wikiUrl: 'https://nl.wikipedia.org/wiki/John_Lennon',
    numberOfSongs: 8
  },
  {
    id: 5,
    name: 'Deep Purple',
    bio: 'Deep Purple is een Engelse rockband opgericht in 1968. De band geldt als een van de grondleggers van heavy metal en moderne hardrock.',
    photoUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop',
    wikiUrl: 'https://nl.wikipedia.org/wiki/Deep_Purple',
    numberOfSongs: 10
  },
  {
    id: 6,
    name: 'The Beatles',
    bio: 'The Beatles was een Engelse popgroep uit Liverpool, opgericht in 1960. De band wordt algemeen beschouwd als de invloedrijkste en populairste band aller tijden.',
    photoUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop',
    wikiUrl: 'https://nl.wikipedia.org/wiki/The_Beatles',
    numberOfSongs: 45
  },
  {
    id: 7,
    name: 'Pink Floyd',
    bio: 'Pink Floyd is een Britse progressieve rockband opgericht in 1965 in Londen. De groep staat vooral bekend om hun filosofische songteksten en experimentele muziek.',
    photoUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=600&fit=crop',
    wikiUrl: 'https://nl.wikipedia.org/wiki/Pink_Floyd',
    numberOfSongs: 22
  },
  {
    id: 8,
    name: 'Bruce Springsteen',
    bio: 'Bruce Springsteen is een Amerikaans singer-songwriter en muzikant. Hij staat ook bekend als "The Boss" en is beroemd om zijn energieke optredens.',
    photoUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop',
    wikiUrl: 'https://nl.wikipedia.org/wiki/Bruce_Springsteen',
    numberOfSongs: 14
  }
];

export const mockSongs: Song[] = [
  {
    id: 1,
    title: 'Bohemian Rhapsody',
    artistId: 1,
    artistName: 'Queen',
    year: 1975,
    albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    lyricsPreview: 'Is this the real life? Is this just fantasy...',
    timesListed: 26
  },
  {
    id: 2,
    title: 'Hotel California',
    artistId: 2,
    artistName: 'Eagles',
    year: 1977,
    albumCover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    youtubeUrl: 'https://www.youtube.com/watch?v=EqPtz5qN7HM',
    lyricsPreview: 'On a dark desert highway, cool wind in my hair...',
    timesListed: 26
  },
  {
    id: 3,
    title: 'Stairway to Heaven',
    artistId: 3,
    artistName: 'Led Zeppelin',
    year: 1971,
    albumCover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    youtubeUrl: 'https://www.youtube.com/watch?v=iXQUu5Dti4g',
    lyricsPreview: "There's a lady who's sure all that glitters is gold...",
    timesListed: 26
  },
  {
    id: 4,
    title: 'Imagine',
    artistId: 4,
    artistName: 'John Lennon',
    year: 1971,
    albumCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    youtubeUrl: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
    lyricsPreview: "Imagine there's no heaven, it's easy if you try...",
    timesListed: 26
  },
  {
    id: 5,
    title: 'Child in Time',
    artistId: 5,
    artistName: 'Deep Purple',
    year: 1970,
    albumCover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    youtubeUrl: 'https://www.youtube.com/watch?v=PfAWReBmxEs',
    lyricsPreview: 'Sweet child in time, you\'ll see the line...',
    timesListed: 25
  }
];

export const mockRankings: SongRanking[] = [
  // Bohemian Rhapsody rankings - always #1
  { songId: 1, year: 2024, position: 1 },
  { songId: 1, year: 2023, position: 1 },
  { songId: 1, year: 2022, position: 1 },
  { songId: 1, year: 2021, position: 1 },
  { songId: 1, year: 2020, position: 1 },
  { songId: 1, year: 2019, position: 1 },
  { songId: 1, year: 2018, position: 1 },
  { songId: 1, year: 2017, position: 1 },
  { songId: 1, year: 2016, position: 1 },
  { songId: 1, year: 2015, position: 1 },

  // Hotel California rankings - around #2-3
  { songId: 2, year: 2024, position: 2 },
  { songId: 2, year: 2023, position: 3 },
  { songId: 2, year: 2022, position: 2 },
  { songId: 2, year: 2021, position: 3 },
  { songId: 2, year: 2020, position: 2 },
  { songId: 2, year: 2019, position: 3 },
  { songId: 2, year: 2018, position: 2 },
  { songId: 2, year: 2017, position: 2 },
  { songId: 2, year: 2016, position: 3 },
  { songId: 2, year: 2015, position: 2 },

  // Stairway to Heaven rankings - around #2-4
  { songId: 3, year: 2024, position: 3 },
  { songId: 3, year: 2023, position: 2 },
  { songId: 3, year: 2022, position: 3 },
  { songId: 3, year: 2021, position: 2 },
  { songId: 3, year: 2020, position: 4 },
  { songId: 3, year: 2019, position: 2 },
  { songId: 3, year: 2018, position: 3 },
  { songId: 3, year: 2017, position: 3 },
  { songId: 3, year: 2016, position: 2 },
  { songId: 3, year: 2015, position: 3 },

  // Imagine rankings - stable around #4-5
  { songId: 4, year: 2024, position: 4 },
  { songId: 4, year: 2023, position: 5 },
  { songId: 4, year: 2022, position: 4 },
  { songId: 4, year: 2021, position: 4 },
  { songId: 4, year: 2020, position: 5 },
  { songId: 4, year: 2019, position: 4 },
  { songId: 4, year: 2018, position: 5 },
  { songId: 4, year: 2017, position: 4 },
  { songId: 4, year: 2016, position: 4 },
  { songId: 4, year: 2015, position: 5 },

  // Child in Time rankings - rising and falling
  { songId: 5, year: 2024, position: 8 },
  { songId: 5, year: 2023, position: 12 },
  { songId: 5, year: 2022, position: 15 },
  { songId: 5, year: 2021, position: 20 },
  { songId: 5, year: 2020, position: 25 },
  { songId: 5, year: 2019, position: 30 },
  // Missing in 2018 (disappeared)
  { songId: 5, year: 2017, position: 28 },
  { songId: 5, year: 2016, position: 25 },
  { songId: 5, year: 2015, position: 23 },
];

export function getArtistById(id: number): Artist | undefined {
  return mockArtists.find(artist => artist.id === id);
}

export function getSongById(id: number): Song | undefined {
  return mockSongs.find(song => song.id === id);
}

export function getSongsByArtistId(artistId: number): Song[] {
  return mockSongs.filter(song => song.artistId === artistId);
}

export function getRankingsForSong(songId: number): SongRanking[] {
  return mockRankings.filter(ranking => ranking.songId === songId).sort((a, b) => b.year - a.year);
}
