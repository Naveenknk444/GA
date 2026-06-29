import { supabase } from '@/lib/supabase';

export type PostSummary = {
  id: string;
  category: 'discussion' | 'support' | 'milestone';
  title: string;
  body: string;
  created_at: string;
  profiles: { handle: string } | null;
  comments: { id: string }[];
};

export type PostDetail = {
  id: string;
  category: 'discussion' | 'support' | 'milestone';
  title: string;
  body: string;
  created_at: string;
  profiles: { handle: string } | null;
};

export type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  profiles: { handle: string } | null;
};

export async function fetchPosts(): Promise<PostSummary[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, category, title, body, created_at, profiles(handle), comments(id)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PostSummary[];
}

export async function fetchPostById(
  id: string,
): Promise<{ post: PostDetail; comments: CommentRow[] } | null> {
  const [postRes, commentsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, category, title, body, created_at, profiles(handle)')
      .eq('id', id)
      .single(),
    supabase
      .from('comments')
      .select('id, body, created_at, profiles(handle)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (postRes.error || !postRes.data) return null;
  return {
    post: postRes.data as unknown as PostDetail,
    comments: (commentsRes.data ?? []) as unknown as CommentRow[],
  };
}

export async function addComment(postId: string, authorId: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, body });
  if (error) throw error;
}

export async function createPost(
  authorId: string,
  category: 'discussion' | 'support' | 'milestone',
  title: string,
  body: string,
): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .insert({ author_id: authorId, category, title, body });
  if (error) throw error;
}
