'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Article } from '@/lib/db';

interface RelatedArticlesProps {
  category: string;
  excludeId: string;
  onSelectArticle: (article: Article) => void;
  isNightMode?: boolean;
}

export function RelatedArticles({ category, excludeId, onSelectArticle, isNightMode = false }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const url = `/api/articles/related?category=${encodeURIComponent(category)}&excludeId=${excludeId}`;
        const res = await fetch(url);
        if (res.ok && active) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error('Error fetching related articles:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRelated();

    return () => {
      active = false;
    };
  }, [category, excludeId]);

  if (loading) {
    return (
      <div className={`mt-8 pt-8 border-t ${isNightMode ? 'border-slate-850' : 'border-gray-150'}`}>
        <h3 className={`text-lg font-[900] mb-5 font-bangla flex items-center gap-1.5 ${isNightMode ? 'text-slate-100' : 'text-gray-900'}`}>
          <span className="w-1.5 h-4.5 bg-red-700 rounded-full inline-block"></span>
          সম্পর্কিত خبرসমূহ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-3.5">
              <div className={`aspect-[16/10] rounded-lg ${isNightMode ? 'bg-slate-800' : 'bg-gray-150'}`}></div>
              <div className={`h-4 rounded w-1/4 ${isNightMode ? 'bg-slate-800' : 'bg-gray-150'}`}></div>
              <div className="space-y-2">
                <div className={`h-4 rounded w-full ${isNightMode ? 'bg-slate-800' : 'bg-gray-150'}`}></div>
                <div className={`h-4 rounded w-2/3 ${isNightMode ? 'bg-slate-800' : 'bg-gray-150'}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className={`mt-8 pt-8 border-t ${isNightMode ? 'border-slate-850' : 'border-gray-150'}`}>
      <h3 className={`text-lg font-[900] mb-5 font-bangla flex items-center gap-1.5 transition-colors duration-300 ${isNightMode ? 'text-slate-100' : 'text-gray-900'}`}>
        <span className="w-1.5 h-4.5 bg-red-700 rounded-full inline-block"></span>
        সম্পর্কিত খবরসমূহ
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {articles.map((art) => (
          <div 
            key={art._id}
            onClick={() => onSelectArticle(art)}
            className={`group cursor-pointer rounded-lg overflow-hidden border transition-all flex flex-col h-full ${
              isNightMode 
                ? 'bg-slate-900 border-slate-800 hover:border-red-500/50 hover:bg-slate-850' 
                : 'bg-white border-gray-150 hover:border-red-200 hover:shadow-sm'
            }`}
          >
            {/* Thumbnail */}
            <div className={`relative w-full aspect-[16/10] overflow-hidden shrink-0 border-b ${isNightMode ? 'bg-slate-950 border-slate-850' : 'bg-gray-55 border-gray-100'}`}>
              <Image 
                src={art.imgUrl} 
                alt={art.title} 
                fill
                className={`object-cover group-hover:scale-105 transition-all duration-500 ${isNightMode ? 'brightness-90 group-hover:brightness-100' : ''}`}
                referrerPolicy="no-referrer"
              />
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded border shadow-xs ${
                isNightMode 
                  ? 'bg-red-950/50 text-red-400 border-red-900/40' 
                  : 'bg-red-50 text-red-700 border-red-150'
              }`}>
                {art.category}
              </span>
            </div>

            {/* Content info */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 
                  className={`text-sm font-bold leading-snug transition-colors line-clamp-2 ${
                    isNightMode ? 'text-slate-200 group-hover:text-red-400' : 'text-gray-900 group-hover:text-red-700'
                  }`}
                  style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
                >
                  {art.title}
                </h4>
              </div>
              
              <div className={`flex items-center justify-between text-[10px] font-bold mt-3 pt-2.5 border-t uppercase tracking-wider ${
                isNightMode ? 'text-slate-400 border-slate-800' : 'text-gray-400 border-gray-100'
              }`}>
                <span>{art.author}</span>
                <span className={`flex items-center gap-0.5 transition-colors ${
                  isNightMode ? 'text-slate-400 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-600'
                }`}>
                  পড়ুন
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
