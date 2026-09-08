-- CalcBuddy: Feature expansion migration
-- 1. Support all Indian currency denominations (₹500, ₹200, ₹100, ₹50, ₹20, ₹10, ₹5, ₹2, ₹1) in counter_entries
alter table public.counter_entries drop constraint if exists counter_entries_denomination_check;
alter table public.counter_entries add constraint counter_entries_denomination_check 
  check (denomination in (500, 200, 100, 50, 20, 10, 5, 2, 1));

-- 2. Products catalog table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 200),
  price numeric(14,2) not null check (price >= 0),
  sku text check (sku is null or char_length(trim(sku)) <= 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'products' and policyname = 'members manage products') then
    create policy "members manage products" on public.products for all 
      using (public.is_business_member(business_id)) 
      with check (public.is_business_member(business_id));
  end if;
end $$;

create index if not exists products_business_id_name_idx on public.products(business_id, name);

-- 3. Estimates enhancements (customer reference, subtotal, discount, notes)
alter table public.estimates add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.estimates add column if not exists subtotal_amount numeric(14,2) not null default 0 check (subtotal_amount >= 0);
alter table public.estimates add column if not exists discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0);
alter table public.estimates add column if not exists notes text check (notes is null or char_length(notes) <= 1000);

