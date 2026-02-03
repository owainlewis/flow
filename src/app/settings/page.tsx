'use client';

import { useState, useEffect } from 'react';
import { Platform, PLATFORM_LABELS, WeeklyCadence, DEFAULT_CADENCE, DAY_LABELS } from '../types/content';
import { loadCadence, saveCadence } from '../utils/feed';
import { loadApiKey, saveApiKey } from '../utils/chat';
import AppLayout from '../components/AppLayout';

const THEME_KEY = 'contentflow-theme';

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  youtube: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  ),
  newsletter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.13 2.56 5.67 5.7 5.67 3.14 0 5.68-2.55 5.68-5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  ),
};

const PLATFORMS: Platform[] = ['linkedin', 'youtube', 'newsletter', 'twitter', 'instagram', 'tiktok'];

export default function SettingsPage() {
  const [cadence, setCadence] = useState<WeeklyCadence>(DEFAULT_CADENCE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaveStatus, setApiKeySaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    setCadence(loadCadence());
    setApiKey(loadApiKey());
    setIsLoaded(true);
  }, []);

  const handleSaveApiKey = () => {
    saveApiKey(apiKey);
    setApiKeySaveStatus('saved');
    setTimeout(() => setApiKeySaveStatus('idle'), 2000);
  };

  const handleToggleDay = (platform: Platform, dayIndex: number) => {
    setCadence((prev) => {
      const days = [...prev[platform]];
      days[dayIndex] = !days[dayIndex];
      const next = { ...prev, [platform]: days };
      saveCadence(next);
      return next;
    });
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-[600px] mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Settings</h1>
          <p className="text-[var(--muted-foreground)]">
            Configure your weekly content cadence. Toggle the days you want to publish on each platform.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            AI Assistant
          </h2>

          <div className="space-y-3">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium mb-1.5">
                Anthropic API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full text-sm bg-[var(--muted)] rounded-lg px-3 py-2 pr-10 outline-none placeholder:text-[var(--placeholder-color)] text-[var(--foreground)]"
                  />
                  <button
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    title={showApiKey ? 'Hide key' : 'Show key'}
                  >
                    {showApiKey ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 text-sm font-medium bg-[var(--foreground)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity"
                >
                  {apiKeySaveStatus === 'saved' ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Your key is stored locally in your browser and sent directly to Anthropic. It is never sent to our servers.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Weekly Cadence
          </h2>

          {PLATFORMS.map((platform) => (
            <div
              key={platform}
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[var(--button-hover)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--muted-foreground)]">
                  {PLATFORM_ICONS[platform]}
                </span>
                <span className="font-medium">{PLATFORM_LABELS[platform]}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {DAY_LABELS.map((label, i) => {
                  const active = cadence[platform]?.[i] ?? false;
                  return (
                    <button
                      key={i}
                      onClick={() => handleToggleDay(platform, i)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[var(--foreground)] text-[var(--background)]'
                          : 'border border-[var(--toolbar-border)] text-[var(--muted-foreground)] hover:bg-[var(--button-hover)]'
                      }`}
                      aria-label={`Toggle ${PLATFORM_LABELS[platform]} on ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-[var(--muted-foreground)]">
          Toggle the days you plan to post on each platform. Active days appear as slots in the weekly view.
        </p>
      </div>
    </AppLayout>
  );
}
