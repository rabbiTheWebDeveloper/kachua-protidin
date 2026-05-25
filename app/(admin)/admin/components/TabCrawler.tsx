import { useState } from 'react';
import { Cpu, Loader2, RefreshCw, Globe } from 'lucide-react';
import { Article } from '@/lib/db';

interface Props {
  scraperStatus: any;
  articles: Article[];
  handleScrapeLatest: () => void;
  scraperLoading: boolean;
  showNotif: (msg: string, type: 'success' | 'error') => void;
}

export function TabCrawler({ scraperStatus, articles, handleScrapeLatest, scraperLoading, showNotif }: Props) {
  
  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই ক্রলকৃত সংবাদটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotif('সংবাদটি সফলভাবে ডিলিট করা হয়েছে', 'success');
        window.location.reload();
      } else {
        showNotif('সংবাদ ডিলিট করা যায়নি', 'error');
      }
    } catch (err) { showNotif('সংবাদ ডিলিট করতে ত্রুটি ঘটেছে', 'error'); }
  };

  const startEdit = (art: Article) => {
    // For now redirect or show error since we separated tabs. 
    // Usually they'd go to the News tab with an ID in query.
    window.location.href = `/admin/news`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex-1 space-y-6 animate-fade-in font-sans">
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
              scraperLoading || scraperStatus.isRunning ? 'bg-red-800/80 cursor-wait' : 'bg-red-700 hover:bg-red-800'
            }`}
          >
            {scraperLoading || scraperStatus.isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>খবর স্ক্র্যাপ হচ্ছে (অপেক্ষা করুন...)</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bangla">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">ক্রলার স্থিতি</span>
          <div className="flex items-center gap-2">
            {scraperStatus.isRunning ? (
              <><span className="w-3 h-3 rounded-full bg-yellow-500 animate-ping"></span><span className="text-lg font-black text-yellow-600">চলমান (Crawling...)</span></>
            ) : (
              <><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-lg font-black text-green-700">অনলাইন (Idle/Active)</span></>
            )}
          </div>
          <p className="text-xs text-gray-550 pt-1 font-sans">স্বয়ংক্রিয় ৩0 মিনিট ইন্টারভাল ট্রিগার সক্রিয় আছে।</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">সর্বশেষ সেশনের রান</span>
          <div className="text-lg font-black text-gray-900 font-mono">
            {scraperStatus.lastRun > 0 ? new Date(scraperStatus.lastRun).toLocaleString('bn-BD', {hour12: true}) : 'সংগৃহীত হয়নি'}
          </div>
          <p className="text-xs text-gray-505 pt-1 font-sans">সর্বশেষ সফলভাবে ফিড বিশ্লেষণ করার ট্র্যাকিং সময়।</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans">সংগৃহীত সংবাদের রেকর্ড</span>
          <div className="text-lg font-black text-red-700">স্বয়ংক্রিয়ভাবে {scraperStatus.count || 0} টি নতুন খবর অ্যাড করা হয়েছে</div>
          <p className="text-xs text-gray-500 pt-1 font-sans">বিগত সেশনে পোর্টাল থেকে ডাউনলোড হওয়া আর্টিকেলের সংখ্যা।</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 font-sans">
            <Globe className="w-4 h-4 text-red-600" /><span>ক্রলার প্রসেস সিস্টেম লগ (Crawler Console Output)</span>
          </h3>
          <span className="text-xs font-mono text-gray-400">STATUS ONLINE</span>
        </div>
        <div className="p-5 bg-[#1C1C1E] text-green-400 font-mono text-xs overflow-y-auto max-h-[220px] space-y-2 leading-relaxed">
          <div className="text-gray-405 font-sans">[{new Date().toISOString()}] INITIALIZING PROTHOM ALO CRAWLER ENGINE...</div>
          <div className="text-gray-405 font-sans">[{new Date().toISOString()}] DETECTED ENCODING: UTF-8 FOR SOURCE FEED RENDER SITE.</div>
          {scraperStatus.lastRun > 0 && <div className="text-green-300 font-sans">[{new Date(scraperStatus.lastRun).toISOString()}] SYSTEM SUCCESS: Crawled {scraperStatus.count} root elements. Status details: "{scraperStatus.message || 'completed'}"</div>}
          {scraperStatus.isRunning ? <div className="text-yellow-300 animate-pulse font-sans">[{new Date().toISOString()}] RUNNING: Downloading story items and applying Gemini Flash Category Classification...</div> : <div className="text-gray-400 font-sans">[{new Date().toISOString()}] STANDBY: Waiting for next cron task or manual administration click.</div>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 font-bangla">
        <div className="border-b border-gray-150 pb-3">
          <h3 className="text-lg font-black text-gray-900 font-sans">ক্রলকৃত সংবাদের সরাসরি তালিকা</h3>
          <p className="text-xs text-gray-500 font-medium font-sans">নিচের তালিকা থেকে ক্রলার সংগৃহীত খবরগুলো দেখে নিয়ে সরাসরি মুছে ফেলতে পারবেন।</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.filter(a => ['প্রথম আলো', 'কুরিয়ার নিউজ', 'রয়টার্স', 'রয়টার্স', 'এএফপি'].includes(a.author)).slice(0, 10).map((art) => (
            <div key={'scraped-'+art._id} className="p-4 rounded-xl border border-gray-150 hover:border-red-200 hover:shadow-xs transition-colors flex gap-3 bg-gray-50/50">
              <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                <img src={art.imgUrl} alt={art.title} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 select-all font-bangla">{art.title}</h4>
                  <p className="text-[11px] text-gray-500 pt-1 font-semibold font-sans">ক্যাটাগরি: <span className="text-red-700">{art.category}</span></p>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={() => startEdit(art)} className="text-[11px] bg-white border border-gray-250 hover:border-red-600 px-2 py-1 rounded font-bold cursor-pointer transition-colors font-sans hover:text-red-700">সম্পাদনা (New Tab)</button>
                  <button onClick={() => handleDelete(art._id)} className="text-[11px] bg-red-50 text-red-700 border border-red-150 hover:bg-red-100 px-2 py-1 rounded font-bold cursor-pointer transition-colors">ডিলিট</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
