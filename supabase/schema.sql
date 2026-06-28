create table feedback_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  body        text not null check (char_length(body) between 1 and 2000),
  category    text not null check (category in ('general', 'performance', 'analytics', 'hardware')),
  status      text not null default 'new'
              check (status in ('new', 'under_review', 'planned', 'in_progress', 'completed', 'declined')),
  author_name text not null,
  vote_score  integer not null default 0,
  created_at  timestamptz default now()
);

create table feedback_votes (
  id               uuid primary key default gen_random_uuid(),
  feedback_post_id uuid not null references feedback_posts(id) on delete cascade,
  voter_id         text not null,
  value            integer not null check (value in (-1, 1)),
  created_at       timestamptz default now(),
  unique (feedback_post_id, voter_id)
);

create index on feedback_posts (vote_score desc, created_at desc);
create index on feedback_posts (created_at desc);
create index on feedback_votes (feedback_post_id);
create index on feedback_votes (voter_id);

create or replace function sync_vote_score()
returns trigger language plpgsql as $$
begin
  update feedback_posts
  set vote_score = (
    select coalesce(sum(value), 0)
    from feedback_votes
    where feedback_post_id = coalesce(new.feedback_post_id, old.feedback_post_id)
  )
  where id = coalesce(new.feedback_post_id, old.feedback_post_id);
  return null;
end;
$$;

create trigger on_vote_change
after insert or update or delete on feedback_votes
for each row execute function sync_vote_score();

-- Permissive RLS for prototype — tighten before production
alter table feedback_posts enable row level security;
alter table feedback_votes enable row level security;
create policy "public read/write" on feedback_posts for all using (true) with check (true);
create policy "public read/write" on feedback_votes for all using (true) with check (true);
