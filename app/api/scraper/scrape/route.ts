import { NextRequest, NextResponse } from 'next/server';
import { scrapeLatestNews, lastScrapeStatus } from '@/lib/scraper';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: lastScrapeStatus
  });
}

export async function POST(req: NextRequest) {
  try {
    const result = await scrapeLatestNews();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      count: 0, 
      message: error.message || 'Fatal error triggering scraper'
    }, { status: 500 });
  }
}
