# Despliegue con Cloudflare Pages + Supabase

## 1. Preparar Supabase

La app ya apunta a este proyecto:

```text
https://xwyqneunbfghlmmuacfb.supabase.co
```

Si la tabla `ventas_soap` ya existe, no necesitas crearla de nuevo. Usa `supabase-setup.sql` solo como respaldo para revisar columnas, RLS y Realtime.

Pasos importantes:

1. Ve a Authentication > Users.
2. Crea al menos un usuario con email y contraseña.
3. Revisa que `ventas_soap` tenga Row Level Security activo.
4. Revisa que existan politicas para `authenticated` en select, insert, update y delete.
5. Revisa que Realtime este activo para `ventas_soap`.

## 2. Credenciales publicas

Las credenciales publicas de Supabase ya quedaron pegadas en `index.html`.

La `anon key` puede vivir en el navegador. La seguridad queda protegida por Supabase Auth y Row Level Security.

## 3. Publicar en Cloudflare Pages

Puedes usar cualquiera de estas opciones:

- Subir directamente la carpeta `seguros-venta-206-main` a Cloudflare Pages.
- O subir estos archivos a GitHub y conectar el repo desde Cloudflare Pages.

Para esta app estatica:

- Build command: dejar vacio.
- Build output directory: `/` si `index.html` queda en la raiz del proyecto.

## 4. Primer inicio

Al entrar con un usuario valido:

- Si la tabla `ventas_soap` esta vacia, la app cargara automaticamente los 57 registros migrados desde Supabase CSV.
- Si la tabla ya tiene datos, la app los leera sin sobreescribirlos.
- Los cambios hechos en un dispositivo se guardan en Supabase y se escuchan por Realtime.
