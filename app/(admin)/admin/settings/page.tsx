'use client';
import { useState, useEffect } from 'react';
import { TabSettings } from '../components/TabSettings';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || null);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadSettings(); }, []);

  const showNotif = (msg: string, type: 'success' | 'error') => {
    alert(msg);
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return <TabSettings settings={settings} loadSettings={loadSettings} showNotif={showNotif} />;
}
