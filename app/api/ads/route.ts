import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { Ad, memoryAds, addAd, INITIAL_ADS } from './store';

export async function GET(req: NextRequest) {
  try {
    const { db, isUsingFallback } = await getDb();
    
    if (!isUsingFallback && db) {
      const ads = await db.collection('ads').find({}).toArray();
      // If collection is empty, seed it with the default sidebar ad
      if (ads.length === 0) {
        const mongoDocs = INITIAL_ADS.map(({ _id, ...rest }) => ({ ...rest }));
        await db.collection('ads').insertMany(mongoDocs as any);
        const seeded = await db.collection('ads').find({}).toArray();
        return NextResponse.json({
          ads: seeded.map(ad => ({ ...ad, _id: ad._id.toString() })),
          source: 'mongodb'
        });
      }
      return NextResponse.json({ 
        ads: ads.map(ad => ({ ...ad, _id: ad._id.toString() })),
        source: 'mongodb' 
      });
    }

    return NextResponse.json({ 
      ads: memoryAds, 
      source: 'local_fallback_db' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching ads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'অননুমোদিত প্রবেশাধিকার! কাজটির জন্য দয়া করে লগইন করুন।' }, { status: 401 });
    }

    const body = await req.json();
    const { title, imgUrl, linkUrl, position, isActive } = body;

    if (!title || !imgUrl || !linkUrl || !position) {
      return NextResponse.json({ error: 'Title, imgUrl, linkUrl, and position are required' }, { status: 452 });
    }

    const { db, isUsingFallback } = await getDb();
    const newAdSeed = {
      title,
      imgUrl,
      linkUrl,
      position,
      isActive: isActive !== false,
      createdAt: new Date().toISOString()
    };

    if (!isUsingFallback && db) {
      const res = await db.collection('ads').insertOne(newAdSeed);
      const inserted = {
        ...newAdSeed,
        _id: res.insertedId.toString()
      };
      return NextResponse.json({ success: true, ad: inserted, source: 'mongodb' });
    }

    // fallback
    const createdLocal = addAd(newAdSeed);
    return NextResponse.json({ success: true, ad: createdLocal, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error creating ad' }, { status: 500 });
  }
}
