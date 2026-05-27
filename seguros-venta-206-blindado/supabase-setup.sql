create extension if not exists pgcrypto;

create table if not exists public.ventas_soap (
  id uuid primary key default gen_random_uuid(),
  fecha_venta date,
  folio text,
  poliza text,
  patente text not null,
  propietario text not null,
  rut text,
  tipo_vehiculo text,
  marca text,
  modelo text,
  ano integer,
  motor text,
  rige_desde date,
  rige_hasta date,
  prima integer default 0,
  precio_cobrado integer default 0,
  efectivo integer default 0,
  transferencia integer default 0,
  total_recibido integer default 0,
  adeudado integer default 0,
  estado_pago text default 'Adeudado',
  vendedor text,
  comprobante text,
  observaciones text,
  revision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ventas_soap add column if not exists fecha_venta date;
alter table public.ventas_soap add column if not exists folio text;
alter table public.ventas_soap add column if not exists poliza text;
alter table public.ventas_soap add column if not exists patente text;
alter table public.ventas_soap add column if not exists propietario text;
alter table public.ventas_soap add column if not exists rut text;
alter table public.ventas_soap add column if not exists tipo_vehiculo text;
alter table public.ventas_soap add column if not exists marca text;
alter table public.ventas_soap add column if not exists modelo text;
alter table public.ventas_soap add column if not exists ano integer;
alter table public.ventas_soap add column if not exists motor text;
alter table public.ventas_soap add column if not exists rige_desde date;
alter table public.ventas_soap add column if not exists rige_hasta date;
alter table public.ventas_soap add column if not exists prima integer default 0;
alter table public.ventas_soap add column if not exists precio_cobrado integer default 0;
alter table public.ventas_soap add column if not exists efectivo integer default 0;
alter table public.ventas_soap add column if not exists transferencia integer default 0;
alter table public.ventas_soap add column if not exists total_recibido integer default 0;
alter table public.ventas_soap add column if not exists adeudado integer default 0;
alter table public.ventas_soap add column if not exists estado_pago text default 'Adeudado';
alter table public.ventas_soap add column if not exists vendedor text;
alter table public.ventas_soap add column if not exists comprobante text;
alter table public.ventas_soap add column if not exists observaciones text;
alter table public.ventas_soap add column if not exists revision text;
alter table public.ventas_soap add column if not exists created_at timestamptz not null default now();
alter table public.ventas_soap add column if not exists updated_at timestamptz not null default now();

create index if not exists ventas_soap_patente_idx on public.ventas_soap (patente);
create index if not exists ventas_soap_estado_pago_idx on public.ventas_soap (estado_pago);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ventas_soap_set_updated_at on public.ventas_soap;
create trigger ventas_soap_set_updated_at
before update on public.ventas_soap
for each row
execute function public.set_updated_at();

alter table public.ventas_soap enable row level security;

create table if not exists public.app_allowed_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.app_allowed_users enable row level security;

create or replace function public.current_app_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role
  from public.app_allowed_users
  where user_id = auth.uid()
    and active = true
  limit 1
$$;

revoke all on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;

drop policy if exists "ventas_soap_select_authenticated" on public.ventas_soap;
drop policy if exists "ventas_soap_insert_authenticated" on public.ventas_soap;
drop policy if exists "ventas_soap_update_authenticated" on public.ventas_soap;
drop policy if exists "ventas_soap_delete_authenticated" on public.ventas_soap;
drop policy if exists "ventas_soap_select_allowed_users" on public.ventas_soap;
drop policy if exists "ventas_soap_insert_editors" on public.ventas_soap;
drop policy if exists "ventas_soap_update_editors" on public.ventas_soap;
drop policy if exists "app_allowed_users_self_or_admin_select" on public.app_allowed_users;

create policy "ventas_soap_select_allowed_users"
on public.ventas_soap
for select
to authenticated
using (public.current_app_role() in ('admin', 'editor', 'viewer'));

create policy "ventas_soap_insert_editors"
on public.ventas_soap
for insert
to authenticated
with check (public.current_app_role() in ('admin', 'editor'));

create policy "ventas_soap_update_editors"
on public.ventas_soap
for update
to authenticated
using (public.current_app_role() in ('admin', 'editor'))
with check (public.current_app_role() in ('admin', 'editor'));

create policy "app_allowed_users_self_or_admin_select"
on public.app_allowed_users
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_app_role() = 'admin'
);

revoke delete on public.ventas_soap from anon, authenticated;
grant select, insert, update on public.ventas_soap to authenticated;
grant select on public.app_allowed_users to authenticated;

-- Despues de crear tu usuario en Supabase Auth, agrega su UUID a la lista blanca:
-- insert into public.app_allowed_users (user_id, role)
-- values ('TU_AUTH_USER_ID_AQUI', 'admin')
-- on conflict (user_id) do update set role = excluded.role, active = true;

do $$
begin
  alter publication supabase_realtime add table public.ventas_soap;
exception
  when duplicate_object then null;
end $$;
