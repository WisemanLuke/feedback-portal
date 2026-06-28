'use client';

import { useCallback, useEffect, useState } from 'react';
import FeedbackCard from '@/components/FeedbackCard';
import SubmitModal from '@/components/SubmitModal';
import { supabase } from '@/lib/supabase';
import type { Category, FeedbackPost, SortOrder, Status } from '@/lib/types';

const VOTER_ID_KEY = 'pd_feedback_voter_id';

function getVoterId(): string {
  let id = localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}

const CATEGORY_OPTIONS: { value: Category | ''; label: string }[] = [
  { value: '',            label: 'All categories' },
  { value: 'general',     label: 'General' },
  { value: 'performance', label: 'Performance' },
  { value: 'analytics',   label: 'Analytics' },
  { value: 'hardware',    label: 'Hardware' },
];

const STATUS_OPTIONS: { value: Status | ''; label: string }[] = [
  { value: '',            label: 'All statuses' },
  { value: 'new',         label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'planned',     label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'declined',    label: 'Declined' },
];

export default function Home() {
  const [posts, setPosts]           = useState<FeedbackPost[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sort, setSort]             = useState<SortOrder>('top');
  const [category, setCategory]     = useState<Category | ''>('');
  const [status, setStatus]         = useState<Status | ''>('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [voterId, setVoterId]       = useState('');

  useEffect(() => {
    setVoterId(getVoterId());
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('feedback_posts')
      .select('*');

    if (category) query = query.eq('category', category);
    if (status)   query = query.eq('status', status);

    if (sort === 'top') {
      query = query.order('vote_score', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: postData } = await query;
    if (!postData) { setLoading(false); return; }

    if (voterId) {
      const { data: voteData } = await supabase
        .from('feedback_votes')
        .select('feedback_post_id, value')
        .eq('voter_id', voterId)
        .in('feedback_post_id', postData.map((p) => p.id));

      const voteMap = Object.fromEntries(
        (voteData ?? []).map((v) => [v.feedback_post_id, v.value as 1 | -1])
      );

      setPosts(postData.map((p) => ({ ...p, viewer_vote: voteMap[p.id] ?? null })));
    } else {
      setPosts(postData.map((p) => ({ ...p, viewer_vote: null })));
    }

    setLoading(false);
  }, [sort, category, status, voterId]);

  useEffect(() => {
    if (voterId) fetchPosts();
  }, [fetchPosts, voterId]);

  const handleVote = async (postId: string, value: 1 | -1) => {
    if (!voterId) return;

    const existing = posts.find((p) => p.id === postId)?.viewer_vote;

    if (existing === value) {
      await supabase.from('feedback_votes').delete()
        .eq('feedback_post_id', postId).eq('voter_id', voterId);
    } else if (existing) {
      await supabase.from('feedback_votes').update({ value })
        .eq('feedback_post_id', postId).eq('voter_id', voterId);
    } else {
      await supabase.from('feedback_votes').insert({ feedback_post_id: postId, voter_id: voterId, value });
    }

    fetchPosts();
  };

  const handleSubmit = async (title: string, body: string, cat: Category, authorName: string) => {
    await supabase.from('feedback_posts').insert({ title, body, category: cat, author_name: authorName });
    setModalOpen(false);
    fetchPosts();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback Portal</h1>
            <p className="text-gray-500 mt-1 text-sm">Share ideas and vote on what matters most</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-brand text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90 shrink-0"
          >
            + Submit
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(['top', 'newest'] as SortOrder[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 ${sort === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {s === 'top' ? 'Top' : 'Newest'}
              </button>
            ))}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | '')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white"
          >
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | '')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No feedback yet — be the first to share yours!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <FeedbackCard
                key={post.id}
                post={post}
                onVote={handleVote}
                votingDisabled={!voterId}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <SubmitModal onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
      )}
    </main>
  );
}
