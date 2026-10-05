-- Adds optional identity to the existing business record; no second profile system.
alter table public.businesses add column if not exists logo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-logos', 'business-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

create policy "business members view logos" on storage.objects for select
using (bucket_id = 'business-logos');

create policy "business members upload own logos" on storage.objects for insert to authenticated
with check (bucket_id = 'business-logos' and public.is_business_member((storage.foldername(name))[1]::uuid));

create policy "business members update own logos" on storage.objects for update to authenticated
using (bucket_id = 'business-logos' and public.is_business_member((storage.foldername(name))[1]::uuid))
with check (bucket_id = 'business-logos' and public.is_business_member((storage.foldername(name))[1]::uuid));

create policy "business members delete own logos" on storage.objects for delete to authenticated
using (bucket_id = 'business-logos' and public.is_business_member((storage.foldername(name))[1]::uuid));
