import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CHAPTERS, chapterBySlug } from "@/content/book";
import { CHAPTER_CONTENT } from "@/content/chapters";
import { ChapterHeader } from "@/components/chapter/ChapterHeader";
import { ChapterNav } from "@/components/chapter/ChapterNav";
import { References } from "@/components/book/References";
import styles from "@/components/chapter/chapter.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const ch = chapterBySlug((await params).slug);
  return ch
    ? { title: `${ch.n}. ${ch.title}`, description: ch.purpose, alternates: { canonical: `/chapters/${ch.slug}/` } }
    : {};
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const ch = chapterBySlug((await params).slug);
  if (!ch) notFound();
  const entry = CHAPTER_CONTENT[ch.slug];
  if (!entry) notFound();
  const { default: Content } = await entry.load();
  return (
    <article className={styles.article}>
      <ChapterHeader chapter={ch} source={entry.file} />
      <div className={styles.body}>
        <Content />
        <References source={entry.file} />
      </div>
      <ChapterNav chapter={ch} />
    </article>
  );
}
