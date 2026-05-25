'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, User, Printer, 
  Settings, Facebook, Twitter, Youtube, MapPin, Clock
} from 'lucide-react';
import { Article } from '@/lib/db';
import { trackPageView } from '@/lib/analytics';
import { WeatherWidget } from '@/components/weather-widget';
import { RelatedArticles } from '@/components/related-articles';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliDigits(num: number | string): string {
  return num
    .toString()
    .split('')
    .map(char => {
      const idx = parseInt(char, 10);
      return isNaN(idx) ? char : BENGALI_DIGITS[idx];
    })
    .join('');
}

interface ArticleDetailClientProps {
  article: Article;
  sourceLabel: string;
}

export function ArticleDetailClient({ article, sourceLabel }: ArticleDetailClientProps) {
  // Sync viewed article to recent session history
  useEffect(() => {
    trackPageView();
  }, [article?._id]);

  useEffect(() => {
    if (article) {
      try {
        const stored = sessionStorage.getItem('recent_articles_history');
        const prev: Article[] = stored ? JSON.parse(stored) : [];
        const filtered = prev.filter((item: Article) => item._id !== article._id);
        const updated = [article, ...filtered].slice(0, 5);
        sessionStorage.setItem('recent_articles_history', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
    }
  }, [article]);

  let isoDate = new Date().toISOString();
  try {
    if (article.time) {
      const parsed = Date.parse(article.time);
      if (!isNaN(parsed)) {
        isoDate = new Date(parsed).toISOString();
      }
    }
  } catch (e) {
    // ignore
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [article.imgUrl].filter(Boolean),
    "datePublished": isoDate,
    "dateModified": isoDate,
    "author": [{
      "@type": "Person",
      "name": article.author,
    }],
    "publisher": {
      "@type": "Organization",
      "name": "কচুয়া প্রতিদিন",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"
      }
    },
    "description": (article.content || '').substring(0, 160).replace(/\r?\n/g, ' ') + '...'
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-gray-850">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      {/* Top Bar for weather and metadata */}
      <div className="border-b border-gray-200 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-sm text-gray-700">
          <div className="flex items-center gap-4">
            <span className="font-bangla font-medium">রবিবার, ২৪ মে ২০২৬</span>
            <WeatherWidget />
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block font-mono text-[11px] font-bold text-gray-400 bg-gray-150 px-2 py-0.5 rounded border">
              DB: {sourceLabel}
            </span>
            <Link href="/admin" className="flex items-center gap-1.5 font-bold hover:text-red-700 text-red-600 cursor-pointer font-bangla transition-colors border border-red-200 bg-red-50/50 px-2.5 py-1 rounded">
              <Settings className="w-3.5 h-3.5" />
              <span>পোর্টাল এডমিন</span>
            </Link>
            <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
              <Facebook className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" />
              <Twitter className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-400 transition-colors" />
              <Youtube className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand Header */}
      <header className="border-b-[3px] border-red-700 py-6 bg-white shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <Link href="/" className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors text-sm font-bold border border-gray-200 text-gray-650 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>মূল পাতা</span>
            </Link>
            
            <Link 
              href="/" 
              className="text-4xl md:text-5xl font-black text-red-700 tracking-tight cursor-pointer" 
              style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
            >
              কচুয়া প্রতিদিন
            </Link>
            <div className="md:hidden text-gray-800 w-6 h-6" />
          </div>
          <div className="text-gray-500 font-bold font-bangla text-base flex items-center gap-1.5 bg-gray-55 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Calendar className="w-4.5 h-4.5 text-red-700" />
            <span>পড়ছেন: {article.category}</span>
          </div>
        </div>
      </header>

      {/* Article Detail Body layout */}
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        <article className="bg-white rounded-2xl border border-gray-250/70 p-6 md:p-10 shadow-sm space-y-6">
          
          {/* Category Pill and Print */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-150 no-print">
            <span className="text-red-700 font-extrabold text-xs uppercase tracking-wider bg-red-50 border border-red-100 px-3 py-1.5 rounded-full font-bangla">
              {article.category}
            </span>
            
            <div className="flex items-center gap-2 font-bangla">
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Heading */}
          <h1 
            className="text-2xl md:text-4xl font-[900] text-gray-900 leading-tight tracking-tight pt-2"
            style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
          >
            {article.title}
          </h1>

          {/* Metadata Block */}
          <div className="flex flex-wrap items-center gap-y-3.5 gap-x-4 text-[13px] font-semibold text-gray-500 border-b border-gray-150 pb-5">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <span>লেখক: <span className="text-gray-800 font-bold">{article.author}</span></span>
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>ক্যালেন্ডার প্রকাশকাল: <span className="text-gray-800">{article.time}</span></span>
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span>উৎস: <span className="text-red-700 font-bold">কচুয়া প্রতিদিন</span></span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold font-bangla border border-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{toBengaliDigits(Math.max(1, Math.ceil((article.content || '').trim().split(/\s+/).length / 200)))} মিনিট পড়ার সময়</span>
            </span>
          </div>

          {/* Image */}
          {article.imgUrl && (
            <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-xs">
              <Image 
                src={article.imgUrl} 
                alt={article.title}
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Content Body with gorgeous Bangla formatting */}
          <p 
            className="text-[17px] sm:text-[18px] leading-[1.8] text-gray-850 whitespace-pre-line font-medium text-justify font-bangla pt-4"
          >
            {article.content}
          </p>

          <div className="bg-amber-50/50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-8 text-xs text-gray-600 font-sans italic no-print">
            * এই সংবাদপত্রের উপাত্ত ও ছবি যথাযথ অনুমোদন ব্যতীত প্রকাশনা বা অন্যান্য সাইটে কপি করা আইনত দণ্ডনীয় অপরাধ।
          </div>

          {/* Related Articles client component section - dynamic query by same category and exclude current article ID */}
          <div className="no-print">
            <RelatedArticles 
              category={article.category}
              excludeId={article._id}
              onSelectArticle={(art) => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/news/${art._id}`;
                }
              }}
            />
          </div>

        </article>
      </main>

      {/* Standard Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-auto border-t-[4px] border-red-700 font-bangla no-print">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="text-white text-lg font-black tracking-tight mb-4 text-red-500" style={{ fontFamily: 'var(--font-serif-bangla)' }}>কচুয়া প্রতিদিন</h4>
            <p className="text-gray-400 leading-relaxed text-xs">কচুয়া প্রতিদিন একটি আধুনিক ও নির্ভীক বাংলা নিউজ পোর্টাল। স্থানীয় ও জাতীয় সর্বাধিক ও সর্বশেষ খবরাখবর সবার আগে অত্যন্ত সত্যতার সাথে তুলে ধরাই আমাদের প্রধান অঙ্গিকার।</p>
          </div>
          <div>
            <h4 className="text-white text-[15px] font-bold tracking-tight mb-4">গুরুত্বপূর্ণ ক্যাটাগরি</h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer"><Link href="/">বিশেষ সংবাদ</Link></li>
              <li className="hover:text-white transition-colors cursor-pointer"><Link href="/">রাজনীতি</Link></li>
              <li className="hover:text-white transition-colors cursor-pointer"><Link href="/">বাংলাদেশ</Link></li>
              <li className="hover:text-white transition-colors cursor-pointer"><Link href="/">খেলাধুলা</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[15px] font-bold tracking-tight mb-4">যোগাযোগ</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500 shrink-0" /> কচুয়া, চাঁদপুর, বাংলাদেশ</p>
              <p>ইমেইল: info@kachuaprotidin.com</p>
              <p className="text-[11px] text-gray-500 mt-4">© ২০২৬ কচুয়া প্রতিদিন। সমস্ত স্বত্ব সংরক্ষিত।</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
