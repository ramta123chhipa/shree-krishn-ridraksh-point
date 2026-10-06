import { useEffect, useState } from 'react';
import { getPublicSettings } from '../services/settingsService';

let cached; // settings rarely change, so fetch once per page load

// Store-wide settings from the server: payment options, shipping text.
export function useSettings() {
  const [settings, setSettings] = useState(cached || null);
  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    getPublicSettings().then((s) => { cached = s; if (!cancelled) setSettings(s); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return settings;
}
