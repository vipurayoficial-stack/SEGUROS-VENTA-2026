-- Exigir MFA (AAL2) para leer, crear o modificar ventas_soap.
-- Ejecuta esto en Supabase SQL Editor despues de:
-- 1. Activar TOTP en Authentication > Multi-Factor.
-- 2. Subir la version de la app que muestra el codigo MFA.

alter table public.ventas_soap enable row level security;

drop policy if exists "ventas_soap_select_allowed_users" on public.ventas_soap;
drop policy if exists "ventas_soap_insert_editors" on public.ventas_soap;
drop policy if exists "ventas_soap_update_editors" on public.ventas_soap;
drop policy if exists "ventas_soap_delete_authenticated" on public.ventas_soap;

create policy "ventas_soap_select_allowed_users"
on public.ventas_soap
for select
to authenticated
using (
  public.current_app_role() in ('admin', 'editor', 'viewer')
  and auth.jwt() ->> 'aal' = 'aal2'
);

create policy "ventas_soap_insert_editors"
on public.ventas_soap
for insert
to authenticated
with check (
  public.current_app_role() in ('admin', 'editor')
  and auth.jwt() ->> 'aal' = 'aal2'
);

create policy "ventas_soap_update_editors"
on public.ventas_soap
for update
to authenticated
using (
  public.current_app_role() in ('admin', 'editor')
  and auth.jwt() ->> 'aal' = 'aal2'
)
with check (
  public.current_app_role() in ('admin', 'editor')
  and auth.jwt() ->> 'aal' = 'aal2'
);

revoke delete on public.ventas_soap from anon, authenticated;
