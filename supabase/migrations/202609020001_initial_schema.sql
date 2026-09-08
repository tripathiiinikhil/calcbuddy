-- CalcBuddy MVP: core relational schema. Apply with `supabase db push`.
create extension if not exists "pgcrypto";

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  business_type text not null check (business_type in ('retail', 'wholesale', 'petrol_pump', 'other')),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create or replace function public.is_business_member(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.business_members where business_id = target_business_id and user_id = auth.uid());
$$;

create or replace function public.is_business_owner(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.business_members where business_id = target_business_id and user_id = auth.uid() and role = 'owner');
$$;

create or replace function public.is_business_creator(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.businesses where id = target_business_id and created_by = auth.uid());
$$;

-- Onboarding must either create both records or neither. SECURITY DEFINER lets this
-- controlled function bypass RLS, while auth.uid() still fixes ownership to the caller.
create or replace function public.create_business_with_owner(p_name text, p_business_type text)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_business_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_name)) not between 2 and 120 then raise exception 'Invalid business name'; end if;
  if p_business_type not in ('retail', 'wholesale', 'petrol_pump', 'other') then raise exception 'Invalid business type'; end if;
  insert into public.businesses (name, business_type, created_by)
  values (trim(p_name), p_business_type, auth.uid()) returning id into new_business_id;
  insert into public.business_members (business_id, user_id, role)
  values (new_business_id, auth.uid(), 'owner');
  return new_business_id;
end;
$$;
revoke execute on function public.create_business_with_owner(text, text) from public;
grant execute on function public.create_business_with_owner(text, text) to authenticated;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 150),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.customers add unique (id, business_id);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null,
  transaction_type text not null check (transaction_type in ('credit', 'payment')),
  amount numeric(14,2) not null check (amount > 0),
  notes text check (char_length(notes) <= 1000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (customer_id, business_id) references public.customers(id, business_id) on delete cascade
);

create table public.counter_reports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  coins_amount numeric(14,2) not null default 0 check (coins_amount >= 0),
  total_amount numeric(14,2) not null check (total_amount >= 0),
  counted_at timestamptz not null default now(),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.counter_entries (
  id uuid primary key default gen_random_uuid(),
  counter_report_id uuid not null references public.counter_reports(id) on delete cascade,
  denomination integer not null check (denomination in (500, 200, 100, 50, 20, 10)),
  quantity integer not null check (quantity >= 0),
  created_at timestamptz not null default now(),
  unique (counter_report_id, denomination)
);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);
alter table public.expense_categories add unique (id, business_id);

create table public.debit_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid,
  category_name text not null check (char_length(trim(category_name)) between 1 and 80),
  amount numeric(14,2) not null check (amount >= 0),
  description text not null default '' check (char_length(description) <= 300),
  notes text check (char_length(notes) <= 1000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (category_id, business_id) references public.expense_categories(id, business_id) on delete set null (category_id)
);

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  estimate_number text not null check (char_length(trim(estimate_number)) between 1 and 40),
  customer_name text not null check (char_length(trim(customer_name)) between 1 and 150),
  issued_at timestamptz not null default now(),
  total_amount numeric(14,2) not null check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, estimate_number)
);

create table public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  product_name text not null check (char_length(trim(product_name)) between 1 and 300),
  quantity numeric(14,3) not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique (estimate_id, position)
);

create index customers_business_id_idx on public.customers(business_id);
create index credit_transactions_customer_id_occurred_at_idx on public.credit_transactions(customer_id, occurred_at desc);
create index counter_reports_business_id_counted_at_idx on public.counter_reports(business_id, counted_at desc);
create index debit_transactions_business_id_occurred_at_idx on public.debit_transactions(business_id, occurred_at desc);
create index estimates_business_id_issued_at_idx on public.estimates(business_id, issued_at desc);

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.customers enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.counter_reports enable row level security;
alter table public.counter_entries enable row level security;
alter table public.expense_categories enable row level security;
alter table public.debit_transactions enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;

create policy "members view businesses" on public.businesses for select using (public.is_business_member(id));
create policy "signed in users create businesses" on public.businesses for insert to authenticated with check (created_by = auth.uid());
create policy "owners update businesses" on public.businesses for update using (public.is_business_owner(id)) with check (public.is_business_owner(id) and created_by = auth.uid());
create policy "members view memberships" on public.business_members for select using (user_id = auth.uid());
create policy "creators add owner membership" on public.business_members for insert to authenticated with check (user_id = auth.uid() and public.is_business_creator(business_id));

create policy "members manage customers" on public.customers for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage credit" on public.credit_transactions for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage counter reports" on public.counter_reports for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage counter entries" on public.counter_entries for all using (exists (select 1 from public.counter_reports r where r.id = counter_report_id and public.is_business_member(r.business_id))) with check (exists (select 1 from public.counter_reports r where r.id = counter_report_id and public.is_business_member(r.business_id)));
create policy "members manage expense categories" on public.expense_categories for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage expenses" on public.debit_transactions for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage estimates" on public.estimates for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage estimate items" on public.estimate_items for all using (exists (select 1 from public.estimates e where e.id = estimate_id and public.is_business_member(e.business_id))) with check (exists (select 1 from public.estimates e where e.id = estimate_id and public.is_business_member(e.business_id)));
