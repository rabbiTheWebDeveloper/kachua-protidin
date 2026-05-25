'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, 
  RotateCcw, Image as ImageIcon, Send, Database, FileText, Sparkles, LogOut, Check,
  UserCheck, Megaphone, ToggleLeft, ToggleRight, Loader2, Cpu, ExternalLink, Globe, RefreshCw,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTotalPageViews } from '@/lib/analytics';

interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  imgUrl: string;
  time: string;
  author: string;
  isLead: boolean;
  isSub: boolean;
  publishDate?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbSource, setDbSource] = useState('loading');
  const [notif, setNotif] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [totalPageViews, setTotalPageViews] = useState<number>(0);

  // Active Admin View Tab
  const [activePanelTab, setActivePanelTab] = useState<'news' | 'ads' | 'crawler'>('news');

  // Ads Management States
  const [ads, setAds] = useState<any[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adEditingId, setAdEditingId] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adImgUrl, setAdImgUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adPosition, setAdPosition] = useState<'sidebar' | 'top_banner'>('sidebar');
  const [adIsActive, setAdIsActive] = useState(true);

  // Crawler Management States
  const [scraperStatus, setScraperStatus] = useState<{
    isRunning: boolean;
    lastRun: number;
    count: number;
    message: string;
  }>({
    isRunning: false,
    lastRun: 0,
    count: 0,
    message: 'এখনো স্ক্র্যাপ করা হয়নি'
  });
  const [scraperLoading, setScraperLoading] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('বিশেষ সংবাদ');
  const [imgUrl, setImgUrl] = useState('');
  const [author, setAuthor] = useState('নিজস্ব প্রতিবেদক');
  const [isLead, setIsLead] = useState(false);
  const [isSub, setIsSub] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [renderTimestamp, setRenderTimestamp] = useState<number>(0);

  // Show status notification
  const showNotif = (message: string, type: 'success' | 'error') => {
    setNotif({ message, type });
    setTimeout(() => {
      setNotif(null);
    }, 4500);
  };

  // Fetch articles
  const loadArticles = async (shouldSetLoading: boolean = false) => {
    try {
      if (shouldSetLoading) {
        setLoading(true);
      }
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setDbSource(data.source || 'local');
      }
    } catch (err) {
      showNotif('সংবাদ তালিকা লোড করতে ত্রুটি ঘটেছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ads
  const loadAds = async (shouldSetLoading: boolean = false) => {
    try {
      if (shouldSetLoading) setAdsLoading(true);
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (err) {
      showNotif('বিজ্ঞাপন তালিকা লোড করতে ত্রুটি ঘটেছে', 'error');
    } finally {
      setAdsLoading(false);
    }
  };

  // Scraper status loading
  const fetchScraperStatus = async () => {
    try {
      const res = await fetch('/api/scraper/scrape');
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setScraperStatus(data.status);
        }
      }
    } catch (err) {
      console.error('Error loading scraper status:', err);
    }
  };

  const handleScrapeLatest = async () => {
    if (scraperLoading || scraperStatus.isRunning) return;
    try {
      setScraperLoading(true);
      setScraperStatus(prev => ({ ...prev, isRunning: true, message: 'বুটস্ট্র্যাপ ক্রলার চলছে...' }));
      const res = await fetch('/api/scraper/scrape', { method: 'POST' });
      if (res.ok) {
        showNotif('প্রথম আলো থেকে সর্বশেষ খবর সফলভাবে স্ক্র্যাপ করা হয়েছে!', 'success');
        // Immediately load articles
        await loadArticles(false);
      } else {
        showNotif('খবর স্ক্র্যাপিং ত্রুটি হয়েছে।', 'error');
      }
    } catch (err) {
      showNotif('ক্রলার সংযোগে ত্রুটি ঘটেছে', 'error');
    } finally {
      setScraperLoading(false);
      await fetchScraperStatus();
    }
  };

  // Ad Actions and Submit
  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adImgUrl || !adLinkUrl) {
      showNotif('বিজ্ঞাপনের সব তথ্য সঠিকভাবে পূরণ করুন', 'error');
      return;
    }

    const payload = {
      title: adTitle,
      imgUrl: adImgUrl,
      linkUrl: adLinkUrl,
      position: adPosition,
      isActive: adIsActive
    };

    try {
      let res;
      if (adEditingId) {
        res = await fetch(`/api/ads/${adEditingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showNotif(adEditingId ? 'বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে' : 'নতুন বিজ্ঞাপন সফলভাবে যুক্ত করা হয়েছে', 'success');
        resetAdForm();
        loadAds();
      } else {
        const errData = await res.json();
        showNotif(errData.error || 'বিজ্ঞাপনটি সংরক্ষণ করা যায়নি', 'error');
      }
    } catch (err) {
      showNotif('সার্ভার সংযোগে ত্রুটি ঘটেছে', 'error');
    }
  };

  const startAdEdit = (ad: any) => {
    setAdEditingId(ad._id);
    setAdTitle(ad.title);
    setAdImgUrl(ad.imgUrl);
    setAdLinkUrl(ad.linkUrl);
    setAdPosition(ad.position);
    setAdIsActive(!!ad.isActive);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotif('বিজ্ঞাপনটি সফলভাবে ডিলিট করা হয়েছে', 'success');
        loadAds();
        if (adEditingId === id) resetAdForm();
      } else {
        showNotif('বিজ্ঞাপন ডিলিট করা যায়নি', 'error');
      }
    } catch (err) {
      showNotif('বিজ্ঞাপন ডিলিট করতে ত্রুটি ঘটেছে', 'error');
    }
  };

  const toggleAdActiveStatus = async (ad: any) => {
    try {
      const res = await fetch(`/api/ads/${ad._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      if (res.ok) {
        showNotif('বিজ্ঞাপন স্থিতি পরিবর্তন করা হয়েছে', 'success');
        loadAds();
      }
    } catch (err) {
      showNotif('বিজ্ঞাপন স্থিতি পরিবর্তন করা যায়নি', 'error');
    }
  };

  const resetAdForm = () => {
    setAdEditingId(null);
    setAdTitle('');
    setAdImgUrl('');
    setAdLinkUrl('');
    setAdPosition('sidebar');
    setAdIsActive(true);
  };

  useEffect(() => {
    let active = true;

    async function checkAuthSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            if (active) {
              setCurrentUser(data.user);
              if (data.user && data.user.name) {
                setAuthor(data.user.name);
              }
              setAuthLoading(false);
              setTotalPageViews(getTotalPageViews());
              // Trigger articles, ads, and scraper status load
              loadArticles(false);
              loadAds(false);
              fetchScraperStatus();
            }
          } else {
            // Unauthenticated - redirect
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Credentials audit error', err);
        router.push('/login');
      }
    }

    checkAuthSession();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setRenderTimestamp(Date.now());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) {
      showNotif('দয়া করে প্রয়োজনীয় সবগুলো তথ্য পূরণ করুন', 'error');
      return;
    }

    const staticSeedSuffix = title.length.toString();
    const payload = {
      title,
      content,
      category,
      imgUrl: imgUrl || `https://picsum.photos/seed/news-${staticSeedSuffix}/600/400`,
      author,
      isLead,
      isSub,
      publishDate: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString()
    };

    try {
      let res;
      if (editingId) {
        // Edit Action
        res = await fetch(`/api/articles/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Action
        res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showNotif(editingId ? 'সংবাদটি সফলভাবে সংস্কার করা হয়েছে' : 'নতুন সংবাদটি সফলভাবে প্রকাশ করা হয়েছে', 'success');
        resetForm();
        loadArticles();
      } else {
        const errData = await res.json();
        showNotif(errData.error || 'সংবাদটি সংরক্ষণ করা যায়নি', 'error');
      }
    } catch (err) {
      showNotif('সার্ভার সংযোগে ত্রুটি ঘটেছে', 'error');
    }
  };

  // Edit Initiator
  const startEdit = (art: Article) => {
    setEditingId(art._id);
    setTitle(art.title);
    setContent(art.content);
    setCategory(art.category);
    setImgUrl(art.imgUrl);
    setAuthor(art.author);
    setIsLead(!!art.isLead);
    setIsSub(!!art.isSub);
    if (art.publishDate) {
      try {
        const d = new Date(art.publishDate);
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
        setPublishDate(localISOTime);
      } catch (e) {
        setPublishDate('');
      }
    } else {
      setPublishDate('');
    }
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Action
  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই সংবাদটি ডিলিট করতে চান?')) return;

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotif('সংবাদটি সফলভাবে ডিলিট করা হয়েছে', 'success');
        loadArticles();
        if (editingId === id) resetForm();
      } else {
        showNotif('সংবাদ ডিলিট করা যায়নি', 'error');
      }
    } catch (err) {
      showNotif('সংবাদ ডিলিট করতে ত্রুটি ঘটেছে', 'error');
    }
  };

  // Reset form helper
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('বিশেষ সংবাদ');
    setImgUrl('');
    setAuthor('নিজস্ব প্রতিবেদক');
    setIsLead(false);
    setIsSub(false);
    setPublishDate('');
  };

  // Restore Seed Data Trigger
  const handleRestoreDefaults = async () => {
    if (!confirm('রিস্টোর করলে সব সাম্প্রতিক সংবাদ মুছে মূল ডেমো সংবাদগুলো পুনরাগমন করবে। আপনি কি রিস্টোর করতে চান?')) return;
    try {
      const res = await fetch('/api/articles/reset', { method: 'POST' });
      if (res.ok) {
        showNotif('সব সংবাদ সফলভাবে ফ্যাক্টরি সেটিংস-এ রিস্টোর করা হয়েছে', 'success');
        loadArticles();
      }
    } catch (err) {
      showNotif('রিস্টোর করা যায়নি', 'error');
    }
  };

  // Sign out administrative session
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        showNotif('সফল লগ-আউট হয়েছে! রিডাইরেক্ট হচ্ছে...', 'success');
        setTimeout(() => {
          router.push('/login');
          router.refresh();
        }, 1200);
      } else {
        showNotif('লগআউট করা যায়নি', 'error');
      }
    } catch (err) {
      showNotif('সার্ভার ত্রুটি', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center font-bangla text-gray-750">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-600">নিরাপত্তা ও প্রবেশাধিকার যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-bangla text-gray-800 animate-fade-in">
      
      {/* Admin Top Dashboard Bar */}
      <div className="bg-[#1C1C1E] text-white py-4 shadow-md sticky top-0 z-45">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>মূল পোর্টাল</span>
            </Link>
            <span className="text-gray-600">|</span>
            <div className="text-lg md:text-xl font-black bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              কচুয়া প্রতিদিন এডমিন প্যানেল
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Logged in User Meta Badge */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-200">
                <UserCheck className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>রিপোর্টার: <strong className="text-white">{currentUser.name || currentUser.username}</strong></span>
              </div>
            )}

            <div className={`hidden sm:flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1 rounded-full border ${dbSource === 'mongodb' ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-yellow-500/15 border-yellow-500/30 text-yellow-500'}`}>
              <Database className="w-3.5 h-3.5" />
              <span>{dbSource === 'mongodb' ? 'MONGODB' : 'LOCAL FALLBACK'}</span>
            </div>
            
            <button 
              onClick={handleRestoreDefaults}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded border border-gray-700 transition-colors cursor-pointer"
              title="Factory Reset Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">রিসেট ডেমো ডাটা</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-800 hover:bg-red-900 text-white text-xs px-3 py-1.5 rounded border border-red-700 transition-all font-bold cursor-pointer active:scale-95 shadow-sm"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগ-আউট</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-gray-200 select-none shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex gap-4 md:gap-8">
          <button 
            onClick={() => setActivePanelTab('news')}
            className={`py-4 px-2 font-bold text-sm md:text-base border-b-2 tracking-tight transition-all cursor-pointer flex items-center gap-2 ${activePanelTab === 'news' ? 'border-red-700 text-red-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-950'}`}
          >
            <FileText className="w-4 h-4" />
            <span>সংবাদ ব্যবস্থাপনা ({articles.length})</span>
          </button>
          
          <button 
            onClick={() => setActivePanelTab('ads')}
            className={`py-4 px-2 font-bold text-sm md:text-base border-b-2 tracking-tight transition-all cursor-pointer flex items-center gap-2 ${activePanelTab === 'ads' ? 'border-red-700 text-red-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-950'}`}
          >
            <Megaphone className="w-4 h-4" />
            <span>বিজ্ঞাপন প্যানেল ({ads.length})</span>
          </button>
          
          <button 
            onClick={() => setActivePanelTab('crawler')}
            className={`py-4 px-2 font-bold text-sm md:text-base border-b-2 tracking-tight transition-all cursor-pointer flex items-center gap-2 ${activePanelTab === 'crawler' ? 'border-red-700 text-red-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-950'}`}
          >
            <Cpu className="w-4 h-4" />
            <span>নিউজ ক্রলার কন্ট্রোল</span>
          </button>
        </div>
      </div>

      {/* VIEW: NEWS MANAGEMENT TAB */}
      {activePanelTab === 'news' && (
        <div className="max-w-7xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left Column - Article Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky lg:top-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <FileText className="w-5 h-5 text-red-600" />
              <span>{editingId ? 'সংবাদ কাস্টমাইজ করুন' : 'নতুন সংবাদ লিখুন'}</span>
            </h2>
            {editingId && (
              <button 
                onClick={resetForm}
                className="text-xs text-gray-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
              >
                বাতিল করুন
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদের শিরোনাম (বাংলায়) *</label>
              <input 
                type="text" 
                placeholder="যেমন: কচুয়ায় ঐতিহ্যবাহী মেলা শুরু..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600"
                required
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদের ক্যাটাগরি *</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value="विशेष সংবাদ">विशेष সংবাদ</option>
                <option value="রাজনীতি">রাজনীতি</option>
                <option value="বাংলাদেশ">বাংলাদেশ</option>
                <option value="অপরাধ">অপরাধ</option>
                <option value="বিশ্ব">বিশ্ব</option>
                <option value="বাণিজ্য">বাণিজ্য</option>
                <option value="মতামত">মতামত</option>
                <option value="খেলা">খেলা</option>
                <option value="বিনোদন">বিনোদন</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদের ছবি (ইমেজ URL)</label>
              <div className="relative">
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm font-mono"
                />
                <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">ফাঁকা রাখলে একটি সুন্দর ব্যানার ইমেজ স্বয়ংক্রিয়ভাবে জেনারেট হবে।</p>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">বিস্তারিত মূল সংবাদ *</label>
              <textarea 
                rows={6} 
                placeholder="এখানে সংবাদের বিস্তারিত মূল অংশটি বাংলা ফন্টে লিখুন..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-[15px] leading-relaxed"
                required
              ></textarea>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদদাতার নাম</label>
              <input 
                type="text" 
                placeholder="যেমন: নিজস্ব প্রতিবেদক..." 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Publish Date Scheduler */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">প্রকাশের নির্দিষ্ট সময় (তফসিল)</label>
              <input 
                type="datetime-local" 
                value={publishDate} 
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm font-sans"
              />
              <p className="text-xs text-gray-400 mt-1">ফাঁকা রাখলে বর্তমান সময় স্বয়ংক্রিয়ভাবে প্রদান করা হবে।</p>
            </div>

            {/* Position Checkboxes */}
            <div className="flex flex-col gap-3 py-1">
               <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold select-none">
                 <input 
                   type="checkbox" 
                   checked={isLead} 
                   onChange={(e) => {
                     setIsLead(e.target.checked);
                     if (e.target.checked) setIsSub(false); // Can't be both Lead & Sub
                   }}
                   className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                 />
                 <span>প্রধান খবর করুন (Lead Story)</span>
               </label>
               
               <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold select-none">
                 <input 
                   type="checkbox" 
                   checked={isSub} 
                   onChange={(e) => {
                     setIsSub(e.target.checked);
                     if (e.target.checked) setIsLead(false); // Can't be both Lead & Sub
                   }}
                   className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                 />
                 <span>উপ-প্রধান খবর করুন (Sub Story)</span>
               </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{editingId ? 'সংবাদ আপডেট করুন' : 'সংবাদটি প্রকাশ করুন'}</span>
            </button>

          </form>
        </div>

        {/* Right Column - Article List & Monitoring (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Quick Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">মোট বড় সংবাদ</span>
              <span className="text-3xl font-black text-gray-900">{articles.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-red-600">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">লিড স্টোরি</span>
              <span className="text-xl font-bold text-red-700 truncate">
                {articles.find(a => a.isLead) ? '১টি নিশ্চিত' : 'নেই'}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-blue-600">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">সাব স্টোরি</span>
              <span className="text-3xl font-black text-gray-900">
                {articles.filter(a => a.isSub).length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-green-600">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ডাটাবেজ সিস্টেম</span>
              <span className="text-[14px] font-bold text-green-700 truncate">
                {dbSource === 'mongodb' ? 'Mongo Live' : 'Local Stream'}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center border-l-4 border-l-orange-500 relative overflow-hidden group">
              <div className="absolute right-2 top-2 text-orange-200 opacity-35 group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">সর্বমোট পেজ ভিউ</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-orange-700">
                  {totalPageViews}
                </span>
                <span className="text-[11px] font-bold text-gray-400">বার</span>
              </div>
            </div>
          </div>

          {/* Toast Notification Alert */}
          {notif && (
            <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />}
              <p className="text-sm font-bold">{notif.message}</p>
            </div>
          )}

          {/* Main List Box */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">প্রকাশিত সংবাদের ডেটা তালিকা ({articles.length})</h3>
              <span className="text-xs text-gray-400 font-mono">Real-time reactive synchronization</span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">ডাটাবেজ থেকে তথ্য আনা হচ্ছে...</span>
              </div>
            ) : articles.length === 0 ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                <FileText className="w-12 h-12 text-gray-200 mb-3" />
                <p className="font-bold mb-1">ডাটাবেজে কোনো সংবাদ নেই</p>
                <p className="text-xs">বাম পাশের ফর্ম ব্যবহার করে প্রথম সংবাদটি পোস্ট করুন।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-bold uppercase select-none">
                      <th className="py-3 px-4">সংবাদ শিরোনাম</th>
                      <th className="py-3 px-4">ক্যাটাগরি</th>
                      <th className="py-3 px-4">অবস্থান</th>
                      <th className="py-3 px-4">লেখক</th>
                      <th className="py-3 px-4 text-right">ম্যানেজ অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {articles.map((art) => (
                      <tr key={art._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-900 max-w-[280px] truncate" title={art.title}>
                            {art.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>{art.time}</span>
                            {art.publishDate && (
                              <>
                                <span className="text-gray-300">•</span>
                                {renderTimestamp > 0 && new Date(art.publishDate).getTime() > renderTimestamp ? (
                                  <span className="text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200 font-bold inline-flex items-center gap-1 animate-pulse text-[10px]">
                                    সময়সূচী: {new Date(art.publishDate).toLocaleString('bn-BD', { hour12: true })}
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px] font-semibold">
                                    প্রকাশকাল: {new Date(art.publishDate).toLocaleString('bn-BD', { hour12: true })}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-600">
                          {art.category}
                        </td>
                        <td className="py-4 px-4 font-bold">
                          {art.isLead && (
                            <span className="bg-red-100 text-red-800 text-[11px] px-2 py-0.5 rounded-full border border-red-200">
                              Lead Story
                            </span>
                          )}
                          {art.isSub && (
                            <span className="bg-blue-100 text-blue-800 text-[11px] px-2 py-0.5 rounded-full border border-blue-200">
                              Sub Story
                            </span>
                          )}
                          {!art.isLead && !art.isSub && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-500 font-medium">{art.author}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex gap-2.5 justify-end">
                            <button 
                              onClick={() => startEdit(art)}
                              className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded border border-gray-200 hover:border-gray-300 transition-all flex items-center gap-1 cursor-pointer text-xs font-semibold"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>সম্পাদনা</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(art._id)}
                              className="p-1 px-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded border border-red-100 hover:border-red-600 transition-all flex items-center gap-1 cursor-pointer text-xs font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>মুছে ফেলুন</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* VIEW: ADS MANAGEMENT TAB */}
      {activePanelTab === 'ads' && (
        <div className="max-w-7xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-fade-in">
          
          {/* Ad Create/Edit Form (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Megaphone className="w-5 h-5 text-red-600" />
                <span>{adEditingId ? 'বিজ্ঞাপন সংশোধন করুন' : 'নতুন বিজ্ঞাপন দিন'}</span>
              </h2>
              {adEditingId && (
                <button 
                  onClick={resetAdForm}
                  className="text-xs text-gray-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            <form onSubmit={handleAdSubmit} className="space-y-4">
              
              {/* Ad Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-sans">ক্যাম্পেইন / ক্লায়েন্টের নাম *</label>
                <input 
                  type="text" 
                  placeholder="যেমন: ওয়ালটন মেগা সেল ২০২৬..." 
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  required
                />
              </div>

              {/* Ad Banner Image URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-sans">ব্যানার ইমেজ লিংক (Image URL) *</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={adImgUrl}
                  onChange={(e) => setAdImgUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm font-mono"
                  required
                />
                
                {adImgUrl && (
                  <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-[10px] text-gray-400 font-semibold mb-1 font-sans">ইনস্ট্যান্ট ব্যানার প্রিভিউ:</p>
                    <div className="relative w-full aspect-[16/9] bg-gray-100 rounded overflow-hidden border border-gray-250">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={adImgUrl} alt="Ad Preview" className="object-cover w-full h-full" referrerPolicy="no-referrer" onError={(e)=>{(e.target as any).src="https://placehold.co/600x400?text=Invalid+Image+URL"}} />
                    </div>
                  </div>
                )}
              </div>

              {/* Target Redirect URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-sans">ক্লিক রিডাইরেক্ট লিংক (Target Link) *</label>
                <input 
                  type="url" 
                  placeholder="https://waltonbd.com বা mailto:ads@..." 
                  value={adLinkUrl}
                  onChange={(e) => setAdLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm font-mono"
                  required
                />
              </div>

              {/* Position selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-sans">বিজ্ঞাপনের অবস্থান নির্ধারণ *</label>
                <select 
                  value={adPosition} 
                  onChange={(e) => setAdPosition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 cursor-pointer text-sm"
                >
                  <option value="sidebar">সাইডবার বিজ্ঞাপন</option>
                  <option value="top_banner">হেডার টপ ব্যানার</option>
                </select>
              </div>

              {/* Active status checkbox */}
              <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded border border-gray-150">
                <input 
                  type="checkbox" 
                  id="adIsActiveCheckbox"
                  checked={adIsActive} 
                  onChange={(e) => setAdIsActive(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="adIsActiveCheckbox" className="text-xs md:text-sm font-bold text-gray-700 cursor-pointer select-none font-sans">বিজ্ঞাপনটি এখনই সক্রিয় করুন (Active Status)</label>
              </div>

              {/* Submit ad */}
              <button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md text-base"
              >
                <Megaphone className="w-4 h-4" />
                <span>{adEditingId ? 'বিজ্ঞাপন আপডেট করুন' : 'বিজ্ঞাপন পোস্ট করুন'}</span>
              </button>

            </form>
          </div>

          {/* Ad list right column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-red-600 animate-bounce" />
                  <span>সক্রিয় বিজ্ঞাপনের তালিকা ({ads.length})</span>
                </h3>
                <span className="text-xs text-gray-400 font-mono">Dynamic Banner Ads Framework</span>
              </div>

              {adsLoading ? (
                <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">বিজ্ঞাপন ডেটা আনা হচ্ছে...</span>
                </div>
              ) : ads.length === 0 ? (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center flex-1">
                  <Megaphone className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="font-bold mb-1">কোনো সক্রিয় বিজ্ঞাপন নেই</p>
                  <p className="text-xs bg-gray-50 px-3 py-1.5 rounded">বাম পাশের ফরম ব্যবহার করে প্রথম বিজ্ঞাপন ক্যাম্পেইনটি চালু করুন।</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase select-none font-sans">
                        <th className="py-3 px-4">ক্যাম্পেইন নাম</th>
                        <th className="py-3 px-4">অবস্থান</th>
                        <th className="py-3 px-4">অবস্থা</th>
                        <th className="py-3 px-4">টার্গেট লিংক</th>
                        <th className="py-3 px-4 text-right font-sans">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {ads.map((ad) => (
                        <tr key={ad._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-gray-900">
                            {ad.title}
                          </td>
                          <td className="py-4 px-4 text-gray-650 font-bold">
                            {ad.position === 'sidebar' ? (
                              <span className="bg-red-55 text-red-700 text-xs px-2.5 py-0.5 rounded border border-red-150">সাইডবার</span>
                            ) : (
                              <span className="bg-orange-55 text-orange-700 text-xs px-2.5 py-0.5 rounded border border-orange-150">হেডার ব্যানার</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <button 
                              onClick={() => toggleAdActiveStatus(ad)}
                              className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                              title="Toggle status"
                            >
                              {ad.isActive ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping"></span>
                                  <span>সক্রিয় (Active)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  <span>বন্ধ (Inactive)</span>
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-4 text-xs font-mono text-blue-600 max-w-[150px] truncate" title={ad.linkUrl}>
                            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 font-sans">
                              <span>লিংক ভিজিট</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => startAdEdit(ad)}
                                className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-250 transition-all cursor-pointer text-xs font-semibold"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleAdDelete(ad._id)}
                                className="p-1 px-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded border border-red-200 transition-all cursor-pointer text-xs font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VIEW: NEWS CRAWLER CONTROL */}
      {activePanelTab === 'crawler' && (
        <div className="max-w-7xl mx-auto px-4 py-8 flex-1 space-y-6 animate-fade-in font-sans">
          
          {/* Crawler Command Center Top Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-black text-gray-900 flex items-center justify-center md:justify-start gap-2.5 font-bangla">
                <Cpu className="w-6 h-6 text-red-600 animate-spin-slow" />
                <span>প্রথম আলো অটোমেটেড নিউজ ক্রলার কন্ট্রোল প্যানেল</span>
              </h2>
              <p className="text-sm text-gray-500 font-semibold max-w-2xl leading-relaxed font-bangla">
                এই ক্রলারটি প্রথম আলো নিউজ পোর্টালের আরএসএস ফিড ব্যবহার করে রিয়ালটাইমে সর্বাধুনিক তথ্য সংগ্রহ করে। ক্যাটাগরি ম্যাপিং ও এআই ক্লাসিফিকেশন (Gemini Flash integration) এর মাধ্যমে প্রতিটি সংবাদ যথার্থভাবে কচুয়া প্রতিদিনের নিজস্ব ক্যাটাগরিতে সংরক্ষিত হয়।
              </p>
            </div>
            
            <div className="shrink-0 font-bangla">
              <button
                onClick={handleScrapeLatest}
                disabled={scraperLoading || scraperStatus.isRunning}
                className={`px-8 py-4 rounded-xl text-white font-extrabold text-[15px] transition-all flex items-center gap-2.5 shadow-md active:scale-95 cursor-pointer ${
                  scraperLoading || scraperStatus.isRunning 
                    ? 'bg-red-800/80 cursor-wait' 
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {scraperLoading || scraperStatus.isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>খবর স্ক্র্যাপ হচ্ছে (দয়া করে অপেক্ষা করুন...)</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>ম্যানুয়ালি এখনই স্ক্র্যাপ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Crawler Health Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bangla">
            
            {/* Healthcard 1 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">ক্রলার স্থিতি</span>
              <div className="flex items-center gap-2">
                {scraperStatus.isRunning ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 animate-ping"></span>
                    <span className="text-lg font-black text-yellow-600">চলমান (Crawling...)</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-lg font-black text-green-700">অনলাইন (Idle/Active)</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-550 pt-1 font-sans">স্বয়ংক্রিয় ৩0 মিনিট ইন্টারভাল ট্রিগার সক্রিয় আছে।</p>
            </div>

            {/* Healthcard 2 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">সর্বশেষ সেশনের রান</span>
              <div className="text-lg font-black text-gray-900 font-mono">
                {scraperStatus.lastRun > 0 
                  ? new Date(scraperStatus.lastRun).toLocaleString('bn-BD', {hour12: true})
                  : 'সংগৃহীত হয়নি'}
              </div>
              <p className="text-xs text-gray-505 pt-1 font-sans">সর্বশেষ সফলভাবে ফিড বিশ্লেষণ করার ট্র্যাকিং সময়।</p>
            </div>

            {/* Healthcard 3 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">সংগৃহীত সংবাদের রেকর্ড</span>
              <div className="text-lg font-black text-red-700">
                স্বয়ংক্রিয়ভাবে {scraperStatus.count || 0} টি নতুন খবর অ্যাড করা হয়েছে
              </div>
              <p className="text-xs text-gray-500 pt-1 font-sans">বিগত সেশনে পোর্টাল থেকে ডাউনলোড হওয়া আর্টিকেলের সংখ্যা।</p>
            </div>

          </div>

          {/* Scrape logger logs list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 font-sans">
                <Globe className="w-4 h-4 text-red-600" />
                <span>ক্রলার প্রসেস সিস্টেম লগ (Crawler Console Output)</span>
              </h3>
              <span className="text-xs font-mono text-gray-400">STATUS ONLINE</span>
            </div>
            
            <div className="p-5 bg-[#1C1C1E] text-green-400 font-mono text-xs overflow-y-auto max-h-[220px] space-y-2 leading-relaxed">
              <div className="text-gray-405 font-sans">[{new Date().toISOString()}] INITIALIZING PROTHOM ALO CRAWLER ENGINE...</div>
              <div className="text-gray-405 font-sans">[{new Date().toISOString()}] DETECTED ENCODING: UTF-8 FOR SOURCE FEED RENDER SITE.</div>
              {scraperStatus.lastRun > 0 && (
                <div className="text-green-300 font-sans">[{new Date(scraperStatus.lastRun).toISOString()}] SYSTEM SUCCESS: Crawled {scraperStatus.count} root elements. Status details: &quot;{scraperStatus.message || 'completed'}&quot;</div>
              )}
              {scraperStatus.isRunning ? (
                <div className="text-yellow-300 animate-pulse font-sans">[{new Date().toISOString()}] RUNNING: Downloading story items and applying Gemini Flash Category Classification...</div>
              ) : (
                <div className="text-gray-400 font-sans">[{new Date().toISOString()}] STANDBY: Waiting for next cron task or manual administration click.</div>
              )}
            </div>
          </div>

          {/* Preview Scraped News (List of Scraped items in articles list) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 font-bangla">
            <div className="border-b border-gray-150 pb-3">
              <h3 className="text-lg font-black text-gray-900 font-sans">ক্রলকৃত সংবাদের সরাসরি তালিকা ও সম্পাদনা সুযোগ</h3>
              <p className="text-xs text-gray-500 font-medium font-sans">নিচের তালিকা থেকে ক্রলার সংগৃহীত খবরগুলো দেখে নিয়ে সরাসরি সম্পাদনা বা মুছে ফেলতে পারবেন মেম্বাররা।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.filter(a => a.author === 'প্রথম আলো' || a.author === 'কুরিয়ার নিউজ' || a.author === 'রয়টার্স' || a.author === 'রয়টার্স' || a.author === 'এএফপি').slice(0, 10).map((art) => (
                <div key={'scraped-'+art._id} className="p-4 rounded-xl border border-gray-150 hover:border-red-200 hover:shadow-xs transition-colors flex gap-3 bg-gray-50/50">
                  <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={art.imgUrl} alt={art.title} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 select-all font-bangla" title={art.title}>{art.title}</h4>
                      <p className="text-[11px] text-gray-500 pt-1 font-semibold font-sans">ক্যাটাগরি: <span className="text-red-700">{art.category}</span></p>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button 
                        onClick={() => {
                          setActivePanelTab('news');
                          startEdit(art);
                        }}
                        className="text-[11px] bg-white border border-gray-250 hover:border-red-600 px-2 py-1 rounded font-bold cursor-pointer transition-colors font-sans hover:text-red-700"
                      >
                        সম্পাদনা
                      </button>
                      <button 
                        onClick={() => handleDelete(art._id)}
                        className="text-[11px] bg-red-50 text-red-700 border border-red-150 hover:bg-red-100 px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                      >
                        ডিলিট
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {articles.filter(a => a.author === 'প্রথম আলো' || a.author === 'কুরিয়ার নিউজ' || a.author === 'রয়টার্স' || a.author === 'রয়টার্স' || a.author === 'এএফপি').length === 0 && (
                <div className="col-span-2 text-center py-10 text-gray-400 text-xs font-sans bg-gray-50 rounded border border-dashed border-gray-200">
                  ক্রলার দ্বারা সংগৃহীত কোনো খবর এখনো পাওয়া যায়নি। রান করতে ম্যানুয়ালি এখনই স্ক্র্যাপ করুন।
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400 font-medium">
          <p>&copy; ২০২৬ কচুয়া প্রতিদিন। এডমিনিস্ট্রেটিভ পোর্টাল কন্ট্রোল সিস্টেম।</p>
        </div>
      </footer>

    </div>
  );
}
