'use client';
import { useState, useEffect } from 'react';
import { TabCategories } from '../components/TabCategories';
import { Loader2 } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const showNotif = (msg: string, type: 'success' | 'error') => {
    alert(msg);
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return <TabCategories categories={categories} loadCategories={loadCategories} showNotif={showNotif} />;
}
