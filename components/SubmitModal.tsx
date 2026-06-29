'use client';

import { useState } from 'react';
import type { Category } from '@/lib/types';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'general',     label: 'General' },
  { value: 'performance', label: 'Performance' },
  { value: 'analytics',   label: 'Analytics' },
  { value: 'hardware',    label: 'Hardware' },
];

interface Props {
  onClose: () => void;
  onSubmit: (title: string, body: string, category: Category, authorName: string) => Promise<void>;
}

const TITLE_MAX = 200;
const BODY_MAX  = 2000;

export default function SubmitModal({ onClose, onSubmit }: Props) {
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [category, setCategory]     = useState<Category>('general');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = title.trim() && body.trim() && authorName.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    await onSubmit(title, body, category, authorName);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-grey-900">Submit Feedback</h2>
          <button onClick={onClose} className="text-grey-300 hover:text-grey-700 transition-colors text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-grey-700 mb-1.5 uppercase tracking-wide">Your name</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Coach Smith"
              maxLength={100}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-grey-900 placeholder:text-grey-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-grey-700 uppercase tracking-wide">Title</label>
              <span className={`text-xs ${title.length > TITLE_MAX * 0.9 ? 'text-orange-500' : 'text-grey-300'}`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of your feedback"
              maxLength={TITLE_MAX}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-grey-900 placeholder:text-grey-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-grey-700 uppercase tracking-wide">Details</label>
              <span className={`text-xs ${body.length > BODY_MAX * 0.9 ? 'text-orange-500' : 'text-grey-300'}`}>
                {body.length}/{BODY_MAX}
              </span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your feedback in detail"
              maxLength={BODY_MAX}
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-grey-900 placeholder:text-grey-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-grey-700 mb-2 uppercase tracking-wide">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    category === c.value
                      ? 'border-brand bg-brand/10 text-grey-900 font-medium'
                      : 'border-border text-grey-700 hover:border-grey-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium text-grey-700 hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 bg-brand text-grey-900 font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
