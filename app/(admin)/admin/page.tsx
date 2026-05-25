'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { getTotalPageViews } from '@/lib/analytics';

export default function AdminOverviewPage() {
  const [totalPageViews, setTotalPageViews] = useState<number>(0);
  const [counts, setCounts] = useState({ news: 0, ads: 0, categories: 0, users: 0 });
  const [dbSource, setDbSource] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [scraperStatus, setScraperStatus] = useState<any>({ isRunning: false, lastRun: 0 });

  useEffect(() => {
    setTotalPageViews(getTotalPageViews());

    async function loadDashboardData() {
      try {
        const [catRes, userRes, adRes, artRes, scrapeRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/users'),
          fetch('/api/ads'),
          fetch('/api/articles'),
          fetch('/api/scraper/scrape')
        ]);
        
        const cats = await catRes.json();
        const users = await userRes.json();
        const ads = await adRes.json();
        const articles = await artRes.json();
        const scrape = await scrapeRes.json();

        setCounts({
          categories: cats.categories?.length || 0,
          users: users.users?.length || 0,
          ads: ads.ads?.length || 0,
          news: articles.articles?.length || 0
        });
        setDbSource(articles.source || 'mongodb');
        if (scrape.status) setScraperStatus(scrape.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in">
      <h2 className="text-2xl font-black flex items-center gap-2 text-gray-900 mb-8 font-bangla border-b border-gray-200 pb-4">
        <LayoutDashboard className="w-6 h-6 text-red-600" />
        <span>ড্যাশবোর্ড ওভারভিউ</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-red-600">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">সর্বমোট সংবাদ</span>
          <span className="text-4xl font-black text-gray-900">{counts.news}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-blue-600">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">ক্যাটাগরি সমূহ</span>
          <span className="text-4xl font-black text-gray-900">{counts.categories}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-green-600">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">সক্রিয় ইউজার</span>
          <span className="text-4xl font-black text-gray-900">{counts.users}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-orange-500 group">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">সর্বমোট পেজ ভিউ</span>
          <span className="text-4xl font-black text-orange-700">{totalPageViews}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-lg text-gray-900 mb-4 font-bangla border-b border-gray-100 pb-2">সিস্টেম ইনফরমেশন</h3>
        <div className="space-y-3 font-sans text-sm">
          <p><strong>ডাটাবেজ স্ট্যাটাস:</strong> {dbSource === 'mongodb' ? <span className="text-green-600">Live (MongoDB Connected)</span> : <span className="text-yellow-600">Fallback Local Mode</span>}</p>
          <p><strong>ক্রলার স্ট্যাটাস:</strong> {scraperStatus.isRunning ? 'Active' : 'Standby'} ({scraperStatus.lastRun > 0 ? new Date(scraperStatus.lastRun).toLocaleString('bn-BD', {hour12: true}) : 'Never'})</p>
        </div>
      </div>
    </div>
  );
}
