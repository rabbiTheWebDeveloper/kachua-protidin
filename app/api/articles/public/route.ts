import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { memoryArticles, addArticle } from '../store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category, imgUrl, author, publishDate } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ 
        success: false, 
        error: 'শিরোনাম, মূল খবর এবং বিভাগ পূরণ করা আবশ্যক।' 
      }, { status: 400 });
    }

    const { db, isUsingFallback } = await getDb();
    const newArticleSeed = {
      title,
      content,
      category,
      imgUrl: imgUrl || `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/800/500`,
      time: 'সদ্য প্রকাশিত',
      author: author || 'নগর প্রতিনিধি (পাবলিক)',
      isLead: false,
      isSub: false,
      publishDate: publishDate || new Date().toISOString()
    };

    if (!isUsingFallback && db) {
      const res = await db.collection('articles').insertOne(newArticleSeed);
      const inserted = {
        ...newArticleSeed,
        _id: res.insertedId.toString()
      };
      return NextResponse.json({ success: true, article: inserted, source: 'mongodb' });
    }

    // fallback
    const createdLocal = addArticle(newArticleSeed);
    return NextResponse.json({ success: true, article: createdLocal, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Fatal error submitting public news' 
    }, { status: 500 });
  }
}
