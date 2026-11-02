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
| `config.js` | Dónde se guardan los datos: repositorio de GitHub (ahora), Supabase o solo el navegador. |
| `datos.json` | Los datos de la liga. Lo escribe la web al guardar; no hay que tocarlo a mano. |
| `img/` | Fotos y logos subidos desde la web. |
| `logo.svg` | Logo oficial de la Ligue S en vector (azul `#1D418F` y blanco), redibujado a partir del JPG oficial. |
| `icono.svg` | Icono de la pestaña del navegador. |
| `estilo.css` | Todo el diseño, con modo claro y oscuro. |
| `js/app.js` | Arranque, rutas, temporada elegida, guardado y botones. |
| `js/vistas.js` | El HTML de cada página. |
| `js/editor.js` | Formularios del modo creador (hoja de partido, temporadas, premios…). |
| `js/logica.js` | Limpieza de datos, clasificación, notas, medias, podio, historiales, calendario y fechas en francés. |
| `js/sincronizar.js` | Calcula qué filas han cambiado para mandar a Supabase solo eso. |
| `js/github.js` | Lee y guarda `datos.json` y las fotos en el repositorio con la API de GitHub (un commit por guardado). |
| `js/almacen.js` | Guarda en el repositorio, en Supabase o en el navegador, según `config.js`. |
| `js/imagen.js` | Reduce las fotos antes de guardarlas (mantiene la transparencia de los PNG recortados). |
| `js/ejemplo.js` | Las dos temporadas de ejemplo del modo local. |
| `supabase/ligue-s.sql` | Tablas, permisos, funciones y almacén de fotos para el modo en línea. |
| `docs/GUIDE.md` | Guía en francés para Tom. |

## Cómo se guardan los datos

`config.js` decide dónde se guarda todo:

```js
window.LIGUE_S = {
  supabaseUrl: "",
  supabaseClave: "",
  github: { usuario: "abelolivalopez-sketch", repositorio: "WEB_FUT", rama: "main" }
};
```

**En el repositorio (ahora).** Con `github` relleno y Supabase vacío, los datos viven en el propio repositorio:

- `datos.json` en la raíz con equipos, jugadores, partidos, notas, temporadas, premios y textos.
- Las fotos y logos como archivos en `img/jugadores/`, `img/equipos/` e `img/sitio/`.
- El público lee esos archivos. No ve ningún botón del modo creador ni enlace al espacio creador.
- Para editar se entra por `…/WEB_FUT/#createur` con una **llave de GitHub** (ver abajo). Sin la llave nadie puede guardar nada, aunque conozca la dirección.
- Cada vez que se guarda algo, la web hace un commit en `main` («Ligue S : Joueur ajouté», etc.) con `datos.json` y las fotos nuevas. Las fotos que se cambian o se quitan se borran del repositorio en ese mismo commit.
- Quien edita ve el cambio al instante. El público lo ve cuando GitHub Pages termina de publicar, en uno o dos minutos.
- Todo queda en el historial del repositorio: para deshacer un cambio basta con revertir su commit en GitHub.
- Si `datos.json` cambia por otro lado mientras alguien edita (otro aparato, o una subida a mano), la web no lo pisa: avisa y pide recargar. Los cambios de código no molestan.

La primera vez que se entra con la llave en un navegador que ya tenía datos guardados de antes (el modo local), la web los enseña con el aviso «Ces données sont seulement dans ce navigateur» y el botón «Enregistrer sur GitHub», que los sube con sus fotos.

**Solo en el navegador.** Si en `config.js` se quita `github`, la web vuelve al modo local: cada navegador guarda lo suyo y se publica a mano con «Données › Publier sur le site» y subiendo `datos.json`.

**Supabase (opcional, más adelante).** Con `supabaseUrl` y `supabaseClave` rellenos manda Supabase: login con correo y contraseña y cambios al instante para todos. Los pasos están más abajo. El `datos.json` se pasa con «Données › Importer».

## La llave de GitHub

1. En GitHub: foto de perfil › *Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token*, o directamente https://github.com/settings/personal-access-tokens/new
2. Nombre: «Ligue S». Caducidad: la que quieras (cuando caduque, se crea otra igual).
3. *Repository access*: *Only select repositories* › `WEB_FUT`.
4. *Permissions › Repository permissions › Contents*: **Read and write**. No hace falta nada más.
5. *Generate token* y copiarla (empieza por `github_pat_`). GitHub no la vuelve a enseñar.
6. Abrir `https://abelolivalopez-sketch.github.io/WEB_FUT/#createur`, pegarla y «Se connecter». Se queda guardada en ese navegador hasta pulsar «Se déconnecter».

La llave solo sirve para este repositorio. Si se pierde o alguien la ve, se borra en la misma página de GitHub y se crea otra.

**Para pasársela a Tom.** Una llave *fine-grained* solo puede tocar repositorios de la cuenta que la crea. Lo más limpio es transferir el repositorio a la cuenta de Tom (*Settings › General › Transfer ownership*), cambiar `usuario` en `config.js` y que él cree su propia llave. La dirección de la web pasará a ser `https://<cuenta-de-tom>.github.io/WEB_FUT/`.

## Ponerla en GitHub

El repositorio es `WEB_FUT` (público).

1. Descomprimir el zip en el ordenador.
2. En GitHub, dentro del repositorio: *Add file › Upload files* y arrastrar **el contenido** de la carpeta (los archivos sueltos y las carpetas `js`, `docs` y `supabase`), no el zip ni la carpeta que los contiene. Commit directo a `main`.
3. Comprobar que en la raíz del repositorio están `index.html` y las carpetas `js`, `docs` y `supabase`.
4. *Settings › Pages*: «Deploy from a branch», rama `main`, carpeta `/ (root)`.
5. La web queda en `https://abelolivalopez-sketch.github.io/WEB_FUT/` (tarda uno o dos minutos).

Para actualizarla, se suben los archivos cambiados de la misma forma y GitHub reemplaza los que tienen el mismo nombre. Un archivo que ya no se usa hay que borrarlo a mano en GitHub.

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
