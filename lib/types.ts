export type Category = 'general' | 'performance' | 'analytics' | 'hardware';
export type Status = 'new' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
export type SortOrder = 'top' | 'newest';

export interface FeedbackPost {
  id: string;
  title: string;
  body: string;
  category: Category;
  status: Status;
  author_name: string;
  vote_score: number;
  created_at: string;
  viewer_vote?: -1 | 1 | null;
}
