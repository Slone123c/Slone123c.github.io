import { getCollection } from 'astro:content';

export async function getPosts() {
  const posts = await getCollection('blog');
  const oldestFirst = [...posts].sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
  return oldestFirst
    .map((post, index) => ({
      post,
      no: String(index + 1).padStart(3, '0'),
      minutes: Math.max(1, Math.round((post.body?.length ?? 0) / 400)),
      date: post.data.pubDate.toISOString().slice(0, 10),
    }))
    .reverse();
}
