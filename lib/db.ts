import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI;

// In-memory fallback database for graceful local state if MONGODB_URI is not supplied yet
export interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  imgUrl: string;
  time: string;
  author: string;
  isLead: boolean;
  isSub: boolean;
  publishDate?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface AppUser {
  _id: string;
  username: string;
  name: string;
  role: 'admin' | 'reporter' | 'editor';
  isActive: boolean;
}

export interface SiteSettings {
  _id: string;
  siteName: string;
  description: string;
  contactEmail: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    youtube: string;
  };
}

export const INITIAL_CATEGORIES: Category[] = [
  { _id: 'cat-1', name: 'বিশেষ সংবাদ', slug: 'special', isActive: true },
  { _id: 'cat-2', name: 'রাজনীতি', slug: 'politics', isActive: true },
  { _id: 'cat-3', name: 'বাংলাদেশ', slug: 'bangladesh', isActive: true },
  { _id: 'cat-4', name: 'অপরাধ', slug: 'crime', isActive: true },
  { _id: 'cat-5', name: 'বিশ্ব', slug: 'world', isActive: true },
  { _id: 'cat-6', name: 'বাণিজ্য', slug: 'business', isActive: true },
  { _id: 'cat-7', name: 'মতামত', slug: 'opinion', isActive: true },
  { _id: 'cat-8', name: 'খেলা', slug: 'sports', isActive: true },
  { _id: 'cat-9', name: 'বিনোদন', slug: 'entertainment', isActive: true },
];

export const INITIAL_USERS: AppUser[] = [
  { _id: 'usr-1', username: 'admin', name: 'প্রধান সম্পাদক', role: 'admin', isActive: true },
  { _id: 'usr-2', username: 'reporter1', name: 'নিজস্ব প্রতিবেদক', role: 'reporter', isActive: true },
];

export const INITIAL_SETTINGS: SiteSettings = {
  _id: 'settings-global',
  siteName: 'কচুয়া প্রতিদিন',
  description: 'বাগেরহাট জেলার কচুয়া উপজেলার স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল।',
  contactEmail: 'info@kachuaprotidin.com',
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com',
  }
};

export const INITIAL_ARTICLES: Article[] = [
  {
    _id: "lead-1",
    title: "কচুয়া পৌরসভায় নতুন মেগা উন্নয়ন প্রকল্পের অনুমোদন, বাজেট বরাদ্দে রেকর্ড",
    content: "স্থানীয় সরকার মন্ত্রণালয়ের অধীনে কচুয়া পৌরসভার বিভিন্ন অবকাঠামো উন্নয়নের জন্য প্রায় ৫০ কোটি টাকার বিশেষ বাজেট বরাদ্দ দেওয়া হয়েছে। এই প্রকল্পের অধীনে রাস্তাঘাট সংস্কার, ড্রেনেজ ব্যবস্থার উন্নয়ন এবং কালভার্ট নির্মাণ অন্তর্ভুক্ত রয়েছে। মেয়র জানান, এই প্রকল্প বাস্তবায়ন হলে পৌর এলাকার দীর্ঘদিনের জলাবদ্ধতা দূর হবে এবং নাগরিক সুবিধা বৃদ্ধি পাবে।",
    category: "বিশেষ সংবাদ",
    imgUrl: "https://picsum.photos/seed/politics3/800/450",
    time: "২ ঘণ্টা আগে",
    author: "নিজস্ব প্রতিবেদক",
    isLead: true,
    isSub: false
  },
  {
    _id: "sub-1",
    title: "কৃষকদের সুবিধার্থে নতুন সার ও বীজ বিতরণ কর্মসূচি শুরু",
    content: "উপজেলা কৃষি সম্প্রসারণ অধিদপ্তরের উদ্যোগে স্থানীয় ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে উন্নত জাতের বীজ এবং ভর্তুকিমূল্যে রাসায়নিক সার বিতরণ শুরু হয়েছে। আজ সকালে উপজেলা মিলনায়তনে এই কর্মসূচির উদ্বোধন করা হয়।",
    category: "বাংলাদেশ",
    imgUrl: "https://picsum.photos/seed/farmers/400/266",
    time: "৩ ঘণ্টা আগে",
    author: "কৃষি প্রতিনিধি",
    isLead: false,
    isSub: true
  },
  {
    _id: "sub-2",
    title: "উপজেলা স্বাস্থ্য কমপ্লেক্সে আধুনিক যন্ত্রপাতি সংযোজন, সেবার মান বৃদ্ধি",
    content: "কচুয়া উপজেলা স্বাস্থ্য কমপ্লেক্সে নতুন আল্ট্রাসনোগ্রাম ও এক্স-রে মেশিন সংযোজন করা হয়েছে। এর ফলে প্রত্যন্ত অঞ্চলের মানুষকে আর জেলা সদরে যেতে হবে না। হাসপাতালের প্রধান জানান, এখন থেকে স্বল্পমূল্যে এই চিকিৎসাসেবা দেওয়া সম্ভব হবে।",
    category: "বাংলাদেশ",
    imgUrl: "https://picsum.photos/seed/med/400/266",
    time: "৫ ঘণ্টা আগে",
    author: "নিজস্ব প্রতিবেদক",
    isLead: false,
    isSub: true
  },
  {
    _id: "sec-1",
    title: "কচুয়া সরকারি কলেজে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত",
    content: "কচুয়া সরকারি কলেজের খেলার মাঠে বার্ষিক ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতার প্রথম পর্ব শেষ হয়েছে। সমাপনী অনুষ্ঠানে বিজয়ীদের হাতে পুরস্কার তুলে দিতে স্থানীয় গণ্যমান্য ব্যক্তিবর্গ উপস্থিত ছিলেন।",
    category: "খেলা",
    imgUrl: "https://picsum.photos/seed/school/400/266",
    time: "৬ ঘণ্টা আগে",
    author: "ক্রীড়া প্রতিনিধি",
    isLead: false,
    isSub: false
  },
  {
    _id: "sec-2",
    title: "গ্রামীণ অর্থনীতি চাঙ্গা করতে ক্ষুদ্র ঋণ বিতরণ শুরু",
    content: "স্থানীয় উদ্যোক্তাদের উৎসাহিত করতে সহজ শর্তে ঋণ দেওয়ার উদ্যোগ নেওয়া হয়েছে। নারী সমাজকে স্বাবলম্বী করতে এই মেগা ঋণে বিশেষ প্রাধান্য দেওয়া হচ্ছে বলে সরকারি সূত্র জানিয়েছে।",
    category: "বাণিজ্য",
    imgUrl: "https://picsum.photos/seed/economy/400/266",
    time: "৮ ঘণ্টা আগে",
    author: "অর্থনীতি প্রতিবেদক",
    isLead: false,
    isSub: false
  },
  {
    _id: "sec-3",
    title: "মহাসড়কে যানজট নিরসনে ট্রাফিক পুলিশের বিশেষ অভিযান",
    content: "কচুয়া বাগেরহাট বাইপাস ও জাতীয় মহাসড়কে যানজট ও অবৈধ পার্কিং নিরসনে পুলিশের যৌথ অভিযান পরিচালিত হয়েছে। ১০টি ফিটনেসবিহীন গাড়ি জব্দ করা হয়েছে এবং জরিমানা করা হয়েছে।",
    category: "বাংলাদেশ",
    imgUrl: "https://picsum.photos/seed/traffic/400/266",
    time: "১০ ঘণ্টা আগে",
    author: "পুলিশ ব্যুরো",
    isLead: false,
    isSub: false
  }
];

// Lazy initialization of MongoDB
export async function getDb(): Promise<{ db: Db | null; client: MongoClient | null; isUsingFallback: boolean }> {
  if (!MONGODB_URI) {
    return { db: null, client: null, isUsingFallback: true };
  }

  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      });
      await client.connect();
      db = client.db('kachua_protidin');
      console.log('Successfully connected to MongoDB!');
    }
    return { db, client, isUsingFallback: false };
  } catch (error) {
    console.error('Failed to connect to MongoDB, falling back', error);
    return { db: null, client: null, isUsingFallback: true };
  }
}
