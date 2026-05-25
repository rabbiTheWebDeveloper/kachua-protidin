import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { memoryArticles } from '../store';

function getArticleDate(art: any): Date {
  if (art.publishDate) {
    try {
      const d = new Date(art.publishDate);
      if (!isNaN(d.getTime())) {
        return d;
      }
    } catch {
      // ignore
    }
  }
  if (art._id) {
    try {
      if (ObjectId.isValid(art._id)) {
        return new ObjectId(art._id).getTimestamp();
      }
    } catch {
      // ignore
    }
  }
  // Default to May 24, 2026 for original seed data
  return new Date('2026-05-24T06:00:00.000Z');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const { db, isUsingFallback } = await getDb();
    let rawArticles: any[] = [];
    let source = 'local_fallback_db';

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
      source = 'mongodb';
    } else {
      rawArticles = [...memoryArticles];
    }

    // Map each article with its established Date object
    const articlesWithDates = rawArticles.map(art => ({
      ...art,
      computedDate: getArticleDate(art)
    }));

    // Generate unique years and months for archive sidebar/dropdown selector UI
    const filtersMap: { [year: number]: Set<number> } = {};
    articlesWithDates.forEach(art => {
      const d = art.computedDate;
      const yr = d.getFullYear(); // 1-indexed (e.g., 2026)
      const mth = d.getMonth() + 1; // 1-indexed (1 to 12)
      if (!filtersMap[yr]) {
        filtersMap[yr] = new Set<number>();
      }
      filtersMap[yr].add(mth);
    });

    const availableFilters = Object.keys(filtersMap)
      .map(Number)
      .sort((a, b) => b - a)
      .map(yr => ({
        year: yr,
        months: Array.from(filtersMap[yr]).sort((a, b) => b - a)
      }));

    // Determine target year and month filter
    // Default to the latest available year/month if not passed
    let selectedYear = yearParam ? parseInt(yearParam, 10) : null;
    let selectedMonth = monthParam ? parseInt(monthParam, 10) : null;

    if (!selectedYear || isNaN(selectedYear) || !selectedMonth || isNaN(selectedMonth)) {
      if (availableFilters.length > 0) {
        selectedYear = availableFilters[0].year;
        selectedMonth = availableFilters[0].months[0];
      } else {
        selectedYear = 2026;
        selectedMonth = 5;
      }
    }

    // Filter articles based on designated target year and month
    const filteredArticles = articlesWithDates.filter(art => {
      const artYear = art.computedDate.getFullYear();
      const artMonth = art.computedDate.getMonth() + 1;
      return artYear === selectedYear && artMonth === selectedMonth;
    }).map(({ computedDate, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      articles: filteredArticles,
      availableFilters,
      selectedYear,
      selectedMonth,
      source
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Fatal error fetching archived articles' 
    }, { status: 500 });
  }
}
