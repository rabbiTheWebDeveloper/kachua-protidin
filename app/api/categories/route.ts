import { NextRequest, NextResponse } from 'next/server';
import { getDb, INITIAL_CATEGORIES, Category } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';

let memoryCategories = [...INITIAL_CATEGORIES];

export async function GET(req: NextRequest) {
  try {
    const { db, isUsingFallback } = await getDb();
    
    if (!isUsingFallback && db) {
      const categories = await db.collection('categories').find({}).toArray();
      if (categories.length === 0) {
        await db.collection('categories').insertMany(INITIAL_CATEGORIES as any);
        const seeded = await db.collection('categories').find({}).toArray();
        return NextResponse.json({
          categories: seeded.map(c => ({ ...c, _id: c._id.toString() })),
          source: 'mongodb'
        });
      }
      return NextResponse.json({ 
        categories: categories.map(c => ({ ...c, _id: c._id.toString() })),
        source: 'mongodb' 
      });
    }

    return NextResponse.json({ 
      categories: memoryCategories, 
      source: 'local_fallback_db' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const { db, isUsingFallback } = await getDb();
    const newCategory = { name, slug, isActive: isActive !== false };

    if (!isUsingFallback && db) {
      const res = await db.collection('categories').insertOne(newCategory);
      return NextResponse.json({ success: true, category: { ...newCategory, _id: res.insertedId.toString() }, source: 'mongodb' });
    }

    // fallback
    const newCatFallback = { ...newCategory, _id: 'cat-' + Date.now() };
    memoryCategories.unshift(newCatFallback);

    return NextResponse.json({ success: true, category: newCatFallback, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error creating category' }, { status: 500 });
  }
}
