# Ligue S · web

Web de la Ligue S, liga amateur de fútbol 5 organizada por Tom Hallé. Está en francés y Tom la gestiona desde la propia web, con el modo creador.

- **Accueil**: logo, temporada en curso, texto de presentación, reglas y baremo de puntos, próximo partido, calendario y último récap.
- **Menú**: Accueil, Calendrier, un desplegable **Classements** (Équipes, Joueurs, Pronostiqueurs, Palmarès) y Vidéos. A la derecha, «Connexion» o el pseudo del visitante conectado.
- **Calendrier**: partidos y lives por día, con las pestañas «À venir» y «Résultats». Cada partido enseña el marcador, los goleadores, el hombre del partido (la nota más alta), la cota y el pronóstico del visitante, y lleva a su ficha.
- **Fiche du match** (`#match-…`): cabecera con el marcador, pronósticos, un **mini campo** con las fotos de los dos equipos colocados por puesto (al pasar o tocar una foto sale su ficha: nota, goles, tarjetas, comentario de Tom sobre su partido y descripción), suplentes, evaluación de cada equipo, goles y tarjetas, hombre del partido y vídeo.
- **Pronostiqueurs** (`#pronostics`): reglas del juego, partidos abiertos y clasificación de la temporada por créditos, con podio.
- **Mon compte** (`#compte`): crear cuenta (pseudo, correo y contraseña) o entrar; después, sus cifras, sus pronósticos, cambiar el pseudo, salir o borrar la cuenta.
- **Équipes**: clasificación por puntos (J, G, N, P, BP, BC, Diff y forma), tarjetas de los equipos y podio de los tres mejores jugadores por nota media. Cada equipo tiene su página con su foto de grupo, las fichas de los jugadores (nota media en grande), sus partidos y sus temporadas anteriores.
- **Joueurs**: podio y clasificación de todos los jugadores por nota media (o por goles), con sus tarjetas. Cada jugador tiene su página con su presentación, su nota, goles y tarjetas en cada partido y en total, su historial por temporadas y los vídeos de sus partidos.
- **Vidéos**: récaps de los lives de YouTube. El reproductor no se carga hasta que se pulsa (youtube-nocookie).
- **Palmarès**: campeón, premios (también el de mejor pronosticador) y los tres mejores pronosticadores de cada temporada.
- **Politique de confidentialité**: derecho a la imagen, notas, cuentas y pronósticos, RGPD y alojamiento. Pie con YouTube, Instagram, «Organisée par Tom Hallé» y «Site créé par A2WD Studio».

En Calendrier, Équipes, Joueurs y Vidéos hay un selector para ver las temporadas pasadas. Por defecto sale la temporada en curso.

## Los pronósticos

- Tom pone en cada partido la **cota** del equipo 1 en % (el equipo 2 tiene el resto). Sin cota no hay pronósticos.
- El visitante con cuenta elige un ganador, sin empate. Puede cambiarlo hasta el saque inicial (fecha y hora del partido, hora de París); luego se cierra.
- Cada acierto da `creditosAcierto` créditos (5 por defecto, se cambia en «Paramètres»). Un empate no da créditos a nadie.
- La clasificación es por temporada: créditos, luego aciertos, luego menos partidos jugados. Para la gala, Tom añade el premio «Meilleur pronostiqueur» con el pseudo del ganador.
- Si Tom cambia un equipo de un partido, se borran los pronósticos de ese partido.

## Cómo se organizan los datos

Todo está enlazado por identificadores, así que cada dato se escribe una sola vez y lo demás se calcula:

| Dato | Qué guarda | Enlazado con |
| --- | --- | --- |
| Temporadas | Nombre («Saison 5») y orden | — |
| Equipos | Nombre, sigla, color, logo y foto de grupo | — |
| Jugadores | Nombre, puesto, foto y descripción | — |
| Inscripciones | Qué equipos juegan cada temporada | temporada, equipo |
| Plantillas | En qué equipo juega cada jugador cada temporada, con su dorsal y si es capitán | temporada, equipo, jugador |
| Partidos | Fecha, hora, equipos, jornada, campo, marcador, cota y evaluación de cada equipo (nota y texto) | temporada, equipos |
| Actuaciones | La nota (de 0 a 10, de 0,25 en 0,25), los goles, las tarjetas (0–2 amarillas, 0–1 roja) y un comentario de un jugador en un partido | partido, jugador, equipo |
| Lives y vídeos | Directos anunciados y récaps de YouTube | temporada (y partido para los vídeos) |
| Premios | Nombre del premio, ganador (jugador, equipo o pseudo de un pronosticador) y precisión | temporada, jugador o equipo |
| Perfiles | Pseudo de cada visitante con cuenta (solo Supabase) | cuenta de Supabase |
| Pronósticos | Equipo elegido por un visitante en un partido (solo Supabase) | perfil, partido |

La clasificación, los goles de cada jugador, las medias, el hombre del partido, el podio, el campeón y los historiales salen de esas tablas. El podio cuenta solo a los jugadores con un mínimo de partidos con nota (3 por defecto, se cambia en «Paramètres»).

Un equipo o un jugador que vuelve otra temporada es el mismo: conserva su ficha, sus notas y su historial.

## Archivos

| Archivo | Qué hace |
| --- | --- |
| `index.html` | Página única; las secciones van por `#inicio`, `#calendrier`, `#match-…`, `#equipes`, `#equipe-…`, `#joueurs`, `#joueur-…`, `#pronostics`, `#compte`, `#videos`, `#palmares`, `#confidentialite` y `#createur`. |
| `config.js` | Dónde se guardan los datos: Supabase (ahora), repositorio de GitHub o solo el navegador. |
| `datos.json` | Los datos de la liga del modo repositorio. Con Supabase ya no se usa; se queda como copia de la etapa de prototipo. |
| `img/` | Fotos y logos subidos en el modo repositorio. Las fotos nuevas van al almacén `ligue-s` de Supabase. |
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
| `supabase/ligue-s.sql` | Tablas, permisos, funciones, cuentas, pronósticos y almacén de fotos para el modo en línea. |
| `docs/GUIDE.md` | Guía en francés para Tom. |

## Cómo se guardan los datos

`config.js` decide dónde se guarda todo. Si `supabaseUrl` y `supabaseClave` están rellenos, manda Supabase; si no, el repositorio (`github`); sin nada, el navegador.

**Supabase (ahora).** Proyecto `djfwsutpipgghprpcxas` (organización A2WD, región de Europa):

- La gente lee la liga con una sola llamada y ve los cambios en cuanto abre o recarga la página.
- Tom entra en `…/?createur` con su **correo y contraseña**. Solo los correos de la tabla `creadores` pueden editar.
- Los visitantes se crean una cuenta para pronosticar. Una cuenta de visitante no puede editar nada.
- Las fotos nuevas se suben al almacén `ligue-s`. Las que ya estaban en `img/` siguen saliendo de GitHub Pages.

**En el repositorio (etapa de prototipo).** Con Supabase vacío y `github` relleno, los datos viven en el propio repositorio:

- `datos.json` en la raíz y las fotos en `img/jugadores/`, `img/equipos/` e `img/sitio/`.
- Tom entraba en `…/?createur` con una **llave de GitHub** (ver abajo); cada guardado era un commit en `main` y el público lo veía en uno o dos minutos.
- En este modo no hay cuentas ni pronósticos: la web dice que «ouvriront bientôt».

**Solo en el navegador.** Sin Supabase ni `github`, cada navegador guarda lo suyo (con datos de ejemplo la primera vez) y se publica a mano con «Données › Publier sur le site».

Los dos enlaces no cambian: `https://abelolivalopez-sketch.github.io/WEB_FUT/` es siempre la web pública, y `https://abelolivalopez-sketch.github.io/WEB_FUT/?createur` el acceso de creador. Una página copiada desde el modo creador (`…?createur#equipes`) se ve como la web normal para quien no es creador.

## La llave de GitHub

Solo hace falta en el modo repositorio.

1. En GitHub: foto de perfil › *Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token*, o directamente https://github.com/settings/personal-access-tokens/new
2. Nombre: «Ligue S». Caducidad: la que quieras (cuando caduque, se crea otra igual).
3. *Repository access*: *Only select repositories* › `WEB_FUT`.
4. *Permissions › Repository permissions › Contents*: **Read and write**. No hace falta nada más.
5. *Generate token* y copiarla (empieza por `github_pat_`). GitHub no la vuelve a enseñar.
6. Abrir `https://abelolivalopez-sketch.github.io/WEB_FUT/?createur`, pegarla y «Se connecter». Se queda guardada en ese navegador hasta pulsar «Se déconnecter».

La llave solo sirve para este repositorio. Si se pierde o alguien la ve, se borra en la misma página de GitHub y se crea otra.

**Mientras sea un prototipo.** Para que Tom pruebe el modo creador: crear una segunda llave igual, solo para él, con caducidad corta (30 días), y mandársela por privado. Si hace falta, se borra la suya sin tocar la de Abel. Sus cambios aparecen en el historial a nombre de Abel.

**Para pasársela a Tom.** Una llave *fine-grained* solo puede tocar repositorios de la cuenta que la crea. Lo más limpio es transferir el repositorio a la cuenta de Tom (*Settings › General › Transfer ownership*), cambiar `usuario` en `config.js` y que él cree su propia llave. La dirección de la web pasará a ser `https://<cuenta-de-tom>.github.io/WEB_FUT/`.

## Dominio propio

Cuando se compre el dominio (por ejemplo `ligue-s.fr`), la web sigue en GitHub Pages; solo cambia la dirección.

1. Comprar el dominio, a ser posible a nombre de Tom.
2. En GitHub, verificar el dominio en la cuenta dueña del repositorio, antes de añadirlo al repositorio: foto de perfil › *Settings › Pages › Add a domain*. GitHub da un registro `TXT` para el DNS.
3. En el DNS del registrador:
   - Cuatro registros `A` para el dominio raíz: `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`.
   - Opcional, cuatro `AAAA`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` y `2606:50c0:8003::153`.
   - Un `CNAME` para `www` que apunte a `abelolivalopez-sketch.github.io` (sin `/WEB_FUT`).
4. En el repositorio: *Settings › Pages › Custom domain*, escribir el dominio y *Save*. GitHub añade un archivo `CNAME` a `main` con un commit; no hay que tocarlo.
5. Cuando GitHub lo permita (puede tardar hasta 24 h), marcar *Enforce HTTPS*.
6. Los enlaces pasan a ser `https://ligue-s.fr/` (público) y `https://ligue-s.fr/?createur` (creador). La dirección de github.io redirige sola al dominio.
7. La sesión se guarda por dirección: en el dominio nuevo hay que volver a conectarse en cada navegador (Tom y los visitantes).
8. En Supabase, *Authentication › URL Configuration*: poner el dominio nuevo en «Site URL».
9. Quitar `<meta name="robots" content="noindex">` de `index.html` cuando la web sea la definitiva, para que salga en Google.

Si el repositorio se transfiere a la cuenta de Tom, el `CNAME` del registro `www` pasa a ser `<cuenta-de-tom>.github.io` y el dominio se verifica en su cuenta.

## Ponerla en GitHub

El repositorio es `WEB_FUT` (público).

1. Descomprimir el zip en el ordenador.
2. En GitHub, dentro del repositorio: *Add file › Upload files* y arrastrar **el contenido** de la carpeta (los archivos sueltos y las carpetas `js`, `docs` y `supabase`), no el zip ni la carpeta que los contiene. Commit directo a `main`.
3. Comprobar que en la raíz del repositorio están `index.html` y las carpetas `js`, `docs` y `supabase`.
4. *Settings › Pages*: «Deploy from a branch», rama `main`, carpeta `/ (root)`.
5. La web queda en `https://abelolivalopez-sketch.github.io/WEB_FUT/` (tarda uno o dos minutos).

Para actualizarla, se suben los archivos cambiados de la misma forma y GitHub reemplaza los que tienen el mismo nombre. Un archivo que ya no se usa hay que borrarlo a mano en GitHub.

## Supabase

El proyecto ya está creado y `supabase/ligue-s.sql` aplicado. El archivo se puede ejecutar otra vez en el *SQL Editor* sin romper nada (por ejemplo, después de cambiarlo).

**Ajustes del panel** (*Authentication › Sign In / Providers › Email*):

- «Allow new users to sign up»: **activado**, para que los visitantes se creen su cuenta.
- «Confirm email»: **desactivado** por ahora. El correo de Supabase sin configurar solo llega a los miembros de la organización, así que los visitantes no recibirían el enlace. Cuando se configure un SMTP propio (Resend, *Authentication › Emails › SMTP Settings*), se vuelve a activar.
- *Authentication › URL Configuration*: «Site URL» = la dirección de la web.

**Dar acceso de creador.** Primero se crea la cuenta (desde la web, «Connexion › Créer un compte», o en *Authentication › Users › Add user* con «Auto Confirm User») y **después** se añade el correo:

```sql
insert into public.creadores (correo) values ('correo@ejemplo.com');
```

En ese orden nadie puede adelantarse y crearse una cuenta con ese correo. Para quitar el acceso: `delete from public.creadores where correo = '…';`.

**Pasarle el proyecto a Tom.** Tom crea su organización en Supabase e invita a Abel como miembro. Abel, como dueño de A2WD: *Project Settings › General › Transfer project* y elige la organización de Tom. La organización de destino no puede pasar de dos proyectos gratis. El proyecto conserva su identificador, así que `config.js` no debería cambiar (comprobarlo después). Después se añade el correo de Tom a `creadores` y, si se quiere, se quita el de Abel.

Cómo funciona por dentro:

- La gente lee todo con una sola llamada (`leer_ligue`), sin límite de filas.
- Tom guarda con `guardar_cambios`, que recibe solo las filas nuevas, cambiadas o borradas y las aplica todas juntas (o ninguna). Nadie puede escribir directamente en las tablas.
- Al crearse una cuenta, un disparador crea su perfil con el pseudo elegido (si ya existe, le añade un número). Cada visitante solo puede leer su perfil y sus pronósticos.
- Los pronósticos pasan por `pronosticar`, que comprueba en el servidor que el partido tiene cota, no tiene resultado y no ha empezado (hora de París). La clasificación sale de `clasificacion_pronosticos`, que solo devuelve pseudos y cifras, nunca correos.
- `borrar_cuenta` borra la cuenta, el perfil y los pronósticos del visitante.
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

- Meter los equipos de la Saison 5 (ya están los del repositorio).
- Rellenar en «Paramètres» el correo de contacto (sale en la política de confidentialité). El organizador (Tom Hallé) y los enlaces de YouTube (@Ligue.S) e Instagram (@ligue._s) ya vienen puestos.
- Que Tom revise el texto de presentación y las reglas (las actuales son un borrador).
- Quitar `<meta name="robots" content="noindex">` de `index.html` cuando ya no haya datos de ejemplo.
- Si se cambia de alojamiento (dominio en Cloudflare, por ejemplo), actualizar el párrafo «Hébergement» en `js/vistas.js`.
- Configurar el SMTP (Resend) y volver a activar «Confirm email».
- Las fuentes (Saira Extra Condensed y Barlow) se cargan de Google Fonts; la política lo indica. Si se prefiere no depender de Google, se pueden servir desde el propio repo.
