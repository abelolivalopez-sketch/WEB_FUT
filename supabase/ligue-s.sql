create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

create table if not exists public.temporadas (
  id text primary key check (char_length(id) between 1 and 80),
  nombre text not null check (char_length(nombre) between 1 and 60),
  orden integer not null default 0
);

create table if not exists public.equipos (
  id text primary key check (char_length(id) between 1 and 80),
  nombre text not null check (char_length(nombre) between 1 and 60),
  sigla text not null default '' check (sigla ~ '^[A-Z0-9]{0,4}$'),
  color text not null default '#1D4ED8' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  logo text not null default '' check (char_length(logo) <= 2000),
  foto text not null default '' check (char_length(foto) <= 2000)
);

create table if not exists public.jugadores (
  id text primary key check (char_length(id) between 1 and 80),
  nombre text not null check (char_length(nombre) between 1 and 60),
  puesto text not null default '' check (puesto in ('', 'Gardien', 'Défenseur', 'Milieu', 'Attaquant')),
  foto text not null default '' check (char_length(foto) <= 2000)
);

create table if not exists public.inscripciones (
  id text primary key check (char_length(id) between 1 and 80),
  temporada text not null references public.temporadas (id) on delete cascade,
  equipo text not null references public.equipos (id) on delete cascade,
  unique (temporada, equipo)
);

create table if not exists public.plantillas (
  id text primary key check (char_length(id) between 1 and 80),
  temporada text not null,
  equipo text not null,
  jugador text not null references public.jugadores (id) on delete cascade,
  numero smallint check (numero between 0 and 99),
  capitan boolean not null default false,
  unique (temporada, jugador),
  foreign key (temporada, equipo) references public.inscripciones (temporada, equipo) on delete cascade
);

create table if not exists public.partidos (
  id text primary key check (char_length(id) between 1 and 80),
  temporada text not null,
  fecha date not null,
  hora time,
  local text not null,
  visitante text not null,
  jornada text not null default '' check (char_length(jornada) <= 40),
  lugar text not null default '' check (char_length(lugar) <= 80),
  goles smallint[] check (goles is null or (array_length(goles, 1) = 2 and goles[1] between 0 and 99 and goles[2] between 0 and 99)),
  check (local <> visitante),
  foreign key (temporada, local) references public.inscripciones (temporada, equipo) on delete cascade,
  foreign key (temporada, visitante) references public.inscripciones (temporada, equipo) on delete cascade
);

create table if not exists public.actuaciones (
  id text primary key check (char_length(id) between 1 and 80),
  partido text not null references public.partidos (id) on delete cascade,
  jugador text not null references public.jugadores (id) on delete cascade,
  equipo text not null references public.equipos (id) on delete cascade,
  nota numeric(4, 2) check (nota between 0 and 10 and nota * 4 = trunc(nota * 4)),
  goles smallint not null default 0 check (goles between 0 and 99),
  check (nota is not null or goles > 0),
  unique (partido, jugador)
);

create table if not exists public.lives (
  id text primary key check (char_length(id) between 1 and 80),
  temporada text not null references public.temporadas (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 100),
  fecha date not null,
  hora time,
  enlace text not null default '' check (enlace = '' or enlace ~ '^https?://')
);

create table if not exists public.videos (
  id text primary key check (char_length(id) between 1 and 80),
  temporada text not null references public.temporadas (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 140),
  youtube text not null check (youtube ~ '^[A-Za-z0-9_-]{11}$'),
  fecha date,
  partido text references public.partidos (id) on delete set null
);

create table if not exists public.premios (
  id text primary key check (char_length(id) between 1 and 80),
  temporada text not null references public.temporadas (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  jugador text references public.jugadores (id) on delete set null,
  equipo text references public.equipos (id) on delete set null,
  detalle text not null default '' check (char_length(detalle) <= 120),
  orden integer not null default 0
);

create table if not exists public.ajustes (
  id smallint primary key default 1 check (id = 1),
  sitio jsonb not null default '{}'::jsonb check (jsonb_typeof(sitio) = 'object'),
  temporada_actual text references public.temporadas (id) on delete set null,
  version integer not null default 0,
  actualizado timestamptz not null default now()
);

create table if not exists public.ligue_versiones (
  id bigint generated always as identity primary key,
  version integer not null,
  datos jsonb not null,
  guardado timestamptz not null default now()
);

create table if not exists public.creadores (
  correo text primary key check (correo = lower(trim(correo)) and correo like '%@%')
);

create index if not exists plantillas_equipo on public.plantillas (temporada, equipo);
create index if not exists partidos_temporada on public.partidos (temporada, fecha);
create index if not exists partidos_local on public.partidos (temporada, local);
create index if not exists partidos_visitante on public.partidos (temporada, visitante);
create index if not exists actuaciones_jugador on public.actuaciones (jugador);
create index if not exists actuaciones_equipo on public.actuaciones (equipo);
create index if not exists inscripciones_equipo on public.inscripciones (equipo);
create index if not exists plantillas_jugador on public.plantillas (jugador);
create index if not exists lives_temporada on public.lives (temporada);
create index if not exists videos_temporada on public.videos (temporada);
create index if not exists videos_partido on public.videos (partido);
create index if not exists premios_temporada on public.premios (temporada);
create index if not exists premios_jugador on public.premios (jugador);
create index if not exists premios_equipo on public.premios (equipo);
create index if not exists ajustes_temporada on public.ajustes (temporada_actual);

insert into public.temporadas (id, nombre, orden) values ('saison-5', 'Saison 5', 5) on conflict (id) do nothing;
insert into public.ajustes (id, temporada_actual) values (1, 'saison-5') on conflict (id) do nothing;

alter table public.temporadas enable row level security;
alter table public.equipos enable row level security;
alter table public.jugadores enable row level security;
alter table public.inscripciones enable row level security;
alter table public.plantillas enable row level security;
alter table public.partidos enable row level security;
alter table public.actuaciones enable row level security;
alter table public.lives enable row level security;
alter table public.videos enable row level security;
alter table public.premios enable row level security;
alter table public.ajustes enable row level security;
alter table public.ligue_versiones enable row level security;
alter table public.creadores enable row level security;

revoke all on public.temporadas, public.equipos, public.jugadores, public.inscripciones, public.plantillas, public.partidos, public.actuaciones, public.lives, public.videos, public.premios, public.ajustes, public.ligue_versiones, public.creadores from anon, authenticated;
grant select on public.temporadas, public.equipos, public.jugadores, public.inscripciones, public.plantillas, public.partidos, public.actuaciones, public.lives, public.videos, public.premios, public.ajustes to anon, authenticated;

drop policy if exists "leer" on public.temporadas;
create policy "leer" on public.temporadas for select to anon, authenticated using (true);
drop policy if exists "leer" on public.equipos;
create policy "leer" on public.equipos for select to anon, authenticated using (true);
drop policy if exists "leer" on public.jugadores;
create policy "leer" on public.jugadores for select to anon, authenticated using (true);
drop policy if exists "leer" on public.inscripciones;
create policy "leer" on public.inscripciones for select to anon, authenticated using (true);
drop policy if exists "leer" on public.plantillas;
create policy "leer" on public.plantillas for select to anon, authenticated using (true);
drop policy if exists "leer" on public.partidos;
create policy "leer" on public.partidos for select to anon, authenticated using (true);
drop policy if exists "leer" on public.actuaciones;
create policy "leer" on public.actuaciones for select to anon, authenticated using (true);
drop policy if exists "leer" on public.lives;
create policy "leer" on public.lives for select to anon, authenticated using (true);
drop policy if exists "leer" on public.videos;
create policy "leer" on public.videos for select to anon, authenticated using (true);
drop policy if exists "leer" on public.premios;
create policy "leer" on public.premios for select to anon, authenticated using (true);
drop policy if exists "leer" on public.ajustes;
create policy "leer" on public.ajustes for select to anon, authenticated using (true);

create or replace function public.es_creador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.creadores c on c.correo = lower(u.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.es_creador() from public;
grant execute on function public.es_creador() to anon, authenticated;

create or replace function public.leer_ligue()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'esquema', 3,
    'version', a.version,
    'sitio', a.sitio,
    'temporadaActual', a.temporada_actual,
    'temporadas', coalesce((select jsonb_agg(to_jsonb(t) order by t.orden, t.id) from public.temporadas t), '[]'::jsonb),
    'equipos', coalesce((select jsonb_agg(to_jsonb(e) order by e.nombre, e.id) from public.equipos e), '[]'::jsonb),
    'jugadores', coalesce((select jsonb_agg(to_jsonb(j) order by j.nombre, j.id) from public.jugadores j), '[]'::jsonb),
    'inscripciones', coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from public.inscripciones i), '[]'::jsonb),
    'plantillas', coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from public.plantillas p), '[]'::jsonb),
    'partidos', coalesce((select jsonb_agg(to_jsonb(p) || jsonb_build_object('hora', to_char(p.hora, 'HH24:MI')) order by p.fecha, p.hora, p.id) from public.partidos p), '[]'::jsonb),
    'actuaciones', coalesce((select jsonb_agg(to_jsonb(x) order by x.id) from public.actuaciones x), '[]'::jsonb),
    'lives', coalesce((select jsonb_agg(to_jsonb(l) || jsonb_build_object('hora', to_char(l.hora, 'HH24:MI')) order by l.fecha, l.id) from public.lives l), '[]'::jsonb),
    'videos', coalesce((select jsonb_agg(to_jsonb(v) order by v.fecha, v.id) from public.videos v), '[]'::jsonb),
    'premios', coalesce((select jsonb_agg(to_jsonb(p) order by p.orden, p.id) from public.premios p), '[]'::jsonb)
  )
  from public.ajustes a
  where a.id = 1;
$$;

revoke all on function public.leer_ligue() from public;
grant execute on function public.leer_ligue() to anon, authenticated;

create or replace function privado.poner_filas(p_cambios jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  tabla text;
  columnas text;
  borrar text[] := array['premios', 'videos', 'actuaciones', 'lives', 'partidos', 'plantillas', 'inscripciones', 'jugadores', 'equipos', 'temporadas'];
  poner text[] := array['temporadas', 'equipos', 'jugadores', 'inscripciones', 'plantillas', 'partidos', 'actuaciones', 'lives', 'videos', 'premios'];
begin
  foreach tabla in array borrar loop
    if jsonb_typeof(p_cambios -> tabla -> 'quitar') = 'array' then
      execute format('delete from public.%I where id in (select jsonb_array_elements_text($1))', tabla)
        using p_cambios -> tabla -> 'quitar';
    end if;
  end loop;
  foreach tabla in array poner loop
    if jsonb_typeof(p_cambios -> tabla -> 'poner') = 'array' and jsonb_array_length(p_cambios -> tabla -> 'poner') > 0 then
      select string_agg(format('%I = excluded.%I', a.attname, a.attname), ', ' order by a.attnum)
        into columnas
        from pg_catalog.pg_attribute a
       where a.attrelid = format('public.%I', tabla)::regclass
         and a.attnum > 0
         and not a.attisdropped
         and a.attname <> 'id';
      execute format('insert into public.%I select * from jsonb_populate_recordset(null::public.%I, $1) on conflict (id) do update set %s', tabla, tabla, columnas)
        using p_cambios -> tabla -> 'poner';
    end if;
  end loop;
  if jsonb_typeof(p_cambios -> 'ajustes') = 'object' then
    update public.ajustes
       set sitio = case when jsonb_typeof(p_cambios -> 'ajustes' -> 'sitio') = 'object' then p_cambios -> 'ajustes' -> 'sitio' else sitio end,
           temporada_actual = case when p_cambios -> 'ajustes' ? 'temporada_actual' then p_cambios -> 'ajustes' ->> 'temporada_actual' else temporada_actual end
     where id = 1;
  end if;
end;
$$;

revoke all on function privado.poner_filas(jsonb) from public, anon, authenticated;

create or replace function public.guardar_cambios(p_cambios jsonb, p_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actual integer;
begin
  if not public.es_creador() then
    raise exception 'prohibido' using errcode = '42501';
  end if;
  if p_cambios is null or jsonb_typeof(p_cambios) <> 'object' then
    raise exception 'datos no validos' using errcode = '22023';
  end if;
  if pg_column_size(p_cambios) > 5000000 then
    raise exception 'datos demasiado grandes' using errcode = '22023';
  end if;
  select version into actual from public.ajustes where id = 1 for update;
  if actual is distinct from p_version then
    raise exception 'conflicto' using errcode = '40001';
  end if;
  insert into public.ligue_versiones (version, datos) values (actual, public.leer_ligue());
  delete from public.ligue_versiones where id in (select id from public.ligue_versiones order by id desc offset 60);
  perform privado.poner_filas(p_cambios);
  update public.ajustes set version = version + 1, actualizado = now() where id = 1 returning version into actual;
  return actual;
end;
$$;

revoke all on function public.guardar_cambios(jsonb, integer) from public, anon;
grant execute on function public.guardar_cambios(jsonb, integer) to authenticated;

create or replace function public.restaurar_ligue(p_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  copia jsonb;
  cambios jsonb := '{}'::jsonb;
  tabla text;
  nueva integer;
begin
  if not public.es_creador() then
    raise exception 'prohibido' using errcode = '42501';
  end if;
  select v.datos into copia from public.ligue_versiones v where v.version = p_version order by v.id desc limit 1;
  if copia is null then
    raise exception 'version no encontrada' using errcode = 'P0002';
  end if;
  perform public.guardar_cambios('{}'::jsonb, (select version from public.ajustes where id = 1));
  update public.ajustes set temporada_actual = null where id = 1;
  delete from public.temporadas;
  delete from public.equipos;
  delete from public.jugadores;
  foreach tabla in array array['temporadas', 'equipos', 'jugadores', 'inscripciones', 'plantillas', 'partidos', 'actuaciones', 'lives', 'videos', 'premios'] loop
    cambios := cambios || jsonb_build_object(tabla, jsonb_build_object('poner', coalesce(copia -> tabla, '[]'::jsonb)));
  end loop;
  cambios := cambios || jsonb_build_object('ajustes', jsonb_build_object('sitio', copia -> 'sitio', 'temporada_actual', copia ->> 'temporadaActual'));
  perform privado.poner_filas(cambios);
  update public.ajustes set version = version + 1, actualizado = now() where id = 1 returning version into nueva;
  return nueva;
end;
$$;

revoke all on function public.restaurar_ligue(integer) from public, anon;
grant execute on function public.restaurar_ligue(integer) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ligue-s', 'ligue-s', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ligue_s_fotos_ver" on storage.objects;
create policy "ligue_s_fotos_ver" on storage.objects
  for select to authenticated
  using (bucket_id = 'ligue-s' and (select public.es_creador()));

drop policy if exists "ligue_s_fotos_subir" on storage.objects;
create policy "ligue_s_fotos_subir" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ligue-s' and (select public.es_creador()));

drop policy if exists "ligue_s_fotos_cambiar" on storage.objects;
create policy "ligue_s_fotos_cambiar" on storage.objects
  for update to authenticated
  using (bucket_id = 'ligue-s' and (select public.es_creador()))
  with check (bucket_id = 'ligue-s' and (select public.es_creador()));

drop policy if exists "ligue_s_fotos_borrar" on storage.objects;
create policy "ligue_s_fotos_borrar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'ligue-s' and (select public.es_creador()));
