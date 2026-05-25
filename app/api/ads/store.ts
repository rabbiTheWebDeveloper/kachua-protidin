export interface Ad {
  _id: string;
  title: string;
  imgUrl: string;
  linkUrl: string;
  position: 'sidebar' | 'top_banner';
  isActive: boolean;
  createdAt?: string;
}

export const INITIAL_ADS: Ad[] = [
  {
    _id: "default-ad-sidebar",
    title: "কচুয়া প্রতিদিন বিজ্ঞাপন সেবা",
    imgUrl: "https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=600&q=80",
    linkUrl: "mailto:ads@kachuaprotidin.com",
    position: "sidebar",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export let memoryAds: Ad[] = [...INITIAL_ADS];

export function resetAds() {
  memoryAds = [...INITIAL_ADS];
}

export function addAd(ad: Omit<Ad, '_id'> & { _id?: string }) {
  const newAd: Ad = {
    ...ad,
    _id: ad._id || `ad-${Date.now()}`,
    createdAt: ad.createdAt || new Date().toISOString()
  };
  memoryAds.unshift(newAd);
  return newAd;
}

export function updateAd(id: string, updated: Partial<Ad>) {
  const index = memoryAds.findIndex(a => a._id === id);
  if (index !== -1) {
    memoryAds[index] = { ...memoryAds[index], ...updated };
    return memoryAds[index];
  }
  return null;
}

export function deleteAd(id: string) {
  const index = memoryAds.findIndex(a => a._id === id);
  if (index !== -1) {
    const deleted = memoryAds[index];
    memoryAds.splice(index, 1);
    return deleted;
  }
  return null;
}
