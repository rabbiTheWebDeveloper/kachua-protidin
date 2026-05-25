import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-store';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kachua_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifyToken(token);
    if (!payload) {
      // Clear invalid token
      cookieStore.delete('kachua_session');
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
        name: payload.name
      }
    });

  } catch (err) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
