import type { Status } from '@/lib/types';

const STYLES: Record<Status, string> = {
  new:          'bg-border text-grey-700',
  under_review: 'bg-blue-50 text-blue-700',
  planned:      'bg-purple-50 text-purple-700',
  in_progress:  'bg-orange-50 text-orange-700',
  completed:    'bg-green-50 text-green-700',
  declined:     'bg-red-50 text-red-600',
};

const LABELS: Record<Status, string> = {
  new:          'New',
  under_review: 'Under Review',
  planned:      'Planned',
  in_progress:  'In Progress',
  completed:    'Completed',
  declined:     'Declined',
};

export default function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
