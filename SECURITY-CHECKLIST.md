# Checklist de blindaje

## Supabase

1. Ejecuta `supabase-setup.sql` en Supabase SQL Editor.
2. Ve a Authentication > Users y copia el `User UID` de tu usuario.
3. En SQL Editor ejecuta:

```sql
insert into public.app_allowed_users (user_id, role)
values ('PEGA_AQUI_TU_USER_UID', 'admin')
on conflict (user_id) do update set role = excluded.role, active = true;
```

4. En Authentication > Providers > Email, desactiva registro publico si no quieres que cualquiera pueda crear cuenta.
5. En Authentication > Multi-Factor, activa MFA/TOTP.
6. En Project Settings > API, usa una `publishable key` nueva si Supabase te la ofrece. Si solo ves `anon key`, puedes usarla, pero la seguridad depende de RLS.

## Cloudflare

1. En Workers & Pages > tu app > Settings > Build:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
2. En Settings > Variables agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Sube este proyecto al repositorio y deja que Cloudflare haga el deploy.

## Operacion segura

- No subas CSVs, PDFs ni respaldos con RUTs al repositorio.
- No compartas usuarios de Supabase.
- Usa claves largas y un gestor de contrasenas.
- Deja un usuario `viewer` para solo lectura si alguien necesita revisar sin editar.
- No vuelvas a agregar datos reales dentro de `index.html` o archivos `.js`.
