'use client';

import { LayoutDashboard, FileText, Megaphone, Cpu, Tags, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  counts: {
    news: number;
    ads: number;
    categories: number;
    users: number;
  };
}

export function DashboardSidebar({ counts }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', icon: LayoutDashboard, path: '/admin' },
    { id: 'news', label: 'সংবাদ ব্যবস্থাপনা', icon: FileText, count: counts.news, path: '/admin/news' },
    { id: 'categories', label: 'ক্যাটাগরি ম্যানেজমেন্ট', icon: Tags, count: counts.categories, path: '/admin/categories' },
    { id: 'ads', label: 'বিজ্ঞাপন প্যানেল', icon: Megaphone, count: counts.ads, path: '/admin/ads' },
    { id: 'crawler', label: 'নিউজ ক্রলার কন্ট্রোল', icon: Cpu, path: '/admin/crawler' },
    { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Users, count: counts.users, path: '/admin/users' },
    { id: 'settings', label: 'সাইট সেটিংস', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-gray-100 hidden md:block">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-sans">ম্যানেজমেন্ট প্যানেল</h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2 flex md:flex-col overflow-x-auto md:overflow-visible">
          {navItems.map(item => {
            const Icon = item.icon;
            // Exact match for overview, prefix match for others
            const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
            
            return (
              <li key={item.id} className="shrink-0">
                <Link
                  href={item.path}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-bold text-sm whitespace-nowrap md:whitespace-normal ${
                    isActive 
                      ? 'bg-red-50 text-red-700 border border-red-100 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
