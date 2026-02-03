'use client';

import { useState, useEffect } from 'react';
import { Platform, PLATFORM_LABELS, WeeklyCadence, DEFAULT_CADENCE, DAY_LABELS } from '../types/content';
import { loadCadence, saveCadence } from '../utils/feed';
import { getPlatformIcons } from '../utils/platform-icons';
import { loadApiKey, saveApiKey } from '../utils/chat';
import AppLayout from '../components/AppLayout';

const THEME_KEY = 'contentflow-theme';

const PLATFORM_ICONS = getPlatformIcons(20);

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
