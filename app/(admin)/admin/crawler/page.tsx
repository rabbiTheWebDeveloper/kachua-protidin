'use client';
import { useState, useEffect } from 'react';
import { TabCrawler } from '../components/TabCrawler';
import { Loader2 } from 'lucide-react';
import { Article } from '@/lib/db';

export default function CrawlerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [scraperStatus, setScraperStatus] = useState<any>({ isRunning: false, lastRun: 0, count: 0, message: '' });
  const [loading, setLoading] = useState(true);
  const [scraperLoading, setScraperLoading] = useState(false);

  const loadData = async () => {
    try {
      const [artRes, scrapeRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/scraper/scrape')
      ]);
      const artData = await artRes.json();
      const scrapeData = await scrapeRes.json();
      setArticles(artData.articles || []);
      if (scrapeData.status) setScraperStatus(scrapeData.status);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const showNotif = (msg: string, type: 'success' | 'error') => {
    alert(msg);
  };

  const handleScrapeLatest = async () => {
    if (scraperLoading || scraperStatus.isRunning) return;
    try {
      setScraperLoading(true);
      setScraperStatus((prev: any) => ({ ...prev, isRunning: true, message: 'বুটস্ট্র্যাপ ক্রলার চলছে...' }));
      const res = await fetch('/api/scraper/scrape', { method: 'POST' });
      if (res.ok) {
        showNotif('প্রথম আলো থেকে সর্বশেষ খবর সফলভাবে স্ক্র্যাপ করা হয়েছে!', 'success');
        await loadData();
      } else {
        showNotif('খবর স্ক্র্যাপিং ত্রুটি হয়েছে।', 'error');
      }
    } catch (err) {
      showNotif('ক্রলার সংযোগে ত্রুটি ঘটেছে', 'error');
    } finally {
      setScraperLoading(false);
      await loadData();
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return (
    <TabCrawler 
      scraperStatus={scraperStatus} 
      articles={articles} 
      handleScrapeLatest={handleScrapeLatest} 
      scraperLoading={scraperLoading} 
      showNotif={showNotif} 
    />
  );
}
