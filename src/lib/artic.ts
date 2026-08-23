// Art Institute of Chicago public API (no key required).
// We pull a small, calm gallery of public-domain works to use as
// backdrops behind the companion. Results are cached in localStorage so
// the gallery keeps working offline after the first successful load.

export interface ArtPiece {
  id: string;
  title: string;
  artist: string;
  date: string;
  /** IIIF base image id or direct URL */
  imageId: string;
  cost: number;
}

export const CURATED_ARTWORKS: ArtPiece[] = [
  {
    id: "14572",
    title: "Water Lilies",
    artist: "Claude Monet",
    date: "1906",
    imageId: "3c27b499-af56-f0d5-9aa1-504d23eb899b",
    cost: 0,
  },
  {
    id: "16568",
    title: "The Bedroom",
    artist: "Vincent van Gogh",
    date: "1889",
    imageId: "25c31d8d-21a4-9ea1-1d73-6a4ced8d7088",
    cost: 30,
  },
  {
    id: "27992",
    title: "A Sunday on La Grande Jatte",
    artist: "Georges Seurat",
    date: "1884–1886",
    imageId: "2d484387-ede2-390d-25b6-37ab8112d06b",
    cost: 40,
  },
  {
    id: "20684",
    title: "Cliff Walk at Pourville",
    artist: "Claude Monet",
    date: "1882",
    imageId: "f7f6cfb3-96b0-7389-fa9a-5ca07c4273fa",
    cost: 50,
  },
  {
    id: "28560",
    title: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    date: "c. 1830–1832",
    imageId: "1699994c-8514-be74-5e13-2df600b65f3f",
    cost: 60,
  },
  {
    id: "43849",
    title: "Paris Street; Rainy Day",
    artist: "Gustave Caillebotte",
    date: "1877",
    imageId: "0c7d4133-c823-3b68-e565-d7f4749f7e59",
    cost: 70,
  },
  {
    id: "24645",
    title: "Stack of Wheat",
    artist: "Claude Monet",
    date: "1890–1891",
    imageId: "82ef2fbf-25c1-3fcf-847e-d3ae2e8f1b62",
    cost: 80,
  },
  {
    id: "86385",
    title: "Starry Night and the Astronauts",
    artist: "Alma Thomas",
    date: "1972",
    imageId: "b3fa47d4-8d96-c678-bfa9-e58f0dd8cc8e",
    cost: 90,
  },
];

const CACHE_KEY = "serenity.artGallery.v1";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 14; // two weeks

/** Calm, well-known public-domain works: landscapes, night scenes, quiet still lifes. */
const QUERIES = [
  "moonlight landscape",
  "starry night sky painting",
  "quiet river landscape",
  "water lilies",
  "snow winter landscape",
  "sunrise seascape",
  "wildflowers still life",
  "garden path painting",
];

const BASE = "https://api.artic.edu/api/v1/artworks/search";
const FIELDS = "id,title,artist_title,date_display,image_id";

export function artImageUrl(imageId: string, width = 843) {
  if (!imageId) return "";
  if (imageId.startsWith("http://") || imageId.startsWith("https://") || imageId.startsWith("/")) {
    return imageId;
  }
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;
}

function priceFor(index: number) {
  return 30 + index * 10;
}

interface CacheShape {
  at: number;
  pieces: ArtPiece[];
}

function readCache(): ArtPiece[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed?.pieces?.length) return null;
    if (Date.now() - parsed.at > CACHE_TTL) return parsed.pieces;
    return parsed.pieces;
  } catch {
    return null;
  }
}

function writeCache(pieces: ArtPiece[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), pieces } satisfies CacheShape));
  } catch {
    /* ignore */
  }
}

async function searchOne(q: string, signal?: AbortSignal) {
  const url = `${BASE}?q=${encodeURIComponent(q)}&limit=4&fields=${FIELDS}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`artic ${res.status}`);
  const json = (await res.json()) as {
    data?: Array<{
      id: number;
      title?: string;
      artist_title?: string | null;
      date_display?: string | null;
      image_id?: string | null;
    }>;
  };
  return json.data ?? [];
}

/**
 * Returns the gallery. Combines curated defaults with live search results or cache.
 */
export async function loadGallery(signal?: AbortSignal): Promise<ArtPiece[]> {
  const cached = readCache();
  if (cached && cached.length) return galleryFromCache();

  try {
    const results = await Promise.allSettled(QUERIES.map((q) => searchOne(q, signal)));
    const seen = new Set<string>(CURATED_ARTWORKS.map((a) => a.id));
    const pieces: ArtPiece[] = [...CURATED_ARTWORKS];

    results.forEach((r) => {
      if (r.status !== "fulfilled") return;
      r.value.forEach((item) => {
        const id = String(item.id);
        if (!item.image_id || seen.has(id)) return;
        seen.add(id);
        pieces.push({
          id,
          title: item.title || "Untitled",
          artist: item.artist_title || "Unknown artist",
          date: item.date_display || "",
          imageId: item.image_id,
          cost: priceFor(pieces.length),
        });
      });
    });

    const gallery = pieces.slice(0, 24);
    writeCache(gallery);
    return gallery;
  } catch {
    return CURATED_ARTWORKS;
  }
}

/** Owned and curated pieces resolve from cache/curated list so the backdrop renders instantly. */
export function galleryFromCache(): ArtPiece[] {
  const cached = readCache();
  if (!cached || cached.length === 0) {
    return CURATED_ARTWORKS;
  }
  const map = new Map<string, ArtPiece>();
  CURATED_ARTWORKS.forEach((p) => map.set(p.id, p));
  cached.forEach((p) => map.set(p.id, p));
  return Array.from(map.values());
}

/** Resolves any art piece by ID instantly */
export function getArtPiece(id: string | undefined): ArtPiece | undefined {
  if (!id) return undefined;
  return galleryFromCache().find((a) => a.id === id) ?? CURATED_ARTWORKS.find((a) => a.id === id);
}
