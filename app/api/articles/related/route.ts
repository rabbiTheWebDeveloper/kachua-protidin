import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { memoryArticles } from '../store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const excludeId = searchParams.get('excludeId');

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const { db, isUsingFallback } = await getDb();
    let rawArticles: any[] = [];

    if (!isUsingFallback && db) {
      const dbArticles = await db.collection('articles').find({}).sort({ _id: -1 }).toArray();
      // Seed if empty
      if (dbArticles.length === 0) {
        const mongoDocs = memoryArticles.map(({ _id, ...rest }) => ({ ...rest }));
        await db.collection('articles').insertMany(mongoDocs as any);
        const seeded = await db.collection('articles').find({}).sort({ _id: -1 }).toArray();
        rawArticles = seeded.map(a => ({ ...a, _id: a._id.toString() }));
      } else {
        rawArticles = dbArticles.map(a => ({ ...a, _id: a._id.toString() }));
      }
    } else {
      rawArticles = [...memoryArticles];
    }

    // Filter by:
    // 1. Same category
    // 2. Not the current article (excludeId)
    // 3. Already published
    const now = Date.now();
    const relatedArticles = rawArticles
      .filter(art => {
        const matchesCategory = art.category && art.category.toLowerCase().trim() === category.toLowerCase().trim();
        const isNotExcluded = excludeId ? art._id !== excludeId : true;
        const isPublished = !art.publishDate || new Date(art.publishDate).getTime() <= now;
        return matchesCategory && isNotExcluded && isPublished;
      })
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      articles: relatedArticles
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Fatal error fetching related articles' 
    }, { status: 500 });
  }
}
