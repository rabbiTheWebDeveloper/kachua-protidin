import { useState } from 'react';
import { Megaphone, ExternalLink, Edit2, Trash2 } from 'lucide-react';

interface Props {
  ads: any[];
  loadAds: () => void;
  showNotif: (msg: string, type: 'success' | 'error') => void;
}

export function TabAds({ ads, loadAds, showNotif }: Props) {
  const [adEditingId, setAdEditingId] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adImgUrl, setAdImgUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adPosition, setAdPosition] = useState<'sidebar' | 'top_banner'>('sidebar');
  const [adIsActive, setAdIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adImgUrl || !adLinkUrl) {
      showNotif('বিজ্ঞাপনের সব তথ্য সঠিকভাবে পূরণ করুন', 'error');
      return;
    }

    setLoading(true);
    const payload = { title: adTitle, imgUrl: adImgUrl, linkUrl: adLinkUrl, position: adPosition, isActive: adIsActive };

    try {
      const res = await fetch(adEditingId ? `/api/ads/${adEditingId}` : '/api/ads', {
        method: adEditingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

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
    } finally {
      setLoading(false);
    }
  };

  const startAdEdit = (ad: any) => {
    setAdEditingId(ad._id); setAdTitle(ad.title); setAdImgUrl(ad.imgUrl);
    setAdLinkUrl(ad.linkUrl); setAdPosition(ad.position); setAdIsActive(!!ad.isActive);
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
    } catch (err) { showNotif('বিজ্ঞাপন ডিলিট করতে ত্রুটি ঘটেছে', 'error'); }
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
    } catch (err) { showNotif('বিজ্ঞাপন স্থিতি পরিবর্তন করা যায়নি', 'error'); }
  };

  const resetAdForm = () => {
    setAdEditingId(null); setAdTitle(''); setAdImgUrl(''); setAdLinkUrl('');
    setAdPosition('sidebar'); setAdIsActive(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-fade-in font-sans">
      <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 font-bangla">
            <Megaphone className="w-5 h-5 text-red-600" />
            <span>{adEditingId ? 'বিজ্ঞাপন এডিট করুন' : 'নতুন বিজ্ঞাপন দিন'}</span>
          </h2>
          {adEditingId && (
            <button onClick={resetAdForm} className="text-xs text-gray-500 hover:text-red-600 font-bold hover:underline cursor-pointer font-bangla">বাতিল করুন</button>
          )}
        </div>

        <form onSubmit={handleAdSubmit} className="space-y-4 font-bangla">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ক্যাম্পেইন নাম *</label>
            <input type="text" value={adTitle} onChange={(e) => setAdTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm" placeholder="যেমন: ঈদুল ফিতর অফার" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">বিজ্ঞাপনের ছবি (ইমেজ URL) *</label>
            <input type="url" value={adImgUrl} onChange={(e) => setAdImgUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm font-mono" placeholder="https://..." required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">টার্গেট লিংক URL *</label>
            <input type="url" value={adLinkUrl} onChange={(e) => setAdLinkUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm font-mono" placeholder="https://..." required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">বিজ্ঞাপনের অবস্থান</label>
            <select value={adPosition} onChange={(e) => setAdPosition(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 cursor-pointer text-sm font-bangla">
              <option value="sidebar">সাইডবার বিজ্ঞাপন</option>
              <option value="top_banner">হেডার টপ ব্যানার</option>
            </select>
          </div>
          <div className="flex items-center gap-2.5 bg-gray-50 p-2.5 rounded border border-gray-150">
            <input type="checkbox" id="adIsActiveCheckbox" checked={adIsActive} onChange={(e) => setAdIsActive(e.target.checked)} className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
            <label htmlFor="adIsActiveCheckbox" className="text-xs md:text-sm font-bold text-gray-700 cursor-pointer select-none font-bangla">বিজ্ঞাপনটি এখনই সক্রিয় করুন (Active Status)</label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md text-base">
            <Megaphone className="w-4 h-4" />
            <span>{adEditingId ? 'বিজ্ঞাপন আপডেট করুন' : 'বিজ্ঞাপন পোস্ট করুন'}</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 font-bangla">
              <Megaphone className="w-5 h-5 text-red-600 animate-bounce" />
              <span>সক্রিয় বিজ্ঞাপনের তালিকা ({ads.length})</span>
            </h3>
          </div>
          {ads.length === 0 ? (
            <div className="p-16 text-center text-gray-400 flex flex-col items-center flex-1 font-bangla">
              <Megaphone className="w-12 h-12 text-gray-200 mb-3" />
              <p className="font-bold mb-1">কোনো সক্রিয় বিজ্ঞাপন নেই</p>
              <p className="text-xs bg-gray-50 px-3 py-1.5 rounded">বাম পাশের ফরম ব্যবহার করে প্রথম বিজ্ঞাপন ক্যাম্পেইনটি চালু করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto font-bangla">
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
                      <td className="py-4 px-4 font-bold text-gray-900 font-bangla">{ad.title}</td>
                      <td className="py-4 px-4 text-gray-650 font-bold font-bangla">
                        {ad.position === 'sidebar' ? (
                          <span className="bg-red-50 text-red-700 text-xs px-2.5 py-0.5 rounded border border-red-150">সাইডবার</span>
                        ) : (
                          <span className="bg-orange-50 text-orange-700 text-xs px-2.5 py-0.5 rounded border border-orange-150">হেডার ব্যানার</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bangla">
                        <button onClick={() => toggleAdActiveStatus(ad)} className="focus:outline-none transition-transform active:scale-95 cursor-pointer" title="Toggle status">
                          {ad.isActive ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping"></span><span>সক্রিয় (Active)</span>
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
                          <button onClick={() => startAdEdit(ad)} className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-250 transition-all cursor-pointer text-xs font-semibold"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleAdDelete(ad._id)} className="p-1 px-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded border border-red-200 transition-all cursor-pointer text-xs font-semibold"><Trash2 className="w-3.5 h-3.5" /></button>
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
  );
}
