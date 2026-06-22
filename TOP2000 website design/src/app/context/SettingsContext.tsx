import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'nl' | 'en';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  nl: {
    // Nav Bar
    nav_home: 'Home',
    nav_list: 'De Lijst',
    nav_artists: 'Artiesten',
    nav_songs: 'Nummers',
    nav_history: 'Geschiedenis',
    nav_stats: 'Statistieken',
    nav_playlists: 'Mijn Playlists',
    nav_admin: 'Admin Panel',
    nav_logout: 'Uitloggen',
    nav_login: 'Inloggen',
    nav_register: 'Account aanmaken',
    nav_settings: 'Instellingen',

    // Settings Page
    settings_title: 'Instellingen',
    settings_subtitle: 'Pas de website aan naar jouw voorkeur',
    settings_section_lang: 'Taalkeuze / Language',
    settings_lang_desc: 'Selecteer de taal voor de gebruikersinterface.',
    settings_section_access: 'Toegankelijkheid',
    settings_access_desc: 'Pas de weergave en animaties aan voor een betere leesbaarheid.',
    settings_high_contrast: 'Hoog Contrast',
    settings_high_contrast_desc: 'Verhoog het contrast voor betere leesbaarheid.',
    settings_large_text: 'Grote Tekst',
    settings_large_text_desc: 'Vergroot de lettergrootte van de hele website.',
    settings_reduced_motion: 'Verminderde Beweging',
    settings_reduced_motion_desc: 'Schakel vloeiende animaties en overgangen uit.',
    settings_saved: 'Instellingen opgeslagen!',

    // General / Footer
    footer_subtitle: 'De grootste muzieklijst van Nederland',
    footer_service: 'Service',
    footer_contact: 'Contact',
    footer_faq: 'FAQ',
    footer_privacy: 'Privacy',
    footer_terms: 'Voorwaarden',
    footer_copy: 'NPO Radio 2. Onderdeel van de Nederlandse Publieke Omroep.'
  },
  en: {
    // Nav Bar
    nav_home: 'Home',
    nav_list: 'The List',
    nav_artists: 'Artists',
    nav_songs: 'Songs',
    nav_history: 'History',
    nav_stats: 'Statistics',
    nav_playlists: 'My Playlists',
    nav_admin: 'Admin Panel',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_register: 'Create Account',
    nav_settings: 'Settings',

    // Settings Page
    settings_title: 'Settings',
    settings_subtitle: 'Customize the website to your preferences',
    settings_section_lang: 'Language / Taalkeuze',
    settings_lang_desc: 'Select the language for the user interface.',
    settings_section_access: 'Accessibility',
    settings_access_desc: 'Adjust contrast, text sizing, and motion defaults.',
    settings_high_contrast: 'High Contrast',
    settings_high_contrast_desc: 'Increase contrast for improved readability.',
    settings_large_text: 'Large Text',
    settings_large_text_desc: 'Enlarge font sizes across the entire website.',
    settings_reduced_motion: 'Reduced Motion',
    settings_reduced_motion_desc: 'Disable smooth transitions and animations.',
    settings_saved: 'Settings saved!',

    // General / Footer
    footer_subtitle: 'The largest music list of the Netherlands',
    footer_service: 'Service',
    footer_contact: 'Contact',
    footer_faq: 'FAQ',
    footer_privacy: 'Privacy',
    footer_terms: 'Terms',
    footer_copy: 'NPO Radio 2. Part of the Dutch Public Broadcasting.'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'nl';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  const [largeText, setLargeTextState] = useState<boolean>(() => {
    return localStorage.getItem('largeText') === 'true';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('reducedMotion') === 'true';
  });

  // Apply accessibility classes to html element
  useEffect(() => {
    const html = document.documentElement;

    if (highContrast) {
      html.classList.add('theme-high-contrast');
    } else {
      html.classList.remove('theme-high-contrast');
    }

    if (largeText) {
      html.classList.add('theme-large-text');
    } else {
      html.classList.remove('theme-large-text');
    }

    if (reducedMotion) {
      html.classList.add('theme-reduced-motion');
    } else {
      html.classList.remove('theme-reduced-motion');
    }
  }, [highContrast, largeText, reducedMotion]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const setHighContrast = (val: boolean) => {
    localStorage.setItem('highContrast', String(val));
    setHighContrastState(val);
  };

  const setLargeText = (val: boolean) => {
    localStorage.setItem('largeText', String(val));
    setLargeTextState(val);
  };

  const setReducedMotion = (val: boolean) => {
    localStorage.setItem('reducedMotion', String(val));
    setReducedMotionState(val);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        reducedMotion,
        setReducedMotion,
        t
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
