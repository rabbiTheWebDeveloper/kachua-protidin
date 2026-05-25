import { Article, INITIAL_ARTICLES } from '@/lib/db';

export let memoryArticles: Article[] = [...INITIAL_ARTICLES];

export function resetArticles() {
  memoryArticles = [...INITIAL_ARTICLES];
}

export function addArticle(article: Omit<Article, '_id'> & { _id?: string }) {
  const newArticle: Article = {
    ...article,
    _id: article._id || `local-${Date.now()}`
  };
  memoryArticles.unshift(newArticle);
  return newArticle;
}

export function updateArticle(id: string, updated: Partial<Article>) {
  const index = memoryArticles.findIndex(a => a._id === id);
  if (index !== -1) {
    memoryArticles[index] = { ...memoryArticles[index], ...updated };
    return memoryArticles[index];
  }
  return null;
}

export function deleteArticle(id: string) {
  const index = memoryArticles.findIndex(a => a._id === id);
  if (index !== -1) {
    const deleted = memoryArticles[index];
    memoryArticles.splice(index, 1);
    return deleted;
  }
  return null;
}
