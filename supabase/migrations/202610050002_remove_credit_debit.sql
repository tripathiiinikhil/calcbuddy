-- Remove the retired Credit and Debit features.
-- Customer rows remain because estimates may reference them.
drop table if exists public.credit_transactions;
drop table if exists public.debit_transactions;
drop table if exists public.expense_categories;
