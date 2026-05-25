import { NextRequest, NextResponse } from 'next/server';
import { getDb, INITIAL_SETTINGS, SiteSettings } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';

let memorySettings = { ...INITIAL_SETTINGS };

export async function GET(req: NextRequest) {
  try {
    const { db, isUsingFallback } = await getDb();
    
    if (!isUsingFallback && db) {
      const settings = await db.collection('settings').findOne({ _id: 'settings-global' as any });
      if (!settings) {
        await db.collection('settings').insertOne(INITIAL_SETTINGS as any);
        return NextResponse.json({
          settings: INITIAL_SETTINGS,
          source: 'mongodb'
        });
      }
      return NextResponse.json({ 
        settings,
        source: 'mongodb' 
      });
    }

    return NextResponse.json({ 
      settings: memorySettings, 
      source: 'local_fallback_db' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { siteName, description, contactEmail, socialLinks } = body;

    const { db, isUsingFallback } = await getDb();
    const updatedSettings = {
      _id: 'settings-global',
      siteName: siteName || memorySettings.siteName,
      description: description || memorySettings.description,
      contactEmail: contactEmail || memorySettings.contactEmail,
      socialLinks: socialLinks || memorySettings.socialLinks
    };

    if (!isUsingFallback && db) {
      await db.collection('settings').updateOne(
        { _id: 'settings-global' as any },
        { $set: updatedSettings },
        { upsert: true }
      );
      return NextResponse.json({ success: true, settings: updatedSettings, source: 'mongodb' });
    }

    // fallback
    memorySettings = { ...updatedSettings };

    return NextResponse.json({ success: true, settings: memorySettings, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error updating settings' }, { status: 500 });
  }
}
