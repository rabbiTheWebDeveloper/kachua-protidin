import { useState } from 'react';
import { FileText, Image as ImageIcon, Send, Edit2, Trash2, Database, Eye } from 'lucide-react';
import { Article, Category } from '@/lib/db';

interface Props {
  articles: Article[];
  categories: Category[];
  dbSource: string;
  totalPageViews: number;
  loadArticles: () => void;
  showNotif: (msg: string, type: 'success' | 'error') => void;
  currentUser: any;
}

export function TabNews({ articles, categories, dbSource, totalPageViews, loadArticles, showNotif, currentUser }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'বিশেষ সংবাদ');
  const [imgUrl, setImgUrl] = useState('');
  const [author, setAuthor] = useState(currentUser?.name || 'নিজস্ব প্রতিবেদক');
  const [isLead, setIsLead] = useState(false);
  const [isSub, setIsSub] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) {
      return showNotif('দয়া করে প্রয়োজনীয় সবগুলো তথ্য পূরণ করুন', 'error');
    }
    setLoading(true);
    const staticSeedSuffix = title.length.toString();
    const payload = {
      title, content, category,
      imgUrl: imgUrl || `https://picsum.photos/seed/news-${staticSeedSuffix}/600/400`,
      author, isLead, isSub,
      publishDate: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString()
    };

    try {
      const res = await fetch(editingId ? `/api/articles/${editingId}` : '/api/articles', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showNotif(editingId ? 'সংবাদটি সফলভাবে আপডেট করা হয়েছে' : 'নতুন সংবাদটি সফলভাবে প্রকাশ করা হয়েছে', 'success');
        resetForm();
        loadArticles();
      } else {
        const errData = await res.json();
        showNotif(errData.error || 'সংবাদটি সংরক্ষণ করা যায়নি', 'error');
      }
    } catch (err) {
      showNotif('সার্ভার সংযোগে ত্রুটি ঘটেছে', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      } catch (e) { setPublishDate(''); }
    } else { setPublishDate(''); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই সংবাদটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotif('সংবাদটি সফলভাবে ডিলিট করা হয়েছে', 'success');
        loadArticles();
        if (editingId === id) resetForm();
      } else {
        showNotif('সংবাদ ডিলিট করা যায়নি', 'error');
      }
    } catch (err) { showNotif('সংবাদ ডিলিট করতে ত্রুটি ঘটেছে', 'error'); }
  };

  const resetForm = () => {
    setEditingId(null); setTitle(''); setContent('');
    setCategory(categories[0]?.name || 'বিশেষ সংবাদ'); setImgUrl('');
    setAuthor(currentUser?.name || 'নিজস্ব প্রতিবেদক'); setIsLead(false); setIsSub(false); setPublishDate('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-fade-in font-sans">
      <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky lg:top-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 font-bangla">
            <FileText className="w-5 h-5 text-red-600" />
            <span>{editingId ? 'সংবাদ কাস্টমাইজ করুন' : 'নতুন সংবাদ লিখুন'}</span>
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-gray-500 hover:text-red-600 font-bold hover:underline cursor-pointer font-bangla">বাতিল করুন</button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 font-bangla">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদের শিরোনাম (বাংলায়) *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদের ক্যাটাগরি *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 cursor-pointer">
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদের ছবি (ইমেজ URL)</label>
            <div className="relative">
              <input type="url" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm font-mono" />
              <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">বিস্তারিত মূল সংবাদ *</label>
            <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-[15px] leading-relaxed" required></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদদাতার নাম</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">প্রকাশের নির্দিষ্ট সময়</label>
            <input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 text-sm font-sans" />
          </div>
          <div className="flex flex-col gap-3 py-1">
             <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold select-none">
               <input type="checkbox" checked={isLead} onChange={(e) => { setIsLead(e.target.checked); if (e.target.checked) setIsSub(false); }} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
               <span>প্রধান খবর করুন (Lead Story)</span>
             </label>
             <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold select-none">
               <input type="checkbox" checked={isSub} onChange={(e) => { setIsSub(e.target.checked); if (e.target.checked) setIsLead(false); }} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
               <span>উপ-প্রধান খবর করুন (Sub Story)</span>
             </label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
            <Send className="w-4 h-4" />
            <span>{editingId ? 'সংবাদ আপডেট করুন' : 'সংবাদটি প্রকাশ করুন'}</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-lg text-gray-900 font-bangla">প্রকাশিত সংবাদের ডেটা তালিকা ({articles.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {articles.slice(0, 15).map((art) => (
              <div key={art._id} className="p-4 rounded-xl border border-gray-150 hover:border-red-200 hover:shadow-xs transition-colors flex gap-3 bg-gray-50/50">
                <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                  <img src={art.imgUrl} alt={art.title} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 font-bangla">{art.title}</h4>
                    <p className="text-[11px] text-gray-500 pt-1 font-semibold font-bangla">ক্যাটাগরি: <span className="text-red-700">{art.category}</span></p>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button onClick={() => startEdit(art)} className="text-[11px] bg-white border border-gray-250 hover:border-red-600 px-2 py-1 rounded font-bold transition-colors font-bangla">সম্পাদনা</button>
                    <button onClick={() => handleDelete(art._id)} className="text-[11px] bg-red-50 text-red-700 border border-red-150 hover:bg-red-100 px-2 py-1 rounded font-bold transition-colors font-bangla">ডিলিট</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
