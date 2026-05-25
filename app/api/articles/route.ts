import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { memoryArticles, addArticle } from './store';
import { scrapeLatestNews, lastScrapeStatus } from '@/lib/scraper';

export async function GET(req: NextRequest) {
  try {
    // Autotrigger news scraper if 30 minutes elapsed (non-blocking)
    const THIRTY_MIN_MS = 30 * 60 * 1000;
    if (Date.now() - lastScrapeStatus.lastRun > THIRTY_MIN_MS && !lastScrapeStatus.isRunning) {
      console.log('30-minute news crawl interval reached. Booting latest background scraper...');
      scrapeLatestNews().catch(err => {
        console.error('Automated background news scraping failed:', err);
      });
    }

    const { db, isUsingFallback } = await getDb();
    
    if (!isUsingFallback && db) {
      const articles = await db.collection('articles').find({}).sort({ _id: -1 }).toArray();
      // If db is empty, seed it initially
      if (articles.length === 0) {
        const mongoDocs = memoryArticles.map(({ _id, ...rest }) => ({ ...rest }));
        await db.collection('articles').insertMany(mongoDocs as any);
        const seeded = await db.collection('articles').find({}).sort({ _id: -1 }).toArray();
        return NextResponse.json({
          articles: seeded.map(a => ({ ...a, _id: a._id.toString() })),
          source: 'mongodb'
        });
      }
      return NextResponse.json({ 
        articles: articles.map(a => ({ ...a, _id: a._id.toString() })),
        source: 'mongodb' 
      });
    }

    return NextResponse.json({ 
      articles: memoryArticles, 
      source: 'local_fallback_db' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Audit check: Verify active admin session to block publication from unauthorized endpoints
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশাধিকার! এই কাজটি সম্পন্ন করার জন্য দয়া করে আগে লগইন করুন।' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category, imgUrl, author, isLead, isSub, publishDate } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Title, content and category are required' }, { status: 400 });
    }

    const { db, isUsingFallback } = await getDb();
    const newArticleSeed = {
      title,
      content,
      category,
      imgUrl: imgUrl || 'https://picsum.photos/seed/default/600/400',
      time: 'সদ্য প্রকাশিত',
      author: author || 'নিজস্ব প্রতিবেদক',
      isLead: !!isLead,
      isSub: !!isSub,
      publishDate: publishDate || new Date().toISOString()
    };

    if (!isUsingFallback && db) {
      // If we are setting this as a lead story, let's reset other lead stories
      if (isLead) {
        await db.collection('articles').updateMany({ isLead: true }, { $set: { isLead: false } });
      }
      if (isSub) {
        // Limit total subs or let it be
      }

      const res = await db.collection('articles').insertOne(newArticleSeed);
      const inserted = {
        ...newArticleSeed,
        _id: res.insertedId.toString()
      };
      return NextResponse.json({ success: true, article: inserted, source: 'mongodb' });
    }

    // fallback
    if (isLead) {
      memoryArticles.forEach(a => a.isLead = false);
    }
    const createdLocal = addArticle(newArticleSeed);

    return NextResponse.json({ success: true, article: createdLocal, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error creating article' }, { status: 500 });
  }
}
