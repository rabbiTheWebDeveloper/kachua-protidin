import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { memoryAds, updateAd, deleteAd } from '../store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      let query = {};
      try {
        if (ObjectId.isValid(id)) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id as any };
        }
      } catch {
        query = { _id: id as any };
      }

      const ad = await db.collection('ads').findOne(query);
      if (ad) {
        return NextResponse.json({
          success: true,
          ad: { ...ad, _id: ad._id.toString() },
          source: 'mongodb'
        });
      }
    }

    // fallback
    const localAd = memoryAds.find(a => a._id === id);
    if (!localAd) {
      return NextResponse.json({ error: 'বিজ্ঞাপনটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ad: localAd,
      source: 'local_fallback_db'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching ad' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'পরিবর্তন করার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, imgUrl, linkUrl, position, isActive } = body;

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (imgUrl !== undefined) updatedData.imgUrl = imgUrl;
    if (linkUrl !== undefined) updatedData.linkUrl = linkUrl;
    if (position !== undefined) updatedData.position = position;
    if (isActive !== undefined) updatedData.isActive = !!isActive;

    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      let query = {};
      try {
        if (ObjectId.isValid(id)) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id as any };
        }
      } catch {
        query = { _id: id as any };
      }

      const res = await db.collection('ads').findOneAndUpdate(
        query,
        { $set: updatedData },
        { returnDocument: 'after' }
      );

      return NextResponse.json({ success: true, ad: res, source: 'mongodb' });
    }

    // fallback
    const resLocal = updateAd(id, updatedData);
    if (!resLocal) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, ad: resLocal, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error updating ad' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'মুছে ফেলার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      let query = {};
      try {
        if (ObjectId.isValid(id)) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id as any };
        }
      } catch {
        query = { _id: id as any };
      }

      const res = await db.collection('ads').deleteOne(query);
      if (res.deletedCount === 0) {
        return NextResponse.json({ error: 'Ad not found in database' }, { status: 404 });
      }
      return NextResponse.json({ success: true, id, source: 'mongodb' });
    }

    // fallback
    const resLocal = deleteAd(id);
    if (!resLocal) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error deleting ad' }, { status: 500 });
  }
}
