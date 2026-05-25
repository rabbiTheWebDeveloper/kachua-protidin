'use client';
import { useState, useEffect } from 'react';
import { TabNews } from '../components/TabNews';
import { Loader2 } from 'lucide-react';
import { Article, Category } from '@/lib/db';

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [dbSource, setDbSource] = useState('loading');

  const loadData = async () => {
    try {
      const [artRes, catRes, userRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/categories'),
        fetch('/api/auth/me')
      ]);
      
      const artData = await artRes.json();
      const catData = await catRes.json();
      const userData = await userRes.json();

      setArticles(artData.articles || []);
      setDbSource(artData.source || 'mongodb');
      setCategories(catData.categories || []);
      setCurrentUser(userData.user || null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const showNotif = (msg: string, type: 'success' | 'error') => {
    alert(msg);
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return (
    <TabNews 
      articles={articles} 
      categories={categories} 
      dbSource={dbSource} 
      totalPageViews={0} // We can ignore totalPageViews here as it's not strictly needed for this tab
      loadArticles={loadData} 
      showNotif={showNotif} 
      currentUser={currentUser} 
    />
  );
}
