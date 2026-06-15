import { useSettings } from '../context/SettingsContext';
import { Globe, Accessibility, Eye, Type, Activity, Settings, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const {
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    reducedMotion,
    setReducedMotion,
    t
  } = useSettings();

  const handleLanguageChange = (lang: 'nl' | 'en') => {
    setLanguage(lang);
    toast.success(lang === 'nl' ? 'Taal gewijzigd naar Nederlands!' : 'Language changed to English!');
  };

  const handleAccessibilityToggle = (type: 'contrast' | 'text' | 'motion', currentVal: boolean) => {
    if (type === 'contrast') {
      setHighContrast(!currentVal);
      toast.success(!currentVal ? 'Hoog contrast ingeschakeld!' : 'Hoog contrast uitgeschakeld!');
    } else if (type === 'text') {
      setLargeText(!currentVal);
      toast.success(!currentVal ? 'Grote tekst ingeschakeld!' : 'Grote tekst uitgeschakeld!');
    } else if (type === 'motion') {
      setReducedMotion(!currentVal);
      toast.success(!currentVal ? 'Verminderde beweging ingeschakeld!' : 'Verminderde beweging uitgeschakeld!');
    }
  };

  return (
    <div className="pb-16 text-white">
      {/* Page Header */}
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] py-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 mb-3">
            <Settings className="w-3.5 h-3.5" />
            Preferences
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {t('settings_title')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {t('settings_subtitle')}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12 max-w-3xl space-y-8">
        
        {/* Section 1: Language */}
        <div className="bg-card/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            {t('settings_section_lang')}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {t('settings_lang_desc')}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Dutch Option */}
            <button
              onClick={() => handleLanguageChange('nl')}
              className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                language === 'nl'
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div>
                <span className="font-extrabold text-base block text-white">Nederlands</span>
                <span className="text-xs text-muted-foreground mt-0.5 block">Dutch (NL)</span>
              </div>
              {language === 'nl' && (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </button>

            {/* English Option */}
            <button
              onClick={() => handleLanguageChange('en')}
              className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                language === 'en'
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div>
                <span className="font-extrabold text-base block text-white">English</span>
                <span className="text-xs text-muted-foreground mt-0.5 block">English (EN)</span>
              </div>
              {language === 'en' && (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Accessibility */}
        <div className="bg-card/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <Accessibility className="w-5 h-5 text-primary" />
            {t('settings_section_access')}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {t('settings_access_desc')}
          </p>

          <div className="space-y-4">
            
            {/* Toggle 1: High Contrast */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl shadow-sm hover:border-white/10 transition-colors">
              <div className="flex items-start gap-4 pr-4">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary mt-0.5">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-base block">{t('settings_high_contrast')}</span>
                  <span className="text-xs text-muted-foreground leading-normal mt-0.5 block">{t('settings_high_contrast_desc')}</span>
                </div>
              </div>

              {/* Custom Switch Slider */}
              <button
                onClick={() => handleAccessibilityToggle('contrast', highContrast)}
                className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer outline-none ${
                  highContrast ? 'bg-primary' : 'bg-white/20'
                }`}
                aria-label="Toggle High Contrast"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Large Text */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl shadow-sm hover:border-white/10 transition-colors">
              <div className="flex items-start gap-4 pr-4">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary mt-0.5">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-base block">{t('settings_large_text')}</span>
                  <span className="text-xs text-muted-foreground leading-normal mt-0.5 block">{t('settings_large_text_desc')}</span>
                </div>
              </div>

              {/* Custom Switch Slider */}
              <button
                onClick={() => handleAccessibilityToggle('text', largeText)}
                className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer outline-none ${
                  largeText ? 'bg-primary' : 'bg-white/20'
                }`}
                aria-label="Toggle Large Text"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    largeText ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Reduced Motion */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl shadow-sm hover:border-white/10 transition-colors">
              <div className="flex items-start gap-4 pr-4">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary mt-0.5">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-base block">{t('settings_reduced_motion')}</span>
                  <span className="text-xs text-muted-foreground leading-normal mt-0.5 block">{t('settings_reduced_motion_desc')}</span>
                </div>
              </div>

              {/* Custom Switch Slider */}
              <button
                onClick={() => handleAccessibilityToggle('motion', reducedMotion)}
                className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer outline-none ${
                  reducedMotion ? 'bg-primary' : 'bg-white/20'
                }`}
                aria-label="Toggle Reduced Motion"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
