import type { MetadataRoute } from "next";
import { CHAPTERS } from "@/content/book";
import { CHAPTER_CONTENT } from "@/content/chapters";

export const dynamic = "force-static";

const ORIGIN = "https://rfm.shannon.id";

// Only chapters with written content: the chapter route 404s the rest.
export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = CHAPTERS.filter((c) => CHAPTER_CONTENT[c.slug]).map((c) => `/chapters/${c.slug}/`);
  return ["/", "/chapters/", "/sources/", ...chapters].map((path) => ({ url: `${ORIGIN}${path}` }));
}
