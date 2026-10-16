/**
 * Storage Service:
 * 1. Private Gallery: Client-side IndexedDB for zero server cost and maximum user privacy.
 * 2. Public Community Feed: Local storage synced feed with 30-day auto-expiration (TTL).
 */

const DB_NAME = 'psychlens_db';
const DB_VERSION = 1;
const STORE_NAME = 'vault_items';
const PUBLIC_FEED_KEY = 'psychlens_public_feed_v1';

// Seed sample public community items to show the vision immediately
const SEED_PUBLIC_ITEMS = [
  {
    id: 'seed-1',
    title: 'Late Night Train Reflections',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 27, // 27 days left
    likes: 42,
    userLiked: false,
    analysis: {
      overview: 'A solitary commuter seated beside a rain-streaked window under fluorescent transit lighting.',
      mood: {
        primary: 'Introspective & Contemplative',
        atmosphere: 'Nocturnal Solitude',
        tensionScore: 4, // 1 to 10
        energyLevel: 'Low / Passive'
      },
      psychologicalSubtext: 'The downward gaze and relaxed shoulders indicate mental fatigue combined with emotional detachment. Transit spaces ("liminal spaces") often trigger existential reflection and self-evaluation.',
      artisticPsychology: 'Cool cyan tones contrast with amber station lights outside, visually symbolizing the barrier between the subject’s inner quiet and the moving world.',
      reflectionPrompt: 'What parts of your everyday journey do you use to decompress without realizing it?'
    }
  },
  {
    id: 'seed-2',
    title: 'The Confessional Lens',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, // 6 days ago
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 24, // 24 days left
    likes: 89,
    userLiked: true,
    analysis: {
      overview: 'Close-up portrait with direct eye contact, subtle asymmetric brow furrow, and warm side-lighting.',
      mood: {
        primary: 'Vulnerable & Resolute',
        atmosphere: 'Raw Emotional Exposure',
        tensionScore: 7,
        energyLevel: 'Medium / Focused'
      },
      psychologicalSubtext: 'Direct unbroken eye contact conveys honesty and an implicit demand for emotional reciprocity. The micro-expression of slight mouth tightening indicates unspoken hesitance or vulnerability.',
      artisticPsychology: 'Chiaroscuro side-lighting creates deep shadows, representing the conscious split between what is shared and what remains guarded.',
      reflectionPrompt: 'When was the last time you shared a thought that made you feel completely exposed?'
    }
  }
];

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// IndexedDB Private Vault APIs
export async function saveToPrivateVault(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const vaultItem = {
      ...item,
      id: item.id || 'vault_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: item.timestamp || Date.now(),
    };
    const request = store.put(vaultItem);

    request.onsuccess = () => resolve(vaultItem);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function getPrivateVaultItems() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const items = event.target.result || [];
      // Sort newest first
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(items);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function deleteFromPrivateVault(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Public Community Feed APIs (with 30-Day TTL auto-cleanup)
export function getPublicFeedItems() {
  try {
    const raw = localStorage.getItem(PUBLIC_FEED_KEY);
    let items = raw ? JSON.parse(raw) : SEED_PUBLIC_ITEMS;
    const now = Date.now();

    // Auto cleanup expired posts (> 30 days)
    const validItems = items.filter((item) => item.expiresAt > now);
    if (validItems.length !== items.length) {
      localStorage.setItem(PUBLIC_FEED_KEY, JSON.stringify(validItems));
    }
    return validItems.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error fetching public feed:', err);
    return SEED_PUBLIC_ITEMS;
  }
}

export function saveToPublicFeed(post) {
  try {
    const current = getPublicFeedItems();
    const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;
    const newPost = {
      ...post,
      id: 'pub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: Date.now(),
      expiresAt: Date.now() + thirtyDaysMs,
      likes: 1,
      userLiked: true,
    };
    const updated = [newPost, ...current];
    localStorage.setItem(PUBLIC_FEED_KEY, JSON.stringify(updated));
    return newPost;
  } catch (err) {
    console.error('Error publishing to community feed:', err);
    throw err;
  }
}

export function toggleLikePublicItem(id) {
  try {
    const items = getPublicFeedItems();
    const updated = items.map((item) => {
      if (item.id === id) {
        const userLiked = !item.userLiked;
        return {
          ...item,
          userLiked,
          likes: userLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
        };
      }
      return item;
    });
    localStorage.setItem(PUBLIC_FEED_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error toggling like:', err);
    return getPublicFeedItems();
  }
}

export function getDaysRemaining(expiresAt) {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} ${days === 1 ? 'day' : 'days'} left`;
}

export async function clearPrivateVault() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export const storageService = {
  getPrivateVaultItems,
  saveToPrivateVault,
  deleteFromPrivateVault,
  clearPrivateVault,
  getPublicFeedItems,
  saveToPublicFeed,
  toggleLikePublicItem,
  getDaysRemaining,
};
