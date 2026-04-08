create extension if not exists pgcrypto;

create table if not exists trainings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  academy text not null default '',
  category text not null default '',
  level text not null default '',
  status text not null check (status in ('draft', 'scheduled', 'published', 'archived')),
  format text not null check (format in ('live', 'online', 'hybrid')),
  location text not null default '',
  duration_label text not null default '',
  price_eur numeric(10,2) not null default 0,
  next_date timestamptz,
  seats_total integer not null default 0,
  seats_reserved integer not null default 0,
  short_description text not null default '',
  long_description text not null default '',
  hero_image text not null default '',
  tags jsonb not null default '[]'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists training_interests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  source text not null default '',
  status text not null check (status in ('new', 'contacted', 'qualified', 'reserved', 'archived')),
  temperature text not null check (temperature in ('hot', 'warm', 'cold')),
  preferred_training_id uuid references trainings(id) on delete set null,
  training_ids jsonb not null default '[]'::jsonb,
  summary text not null default '',
  created_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now()
);

create table if not exists training_interest_notes (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references training_interests(id) on delete cascade,
  author text not null default 'Admin',
  body text not null,
  created_at timestamptz not null default now()
);

alter table trainings enable row level security;
alter table training_interests enable row level security;
alter table training_interest_notes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'trainings'
      and policyname = 'Authenticated users manage trainings'
  ) then
    create policy "Authenticated users manage trainings"
      on trainings
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'training_interests'
      and policyname = 'Authenticated users manage training interests'
  ) then
    create policy "Authenticated users manage training interests"
      on training_interests
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'training_interest_notes'
      and policyname = 'Authenticated users manage training interest notes'
  ) then
    create policy "Authenticated users manage training interest notes"
      on training_interest_notes
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- Lead magnet: безплатни статии и регистрации (имейли)
create table if not exists lead_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  status text not null check (status in ('draft', 'published')),
  material_label text not null default '',
  material_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  article_id uuid not null references lead_articles(id) on delete cascade,
  source text not null default '',
  created_at timestamptz not null default now(),
  material_sent boolean not null default false,
  material_sent_at timestamptz
);

create index if not exists lead_signups_article_id_idx on lead_signups (article_id);
create index if not exists lead_signups_created_at_idx on lead_signups (created_at desc);
create index if not exists lead_signups_material_sent_idx on lead_signups (material_sent);

-- Допълнение към вече създадена таблица без колоните за статус
alter table lead_signups add column if not exists material_sent boolean not null default false;
alter table lead_signups add column if not exists material_sent_at timestamptz;

alter table lead_articles enable row level security;
alter table lead_signups enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lead_articles' and policyname = 'Authenticated users manage lead articles'
  ) then
    create policy "Authenticated users manage lead articles"
      on lead_articles for all to authenticated using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lead_signups' and policyname = 'Authenticated users manage lead signups'
  ) then
    create policy "Authenticated users manage lead signups"
      on lead_signups for all to authenticated using (true) with check (true);
  end if;
end $$;
