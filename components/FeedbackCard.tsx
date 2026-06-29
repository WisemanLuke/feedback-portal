'use client';

import type { FeedbackPost, Status } from '@/lib/types';
import StatusChip from './StatusChip';
import VoteButtons from './VoteButtons';

const CATEGORY_LABELS: Record<string, string> = {
  general:     'General',
  performance: 'Performance',
  analytics:   'Analytics',
  hardware:    'Hardware',
};

const STATUS_OPTIONS: Status[] = ['new', 'under_review', 'planned', 'in_progress', 'completed', 'declined'];
const STATUS_LABELS: Record<Status, string> = {
  new: 'New', under_review: 'Under Review', planned: 'Planned',
  in_progress: 'In Progress', completed: 'Completed', declined: 'Declined',
};

interface Props {
  post: FeedbackPost;
  onVote: (postId: string, value: 1 | -1) => void;
  votingDisabled: boolean;
  isAdmin: boolean;
  onStatusChange: (postId: string, status: Status) => void;
}

export default function FeedbackCard({ post, onVote, votingDisabled, isAdmin, onStatusChange }: Props) {
  const body = post.body.length > 220 ? `${post.body.slice(0, 220)}…` : post.body;

  return (
    <div className="flex gap-4 bg-white border border-border rounded-lg p-4">
      <VoteButtons
        score={post.vote_score}
        viewerVote={post.viewer_vote ?? null}
        onVote={(v) => onVote(post.id, v)}
        disabled={votingDisabled}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-grey-900 leading-snug">{post.title}</p>
        <p className="text-sm text-grey-700 mt-1 leading-relaxed">{body}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3">
          {isAdmin ? (
            <select
              value={post.status}
              onChange={(e) => onStatusChange(post.id, e.target.value as Status)}
              className="text-xs border border-border rounded px-2 py-0.5 bg-bg text-grey-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          ) : (
            <StatusChip status={post.status} />
          )}
          <span className="text-xs text-grey-300">{CATEGORY_LABELS[post.category]}</span>
          <span className="text-xs text-grey-300">·</span>
          <span className="text-xs text-grey-300">{post.author_name}</span>
          <span className="text-xs text-grey-300">·</span>
          <span className="text-xs text-grey-300">
            {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}
