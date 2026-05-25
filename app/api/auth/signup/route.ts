import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth-store';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, name } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'রজিষ্ট্রেশনের জন্য ব্যবহারকারীর নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'পাসওয়ার্ড অত্যন্ত ছোট! কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন' },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      username,
      email,
      password,
      name: name || 'সহকারী সম্পাদক'
    });

    if (!newUser) {
      return NextResponse.json(
        { error: 'অ্যাকাউন্ট তৈরি করা যায়নি' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'রেজিস্ট্রেশন সফল হয়েছে!',
      user: {
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'একটি ত্রুটি ঘটেছে' },
      { status: 400 }
    );
  }
}
