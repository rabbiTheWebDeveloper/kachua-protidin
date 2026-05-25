'use client';

import { ArrowLeft, UserCheck, Database, RotateCcw, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  currentUser: any;
  dbSource: string;
}

export function DashboardTopbar({ currentUser, dbSource }: Props) {
  const router = useRouter();

  const handleRestoreDefaults = async () => {
    if (!confirm('রিস্টোর করলে সব সাম্প্রতিক সংবাদ মুছে মূল ডেমো সংবাদগুলো পুনরাগমন করবে। আপনি কি রিস্টোর করতে চান?')) return;
    try {
      const res = await fetch('/api/articles/reset', { method: 'POST' });
      if (res.ok) {
        alert('সব সংবাদ সফলভাবে ফ্যাক্টরি সেটিংস-এ রিস্টোর করা হয়েছে');
        window.location.reload();
      }
    } catch (err) {
      alert('রিস্টোর করা যায়নি');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      alert('সার্ভার ত্রুটি');
    }
  };

  return (
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
  );
}
