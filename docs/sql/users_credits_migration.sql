-- Add credit/plan fields and indexes to users table.
-- Safe to run multiple times.

alter table public.users
  add column if not exists credits integer default 3,
  add column if not exists plan text default 'free',
  add column if not exists last_reset_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'unique_email'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint unique_email unique (email);
  end if;
end;
$$;

create index if not exists idx_users_email on public.users (email);

update public.users
set
  credits = coalesce(credits, 3),
  plan = coalesce(plan, 'free'),
  last_reset_at = coalesce(last_reset_at, now())
where credits is null
   or plan is null
   or last_reset_at is null;
