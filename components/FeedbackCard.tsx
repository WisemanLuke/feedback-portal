'use client';

import type { FeedbackPost } from '@/lib/types';
import StatusChip from './StatusChip';
import VoteButtons from './VoteButtons';

const CATEGORY_LABELS: Record<string, string> = {
  general:     'General',
  performance: 'Performance',
  analytics:   'Analytics',
  hardware:    'Hardware',
};

interface Props {
  post: FeedbackPost;
  onVote: (postId: string, value: 1 | -1) => void;
  votingDisabled: boolean;
}

export default function FeedbackCard({ post, onVote, votingDisabled }: Props) {
  const body = post.body.length > 200 ? `${post.body.slice(0, 200)}…` : post.body;

  return (
    <div className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <VoteButtons
        score={post.vote_score}
        viewerVote={post.viewer_vote ?? null}
        onVote={(value) => onVote(post.id, value)}
        disabled={votingDisabled}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{post.title}</p>
        <p className="text-sm text-gray-600 mt-1">{body}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-400">
          <StatusChip status={post.status} />
          <span>{CATEGORY_LABELS[post.category]}</span>
          <span>·</span>
          <span>{post.author_name}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
