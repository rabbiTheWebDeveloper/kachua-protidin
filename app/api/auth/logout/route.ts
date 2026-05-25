import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('kachua_session');
    
    return NextResponse.json({
      success: true,
      message: 'লগ-আউট সফল হয়েছে'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'লগআউট করা যায়নি' },
      { status: 500 }
    );
  }
}
