'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Send, CheckCircle, AlertCircle, PenTool, 
  Image as ImageIcon, User, Layers, FileText, ChevronRight, MapPin
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { trackPageView } from '@/lib/analytics';
import { WeatherWidget } from '@/components/weather-widget';

// Standard categories matching home
const CATEGORIES = [
  'বিশেষ সংবাদ',
  'রাজনীতি',
  'বাংলাদেশ',
  'অপরাধ',
  'বিশ্ব',
  'বাণিজ্য',
  'মতামত',
  'খেলা',
  'বিনোদন'
];

// Presets for gorgeous placeholder visual cards
const IMAGE_PRESETS = [
  { id: 'politics', label: 'রাজনীতি ও আইন', url: 'https://picsum.photos/seed/politics3/800/450' },
  { id: 'bangladesh', label: 'গ্রামীণ কৃষি ও উন্নয়ন', url: 'https://picsum.photos/seed/farmers/800/450' },
  { id: 'health', label: 'জনস্বাস্থ্য ও মেডিকেল', url: 'https://picsum.photos/seed/med/800/450' },
  { id: 'sports', label: 'খেলাধুলা ও টুর্নামেন্ট', url: 'https://picsum.photos/seed/school/800/450' },
  { id: 'business', label: 'বাণিজ্য ও অর্থনীতি', url: 'https://picsum.photos/seed/economy/800/450' },
  { id: 'nature', label: 'কচুয়া নদী ও জীবন', url: 'https://picsum.photos/seed/river/800/450' }
];

export default function SubmitNewsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imgUrl, setImgUrl] = useState(IMAGE_PRESETS[0].url);
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successArticleId, setSuccessArticleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    trackPageView();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!title.trim() || title.length < 10) {
      setErrorMessage('শিরোনামটি অত্যন্ত সংক্ষিপ্ত। কমপক্ষে ১০টি বর্ণের বিস্তারিত শিরোনাম দিন।');
      return;
    }
    if (!content.trim() || content.length < 40) {
      setErrorMessage('সংবাদের বিস্তারিত অংশ খুব ছোট। ঘটনার সত্যতা ও বিবরণ সহ কমপক্ষে ৪০টি অক্ষর লিখুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalImage = customImgUrl.trim() ? customImgUrl.trim() : imgUrl;
      const response = await fetch('/api/articles/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          imgUrl: finalImage,
          author: author.trim() || 'নাগরিক সাংবাদিক',
          publishDate: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessArticleId(data.article._id);
        // Reset states
        setTitle('');
        setContent('');
        setAuthor('');
        setCustomImgUrl('');
      } else {
        setErrorMessage(data.error || 'সংবাদটি প্রকাশ করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('সার্ভার সংযোগে ত্রুটি ঘটেছে। আপনার ইন্টারনেট কোয়ালিটি পরীক্ষা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-gray-850">
      
      {/* Top micro bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-sm text-gray-700">
          <div className="flex items-center gap-4">
            <span className="font-bangla font-medium">রবিবার, ২৪ মে ২০২৬</span>
            <WeatherWidget />
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold font-bangla">
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              🟢 সরাসরি লাইভ পাবলিক রিপোর্টিং
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand Header */}
      <header className="border-b-[3px] border-red-700 py-6 bg-white shadow-xs">
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
            <PenTool className="w-4.5 h-4.5 text-red-700" />
            <span>পাবলিক খবর প্রকাশনা প্যানেল</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        
        {/* If Submited Successfully */}
        {successArticleId ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-md text-center max-w-xl mx-auto space-y-6 my-10 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-[900] text-emerald-950 font-bangla">খবরটি সফলভাবে প্রকাশিত হয়েছে!</h2>
              <p className="text-sm text-gray-650 font-bangla leading-relaxed">
                আপনার দেয়া সংবাদের বিবরণটি সরাসরি ডাটাসোর্সে সংরক্ষণ ও প্রকাশ করা হয়েছে। এখন তা আমাদের মূল পাতা, ক্যাটাগরি এবং পুরাতন আর্কাইভ পাতায় যেকোনো পাঠক পড়তে পারবেন।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 font-bangla">
              <Link 
                href={`/news/${successArticleId}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>প্রকাশিত খবরটি দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => setSuccessArticleId(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-6 py-2.5 rounded-lg border border-gray-250 transition-all cursor-pointer"
              >
                আরও একটি নতুন খবর লিখুন
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            
            {/* Context Notice */}
            <div className="border-b border-gray-150 pb-5 mb-6 space-y-2">
              <h2 className="text-2xl font-[900] text-gray-950 font-bangla flex items-center gap-2">
                ✍️ জনমতের সত্য সংবাদ জনগণের মঞ্চে
              </h2>
              <p className="text-xs md:text-sm text-gray-500 font-bangla leading-relaxed font-semibold">
                আপনার এলাকায় ঘটে যাওয়া সমসাময়িক খবর, শিক্ষামূলক উদ্যোগ বা নাগরিক ভোগান্তির কথা সত্য ও বস্তুনিষ্ঠ বর্ণনায় তুলে ধরুন। কোনো বিতর্কিত বা অসত্য সংবাদ ছড়ানো আইনত দণ্ডনীয়।
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-4 mb-6 flex items-start gap-2.5 font-bangla animate-shake">
                <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-950 font-extrabold text-[15px]">তথ্য পূরণে অমিল</h4>
                  <p className="text-red-800 text-sm mt-0.5 font-medium leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* News Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-extrabold text-gray-900 font-bangla flex items-center gap-1">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>সংবাদের আকর্ষণীয় শিরোনাম <span className="text-red-500">*</span></span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="যেমন: কচুয়ায় স্বেচ্ছাশ্রমে রাস্তা সংস্কার করলেন স্থানীয় ছাত্র সমাজ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all placeholder:text-gray-400 font-sans"
                />
                <p className="text-[11px] text-gray-400 font-bold font-sans">কমপক্ষে ১০টি বর্ণ এবং সর্বোচ্চ ৮০টি বর্নে লিখুন।</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-extrabold text-gray-900 font-bangla flex items-center gap-1">
                    <Layers className="w-4 h-4 text-red-600" />
                    <span>বিভাগ নির্বাচন করুন <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all cursor-pointer font-bangla font-semibold"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reporter Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-extrabold text-gray-900 font-bangla flex items-center gap-1">
                    <User className="w-4 h-4 text-red-600" />
                    <span>লেখকের নাম / উৎস (ঐচ্ছিক)</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="যেমন: করিম আহমেদ, কচুয়া"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all placeholder:text-gray-400 font-sans"
                  />
                  <p className="text-[11px] text-gray-400 font-bold font-sans">ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে &quot;নাগরিক সাংবাদিক&quot; হিসেবে প্রদর্শিত হবে।</p>
                </div>
              </div>

              {/* Cover Image Setup */}
              <div className="space-y-3">
                <label className="block text-sm font-extrabold text-gray-900 font-bangla flex items-center gap-1 mb-1">
                  <ImageIcon className="w-4 h-4 text-red-600" />
                  <span>সংবাদের সাথে সামঞ্জস্যপূর্ণ ছবি <span className="text-red-500">*</span></span>
                </label>
                
                {/* Custom URL Input */}
                <div className="space-y-1">
                  <input 
                    type="url"
                    placeholder="ছবির সরাসরি লিংক (যেমন: https://example.com/photo.jpg)"
                    value={customImgUrl}
                    onChange={(e) => setCustomImgUrl(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all placeholder:text-gray-450 font-sans"
                  />
                  <p className="text-[10px] text-gray-400 font-bold font-sans">আপনার কাছে ছবির সরাসরি URL থাকলে তা এখানে পেস্ট করুন। অন্যথায় নিচের যেকোনো একটি ছবিতে ক্লিক করে সিলেক্ট করুন:</p>
                </div>

                {/* Curated Previews */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {IMAGE_PRESETS.map((preset) => {
                    const isSelected = !customImgUrl.trim() && imgUrl === preset.url;
                    return (
                      <div 
                        key={preset.id}
                        onClick={() => {
                          setCustomImgUrl('');
                          setImgUrl(preset.url);
                        }}
                        className={`group relative aspect-[16/10] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-red-600 ring-2 ring-red-600/30 ring-offset-1' 
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <Image 
                          src={preset.url}
                          alt={preset.label}
                          fill
                          className="object-cover group-hover:scale-102 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                          <span className="text-[10px] font-bold text-white font-bangla line-clamp-1">{preset.label}</span>
                        </div>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 bg-red-600 text-white p-0.5 rounded-full z-10 shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* News content body */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-extrabold text-gray-900 font-bangla flex items-center gap-1">
                    <PenTool className="w-4 h-4 text-red-600" />
                    <span>সংবাদের বিস্তারিত বিবরণী <span className="text-red-500">*</span></span>
                  </label>
                  <span className="text-[11px] font-bold text-gray-400 font-sans bg-gray-100 border px-2 py-0.5 rounded">
                    শব্দ সংখ্যা: {wordCount}
                  </span>
                </div>
                <textarea 
                  required
                  rows={8}
                  placeholder="আজ সকাল ১০ ঘটিকায় কচুয়া উপজেলার..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-950 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-sans leading-relaxed"
                ></textarea>
                <p className="text-[11px] text-gray-400 font-bold font-sans">ঘটনাটি সহজ ভাষায় সাধারণ মানুষের পাঠযোগ্য করে কমপক্ষে ৪০টি বর্ণে বর্ণনা করুন।</p>
              </div>

              {/* Submit panel */}
              <div className="pt-4 border-t border-gray-150 flex justify-end font-bangla">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg text-white font-bold text-sm flex items-center gap-2 shadow hover:shadow-md transition-all active:scale-98 cursor-pointer ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-700 hover:bg-red-800'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>তথ্য আপলোড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>সংবাদটি এখনই প্রকাশ করুন</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* Standard Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-auto border-t-[4px] border-red-700 font-bangla">
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
              <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500 shrink-0" /> কচুয়া, বাগেরহাট, বাংলাদেশ</p>
              <p>ইমেইল: info@kachuaprotidin.com</p>
              <p className="text-[11px] text-gray-500 mt-4 font-sans">© ২০২৬ কচুয়া প্রতিদিন। সমস্ত স্বত্ব সংরক্ষিত।</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
