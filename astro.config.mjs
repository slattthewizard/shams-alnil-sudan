import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Real publish/update dates, read straight from blog frontmatter.
// Only pages with a genuine date get <lastmod> — stamping build time on every
// URL makes the hint worthless to crawlers.
const BLOG_DIR = 'src/content/blog';
const lastmodBySlug = new Map();

if (fs.existsSync(BLOG_DIR)) {
  for (const file of fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const fm = raw.split('---')[1] ?? '';
    const pick = key => fm.match(new RegExp(`^${key}:\\s*"?([0-9]{4}-[0-9]{2}-[0-9]{2})`, 'm'))?.[1];
    const date = pick('updatedDate') ?? pick('publishedDate');
    if (date) lastmodBySlug.set(file.replace(/\.md$/, ''), date);
  }
}

export default defineConfig({
  site: 'https://shamsalnil.com',
  integrations: [
    sitemap({
      serialize(item) {
        const slug = item.url.match(/\/blog\/([^/]+)\/$/)?.[1];
        const date = slug && lastmodBySlug.get(slug);
        if (date) item.lastmod = new Date(`${date}T12:00:00Z`).toISOString();
        return item;
      },
    }),
  ],
});
