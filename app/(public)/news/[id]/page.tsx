import { Metadata } from 'next';
import { getDb, Article } from '@/lib/db';
import { memoryArticles } from '@/app/api/articles/store';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { 
  ArrowLeft, AlertCircle
} from 'lucide-react';
import { ArticleDetailClient } from '@/components/article-detail-client';

// Dynamic Metadata Generation for Crawler of Facebook, Twitter, Google, etc.
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  let article: Article | null = null;

  try {
    const { db, isUsingFallback } = await getDb();
    if (!isUsingFallback && db) {
      let query = {};
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { _id: id as any };
      }
      const dbArt = await db.collection('articles').findOne(query);
      if (dbArt) {
        article = { ...dbArt, _id: dbArt._id.toString() } as Article;
      }
    }
  } catch {
    // ignore
  }

  if (!article) {
    article = memoryArticles.find(a => a._id === id) || null;
  }

  if (!article) {
    return {
      title: 'সংবাদ পাওয়া যায়নি - কচুয়া প্রতিদিন',
      description: 'আপনার অনুরোধকৃত খবরটি ডেটাবেজে খুঁজে পাওয়া যায়নি।'
    };
  }

  const cleanDescription = article.content.substring(0, 160).replace(/\r?\n/g, ' ') + '...';

  return {
    title: `${article.title} | কচুয়া প্রতিদিন`,
    description: cleanDescription,
    category: article.category,
    authors: [{ name: article.author }],
    alternates: {
      canonical: `https://kachuaprotidin.com/news/${article._id}`,
    },
    openGraph: {
      title: article.title,
      description: cleanDescription,
      url: `/news/${article._id}`,
      siteName: 'কচুয়া প্রতিদিন',
      images: [
        {
          url: article.imgUrl,
          width: 800,
          height: 450,
          alt: article.title,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: cleanDescription,
      images: [article.imgUrl],
    }
  };
}

export default async function ArticleDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let article: Article | null = null;
  let sourceLabel = '';

  try {
    const { db, isUsingFallback } = await getDb();
    if (!isUsingFallback && db) {
      let query = {};
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { _id: id as any };
      }
      const dbArt = await db.collection('articles').findOne(query);
      if (dbArt) {
        article = { ...dbArt, _id: dbArt._id.toString() } as Article;
        sourceLabel = '🟢 MONGO LIVE';
      }
    }
  } catch {
    // ignore
  }

  if (!article) {
    article = memoryArticles.find(a => a._id === id) || null;
    sourceLabel = '🟡 LOCAL STREAM';
  }

  // Not Found layout
  if (!article) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-gray-800">
        <header className="border-b-[3px] border-red-700 py-6 bg-white shrink-0">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-3xl font-black text-red-700 tracking-tight" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
              কচুয়া প্রতিদিন
            </Link>
            <Link href="/" className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 border border-gray-200 rounded transition-colors text-xs font-bold font-bangla">
              <ArrowLeft className="w-4 h-4" />
              <span>মূল পাতায় যান</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="bg-white border rounded-2xl p-8 shadow-sm space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h2 className="text-xl font-bold font-bangla text-gray-900">সংবাদটি খুঁজে পাওয়া যায়নি!</h2>
            <p className="text-sm text-gray-500 font-bangla leading-relaxed">
              দুঃখিত, আপনি যে খবরটি পড়তে চাইছেন তার কোনো অস্তিত্ব বা সঠিক আইডি নেই। অথবা এটি ডিলিট করা হয়েছে।
            </p>
            <Link href="/" className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded transition-all font-bangla cursor-pointer">
              অন্যান্য খবর পড়ুন
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://kachuaprotidin.com/news/${article._id}`
    },
    "headline": article.title,
    "image": [article.imgUrl],
    "datePublished": article.publishDate || new Date().toISOString(),
    "dateModified": article.publishDate || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author || "নিজস্ব প্রতিবেদক",
      "url": "https://kachuaprotidin.com"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "কচুয়া প্রতিদিন",
      "url": "https://kachuaprotidin.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"
      }
    },
    "description": article.content.substring(0, 160).replace(/\r?\n/g, ' ') + '...'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ArticleDetailClient article={article} sourceLabel={sourceLabel} />
    </>
  );
}
