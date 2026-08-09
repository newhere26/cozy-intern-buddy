// Art Institute of Chicago public API (no key required).
// We pull a small, calm gallery of public-domain works to use as
// backdrops behind the companion. Results are cached in localStorage so
// the gallery keeps working offline after the first successful load.

export interface ArtPiece {
  id: string;
  title: string;
  artist: string;
  date: string;
  /** IIIF base image id */
  imageId: string;
  cost: number;
}

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
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;
}

function priceFor(index: number) {
  // gentle ladder: 30 → 170 credits
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
    if (Date.now() - parsed.at > CACHE_TTL) return parsed.pieces; // stale but usable
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
 * Returns the gallery. Uses cache first, then refreshes in the background is
 * not attempted — a single fetch keeps things simple and quiet.
 */
export async function loadGallery(signal?: AbortSignal): Promise<ArtPiece[]> {
  const cached = readCache();
  if (cached) return cached;

  const results = await Promise.allSettled(QUERIES.map((q) => searchOne(q, signal)));
  const seen = new Set<string>();
  const pieces: ArtPiece[] = [];

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
        cost: 0,
      });
    });
  });

  if (!pieces.length) throw new Error("no artwork");

  const gallery = pieces
    .slice(0, 16)
    .map((p, i) => ({ ...p, cost: priceFor(i) }));

  writeCache(gallery);
  return gallery;
}

/** Owned pieces resolve from cache so the backdrop renders instantly. */
export function galleryFromCache(): ArtPiece[] {
  return readCache() ?? [];
}
