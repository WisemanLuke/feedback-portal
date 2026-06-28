'use client';

interface Props {
  score: number;
  viewerVote: -1 | 1 | null;
  onVote: (value: 1 | -1) => void;
  disabled?: boolean;
}

export default function VoteButtons({ score, viewerVote, onVote, disabled }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[2.5rem]">
      <button
        disabled={disabled}
        onClick={() => onVote(1)}
        className={`text-lg leading-none transition-colors ${
          viewerVote === 1 ? 'text-brand' : 'text-gray-300 hover:text-brand'
        } disabled:opacity-40`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="text-sm font-semibold text-gray-700">{score}</span>
      <button
        disabled={disabled}
        onClick={() => onVote(-1)}
        className={`text-lg leading-none transition-colors ${
          viewerVote === -1 ? 'text-gray-700' : 'text-gray-300 hover:text-gray-700'
        } disabled:opacity-40`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
