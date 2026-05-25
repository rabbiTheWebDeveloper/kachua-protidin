'use client';
import { useState, useEffect } from 'react';
import { TabUsers } from '../components/TabUsers';
import { Loader2 } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const showNotif = (msg: string, type: 'success' | 'error') => {
    alert(msg);
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return <TabUsers users={users} loadUsers={loadUsers} showNotif={showNotif} />;
}
