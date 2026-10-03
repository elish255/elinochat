-- ElinoChat tables use their own prefix so they do not alter or overwrite
-- existing tables in a shared Supabase database.
create extension if not exists pgcrypto;

create table if not exists public.elinochat_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  username text not null unique,
  phone text not null,
  country text not null default 'Tanzania',
  account_status text not null default 'pending_payment' check (account_status in ('pending_payment','active','inactive','banned')),
  is_active boolean not null default false,
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.elinochat_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  amount numeric(14,2) not null,
  currency text not null default 'TZS',
  provider_order_id text unique,
  provider_transaction_id text,
  provider_status text,
  status text not null default 'pending' check (status in ('pending','inprogress','success','cancelled','usercancelled','rejected','failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.elinochat_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Taarifa',
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.elinochat_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- Safe migrations for a table that may already have been created during testing.
alter table public.elinochat_profiles add column if not exists is_active boolean not null default false;
alter table public.elinochat_profiles add column if not exists updated_at timestamptz not null default now();

alter table public.elinochat_profiles enable row level security;
alter table public.elinochat_payments enable row level security;
alter table public.elinochat_notifications enable row level security;
alter table public.elinochat_admins enable row level security;

-- Policies are created only if absent. Service-role server calls bypass RLS.
do $$ begin
  if not exists (select 1 from pg_policies where tablename='elinochat_profiles' and policyname='elinochat_profiles_select_own') then
    create policy elinochat_profiles_select_own on public.elinochat_profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='elinochat_notifications' and policyname='elinochat_notifications_select_own') then
    create policy elinochat_notifications_select_own on public.elinochat_notifications for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='elinochat_notifications' and policyname='elinochat_notifications_update_own') then
    create policy elinochat_notifications_update_own on public.elinochat_notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='elinochat_payments' and policyname='elinochat_payments_select_own') then
    create policy elinochat_payments_select_own on public.elinochat_payments for select using (auth.uid() = user_id);
  end if;
end $$;

-- After creating your admin Auth user, run this with the real UUID:
-- insert into public.elinochat_admins (user_id, email) values ('ADMIN-AUTH-USER-UUID', 'admin@example.com') on conflict (user_id) do nothing;
