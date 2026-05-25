import { NextRequest, NextResponse } from 'next/server';
import { getDb, INITIAL_ARTICLES } from '@/lib/db';
import { resetArticles } from '../store';

export async function POST(req: NextRequest) {
  try {
    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      // Clear database articles completely
      await db.collection('articles').deleteMany({});
      // Reconstitute initial seed articles in MongoDB
      const mongoDocs = INITIAL_ARTICLES.map(({ _id, ...rest }) => ({
        ...rest
      }));
      await db.collection('articles').insertMany(mongoDocs as any);
      return NextResponse.json({ success: true, source: 'mongodb' });
    }

    // fallback
    resetArticles();
    return NextResponse.json({ success: true, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error resetting articles' }, { status: 500 });
  }
}
