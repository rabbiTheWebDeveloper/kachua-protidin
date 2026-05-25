'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LayoutDashboard, LogIn, Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorNotif, setErrorNotif] = useState<string | null>(null);
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.push('/admin');
            return;
          }
        }
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkCurrentSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotif(null);
    setSuccessNotif(null);

    if (!identifier || !password) {
      setErrorNotif('দয়া করে আপনার ইউজারনেম/ইমেইল এবং পাসওয়ার্ড দিন');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessNotif('সফল লগইন! আপনাকে এডমিন ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...');
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1200);
      } else {
        setErrorNotif(data.error || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।');
      }
    } catch (err) {
      setErrorNotif('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center font-bangla text-gray-700">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-700 animate-spin" />
          <p className="text-sm font-bold">নিরাপত্তা যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-bangla text-gray-800">
      
      {/* Return Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-red-700 transition-colors bg-white px-3.5 py-2 border border-gray-200 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল নিউজ পোর্টালে ফিরুন</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Nice Masthead in Auth */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2 font-serif" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
            কচুয়া প্রতিদিন
          </h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
            সম্পাদকীয় ও সাংবাদিক পোর্টাল
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            ড্যাশবোর্ডে লগইন করুন
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            অথবা{' '}
            <Link href="/signup" className="font-bold text-red-700 hover:text-red-800 transition-colors underline decoration-2 underline-offset-4">
              নতুন রিপোর্টার অ্যাকাউন্ট খুলুন
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow sm:rounded-xl border border-gray-200 sm:px-10">
          
          {/* Notifications */}
          {errorNotif && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-250 text-red-800 text-sm font-bold flex items-center gap-2">
              <span className="shrink-0 bg-red-600 text-white rounded-full w-4.5 h-4.5 inline-flex items-center justify-center text-xs">!</span>
              <div>{errorNotif}</div>
            </div>
          )}

          {successNotif && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-250 text-green-800 text-sm font-bold flex items-center gap-2">
              <span className="shrink-0 bg-green-600 text-white rounded-full w-4.5 h-4.5 inline-flex items-center justify-center text-xs">✓</span>
              <div>{successNotif}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username / Email field */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-bold text-gray-700 mb-1">
                ইউজারনেম অথবা ইমেইল এড্রেস
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  placeholder="যেমন: admin অথবা info@kachuaprotidin.com"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                নিরাপত্তা পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="আপনার অন্তত ৬ অক্ষরের পাসওয়ার্ড"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড প্রদর্শন করুন'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Default Demo account tip */}
            <div className="bg-amber-50/50 border-l-4 border-amber-500 p-3.5 rounded text-xs text-amber-900">
              <span className="font-bold">রিসোর্স ব্যবহারের নির্দেশিকা:</span> ডেমো অ্যাকাউন্টের জন্য ইউজারনেমে <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">admin</code> এবং পাসওয়ার্ডে <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">admin123</code> ব্যবহার করুন।
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>প্রবেশ করুন (লগইন)</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
