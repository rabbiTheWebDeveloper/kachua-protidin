import { getDb, INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_USERS, INITIAL_SETTINGS, Article, Category, AppUser, SiteSettings } from '@/lib/db';
import { memoryArticles } from '@/app/api/articles/store';

export const dbService = {
  async getDbSource() {
    const { isUsingFallback } = await getDb();
    return isUsingFallback ? 'local_fallback_db' : 'mongodb';
  },

  async getCounts() {
    try {
      const { db, isUsingFallback } = await getDb();
      if (!isUsingFallback && db) {
        const [newsCount, adsCount, categoriesCount, usersCount] = await Promise.all([
          db.collection('articles').countDocuments(),
          db.collection('ads').countDocuments(),
          db.collection('categories').countDocuments(),
          db.collection('users').countDocuments()
        ]);
        return { news: newsCount, ads: adsCount, categories: categoriesCount, users: usersCount };
      }
      return {
        news: memoryArticles.length || INITIAL_ARTICLES.length,
        ads: 0, // Fallback ads not implemented locally in store
        categories: INITIAL_CATEGORIES.length,
        users: INITIAL_USERS.length
      };
    } catch (err) {
      return { news: 0, ads: 0, categories: 0, users: 0 };
    }
  },

  async getArticles(): Promise<Article[]> {
    try {
      const { db, isUsingFallback } = await getDb();
      if (!isUsingFallback && db) {
        const articles = await db.collection('articles').find({}).sort({ _id: -1 }).toArray();
        if (articles.length === 0) {
          // Initialize if empty
          await db.collection('articles').insertMany(INITIAL_ARTICLES as any);
          const seeded = await db.collection('articles').find({}).sort({ _id: -1 }).toArray();
          return seeded.map(a => ({ ...a, _id: a._id.toString() })) as Article[];
        }
        return articles.map(a => ({ ...a, _id: a._id.toString() })) as Article[];
      }
      return memoryArticles;
    } catch (err) {
      return [];
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { db, isUsingFallback } = await getDb();
      if (!isUsingFallback && db) {
        const categories = await db.collection('categories').find({}).toArray();
        if (categories.length === 0) {
          await db.collection('categories').insertMany(INITIAL_CATEGORIES as any);
          const seeded = await db.collection('categories').find({}).toArray();
          return seeded.map(c => ({ ...c, _id: c._id.toString() })) as Category[];
        }
        return categories.map(c => ({ ...c, _id: c._id.toString() })) as Category[];
      }
      return INITIAL_CATEGORIES;
    } catch (err) {
      return [];
    }
  },

  async getUsers(): Promise<AppUser[]> {
    try {
      const { db, isUsingFallback } = await getDb();
      if (!isUsingFallback && db) {
        const users = await db.collection('users').find({}).toArray();
        if (users.length === 0) {
          await db.collection('users').insertMany(INITIAL_USERS as any);
          const seeded = await db.collection('users').find({}).toArray();
          return seeded.map(u => ({ ...u, _id: u._id.toString() })) as AppUser[];
        }
        return users.map(u => ({ ...u, _id: u._id.toString() })) as AppUser[];
      }
      return INITIAL_USERS;
    } catch (err) {
      return [];
    }
  },

  async getSettings(): Promise<SiteSettings | null> {
    try {
      const { db, isUsingFallback } = await getDb();
      if (!isUsingFallback && db) {
        const settings = await db.collection('settings').findOne({ _id: 'settings-global' as any });
        if (!settings) {
          await db.collection('settings').insertOne(INITIAL_SETTINGS as any);
          return INITIAL_SETTINGS;
        }
        return settings as unknown as SiteSettings;
      }
      return INITIAL_SETTINGS;
    } catch (err) {
      return null;
    }
  },

  async getAds(): Promise<any[]> {
    try {
      const { db, isUsingFallback } = await getDb();
      if (!isUsingFallback && db) {
        const ads = await db.collection('ads').find({}).sort({ _id: -1 }).toArray();
        return ads.map(a => ({ ...a, _id: a._id.toString() }));
      }
      return [];
    } catch (err) {
      return [];
    }
  }
};
