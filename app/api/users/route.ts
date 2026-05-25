import { NextRequest, NextResponse } from 'next/server';
import { getDb, INITIAL_USERS, AppUser } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';

let memoryUsers = [...INITIAL_USERS];

export async function GET(req: NextRequest) {
  try {
    const { db, isUsingFallback } = await getDb();
    
    if (!isUsingFallback && db) {
      const users = await db.collection('users').find({}).toArray();
      if (users.length === 0) {
        await db.collection('users').insertMany(INITIAL_USERS as any);
        const seeded = await db.collection('users').find({}).toArray();
        return NextResponse.json({
          users: seeded.map(u => ({ ...u, _id: u._id.toString() })),
          source: 'mongodb'
        });
      }
      return NextResponse.json({ 
        users: users.map(u => ({ ...u, _id: u._id.toString() })),
        source: 'mongodb' 
      });
    }

    return NextResponse.json({ 
      users: memoryUsers, 
      source: 'local_fallback_db' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error fetching users' }, { status: 500 });
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
    const { username, name, role, isActive } = body;

    if (!username || !name || !role) {
      return NextResponse.json({ error: 'Username, name and role are required' }, { status: 400 });
    }

    const { db, isUsingFallback } = await getDb();
    const newUser = { username, name, role, isActive: isActive !== false };

    if (!isUsingFallback && db) {
      const res = await db.collection('users').insertOne(newUser);
      return NextResponse.json({ success: true, user: { ...newUser, _id: res.insertedId.toString() }, source: 'mongodb' });
    }

    // fallback
    const newUserFallback = { ...newUser, _id: 'usr-' + Date.now() };
    memoryUsers.unshift(newUserFallback as AppUser);

    return NextResponse.json({ success: true, user: newUserFallback, source: 'local_fallback_db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fatal error creating user' }, { status: 500 });
  }
}
