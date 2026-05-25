import { useState, useEffect } from 'react';
import { Settings, Send, Link as LinkIcon, Mail } from 'lucide-react';
import { SiteSettings } from '@/lib/db';

interface Props {
  settings: SiteSettings | null;
  loadSettings: () => void;
  showNotif: (msg: string, type: 'success' | 'error') => void;
}

export function TabSettings({ settings, loadSettings, showNotif }: Props) {
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [fb, setFb] = useState('');
  const [tw, setTw] = useState('');
  const [yt, setYt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setDescription(settings.description || '');
      setContactEmail(settings.contactEmail || '');
      setFb(settings.socialLinks?.facebook || '');
      setTw(settings.socialLinks?.twitter || '');
      setYt(settings.socialLinks?.youtube || '');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          siteName, 
          description, 
          contactEmail, 
          socialLinks: { facebook: fb, twitter: tw, youtube: yt } 
        })
      });
      if (res.ok) {
        showNotif('Settings updated successfully', 'success');
        loadSettings();
      } else {
        showNotif('Failed to update settings', 'error');
      }
    } catch (err) {
      showNotif('Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in font-sans">
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-black flex items-center gap-2 text-gray-900 mb-8 font-bangla border-b border-gray-100 pb-4">
          <Settings className="w-6 h-6 text-red-600 animate-spin-slow" />
          <span>সাইট গ্লোবাল সেটিংস</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-2 mb-4 font-bangla">সাধারণ সেটিংস</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-bangla">সাইটের নাম *</label>
                <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-bangla" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-bangla">এস.ই.ও ডেসক্রিপশন (SEO Description)</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-bangla"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-bangla">যোগাযোগের ইমেইল</label>
                <div className="relative">
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-mono text-sm" />
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-2 mb-4 font-bangla">সোশ্যাল মিডিয়া লিংক</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-sans">Facebook URL</label>
                <div className="relative">
                  <input type="url" value={fb} onChange={e => setFb(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-mono text-sm" />
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-sans">Twitter URL</label>
                <div className="relative">
                  <input type="url" value={tw} onChange={e => setTw(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-mono text-sm" />
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-sans">YouTube URL</label>
                <div className="relative">
                  <input type="url" value={yt} onChange={e => setYt(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-mono text-sm" />
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full md:w-auto bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md font-bangla ml-auto">
              <Send className="w-4 h-4" />
              <span>সেটিংস আপডেট করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
