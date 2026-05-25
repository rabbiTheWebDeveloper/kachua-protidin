import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { dbService } from '@/lib/services/dbService';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardTopbar } from './components/DashboardTopbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Authenticate user at layout level
  const cookieStore = await cookies();
  const token = cookieStore.get('kachua_session')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  const user = verifyToken(token);
  if (!user) {
    redirect('/login');
  }

  // 2. Fetch required layout data server-side
  const dbSource = await dbService.getDbSource();
  const counts = await dbService.getCounts();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-bangla text-gray-800 animate-fade-in">
      <DashboardTopbar currentUser={user} dbSource={dbSource} />
      
      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-68px)] relative">
        <DashboardSidebar counts={counts} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 w-full">
          {children}
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400 font-medium">
          <p>&copy; ২০২৬ কচুয়া প্রতিদিন। এডমিনিস্ট্রেটিভ পোর্টাল কন্ট্রোল সিস্টেম।</p>
        </div>
      </footer>
    </div>
  );
}
