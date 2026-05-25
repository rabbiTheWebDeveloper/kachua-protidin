import { MetadataRoute } from 'next';
import { dbService } from '@/lib/services/dbService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kachuaprotidin.com';

  // 1. Core static pages
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit-news`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  // 2. Fetch all published articles for indexing individual news pages
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await dbService.getArticles();
    articleRoutes = articles.map((article) => {
      const publishDate = article.publishDate ? new Date(article.publishDate) : new Date();
      return {
        url: `${baseUrl}/news/${article._id}`,
        lastModified: publishDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error('[Sitemap Generator] Error fetching articles for sitemap:', error);
  }

  return [...staticRoutes, ...articleRoutes];
}
