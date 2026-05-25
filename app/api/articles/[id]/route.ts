import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';
import { memoryArticles, updateArticle, deleteArticle } from '../store';

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
          // If the ID isn't a valid ObjectId format, search by string ID (e.g. for seed data fallback keys)
          query = { _id: id as any };
        }
      } catch {
        query = { _id: id as any };
      }

      const article = await db.collection('articles').findOne(query);
      if (article) {
        return NextResponse.json({
          success: true,
          article: { ...article, _id: article._id.toString() },
          source: 'mongodb'
        });
      }
    }

    // fallback / in-memory lookup
    const localArticle = memoryArticles.find(a => a._id === id);
    if (!localArticle) {
      return NextResponse.json({ error: 'এই খবরটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      article: localArticle,
      source: 'local_fallback_db'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching article' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'পরিবর্তন করার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, category, imgUrl, author, isLead, isSub, publishDate } = body;

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (content !== undefined) updatedData.content = content;
    if (category !== undefined) updatedData.category = category;
    if (imgUrl !== undefined) updatedData.imgUrl = imgUrl;
    if (author !== undefined) updatedData.author = author;
    if (isLead !== undefined) updatedData.isLead = !!isLead;
    if (isSub !== undefined) updatedData.isSub = !!isSub;
    if (publishDate !== undefined) updatedData.publishDate = publishDate;

    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      if (updatedData.isLead) {
        await db.collection('articles').updateMany({ _id: { $ne: new ObjectId(id) } }, { $set: { isLead: false } });
      }

      const res = await db.collection('articles').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedData },
        { returnDocument: 'after' }
      );

      return NextResponse.json({ success: true, article: res, source: 'mongodb' });
    }

    // fallback
    const resLocal = updateArticle(id, updatedData);
    if (!resLocal) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, article: resLocal, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error updating article' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'মুছে ফেলার জন্য লগইন করা আবশ্যক!' }, { status: 401 });
    }

    const { id } = await params;
    const { db, isUsingFallback } = await getDb();

    if (!isUsingFallback && db) {
      const res = await db.collection('articles').deleteOne({ _id: new ObjectId(id) });
      if (res.deletedCount === 0) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, id, source: 'mongodb' });
    }

    // fallback
    const resLocal = deleteArticle(id);
    if (!resLocal) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error deleting article' }, { status: 500 });
  }
}
