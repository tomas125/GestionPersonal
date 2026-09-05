-- Sistema Web Contable Personal — schema inicial
-- Todas las tablas de usuario llevan RLS con policy user_id = auth.uid()

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  phone_number text unique,
  default_account_id uuid,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- Crea el profile automáticamente cuando se registra un usuario nuevo
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- accounts
-- ============================================================
create type account_type as enum ('efectivo', 'banco', 'tarjeta', 'otro');

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type account_type not null default 'banco',
  initial_balance numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;
create policy "accounts_all_own" on public.accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.profiles
  add constraint profiles_default_account_fk
  foreign key (default_account_id) references public.accounts (id) on delete set null;

-- ============================================================
-- categories
-- ============================================================
create type movement_type as enum ('gasto', 'ingreso');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text not null default 'circle',
  color text not null default '#64748b',
  type movement_type not null,
  parent_category_id uuid references public.categories (id) on delete cascade,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "categories_all_own" on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index categories_user_type_idx on public.categories (user_id, type);

-- ============================================================
-- payment_methods
-- ============================================================
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.payment_methods enable row level security;
create policy "payment_methods_all_own" on public.payment_methods
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- recurring_expenses
-- ============================================================
create type recurrence_frequency as enum ('semanal', 'mensual');

create table public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  account_id uuid not null references public.accounts (id) on delete restrict,
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  amount numeric(14, 2) not null check (amount > 0),
  description text not null,
  frequency recurrence_frequency not null default 'mensual',
  day_of_month smallint check (day_of_month between 1 and 31),
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring_expenses enable row level security;
create policy "recurring_expenses_all_own" on public.recurring_expenses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- transactions
-- ============================================================
create type transaction_source as enum ('web', 'whatsapp', 'api');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  type movement_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  occurred_at date not null default current_date,
  installment_group_id uuid,
  installment_number smallint,
  installments_total smallint,
  recurring_expense_id uuid references public.recurring_expenses (id) on delete set null,
  source transaction_source not null default 'web',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy "transactions_all_own" on public.transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index transactions_user_date_idx on public.transactions (user_id, occurred_at);
create index transactions_user_category_idx on public.transactions (user_id, category_id);
create index transactions_installment_group_idx on public.transactions (installment_group_id);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- budgets
-- ============================================================
create type budget_period as enum ('mensual');

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  period budget_period not null default 'mensual',
  start_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.budgets enable row level security;
create policy "budgets_all_own" on public.budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- whatsapp_messages (estructura preparada para fase futura)
-- ============================================================
create type whatsapp_message_direction as enum ('inbound', 'outbound');
create type whatsapp_message_status as enum ('pending', 'processed', 'needs_confirmation', 'confirmed', 'rejected', 'error');

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  phone_number text not null,
  direction whatsapp_message_direction not null,
  message_text text not null,
  wa_message_id text,
  status whatsapp_message_status not null default 'pending',
  parsed_payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_messages enable row level security;
create policy "whatsapp_messages_all_own" on public.whatsapp_messages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- ai_analyses (estructura preparada para fase futura)
-- ============================================================
create type ai_analysis_type as enum ('monthly_summary', 'anomaly', 'query');

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type ai_analysis_type not null,
  period_start date,
  period_end date,
  content jsonb,
  summary_text text,
  created_at timestamptz not null default now()
);

alter table public.ai_analyses enable row level security;
create policy "ai_analyses_all_own" on public.ai_analyses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
