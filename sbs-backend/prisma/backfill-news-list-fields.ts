/**
 * One-time backfill for the `excerpt` / `coverImage` fields added to
 * NewsPost (see migration 20260715000000_news_list_perf_fields).
 *
 * Existing posts created before this migration will have `excerpt` and
 * `coverImage` set to NULL — this script derives them from each post's
 * blocks and saves them, the same way NewsService.createPost/updatePost
 * do for new/edited posts going forward.
 *
 * Run once, after applying the migration:
 *   npx ts-node prisma/backfill-news-list-fields.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

function deriveListMeta(blocks: any[] = []) {
  const textBlock = blocks.find((b) => b?.type === 'text' && b?.content);
  const imageBlock = blocks.find((b) => b?.type === 'imageRow' && b?.images?.length);
  const plainText = textBlock?.content
    ? String(textBlock.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  return {
    excerpt: plainText ? plainText.slice(0, 280) : null,
    coverImage: imageBlock?.images?.[0]?.src || null,
  };
}

async function main() {
  const posts = await prisma.newsPost.findMany({
    where: { OR: [{ excerpt: null }, { coverImage: null }] },
    include: { blocks: { orderBy: { sortOrder: 'asc' } } },
  });

  console.log(`Found ${posts.length} post(s) needing excerpt/coverImage backfill.`);

  let updated = 0;
  for (const post of posts) {
    const { excerpt, coverImage } = deriveListMeta(post.blocks);
    if (!excerpt && !coverImage) continue; // nothing to backfill for this one
    await prisma.newsPost.update({
      where: { id: post.id },
      data: { excerpt, coverImage },
    });
    updated++;
  }

  console.log(`Backfilled ${updated} post(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
