'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Database, AlertCircle, Printer, X, 
  ChevronRight, Facebook, Twitter, Youtube, Settings, MapPin, Clock
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { WeatherWidget } from '@/components/weather-widget';
import { RelatedArticles } from '@/components/related-articles';
import { trackPageView } from '@/lib/analytics';
import { Article } from '@/lib/db';

interface FilterOption {
  year: number;
  months: number[];
}

const BENGALI_MONTHS: { [key: number]: string } = {
  1: 'জানুয়ারি',
  2: 'ফেব্রুয়ারি',
  3: 'মার্চ',
  4: 'এপ্রিল',
  5: 'মে',
  6: 'জুন',
  7: 'জুলাই',
  8: 'আগস্ট',
  9: 'সেপ্টেম্বর',
  10: 'অক্টোবর',
  11: 'নভেম্বর',
  12: 'ডিসেম্বর'
};

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

export default function ArchivePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbSource, setDbSource] = useState<string>('loading');
  const [selectedArticle, setSelectedArticleAction] = useState<Article | null>(null);
  const [printTarget, setPrintTarget] = useState<Article | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  const setSelectedArticle = (art: Article | null) => {
    setSelectedArticleAction(art);
    setReadingProgress(0);
  };

  // Load archived articles based on selectedYear and selectedMonth
  const fetchArchivedData = async (yr: number, mth: number, isInitial: boolean = false) => {
    try {
      setLoading(true);
      const url = `/api/articles/archive?year=${yr}&month=${mth}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setDbSource(data.source || 'mongodb');
        
        if (data.availableFilters && data.availableFilters.length > 0) {
          setAvailableFilters(data.availableFilters);
          
          if (isInitial) {
            // Apply defaults returned from the model API
            setSelectedYear(data.selectedYear);
            setSelectedMonth(data.selectedMonth);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load archived articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    trackPageView();
    const t = setTimeout(() => {
      fetchArchivedData(2026, 5, true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Handle manual selection changes
  const handleYearChange = (yr: number) => {
    setSelectedYear(yr);
    // Automatically default to the first available month within the selected year
    const targetYr = availableFilters.find(f => f.year === yr);
    if (targetYr && targetYr.months.length > 0) {
      const defaultMth = targetYr.months[0];
      setSelectedMonth(defaultMth);
      fetchArchivedData(yr, defaultMth);
    } else {
      fetchArchivedData(yr, selectedMonth);
    }
  };

  const handleMonthChange = (mth: number) => {
    setSelectedMonth(mth);
    fetchArchivedData(selectedYear, mth);
  };

  const handlePrint = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    setPrintTarget(art);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const selectedYearGroup = availableFilters.find(f => f.year === selectedYear);
  const activeMonths = selectedYearGroup ? selectedYearGroup.months : [];

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-800">
      
      {/* Printable Area Hack (similar to what's used on the home page) */}
      {printTarget && (
        <div className="print-only hidden p-8 bg-white text-black font-sans leading-relaxed text-[16px]">
          <h1 className="text-3xl font-extrabold mb-4">{printTarget.title}</h1>
          <p className="text-xs text-gray-500 mb-6">কচুয়া প্রতিদিন | লেখক: {printTarget.author} | প্রকাশকাল: {printTarget.time}</p>
          {printTarget.imgUrl && (
            <div className="relative w-full h-80 mb-6">
              <Image 
                src={printTarget.imgUrl} 
                alt={printTarget.title} 
                fill 
                className="object-cover rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <p className="whitespace-pre-line text-sm text-[15px]">{printTarget.content}</p>
          <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-150 pt-4">
            © ২০২৬ কচুয়া প্রতিদিন | সমস্ত স্বত্ব সংরক্ষিত।
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-sm text-gray-700">
          <div className="flex items-center gap-4">
            <span className="font-bangla font-medium">রবিবার, ২৪ মে ২০২৬</span>
            <WeatherWidget />
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block font-mono text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              DB: {dbSource === 'mongodb' ? '🟢 MONGO LIVE' : '🟡 LOCAL STREAM'}
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

      {/* Header */}
      <header className="border-b-[3px] border-red-700 py-6 bg-white no-print">
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
            <div className="md:hidden text-gray-800 w-6 h-6" /> {/* Spacer */}
          </div>
          <div className="text-gray-500 font-bold font-bangla text-base flex items-center gap-1.5 bg-gray-55 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Calendar className="w-4.5 h-4.5 text-red-700" />
            <span>আর্কাইভ অনুসন্ধান ফিল্টার</span>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 no-print">
        
        {/* Archive Selector Banner */}
        <div className="bg-gradient-to-br from-red-50 to-amber-50/40 border border-red-150 rounded-xl p-5 md:p-6 mb-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-[900] text-red-950 mb-3 font-bangla flex items-center gap-2">
            📂 পুরাতন সংবাদ আর্কাইভ
          </h2>
          <p className="text-sm md:text-[15px] text-gray-650 mb-6 font-medium leading-relaxed font-bangla">
            কচুয়া প্রতিদিন-এর ডিজিটাল সংরক্ষণশালা থেকে পূর্বে প্রকাশিত হওয়া খবরসমূহ মাস এবং বছর অনুযায়ী খুঁজে পড়ুন। নিচের প্যানেল থেকে আপনার বাছাইকৃত বছর ও মাস সিলেক্ট করুন।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl bg-white p-4.5 rounded-lg border border-red-100/70 shadow-sm">
            
            {/* Year Selector */}
            <div>
              <label className="block text-xs font-bold text-red-850 uppercase tracking-widest mb-1.5">বছর নির্বাচন করুন</label>
              <div className="flex flex-wrap gap-2">
                {availableFilters.length === 0 ? (
                  <button className="bg-gray-100 border border-gray-200 text-gray-400 px-4 py-1.5 rounded text-sm font-bold font-bangla" disabled>
                    {toBengaliDigits(2026)}
                  </button>
                ) : (
                  availableFilters.map(opt => (
                    <button 
                      key={opt.year}
                      onClick={() => handleYearChange(opt.year)}
                      className={`px-4 py-1.5 rounded text-sm font-bold font-bangla border transition-all cursor-pointer ${selectedYear === opt.year ? 'bg-red-700 border-red-705 text-white shadow' : 'bg-white border-gray-300 hover:border-red-600 text-gray-700'}`}
                    >
                      {toBengaliDigits(opt.year)} সাল
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Month Selector */}
            <div>
              <label className="block text-xs font-bold text-red-850 uppercase tracking-widest mb-1.5">মাস নির্বাচন করুন</label>
              <div className="flex flex-wrap gap-2">
                {activeMonths.length === 0 ? (
                  <span className="text-xs text-gray-400 font-semibold font-bangla py-1">কোনো মাস পাওয়া যায়নি</span>
                ) : (
                  activeMonths.map(mth => (
                    <button 
                      key={mth}
                      onClick={() => handleMonthChange(mth)}
                      className={`px-3 py-1.5 rounded text-xs font-bold font-bangla border transition-all cursor-pointer ${selectedMonth === mth ? 'bg-amber-600 border-amber-600 text-white shadow' : 'bg-white border-gray-300 hover:border-amber-600 text-gray-750'}`}
                    >
                      {BENGALI_MONTHS[mth] || `${mth} নং মাস`}
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Selected Archive Status Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-700 rounded-full"></span>
            <h3 className="text-lg md:text-xl font-bold font-bangla text-gray-900">
              {toBengaliDigits(selectedYear)} সালের {BENGALI_MONTHS[selectedMonth]} মাসের সংবাদসমূহ
            </h3>
          </div>
          <span className="bg-gray-100 border border-gray-250 text-gray-600 text-xs font-bold px-3 py-1 rounded-full font-bangla">
            সর্বমোট প্রাপ্ত সংবাদ: {toBengaliDigits(articles.length)}টি
          </span>
        </div>

        {/* Loading / Results Screen */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bangla font-semibold text-base text-gray-600">আর্কাইভ থেকে তথ্য খোঁজা হচ্ছে...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300 max-w-md mx-auto p-6 shadow-xs">
            <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
            <p className="font-bangla font-semibold text-lg text-gray-800 mb-1">কোন সংবাদ সংরক্ষিত নেই</p>
            <p className="font-bangla text-gray-500 text-xs leading-normal">
              দুঃখিত! {toBengaliDigits(selectedYear)} সালের {BENGALI_MONTHS[selectedMonth]} মাসে কচুয়া প্রতিদিন পোর্টালে এই মুহূর্তে কোনো খবর ডাটাবেজে রেকর্ড করা নেই। অন্য মাস বা বছর সিলেক্ট করে দেখুন।
            </p>
          </div>
        ) : (
          /* Archive Grid matching home page clean structure */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div 
                key={art._id}
                onClick={() => setSelectedArticle(art)}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
              >
                {/* Image header matching home style */}
                <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-100 shrink-0">
                  <Image 
                    src={art.imgUrl} 
                    alt={art.title} 
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {art.category}
                  </span>
                </div>

                {/* Body details */}
                <div className="p-4.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-3">
                    <h4 
                      className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug"
                      style={{ fontFamily: 'var(--font-serif-bangla)' }}
                    >
                      {art.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {art.content}
                    </p>
                  </div>

                  {/* Date, author & printable metadata */}
                  <div className="flex justify-between items-center text-gray-400 text-[11px] pt-3 border-t border-gray-100 font-semibold uppercase">
                    <div className="flex gap-2.5">
                      <span className="text-gray-700 font-bold">{art.author}</span>
                      <span>•</span>
                      <span>{art.time}</span>
                    </div>
                    <button 
                      onClick={(e) => handlePrint(e, art)}
                      className="text-gray-400 hover:text-red-700 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="সংবাদ প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
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

      {/* Single Article Detailed View Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 no-print"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto font-sans text-gray-800 flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            onScroll={(e) => {
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const scrollHeight = target.scrollHeight;
              const clientHeight = target.clientHeight;
              const totalScroll = scrollHeight - clientHeight;
              if (totalScroll > 0) {
                setReadingProgress((scrollTop / totalScroll) * 100);
              } else {
                setReadingProgress(0);
              }
            }}
          >
            {/* Modal Header Actions */}
            <div className="relative flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              {/* Visual Reading Progress Bar */}
              <div 
                className="absolute bottom-0 left-0 h-[3px] bg-red-700 transition-all duration-75 z-20" 
                style={{ width: `${readingProgress}%` }} 
              />

              <div className="flex items-center gap-2">
                <span className="text-red-700 font-extrabold text-xs uppercase tracking-wider bg-red-50 border border-red-100 px-2.5 py-1 rounded font-sans">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">• {selectedArticle.time}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handlePrint(e, selectedArticle)}
                  className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3.5 py-1.5 rounded transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                  title="সংবাদটি প্রিন্ট দিন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Read Content Area */}
            <div className="p-6 md:p-8 space-y-6 flex-1 text-left">
              <h1 
                className="text-2xl md:text-[34px] font-[900] text-gray-900 leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
              >
                {selectedArticle.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-gray-500 border-b border-gray-150 pb-4 font-sans">
                <span>লেখক: <span className="text-gray-800 font-bold">{selectedArticle.author}</span></span>
                <span className="text-gray-300">|</span>
                <span>প্রকাশকাল: <span className="text-gray-800">{selectedArticle.time}</span></span>
                <span className="text-gray-300">|</span>
                <span>উৎস: <span className="text-red-700 font-bold">কচুয়া প্রতিদিন</span></span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold font-bangla border border-emerald-100">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{toBengaliDigits(Math.max(1, Math.ceil((selectedArticle.content || '').trim().split(/\s+/).length / 200)))} মিনিট পড়ার সময়</span>
                </span>
              </div>

              {selectedArticle.imgUrl && (
                <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image 
                    src={selectedArticle.imgUrl} 
                    alt={selectedArticle.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div 
                className="text-[17px] sm:text-[18px] leading-[1.8] text-gray-800 whitespace-pre-line font-medium text-justify font-bangla-serif"
                style={{ fontFamily: 'var(--font-sans), Georgia, serif' }}
              >
                {selectedArticle.content}
              </div>

              <div className="bg-amber-50/50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-6 text-xs text-gray-600 font-sans italic">
                * এই সংবাদপত্রের উপাদানসমূহ কোনো অননুমোদিত উপায়ে পুনর্মুদ্রণ বা বিতরণ করা আইনত দণ্ডনীয় অপরাধ।
              </div>

              {/* Related Articles Component */}
              <RelatedArticles 
                category={selectedArticle.category} 
                excludeId={selectedArticle._id} 
                onSelectArticle={(art) => setSelectedArticle(art)} 
              />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-150 px-6 py-4 bg-gray-50/80 flex justify-between items-center text-xs text-gray-500 font-semibold font-sans">
              <span>© ২০২৬ কচুয়া প্রতিদিন ডিজিটাল</span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-red-700 hover:underline font-bold"
              >
                পড়া শেষ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
