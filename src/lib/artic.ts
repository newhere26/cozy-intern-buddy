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
    id: "water-lilies",
    title: "Water Lilies",
    artist: "Claude Monet",
    date: "1906",
    imageId: "/art/water-lilies.jpg",
    cost: 0,
  },
  {
    id: "starry-sky",
    title: "Starry Night Realm",
    artist: "Vincent van Gogh",
    date: "1889",
    imageId: "/art/starry-sky.jpg",
    cost: 30,
  },
  {
    id: "great-wave",
    title: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    date: "c. 1831",
    imageId: "/art/great-wave.jpg",
    cost: 40,
  },
  {
    id: "wheat-field",
    title: "Wheatfield with Cypresses",
    artist: "Vincent van Gogh",
    date: "1889",
    imageId: "/art/wheat-field.jpg",
    cost: 50,
  },
  {
    id: "cozy-garden",
    title: "Blooming Sanctuary",
    artist: "Claude Monet",
    date: "1895",
    imageId: "/art/cozy-garden.jpg",
    cost: 60,
  },
  {
    id: "boulevard-montmartre",
    title: "Boulevard Montmartre, Afternoon",
    artist: "Camille Pissarro",
    date: "1897",
    imageId: "/art/boulevard-montmartre.jpg",
    cost: 70,
  },
  {
    id: "misty-forest",
    title: "Misty Morning Woodlands",
    artist: "Quiet Nature",
    date: "Serene Studio",
    imageId: "/art/misty-forest.jpg",
    cost: 80,
  },
  {
    id: "classic-oil",
    title: "Sunset over Tranquil Waters",
    artist: "J. M. W. Turner",
    date: "1840",
    imageId: "/art/classic-oil.jpg",
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
