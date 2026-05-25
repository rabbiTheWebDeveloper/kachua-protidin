import { useState } from 'react';
import { Users, Send } from 'lucide-react';
import { AppUser } from '@/lib/db';

interface Props {
  users: AppUser[];
  loadUsers: () => void;
  showNotif: (msg: string, type: 'success' | 'error') => void;
}

export function TabUsers({ users, loadUsers, showNotif }: Props) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'reporter' | 'editor'>('reporter');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || !role) return showNotif('Please fill required fields', 'error');
    
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, role, isActive })
      });
      if (res.ok) {
        showNotif('User added successfully', 'success');
        setUsername('');
        setName('');
        setRole('reporter');
        setIsActive(true);
        loadUsers();
      } else {
        showNotif('Failed to add user', 'error');
      }
    } catch (err) {
      showNotif('Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-fade-in font-sans">
      <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
        <h2 className="text-xl font-black flex items-center gap-2 text-gray-900 mb-6 font-bangla">
          <Users className="w-5 h-5 text-red-600" />
          <span>নতুন ইউজার তৈরি করুন</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 font-bangla">পুরো নাম *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-bangla" required placeholder="যেমন: আব্দুর রহমান" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 font-bangla">ইউজারনেম *</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-mono text-sm" required placeholder="e.g: rahman123" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 font-bangla">রোল (Role) *</label>
            <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-red-600 font-bangla">
              <option value="reporter">রিপোর্টার (Reporter)</option>
              <option value="editor">সম্পাদক (Editor)</option>
              <option value="admin">অ্যাডমিন (Admin)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} id="userActive" className="w-4 h-4 text-red-600 rounded cursor-pointer" />
            <label htmlFor="userActive" className="text-sm font-bold text-gray-700 cursor-pointer font-bangla">সক্রিয় করুন</label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md font-bangla">
            <Send className="w-4 h-4" />
            <span>অ্যাকাউন্ট তৈরি করুন</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 font-bangla">
            <Users className="w-5 h-5 text-red-600" />
            <span>ইউজার প্যানেল ({users.length})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-semibold uppercase font-sans">
                <th className="py-3 px-4">নাম</th>
                <th className="py-3 px-4">ইউজারনেম</th>
                <th className="py-3 px-4">রোল</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900 font-bangla">{u.name}</td>
                  <td className="py-4 px-4 font-mono text-gray-500">{u.username}</td>
                  <td className="py-4 px-4 font-bold text-gray-700 uppercase text-xs">{u.role}</td>
                  <td className="py-4 px-4">
                    {u.isActive ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold font-bangla border border-green-200">সক্রিয়</span> : <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold font-bangla">বন্ধ</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
