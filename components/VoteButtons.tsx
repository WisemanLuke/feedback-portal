'use client';

interface Props {
  score: number;
  viewerVote: -1 | 1 | null;
  onVote: (value: 1 | -1) => void;
  disabled?: boolean;
}

export default function VoteButtons({ score, viewerVote, onVote, disabled }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[2rem]">
      <button
        disabled={disabled}
        onClick={() => onVote(1)}
        aria-label="Upvote"
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
          viewerVote === 1
            ? 'bg-brand/15 text-brand'
            : 'text-grey-300 hover:text-brand hover:bg-brand/10'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <svg width="10" height="7" viewBox="0 0 10 7" fill="currentColor">
          <path d="M5 0L10 7H0L5 0Z" />
        </svg>
      </button>
      <span className={`text-sm font-semibold tabular-nums ${score > 0 ? 'text-brand' : score < 0 ? 'text-red-500' : 'text-grey-700'}`}>
        {score}
      </span>
      <button
        disabled={disabled}
        onClick={() => onVote(-1)}
        aria-label="Downvote"
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
          viewerVote === -1
            ? 'bg-grey-800/10 text-grey-800'
            : 'text-grey-300 hover:text-grey-700 hover:bg-grey-800/5'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <svg width="10" height="7" viewBox="0 0 10 7" fill="currentColor">
          <path d="M5 7L0 0H10L5 7Z" />
        </svg>
      </button>
    </div>
  );
}
