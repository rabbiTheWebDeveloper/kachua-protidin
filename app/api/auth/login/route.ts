import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUser, hashPassword, createToken } from '@/lib/auth-store';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'রজিষ্ট্রেশন মেল বা ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন' },
        { status: 400 }
      );
    }

    const user = await findUser(identifier);
    if (!user) {
      return NextResponse.json(
        { error: 'এই ব্যবহারকারীর অ্যাকাউন্টের কোনো অস্তিত্ব পাওয়া যায়নি' },
        { status: 401 }
      );
    }

    const hashedInput = hashPassword(password);
    if (user.password !== hashedInput) {
      return NextResponse.json(
        { error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন' },
        { status: 401 }
      );
    }

    // Generate token
    const token = createToken({
      userId: user._id,
      username: user.username,
      email: user.email,
      name: user.name
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('kachua_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 24 * 60 * 60 // 1 day
    });

    return NextResponse.json({
      success: true,
      message: 'সফলভাবে লগইন হয়েছে',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'সার্ভার সংযোগ সমস্যা' },
      { status: 500 }
    );
  }
}
