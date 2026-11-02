# Ligue S · web

Web de la Ligue S, liga amateur de fútbol 5 organizada por Tom Hallé. Está en francés y Tom la gestiona desde la propia web, con el modo creador.

- **Accueil**: logo, temporada en curso, texto de presentación, reglas y baremo de puntos, próximo partido, calendario y último récap.
- **Calendrier**: partidos y lives por día, con las pestañas «À venir» y «Résultats». Cada partido jugado enseña el marcador, los goleadores y el hombre del partido (la nota más alta).
- **Équipes**: clasificación por puntos (J, G, N, P, BP, BC, Diff y forma), tarjetas de los equipos y podio de los tres mejores jugadores por nota media. Cada equipo tiene su página con su foto de grupo, las fichas de los jugadores (nota media en grande), sus partidos y sus temporadas anteriores.
- **Joueurs**: podio y clasificación de todos los jugadores por nota media (o por goles). Cada jugador tiene su página con su nota en cada partido, su historial por temporadas y los vídeos de sus partidos.
- **Vidéos**: récaps de los lives de YouTube. El reproductor no se carga hasta que se pulsa (youtube-nocookie).
- **Palmarès**: campeón y premios de cada temporada.
- **Politique de confidentialité**: derecho a la imagen, notas, RGPD y alojamiento. Pie con YouTube, Instagram, «Organisée par Tom Hallé» y «Site créé par A2WD Studio».

En Calendrier, Équipes, Joueurs y Vidéos hay un selector para ver las temporadas pasadas. Por defecto sale la temporada en curso.

## Cómo se organizan los datos

Todo está enlazado por identificadores, así que cada dato se escribe una sola vez y lo demás se calcula:

| Dato | Qué guarda | Enlazado con |
| --- | --- | --- |
| Temporadas | Nombre («Saison 5») y orden | — |
| Equipos | Nombre, sigla, color, logo y foto de grupo | — |
| Jugadores | Nombre, puesto y foto | — |
| Inscripciones | Qué equipos juegan cada temporada | temporada, equipo |
| Plantillas | En qué equipo juega cada jugador cada temporada, con su dorsal y si es capitán | temporada, equipo, jugador |
| Partidos | Fecha, hora, equipos, jornada, campo y marcador | temporada, equipos |
| Actuaciones | La nota (de 0 a 10, de 0,25 en 0,25) y los goles de un jugador en un partido | partido, jugador, equipo |
| Lives y vídeos | Directos anunciados y récaps de YouTube | temporada (y partido para los vídeos) |
| Premios | Nombre del premio, ganador (jugador o equipo) y precisión | temporada, jugador o equipo |

La clasificación, los goles de cada jugador, las medias, el hombre del partido, el podio, el campeón y los historiales salen de esas tablas. El podio cuenta solo a los jugadores con un mínimo de partidos con nota (3 por defecto, se cambia en «Paramètres»).

Un equipo o un jugador que vuelve otra temporada es el mismo: conserva su ficha, sus notas y su historial.

## Archivos

| Archivo | Qué hace |
| --- | --- |
| `index.html` | Página única; las secciones van por `#inicio`, `#calendrier`, `#equipes`, `#equipe-…`, `#joueurs`, `#joueur-…`, `#videos`, `#palmares`, `#confidentialite` y `#createur`. |
| `config.js` | Dirección y clave pública de Supabase. Vacíos = modo local. |
| `logo.svg` | Logo oficial de la Ligue S en vector (azul `#1D418F` y blanco), redibujado a partir del JPG oficial. |
| `icono.svg` | Icono de la pestaña del navegador. |
| `estilo.css` | Todo el diseño, con modo claro y oscuro. |
| `js/app.js` | Arranque, rutas, temporada elegida, guardado y botones. |
| `js/vistas.js` | El HTML de cada página. |
| `js/editor.js` | Formularios del modo creador (hoja de partido, temporadas, premios…). |
| `js/logica.js` | Limpieza de datos, clasificación, notas, medias, podio, historiales, calendario y fechas en francés. |
| `js/sincronizar.js` | Calcula qué filas han cambiado para mandar a Supabase solo eso. |
| `js/almacen.js` | Guarda en el navegador (modo local) o en Supabase (modo en línea). |
| `js/imagen.js` | Reduce las fotos antes de guardarlas (mantiene la transparencia de los PNG recortados). |
| `js/ejemplo.js` | Las dos temporadas de ejemplo del modo local. |
| `supabase/ligue-s.sql` | Tablas, permisos, funciones y almacén de fotos para el modo en línea. |
| `docs/GUIDE.md` | Guía en francés para Tom. |

## Dos modos

**Modo local (ahora).** Con `config.js` vacío, la web abre en modo creador y guarda en el navegador de quien la usa. Sirve para enseñarla y probarla, pero lo que se cambia solo lo ve ese navegador. Arranca con dos temporadas de ejemplo (la 4, terminada y con premios, y la 5, en curso); desde «Données» se pueden borrar o volver a poner.

**Modo en línea (para pasársela a Tom).** Con Supabase configurado, la gente ve la web sin herramientas y Tom entra por «Espace créateur» (pie de página, o `#createur`) con su correo y contraseña. Solo los correos de la tabla `creadores` pueden cambiar algo.

## Ponerla en GitHub

1. Crear el repositorio `web-futbol` (público) y subir el contenido del zip a `main`, sin carpeta envoltorio.
2. *Settings › Pages*: «Deploy from a branch», rama `main`, carpeta `/ (root)`.
3. La web queda en `https://abelolivalopez-sketch.github.io/web-futbol/`.

## Activar el modo en línea (Supabase)

1. Crear un proyecto nuevo en Supabase para la liga, en una región de Europa (por ejemplo París).
2. *SQL Editor*: pegar `supabase/ligue-s.sql` y ejecutarlo. Se puede ejecutar otra vez sin romper nada. Crea la «Saison 5» como temporada en curso.
3. *Authentication › Users › Add user*: crear el usuario de Tom con su correo y una contraseña, marcando «Auto Confirm User».
4. En el *SQL Editor*, darle permiso:
   ```sql
   insert into public.creadores (correo) values ('correo-de-tom@ejemplo.com');
   ```
5. *Authentication › Sign In / Providers*: desactivar «Allow new users to sign up», para que nadie más pueda crearse una cuenta.
6. *Authentication › URL Configuration*: en «Site URL», la dirección de la web.
7. *Project Settings › API Keys*: copiar la URL del proyecto y la clave pública (publishable o anon) en `config.js`:
   ```js
   window.LIGUE_S = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseClave: "sb_publishable_…"
   };
   ```
8. Entrar en `…/#createur` con la cuenta de Tom. Si ya se habían metido datos en modo local, en ese navegador: «Données › Télécharger» antes de rellenar `config.js`, y después, ya conectado, «Données › Importer». Las fotos se suben solas al almacén `ligue-s`.

Cómo funciona por dentro:

- La gente lee todo con una sola llamada (`leer_ligue`), sin límite de filas.
- Tom guarda con `guardar_cambios`, que recibe solo las filas nuevas, cambiadas o borradas y las aplica todas juntas (o ninguna). Nadie puede escribir directamente en las tablas.
- Cada guardado sube un número de versión. Si Tom tiene la web abierta en dos aparatos, el segundo avisa en vez de pisar los cambios.
- Antes de cada guardado se hace una copia completa en `ligue_versiones` (se guardan las 60 últimas).
- Las tablas comprueban los datos por su cuenta: notas de 0 a 10 de 0,25 en 0,25, un jugador en un solo equipo por temporada, partidos solo entre equipos inscritos en esa temporada, enlaces de YouTube válidos, etc.

Para volver a una versión anterior:

```sql
select version, guardado from public.ligue_versiones order by id desc limit 20;
```

y después, desde el *SQL Editor*, con el número de versión elegido:

```sql
begin;
select set_config('request.jwt.claim.sub', (select id::text from auth.users where email = 'correo-de-tom@ejemplo.com'), true);
select public.restaurar_ligue(12);
commit;
```

La restauración también guarda antes una copia, así que se puede deshacer.

Si Supabase no responde, la gente ve la última copia que guardó su navegador.

## Antes de publicarla de verdad

- Meter los equipos de la Saison 5 (Tom, o Abel con el modo local y luego «Importer»).
- Rellenar en «Paramètres» el correo de contacto (sale en la política de confidentialité). El organizador (Tom Hallé) y los enlaces de YouTube (@Ligue.S) e Instagram (@ligue._s) ya vienen puestos.
- Que Tom revise el texto de presentación y las reglas (las actuales son un borrador).
- Quitar `<meta name="robots" content="noindex">` de `index.html` cuando ya no haya datos de ejemplo.
- Si se cambia de alojamiento (dominio en Cloudflare, por ejemplo), actualizar el párrafo «Hébergement» en `js/vistas.js`.
- Las fuentes (Saira Extra Condensed y Barlow) se cargan de Google Fonts; la política lo indica. Si se prefiere no depender de Google, se pueden servir desde el propio repo.
