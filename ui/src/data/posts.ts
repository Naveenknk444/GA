/**
 * Mock community posts for the UI phase (stands in for the api/ + Supabase layer).
 * Note every author is just "Member" — the anonymity principle, in the data itself.
 */

export type Reply = {
  id: string;
  author: string;
  timeAgo: string;
  body: string;
  likes: number;
};

export type Post = {
  id: string;
  author: string;
  timeAgo: string;
  category: 'Discussion' | 'Support' | 'Milestone';
  title: string;
  body: string;
  likes: number;
  color: string; // avatar color
  replies: Reply[];
};

export const POSTS: Post[] = [
  {
    id: 'rough-night',
    author: 'Member',
    timeAgo: '35 min ago',
    category: 'Discussion',
    title: 'Having a rough night',
    body: 'Just feeling really restless and thinking about gambling. Could use some support right now. Thank you.',
    likes: 18,
    color: '#9B8CFF',
    replies: [
      { id: 'r1', author: 'Member', timeAgo: '30 min ago', body: "I've been there. Take a breath. You don't have to act on it.", likes: 6 },
      { id: 'r2', author: 'Member', timeAgo: '25 min ago', body: 'Call a fellow or go to a meeting. It helps me every time.', likes: 5 },
      { id: 'r3', author: 'Member', timeAgo: '25 min ago', body: "You're stronger than you think. We're here with you.", likes: 7 },
      { id: 'r4', author: 'Member', timeAgo: '20 min ago', body: 'One day at a time. You got this. I believe in you.', likes: 0 },
    ],
  },
];

export function getPost(id: string): Post | undefined {
  return POSTS.find((p) => p.id === id);
}
