# Despliegue con Cloudflare Workers + Supabase

## 1. Preparar Supabase

La app apunta a este proyecto:

```text
https://xwyqneunbfghlmmuacfb.supabase.co
```

Ejecuta `supabase-setup.sql` en Supabase SQL Editor. Ese archivo activa RLS con lista blanca de usuarios y quita permisos de borrado desde la app.

Pasos obligatorios:

1. Ve a Authentication > Users.
2. Crea al menos un usuario con email y contrasena.
3. Copia el `User UID` de ese usuario.
4. Agrega ese usuario a `public.app_allowed_users`:

```sql
insert into public.app_allowed_users (user_id, role)
values ('PEGA_AQUI_TU_USER_UID', 'admin')
on conflict (user_id) do update set role = excluded.role, active = true;
```

5. En Authentication > Providers > Email, desactiva registro publico si no vas a invitar usuarios manualmente.
6. En Authentication > Multi-Factor, activa MFA/TOTP.
7. Revisa que Realtime este activo para `ventas_soap`.

## 2. Credenciales publicas

Configura estas variables en Cloudflare:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

La `anon key` puede vivir en el navegador. La seguridad queda protegida por Supabase Auth y Row Level Security. Nunca pongas una `service_role key` en el frontend.

## 3. Publicar en Cloudflare Workers

En Workers & Pages > Settings > Build:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Root directory: /
```

`wrangler.toml` publica la carpeta `dist`, creada por Vite.

## 4. Primer inicio

Al entrar con un usuario valido y autorizado en `app_allowed_users`, la app leera los datos desde Supabase. Los cambios hechos en un dispositivo se guardan en Supabase y se escuchan por Realtime.
Deploy refresh
