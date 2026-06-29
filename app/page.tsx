'use client';

import Image from 'next/image';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FeedbackCard from '@/components/FeedbackCard';
import SkeletonCard from '@/components/SkeletonCard';
import SubmitModal from '@/components/SubmitModal';
import ToastContainer, { toast } from '@/components/Toast';
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
  { value: '',             label: 'All statuses' },
  { value: 'new',          label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'planned',      label: 'Planned' },
  { value: 'in_progress',  label: 'In Progress' },
  { value: 'completed',    label: 'Completed' },
  { value: 'declined',     label: 'Declined' },
];

function HomeContent() {
  const searchParams  = useSearchParams();
  const adminToken    = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  const isAdmin       = !!adminToken && searchParams.get('admin') === adminToken;

  const [posts, setPosts]         = useState<FeedbackPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [sort, setSort]           = useState<SortOrder>('top');
  const [category, setCategory]   = useState<Category | ''>('');
  const [status, setStatus]       = useState<Status | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [voterId, setVoterId]     = useState('');

  useEffect(() => { setVoterId(getVoterId()); }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase.from('feedback_posts').select('*');
    if (category) query = query.eq('category', category);
    if (status)   query = query.eq('status', status);
    query = sort === 'top'
      ? query.order('vote_score', { ascending: false }).order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false });

    const { data: postData, error } = await query;
    if (error || !postData) { setLoading(false); return; }

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

  useEffect(() => { if (voterId) fetchPosts(); }, [fetchPosts, voterId]);

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

  const handleDelete = async (postId: string) => {
    await supabase.from('feedback_posts').delete().eq('id', postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast('Post deleted');
  };

  const handleStatusChange = async (postId: string, newStatus: Status) => {
    await supabase.from('feedback_posts').update({ status: newStatus }).eq('id', postId);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, status: newStatus } : p));
    toast('Status updated');
  };

  const handleSubmit = async (title: string, body: string, cat: Category, authorName: string) => {
    const { error } = await supabase.from('feedback_posts')
      .insert({ title, body, category: cat, author_name: authorName });
    if (error) { toast('Something went wrong — please try again', 'error'); return; }
    setModalOpen(false);
    toast('Feedback submitted — thank you!');
    fetchPosts();
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Image src="/pd-logo.svg" alt="PlayerData" width={132} height={30} priority />
          <button
            onClick={() => setModalOpen(true)}
            className="bg-brand text-grey-900 font-semibold px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            + Submit Feedback
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-grey-900">Feedback Portal</h1>
          <p className="text-sm text-grey-300 mt-0.5">Vote on what matters most, share new ideas</p>
          {isAdmin && (
            <span className="inline-block mt-2 text-xs bg-brand/15 text-grey-900 font-medium px-2 py-0.5 rounded">
              Admin mode — you can update statuses
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            {(['top', 'newest'] as SortOrder[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  sort === s ? 'bg-grey-900 text-white' : 'bg-white text-grey-700 hover:bg-bg'
                }`}
              >
                {s === 'top' ? 'Top' : 'Newest'}
              </button>
            ))}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | '')}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-grey-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status | '')}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-grey-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-grey-300 text-sm">No feedback yet — be the first to share yours!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <FeedbackCard
                key={post.id}
                post={post}
                onVote={handleVote}
                votingDisabled={!voterId}
                isAdmin={isAdmin}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && <SubmitModal onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />}
      <ToastContainer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
