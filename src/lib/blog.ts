import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { publicationDate, headingId } from "./dates";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  modified: string | null;
  excerpt: string;
  coverImage: string;
  topic: string;
};
const directory = path.join(process.cwd(), "posts");
export function readPost(slug: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) throw new Error("Invalid slug");
  const { data, content } = matter(
    fs.readFileSync(path.join(directory, slug + ".mdx"), "utf8")
  );
  const meta: PostMeta = {
    slug,
    title: data.title,
    date: publicationDate(data.date),
    modified: data.modified ? publicationDate(data.modified) : null,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    topic: data.topic || "Studio journal",
  };
  // The page supplies the sole h1 and an automatically linked contents list.
  const body = content
    .replace(/^# .*\r?\n/m, "")
    .replace(/## Table of Contents[\s\S]*?(?=\n## (?!Table))/m, "");
  const toc = [...body.matchAll(/^## ([^\n]+)/gm)].map((m) => ({
    title: m[1].replace(/\*|\[|\]|\([^)]*\)/g, "").trim(),
    id: headingId(m[1]),
  }));
  return { meta, body, toc };
}
export function allPosts(): PostMeta[] {
  return fs
    .readdirSync(directory)
    .filter((n) => n.endsWith(".mdx"))
    .map((n) => readPost(n.slice(0, -4)).meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}
/** Stable heading IDs, including repeated headings, for existing and generated links. */
export function remarkHeadingIds() {
  return (tree: any) => {
    const used = new Map<string, number>();
    function text(node: any): string {
      return node.value || node.children?.map(text).join("") || "";
    }
    function visit(node: any) {
      if (node.type === "heading") {
        const id = headingId(text(node));
        const count = used.get(id) || 0;
        used.set(id, count + 1);
        node.data = {
          ...node.data,
          hProperties: {
            ...node.data?.hProperties,
            id: count ? `${id}-${count}` : id,
          },
        };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
