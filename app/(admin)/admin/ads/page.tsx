'use client';
import { useState, useEffect } from 'react';
import { TabAds } from '../components/TabAds';
import { Loader2 } from 'lucide-react';

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAds = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadAds(); }, []);

  const showNotif = (msg: string, type: 'success' | 'error') => {
    alert(msg);
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return <TabAds ads={ads} loadAds={loadAds} showNotif={showNotif} />;
}
