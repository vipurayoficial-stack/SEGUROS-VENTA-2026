-- Verificacion posterior al blindaje.
-- Ejecuta esto en Supabase SQL Editor despues de correr supabase-setup.sql
-- y de agregar tu usuario a public.app_allowed_users.

-- 1. RLS debe estar activo en ambas tablas.
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('ventas_soap', 'app_allowed_users');

-- 2. No debe existir politica DELETE para authenticated en ventas_soap.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('ventas_soap', 'app_allowed_users')
order by tablename, policyname;

-- 3. Debe aparecer tu usuario autorizado como admin/editor/viewer.
select
  user_id,
  role,
  active,
  created_at
from public.app_allowed_users
order by created_at desc;

-- 4. La tabla principal debe conservar datos.
select count(*) as total_ventas_soap
from public.ventas_soap;

-- 5. Las politicas de ventas_soap deben exigir MFA / AAL2.
select
  policyname,
  cmd,
  (coalesce(qual, '') || ' ' || coalesce(with_check, '')) like '%aal2%' as exige_mfa_aal2
from pg_policies
where schemaname = 'public'
  and tablename = 'ventas_soap'
  and cmd in ('SELECT', 'INSERT', 'UPDATE')
order by policyname;
