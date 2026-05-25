'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Lock, Mail, User, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorNotif, setErrorNotif] = useState<string | null>(null);
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotif(null);
    setSuccessNotif(null);

    // Frontend Validations
    if (!name || !username || !email || !password) {
      setErrorNotif('দয়া করে সবগুলো প্রদেয় ফিল্ড পূরণ করুন');
      return;
    }

    if (username.includes(' ')) {
      setErrorNotif('ইউজারনেমে কোনো স্পেস বা ফাঁকা জায়গা থাকতে পারবে না');
      return;
    }

    if (password.length < 6) {
      setErrorNotif('নিরাপত্তার স্বার্থে পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, username, email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessNotif('রিপোর্টার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! আপনাকে লগইন স্ক্রিনে পাঠানো হচ্ছে...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setErrorNotif(data.error || 'রেজিস্ট্রেশন সম্পূর্ণ করা যায়নি। পুনরায় সঠিক তথ্য দিন।');
      }
    } catch (err) {
      setErrorNotif('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-bangla text-gray-800">
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-red-700 transition-colors bg-white px-3.5 py-2 border border-gray-200 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল পোর্টালে ফিরুন</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2 font-serif" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
            কচুয়া প্রতিদিন
          </h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
            রিপোর্টিং ও কন্টেন্ট ফোরাম
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            নতুন সাংবাদিক হিসাব খুলুন
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            পূর্বেই নিবন্ধিত থাকলে?{' '}
            <Link href="/login" className="font-bold text-red-700 hover:text-red-800 transition-colors underline decoration-2 underline-offset-4">
              এখানে লগইন দিন
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow sm:rounded-xl border border-gray-200 sm:px-10">
          
          {/* Messages */}
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">
                সাংবাদিকের পূর্ণ নাম (বাংলা বা ইংরেজি)
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="যেমন: মো: আরিফুল রহমান"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">
                অনন্য ইউজারনেম (ইংরেজি ছোট হাতের অক্ষর)
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  placeholder="যেমন: arif26"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm font-mono"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <span className="text-sm font-bold">@</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                ইমেইল এড্রেস
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="যেমন: arif@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm font-mono"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                নিরাপদ প্রবেশাধিকার পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
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
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>সাংবাদিক হিসেবে রেজিষ্ট্রেশন করুন</span>
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
