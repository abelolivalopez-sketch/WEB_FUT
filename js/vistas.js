import { fuenteImagen } from "./imagen.js";
import { esc, usuarioRed, sigla, tinta, iniciales, plural, ordinal, nota, media, nivelNota, diaLargo, partesDia, fechaCorta, fechaMini, porFecha, porMedia, porGoles, agenda, agruparPorDia, siguienteLive, siguientePartido, plantillaDe, temporadasDeJugador, estadisticas, historialEquipo, historialJugador, campeon, resultadoPartido, pronosticoAbierto, alineacion } from "./logica.js";

const ICONOS = {
  lapiz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  papelera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M10 7V4h4v3"/><path d="M6.5 7l1 13h9l1-13"/></svg>',
  mas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  hoja: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h4"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="lleno" d="M8 5.5v13l11-6.5z"/></svg>',
  externo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v6H4V6h6"/></svg>',
  estrella: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="lleno" d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/></svg>',
  flecha: '<svg class="flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  usuario: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'
};

const MARCA = '<svg class="marca-svg" viewBox="-45 -61 90 122" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M0 -61L45 -35L45 35L0 61L-45 35L-45 -35ZM0 -48.5L34 -29L34 -10.2L0 -29.1L-16.3 -20.1L34 10.1L34 29L0 48.5L-34 29L-34 10.2L0 29.1L16.3 20.1L-34 -10.1L-34 -29Z"/></svg>';

const MENU = [
  ["inicio", "Accueil"],
  ["calendrier", "Calendrier"],
  { id: "classements", titulo: "Classements", enlaces: [["equipes", "Équipes"], ["joueurs", "Joueurs"], ["pronostics", "Pronostiqueurs"], ["palmares", "Palmarès"]] },
  ["videos", "Vidéos"]
];

const LINEAS_TERRENO = {
  h: '<svg class="terreno-lineas lineas-h" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true"><rect x="2" y="2" width="156" height="96" rx="1"/><line x1="80" y1="2" x2="80" y2="98"/><circle cx="80" cy="50" r="12"/><circle class="lleno" cx="80" cy="50" r="0.9"/><rect x="2" y="26" width="18" height="48"/><rect x="140" y="26" width="18" height="48"/><rect x="0" y="40" width="2" height="20"/><rect x="158" y="40" width="2" height="20"/><circle class="lleno" cx="14" cy="50" r="0.9"/><circle class="lleno" cx="146" cy="50" r="0.9"/></svg>',
  v: '<svg class="terreno-lineas lineas-v" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true"><rect x="2" y="2" width="96" height="156" rx="1"/><line x1="2" y1="80" x2="98" y2="80"/><circle cx="50" cy="80" r="12"/><circle class="lleno" cx="50" cy="80" r="0.9"/><rect x="26" y="2" width="48" height="18"/><rect x="26" y="140" width="48" height="18"/><rect x="40" y="0" width="20" height="2"/><rect x="40" y="158" width="20" height="2"/><circle class="lleno" cx="50" cy="14" r="0.9"/><circle class="lleno" cx="50" cy="146" r="0.9"/></svg>'
};

function img(url) {
  return esc(fuenteImagen(url));
}

function estiloEquipo(e) {
  return e ? `--c:${e.color};--t:${tinta(e.color)}` : "--c:#1D418F;--t:#FFFFFF";
}

function hora(h) {
  return h ? h.replace(":", "h") : "";
}

function btnIcono(accion, etiqueta, id, icono) {
  return `<button type="button" class="btn-icono" data-accion="${accion}" data-id="${esc(id)}" aria-label="${esc(etiqueta)}" title="${esc(etiqueta)}">${icono}</button>`;
}

function btnCreador(accion, etiqueta, { id = "", icono = ICONOS.mas } = {}) {
  return `<button type="button" class="btn-creador" data-accion="${accion}"${id ? ` data-id="${esc(id)}"` : ""}>${icono}<span>${esc(etiqueta)}</span></button>`;
}

function herramientas(contenido, clase = "") {
  return `<div class="herramientas${clase ? ` ${clase}` : ""}">${contenido}</div>`;
}

function placa(e) {
  return e ? `<span class="placa" style="${estiloEquipo(e)}">${esc(sigla(e))}</span>` : "";
}

function escudoEquipo(e, tamano) {
  const contenido = e.logo ? `<img src="${img(e.logo)}" alt="">` : `<span>${esc(sigla(e))}</span>`;
  return `<span class="escudo escudo-${tamano}${e.logo ? " con-logo" : ""}" style="${estiloEquipo(e)}" aria-hidden="true">${contenido}</span>`;
}

function marcaLiga(sitio, clase) {
  return `<span class="${clase}${sitio.logo ? " con-logo" : ""}" aria-hidden="true">${sitio.logo ? `<img src="${img(sitio.logo)}" alt="">` : MARCA}</span>`;
}

function avatar(j, e, clase) {
  return `<span class="${clase}" style="${estiloEquipo(e)}">${j.foto ? `<img src="${img(j.foto)}" alt="" loading="lazy">` : `<span class="iniciales" aria-hidden="true">${esc(iniciales(j.nombre))}</span>`}</span>`;
}

function notaChip(n, clase = "") {
  return `<span class="nota nota-${nivelNota(n)}${clase ? ` ${clase}` : ""}">${n === null || n === undefined ? "–" : nota(n)}</span>`;
}

function mediaChip(n, clase = "") {
  return `<span class="nota nota-${nivelNota(n)}${clase ? ` ${clase}` : ""}">${n === null || n === undefined ? "–" : media(n)}</span>`;
}

function parrafos(t) {
  return t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
}

function vacio(textoVacio, accion = "") {
  return `<div class="vacio"><p>${esc(textoVacio)}</p>${accion}</div>`;
}

function selectorTemporada(ctx) {
  if (ctx.d.temporadas.length < 2) return `<p class="saison-unica">${esc(ctx.temporada.nombre)}</p>`;
  const opciones = [...ctx.d.temporadas].reverse().map((t) => `<option value="${esc(t.id)}"${t.id === ctx.t ? " selected" : ""}>${esc(t.nombre)}${t.id === ctx.actual ? " (en cours)" : ""}</option>`).join("");
  return `<label class="selector-saison" for="selector-temporada"><span class="sr">Saison affichée</span><select id="selector-temporada">${opciones}</select></label>`;
}

function paginaCabeza(ctx, titulo, textoCabeza, extra = "", conSelector = true) {
  return `<header class="pagina-cabeza">
    <div class="pagina-fila"><h1>${esc(titulo)}</h1>${conSelector ? selectorTemporada(ctx) : ""}</div>
    <p>${esc(textoCabeza)}</p>
    ${extra}
  </header>`;
}

function cabecera(ctx, activa) {
  const { sitio } = ctx.d;
  const enlace = ([h, t]) => `<a href="#${h}" class="menu-${h}"${h === activa ? ' aria-current="page"' : ""}>${t}</a>`;
  const items = MENU.map((m) => {
    if (Array.isArray(m)) return enlace(m);
    const dentro = m.enlaces.some(([h]) => h === activa);
    return `<div class="menu-grupo">
      <button type="button" class="menu-desplegar${dentro ? " es-activo" : ""}" data-accion="menu" aria-expanded="false" aria-controls="menu-${m.id}">${m.titulo}${ICONOS.flecha}</button>
      <div class="menu-lista" id="menu-${m.id}" hidden>${m.enlaces.map(enlace).join("")}</div>
    </div>`;
  }).join("");
  const cuenta = ctx.pronosticos
    ? `<a href="#compte" class="menu-cuenta"${activa === "compte" ? ' aria-current="page"' : ""} aria-label="${ctx.cuenta ? `Mon compte, ${esc(ctx.cuenta.pseudo)}` : "Se connecter"}">${ICONOS.usuario}<span>${ctx.cuenta ? esc(ctx.cuenta.pseudo) : "Connexion"}</span></a>`
    : "";
  return `<div class="cabecera-in">
    <a class="marca" href="#inicio" aria-label="${esc(sitio.nombre)}, accueil">${marcaLiga(sitio, "marca-logo")}<span class="marca-nombre">${esc(sitio.nombre)}</span></a>
    <nav class="menu" aria-label="Sections du site">${items}${cuenta}</nav>
  </div>`;
}

function barraCreador(ctx) {
  if (!ctx.puedeEditar) return ctx.d.ejemplo ? `<p class="aviso-ejemplo">Aperçu avec des équipes, des notes et des matchs d'exemple.</p>` : "";
  if (!ctx.creador) return `<button type="button" class="flotante" data-accion="modo-creador">${ICONOS.lapiz}<span>Mode créateur</span></button>`;
  const textos = {
    local: "Les modifications restent dans ce navigateur. Pour les montrer à tout le monde : « Données », puis « Publier sur le site ».",
    repo: "Connecté à GitHub. Chaque modification est enregistrée dans le dépôt ; le site public se met à jour une à deux minutes après.",
    nube: `Connecté avec ${esc(ctx.usuario?.email || "ton compte")}.`
  };
  const donde = textos[ctx.modo];
  const avisos = [
    ctx.pendiente ? 'Ces données sont seulement dans ce navigateur, pas encore sur GitHub. <button type="button" data-accion="guardar-pendiente">Enregistrer sur GitHub</button>' : "",
    !ctx.esActual ? `Tu modifies la ${esc(ctx.temporada.nombre)}, qui n'est pas la saison en cours.` : "",
    ctx.d.ejemplo ? "Les équipes, joueurs, notes et matchs affichés sont des exemples. Modifie-les ou efface tout depuis « Données »." : ""
  ].filter(Boolean);
  return `<div class="barra-creador">
    <div class="barra-in">
      <p class="barra-texto"><strong>Mode créateur</strong> <span>${donde}</span></p>
      <div class="barra-acciones">
        <button type="button" data-accion="ajustes">Paramètres</button>
        <button type="button" data-accion="temporadas">Saisons</button>
        <button type="button" data-accion="datos">Données</button>
        <button type="button" data-accion="modo-publico">Voir comme le public</button>
        ${ctx.modo !== "local" ? '<button type="button" data-accion="salir">Se déconnecter</button>' : ""}
      </div>
    </div>
    ${avisos.map((a) => `<p class="barra-ejemplo">${a}</p>`).join("")}
  </div>`;
}

function ladoEquipo(e, lado, ganador) {
  return `<a class="lado lado-${lado}${ganador ? " es-ganador" : ""}" href="#equipe-${esc(e.id)}">${placa(e)}<span class="lado-nombre">${esc(e.nombre)}</span></a>`;
}

function listaGoleadores(ctx, m, equipoId) {
  return (ctx.porPartido.get(m.id) || [])
    .filter((a) => a.equipo === equipoId && a.goles > 0)
    .sort((a, b) => b.goles - a.goles)
    .map((a) => `${esc(ctx.jugadores.get(a.jugador)?.nombre || "")}${a.goles > 1 ? ` <span class="veces">×${a.goles}</span>` : ""}`)
    .join(", ");
}

function lineaMvp(ctx, m) {
  const a = ctx.mvps.get(m.id);
  const j = a && ctx.jugadores.get(a.jugador);
  if (!j) return "";
  return `<p class="partido-mvp"><span class="mvp-marca">${ICONOS.estrella}Homme du match</span><a href="#joueur-${esc(j.id)}">${esc(j.nombre)}</a>${notaChip(a.nota)}</p>`;
}

function filaPartido(ctx, m) {
  const a = ctx.equipos.get(m.local);
  const b = ctx.equipos.get(m.visitante);
  const jugado = Boolean(m.goles);
  const diferencia = jugado ? Math.sign(m.goles[0] - m.goles[1]) : 0;
  const centro = jugado
    ? `<span class="tanteo" aria-label="Score : ${m.goles[0]} à ${m.goles[1]}"><span>${m.goles[0]}</span><span>${m.goles[1]}</span></span>`
    : `<span class="tanteo tanteo-hora">${m.hora ? hora(m.hora) : "vs"}</span>`;
  const meta = [m.jornada, m.lugar].filter(Boolean).map((t) => `<span>${esc(t)}</span>`);
  if (!jugado && m.fecha < ctx.hoy) meta.push('<span class="pendiente">Résultat à venir</span>');
  meta.push(`<a class="enlace-partido" href="#match-${esc(m.id)}">Fiche du match</a>`);
  const goleadores = jugado ? [listaGoleadores(ctx, m, a.id), listaGoleadores(ctx, m, b.id)] : ["", ""];
  const acciones = ctx.creador
    ? herramientas(`${btnCreador("resultado", jugado ? "Modifier la feuille de match" : "Feuille de match", { id: m.id, icono: ICONOS.hoja })}${btnIcono("editar-partido", "Modifier le match", m.id, ICONOS.lapiz)}${btnIcono("borrar-partido", "Supprimer le match", m.id, ICONOS.papelera)}`)
    : "";
  return `<article class="partido${jugado ? " es-jugado" : ""}">
    <div class="marcador">${ladoEquipo(a, "izq", diferencia === 1)}${centro}${ladoEquipo(b, "der", diferencia === -1)}</div>
    ${goleadores[0] || goleadores[1] ? `<p class="goleadores"><span>${goleadores[0]}</span><span>${goleadores[1]}</span></p>` : ""}
    ${jugado ? lineaMvp(ctx, m) : ""}
    ${m.cota ? lineaProno(ctx, m) : ""}
    ${meta.length ? `<p class="partido-meta">${meta.join("")}</p>` : ""}
    ${acciones}
  </article>`;
}

function cotas(ctx, m) {
  const a = ctx.equipos.get(m.local);
  const b = ctx.equipos.get(m.visitante);
  const elegido = ctx.misPronos.get(m.id);
  return `<div class="cotas" role="img" aria-label="Cote fixée par l'organisateur : ${esc(a.nombre)} ${m.cota} %, ${esc(b.nombre)} ${100 - m.cota} %">
    <span class="cota${elegido === "local" ? " es-elegida" : ""}" style="${estiloEquipo(a)};flex-grow:${m.cota}"><b>${esc(sigla(a))}</b>${m.cota} %</span>
    <span class="cota cota-der${elegido === "visitante" ? " es-elegida" : ""}" style="${estiloEquipo(b)};flex-grow:${100 - m.cota}">${100 - m.cota} %<b>${esc(sigla(b))}</b></span>
  </div>`;
}

function estadoProno(ctx, m) {
  const elegido = ctx.misPronos.get(m.id) || "";
  const resultado = resultadoPartido(m);
  return { elegido, resultado, abierto: pronosticoAbierto(m, ctx.ahora), acierto: resultado && elegido ? elegido === resultado : null };
}

function lineaProno(ctx, m) {
  const e = estadoProno(ctx, m);
  const equipoElegido = e.elegido ? ctx.equipos.get(e.elegido === "local" ? m.local : m.visitante) : null;
  let texto = "";
  if (e.elegido && e.resultado) texto = e.acierto ? `<span class="mi-prono es-acierto">Bien vu : +${plural(ctx.d.sitio.creditosAcierto, "crédit", "crédits")}</span>` : `<span class="mi-prono es-fallo">Pronostic raté</span>`;
  else if (equipoElegido) texto = `<span class="mi-prono">Ton pronostic : ${placa(equipoElegido)}</span>`;
  else if (e.abierto && ctx.pronosticos) texto = `<a class="mi-prono es-enlace" href="#match-${esc(m.id)}">Pronostiquer</a>`;
  return `<div class="partido-prono"><span class="partido-prono-titulo">Pronostics</span>${cotas(ctx, m)}${texto}</div>`;
}

function botonesProno(ctx, m) {
  const a = ctx.equipos.get(m.local);
  const b = ctx.equipos.get(m.visitante);
  const e = estadoProno(ctx, m);
  if (!e.abierto) return "";
  if (!ctx.pronosticos) return '<p class="prono-nota">Les pronostics ouvriront bientôt, avec les comptes visiteurs.</p>';
  if (!ctx.cuenta) return `<a class="btn btn-principal" href="#compte">Connecte-toi pour pronostiquer</a>`;
  const boton = (equipo, lado) => `<button type="button" class="prono-boton" style="${estiloEquipo(equipo)}" data-accion="pronostiquer" data-id="${esc(m.id)}" data-valor="${lado}" aria-pressed="${e.elegido === lado}">${placa(equipo)}<span>Victoire ${esc(equipo.nombre)}</span></button>`;
  return `<div class="prono-botones" role="group" aria-label="Ton pronostic">${boton(a, "local")}${boton(b, "visitante")}</div>`;
}

function textoProno(ctx, m) {
  const e = estadoProno(ctx, m);
  const creditos = plural(ctx.d.sitio.creditosAcierto, "crédit", "crédits");
  const nombre = (lado) => esc(ctx.equipos.get(lado === "local" ? m.local : m.visitante).nombre);
  if (e.resultado) {
    const r = e.resultado === "nul" ? "Match nul : aucun pronostic ne rapporte de crédit." : `Vainqueur : ${nombre(e.resultado)}.`;
    const propio = !e.elegido ? "" : e.resultado === "nul" ? "" : e.acierto ? ` <strong class="es-acierto">Bien vu, tu gagnes ${creditos}.</strong>` : ` <strong class="es-fallo">Ton pronostic (${nombre(e.elegido)}) est raté.</strong>`;
    return `${r}${propio}`;
  }
  if (!e.abierto) return `Pronostics fermés depuis le coup d'envoi. Résultat à venir.${e.elegido ? ` Ton pronostic : ${nombre(e.elegido)}.` : ""}`;
  const cierre = `${esc(diaLargo(m.fecha).toLowerCase())}${m.hora ? ` à ${hora(m.hora)}` : ""}`;
  return `Choisis l'équipe qui va gagner, jusqu'au coup d'envoi (${cierre}). Un bon pronostic rapporte ${creditos}.${e.elegido ? ` Ton pronostic : ${nombre(e.elegido)}. Tu peux encore changer.` : ""}`;
}

function bloqueProno(ctx, m) {
  if (!m.cota) return ctx.creador && !m.goles ? `<section class="seccion prono" aria-labelledby="t-prono"><div class="seccion-cabeza"><h2 id="t-prono">Pronostics</h2><p class="seccion-nota">Fixe une cote dans « Modifier le match » pour ouvrir les pronostics de ce match.</p></div>${btnCreador("editar-partido", "Fixer la cote", { id: m.id, icono: ICONOS.lapiz })}</section>` : "";
  return `<section class="seccion prono" aria-labelledby="t-prono">
    <div class="seccion-cabeza"><h2 id="t-prono">Pronostics</h2><p class="seccion-nota">${textoProno(ctx, m)}</p></div>
    <div class="prono-cotas"><span class="prono-etiqueta">Cote fixée par l'organisateur</span>${cotas(ctx, m)}</div>
    ${botonesProno(ctx, m)}
  </section>`;
}

function filaLive(ctx, l) {
  const pasado = l.fecha < ctx.hoy;
  const enlace = l.enlace || ctx.d.sitio.youtube;
  const acciones = ctx.creador ? herramientas(`${btnIcono("editar-live", "Modifier le live", l.id, ICONOS.lapiz)}${btnIcono("borrar-live", "Supprimer le live", l.id, ICONOS.papelera)}`) : "";
  return `<article class="live${pasado ? " es-pasado" : ""}">
    <span class="live-marca"><span class="punto" aria-hidden="true"></span>${pasado ? "Live terminé" : "Live"}</span>
    <p class="live-cuerpo"><strong>${esc(l.titulo)}</strong>${l.hora ? `<span>à ${hora(l.hora)}</span>` : ""}</p>
    ${enlace ? `<a class="live-enlace" href="${esc(enlace)}" target="_blank" rel="noopener">${pasado ? "Revoir sur YouTube" : "Regarder sur YouTube"}</a>` : ""}
    ${acciones}
  </article>`;
}

function listaDias(ctx, eventos) {
  return `<div class="dias">${agruparPorDia(eventos).map((g) => {
    const p = partesDia(g.fecha);
    return `<section class="dia" aria-label="${esc(diaLargo(g.fecha))}">
      <time class="dia-fecha" datetime="${g.fecha}"><span class="dia-semana">${esc(p.semana)}</span><span class="dia-num">${p.numero}</span><span class="dia-mes">${esc(p.mes)}</span></time>
      <div class="dia-eventos">${g.eventos.map((e) => (e.tipo === "partido" ? filaPartido(ctx, e.dato) : filaLive(ctx, e.dato))).join("")}</div>
    </section>`;
  }).join("")}</div>`;
}

function botonesAgenda(ctx) {
  return ctx.creador ? `<div class="acciones-creador">${btnCreador("nuevo-partido", "Ajouter un match")}${btnCreador("nuevo-live", "Ajouter un live")}</div>` : "";
}

function tablero(ctx) {
  const m = siguientePartido(ctx.d, ctx.actual);
  const l = siguienteLive(ctx.d, ctx.actual, ctx.hoy);
  const equipoFila = (e) => `<a class="tablero-equipo" href="#equipe-${esc(e.id)}">${placa(e)}<span>${esc(e.nombre)}</span></a>`;
  const partido = m
    ? `<div class="tablero-cuerpo">
        <div class="tablero-equipos">${equipoFila(ctx.equipos.get(m.local))}${equipoFila(ctx.equipos.get(m.visitante))}</div>
        <span class="tablero-hora">${m.hora ? hora(m.hora) : "vs"}</span>
      </div>
      <p class="tablero-meta"><time datetime="${m.fecha}">${esc(diaLargo(m.fecha))}</time>${m.jornada ? `<span>${esc(m.jornada)}</span>` : ""}${m.lugar ? `<span>${esc(m.lugar)}</span>` : ""}</p>`
    : `<p class="tablero-vacio">Les prochains matchs seront annoncés ici.</p>`;
  const enlaceLive = l ? l.enlace || ctx.d.sitio.youtube : "";
  const live = l
    ? `<${enlaceLive ? `a href="${esc(enlaceLive)}" target="_blank" rel="noopener"` : "div"} class="tablero-live"><span class="punto" aria-hidden="true"></span><span><strong>${esc(l.titulo)}</strong> ${esc(diaLargo(l.fecha))}${l.hora ? ` à ${hora(l.hora)}` : ""}</span></${enlaceLive ? "a" : "div"}>`
    : "";
  return `<aside class="tablero" aria-label="Prochain match">
    <p class="tablero-titulo">Prochain match</p>
    ${partido}
    ${live}
  </aside>`;
}

function baremo(puntos) {
  return `Victoire ${plural(puntos.victoria, "pt", "pts")}, nul ${plural(puntos.empate, "pt", "pts")}, défaite ${plural(puntos.derrota, "pt", "pts")}.`;
}

function ordenarVideos(videos) {
  return [...videos].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
}

function miniPartido(ctx, m) {
  const a = ctx.equipos.get(m.local);
  const b = ctx.equipos.get(m.visitante);
  return `<span class="mini-partido">${placa(a)}${m.goles ? `<b>${m.goles[0]} - ${m.goles[1]}</b>` : "<b>vs</b>"}${placa(b)}</span>`;
}

function tarjetaVideo(ctx, v, destacado) {
  const m = v.partido ? ctx.d.partidos.find((p) => p.id === v.partido) : null;
  const acciones = ctx.creador ? herramientas(`${btnIcono("editar-video", "Modifier la vidéo", v.id, ICONOS.lapiz)}${btnIcono("borrar-video", "Supprimer la vidéo", v.id, ICONOS.papelera)}`) : "";
  return `<article class="video${destacado ? " es-destacado" : ""}">
    <div class="video-marco" data-marco="${esc(v.id)}">
      <button type="button" class="video-play" data-accion="reproducir" data-id="${esc(v.id)}" aria-label="Lire la vidéo ${esc(v.titulo)}">
        <img class="miniatura" src="https://i.ytimg.com/vi/${esc(v.youtube)}/hqdefault.jpg" alt="" loading="lazy">
        <span class="video-icono">${ICONOS.play}</span>
      </button>
    </div>
    <div class="video-texto">
      <h3>${esc(v.titulo)}</h3>
      ${v.fecha || m ? `<p class="video-meta">${v.fecha ? `<span>${esc(fechaCorta(v.fecha))}</span>` : ""}${m ? miniPartido(ctx, m) : ""}</p>` : ""}
      <a class="video-yt" href="https://www.youtube.com/watch?v=${esc(v.youtube)}" target="_blank" rel="noopener">Voir sur YouTube${ICONOS.externo}</a>
      ${acciones}
    </div>
  </article>`;
}

function podio(ctx, filas, valor) {
  if (!filas.length) return vacio(valor === "media" ? `Le podium apparaîtra quand des joueurs auront ${plural(ctx.d.sitio.minimoNotas, "match noté", "matchs notés")}.` : "Le podium apparaîtra après les premiers buts.");
  return `<ol class="podio">${filas.map((f, i) => `<li class="podio-paso paso-${i + 1}">
    <a class="podio-figura" href="#joueur-${esc(f.jugador.id)}" tabindex="-1" aria-hidden="true">
      ${avatar(f.jugador, f.equipo, `podio-foto${f.jugador.foto ? " con-foto" : ""}`)}
      <span class="podio-sombra"></span>
    </a>
    <div class="podio-escalon">
      <span class="podio-puesto"><span class="sr">${ordinal(f.puesto)} : </span><span aria-hidden="true">${f.puesto}</span></span>
      <a class="podio-nombre" href="#joueur-${esc(f.jugador.id)}">${esc(f.jugador.nombre)}</a>
      <span class="podio-equipo">${placa(f.equipo)}<span>${esc(f.equipo.nombre)}</span></span>
      ${valor === "media"
        ? `<span class="podio-valor"><strong>${media(f.media)}</strong> de moyenne</span><span class="podio-detalle">${plural(f.notas, "match noté", "matchs notés")}, ${plural(f.goles, "but", "buts")}</span>`
        : `<span class="podio-valor"><strong>${f.goles}</strong> ${f.goles > 1 ? "buts" : "but"}</span><span class="podio-detalle">${plural(f.pj, "match", "matchs")}</span>`}
    </div>
  </li>`).join("")}</ol>`;
}

function inicio(ctx) {
  const { d } = ctx;
  const { proximos } = agenda(d, ctx.actual, ctx.hoy);
  const ultimo = ordenarVideos(d.videos)[0];
  const youtube = d.sitio.youtube
    ? `<a class="btn btn-claro" href="${esc(d.sitio.youtube)}" target="_blank" rel="noopener">Les lives sur YouTube</a>`
    : ctx.creador ? `<button type="button" class="btn btn-claro btn-falta" data-accion="ajustes">Ajouter le lien YouTube</button>` : "";
  return `<section class="portada">
    <div class="portada-in">
      <div class="portada-texto">
        <div class="portada-firma">
          ${marcaLiga(d.sitio, "portada-marca")}
          <div class="portada-nombre">
            <p class="portada-temporada">${esc(ctx.temporadaActual.nombre)}</p>
            <h1 class="portada-titulo">${esc(d.sitio.nombre)}</h1>
          </div>
        </div>
        ${d.sitio.lema ? `<p class="portada-lema">${esc(d.sitio.lema)}</p>` : ""}
        <div class="portada-acciones"><a class="btn btn-principal" href="#calendrier">Voir le calendrier</a>${youtube}</div>
      </div>
      ${tablero(ctx)}
    </div>
  </section>
  <div class="contenedor pila">
    <section class="liga" aria-labelledby="t-liga">
      <div class="liga-texto">
        <div class="seccion-cabeza"><h2 id="t-liga">${esc(d.sitio.presentacion.titulo || "La ligue")}</h2>${ctx.creador ? btnCreador("editar-presentacion", "Modifier le texte", { icono: ICONOS.lapiz }) : ""}</div>
        <div class="prosa">${parrafos(d.sitio.presentacion.texto)}</div>
      </div>
      <section class="reglas" aria-labelledby="t-reglas">
        <div class="seccion-cabeza"><h2 id="t-reglas">Les règles</h2>${ctx.creador ? btnCreador("editar-reglas", "Modifier les règles", { icono: ICONOS.lapiz }) : ""}</div>
        ${d.sitio.reglas.length ? `<ul class="reglas-lista">${d.sitio.reglas.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
        <p class="baremo"><strong>Barème</strong> ${baremo(d.sitio.puntos)}</p>
      </section>
    </section>
    <section class="seccion" aria-labelledby="t-agenda">
      <div class="seccion-cabeza"><h2 id="t-agenda">Calendrier</h2>${ctx.esActual ? botonesAgenda(ctx) : ""}</div>
      ${proximos.length ? listaDias({ ...ctx, mvps: new Map() }, proximos.slice(0, 6)) : vacio("Aucun match ni live de prévu pour l'instant.")}
      <a class="enlace-mas" href="#calendrier">Tout le calendrier et les résultats</a>
    </section>
    ${ultimo ? `<section class="seccion" aria-labelledby="t-recap">
      <div class="seccion-cabeza"><h2 id="t-recap">Dernier récap</h2></div>
      <div class="videos videos-uno">${tarjetaVideo(ctx, ultimo, true)}</div>
      <a class="enlace-mas" href="#videos">Toutes les vidéos</a>
    </section>` : ""}
  </div>`;
}

function calendario(ctx) {
  const { proximos, pasados } = agenda(ctx.d, ctx.t, ctx.hoy);
  const verPasados = ctx.filtro === "pasados";
  const lista = verPasados ? pasados : proximos;
  return `<div class="contenedor pila">
    ${paginaCabeza(ctx, "Calendrier", "Les matchs à venir, les lives et tous les résultats de la saison.", botonesAgenda(ctx))}
    <div class="pestanas" role="group" aria-label="Afficher">
      <button type="button" class="pestana" data-accion="filtro" data-valor="proximos" aria-pressed="${!verPasados}">À venir <span class="cuenta">${proximos.length}</span></button>
      <button type="button" class="pestana" data-accion="filtro" data-valor="pasados" aria-pressed="${verPasados}">Résultats <span class="cuenta">${pasados.length}</span></button>
    </div>
    ${lista.length ? listaDias(ctx, lista) : vacio(verPasados ? "Les résultats apparaîtront après les premiers matchs." : "Aucun match ni live de prévu pour cette saison.")}
  </div>`;
}

function tablaClasificacion(ctx) {
  if (!ctx.tabla.length) return vacio("Le classement apparaîtra dès que les équipes seront inscrites.", ctx.creador ? btnCreador("nuevo-equipo", "Inscrire une équipe") : "");
  const forma = (f) => `<span class="forma" aria-label="Forme : ${f.forma.join(" ") || "aucun match"}">${f.forma.map((r) => `<i class="forma-${r}" title="${{ V: "Victoire", N: "Nul", D: "Défaite" }[r]}">${r}</i>`).join("")}</span>`;
  return `<div class="tabla-marco"><table class="clasif">
    <caption class="sr">Classement des équipes, du premier au dernier</caption>
    <thead><tr>
      <th scope="col" class="c-pos"><abbr title="Position">#</abbr></th>
      <th scope="col" class="c-equipo">Équipe</th>
      <th scope="col" class="c-pts"><abbr title="Points">Pts</abbr></th>
      <th scope="col"><abbr title="Matchs joués">J</abbr></th>
      <th scope="col"><abbr title="Gagnés">G</abbr></th>
      <th scope="col"><abbr title="Nuls">N</abbr></th>
      <th scope="col"><abbr title="Perdus">P</abbr></th>
      <th scope="col" class="c-op"><abbr title="Buts pour">BP</abbr></th>
      <th scope="col" class="c-op"><abbr title="Buts contre">BC</abbr></th>
      <th scope="col"><abbr title="Différence de buts">Diff</abbr></th>
      <th scope="col" class="c-forma">Forme</th>
    </tr></thead>
    <tbody>${ctx.tabla.map((f) => `<tr>
      <td class="c-pos">${f.posicion}</td>
      <th scope="row" class="c-equipo"><a href="#equipe-${esc(f.equipo.id)}">${placa(f.equipo)}<span>${esc(f.equipo.nombre)}</span></a></th>
      <td class="c-pts">${f.pts}</td>
      <td>${f.pj}</td><td>${f.g}</td><td>${f.n}</td><td>${f.p}</td>
      <td class="c-op">${f.gf}</td><td class="c-op">${f.gc}</td>
      <td>${f.dif > 0 ? `+${f.dif}` : f.dif}</td>
      <td class="c-forma">${forma(f)}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function equipos(ctx) {
  const tarjetas = ctx.tabla
    .slice()
    .sort((a, b) => a.equipo.nombre.localeCompare(b.equipo.nombre, "fr"))
    .map((f) => {
      const total = ctx.d.plantillas.filter((p) => p.temporada === ctx.t && p.equipo === f.equipo.id).length;
      return `<a class="equipo-tarjeta" href="#equipe-${esc(f.equipo.id)}" style="${estiloEquipo(f.equipo)}">
        ${escudoEquipo(f.equipo, "md")}
        <span class="et-texto">
          <span class="et-nombre">${esc(f.equipo.nombre)}</span>
          <span class="et-datos">${f.pj ? `${ordinal(f.posicion)} avec ${plural(f.pts, "pt", "pts")}` : "Pas encore de match"}</span>
          <span class="et-datos">${plural(total, "joueur", "joueurs")}</span>
        </span>
      </a>`;
    }).join("");
  return `<div class="contenedor pila">
    ${paginaCabeza(ctx, "Classement", "Le classement de la saison, les effectifs de chaque équipe et les meilleurs joueurs.", ctx.creador ? `<div class="acciones-creador">${btnCreador("nuevo-equipo", "Inscrire une équipe")}</div>` : "")}
    <section class="seccion" aria-labelledby="t-clasif">
      <div class="seccion-cabeza"><h2 id="t-clasif">Classement</h2></div>
      ${tablaClasificacion(ctx)}
    </section>
    ${ctx.tabla.length ? `<section class="seccion" aria-labelledby="t-equipos">
      <div class="seccion-cabeza"><h2 id="t-equipos">Les équipes</h2><p class="seccion-nota">Choisis une équipe pour voir les fiches de ses joueurs.</p></div>
      <div class="equipos-grid">${tarjetas}</div>
    </section>` : ""}
    <section class="seccion" aria-labelledby="t-podio">
      <div class="seccion-cabeza"><h2 id="t-podio">Meilleurs joueurs</h2><p class="seccion-nota">Moyenne des notes données à chaque match, à partir de ${plural(ctx.d.sitio.minimoNotas, "match noté", "matchs notés")}.</p></div>
      ${podio(ctx, ctx.mejores, "media")}
      <a class="enlace-mas" href="#joueurs">Le classement complet des joueurs</a>
    </section>
  </div>`;
}

function tarjetas(amarillas, rojas, conCero = false) {
  const partes = [];
  if (amarillas) partes.push(`<span class="carton carton-jaune" title="${plural(amarillas, "carton jaune", "cartons jaunes")}"></span>${amarillas > 1 ? `<span class="carton-veces">×${amarillas}</span>` : ""}<span class="sr">${plural(amarillas, "carton jaune", "cartons jaunes")}</span>`);
  if (rojas) partes.push(`<span class="carton carton-rouge" title="${plural(rojas, "carton rouge", "cartons rouges")}"></span>${rojas > 1 ? `<span class="carton-veces">×${rojas}</span>` : ""}<span class="sr">${plural(rojas, "carton rouge", "cartons rouges")}</span>`);
  if (!partes.length) return conCero ? "0" : "";
  return `<span class="cartons">${partes.join("")}</span>`;
}

function ficha(ctx, p) {
  const j = p.datos;
  const e = ctx.equipos.get(p.equipo);
  const s = ctx.stats.get(j.id);
  const acciones = ctx.creador ? herramientas(`${btnIcono("editar-jugador", `Modifier ${j.nombre}`, j.id, ICONOS.lapiz)}${btnIcono("borrar-jugador", `Retirer ${j.nombre} de la saison`, j.id, ICONOS.papelera)}`, "herramientas-ficha") : "";
  return `<article class="ficha" style="${estiloEquipo(e)}">
    <div class="ficha-foto">
      ${j.foto ? `<img src="${img(j.foto)}" alt="" loading="lazy">` : `<span class="ficha-iniciales" aria-hidden="true">${esc(iniciales(j.nombre))}</span>`}
      ${p.numero !== null ? `<span class="ficha-num"><span class="sr">Numéro </span>${p.numero}</span>` : ""}
      ${p.capitan ? '<span class="ficha-cap" title="Capitaine"><span aria-hidden="true">C</span><span class="sr">Capitaine</span></span>' : ""}
    </div>
    <div class="ficha-pie">
      <h3 class="ficha-nombre"><a href="#joueur-${esc(j.id)}">${esc(j.nombre)}</a></h3>
      <p class="ficha-puesto">${esc(j.puesto || "Joueur")}</p>
      <div class="ficha-nota">${mediaChip(s?.media ?? null)}<span>moyenne</span></div>
      <p class="ficha-detalle">${plural(s?.pj || 0, "match", "matchs")}, ${plural(s?.goles || 0, "but", "buts")}${tarjetas(s?.amarillas || 0, s?.rojas || 0)}</p>
    </div>
    ${acciones}
  </article>`;
}

function tablaHistorialEquipo(historial) {
  return `<div class="tabla-marco"><table class="clasif tabla-simple">
    <thead><tr><th scope="col" class="c-equipo">Saison</th><th scope="col">Place</th><th scope="col">Pts</th><th scope="col"><abbr title="Matchs joués">J</abbr></th><th scope="col"><abbr title="Gagnés, nuls, perdus">G-N-P</abbr></th><th scope="col"><abbr title="Différence de buts">Diff</abbr></th></tr></thead>
    <tbody>${historial.map((h) => `<tr>
      <th scope="row" class="c-equipo">${esc(h.temporada.nombre)}</th>
      <td>${h.fila?.pj ? ordinal(h.fila.posicion) : "–"}</td>
      <td class="c-pts">${h.fila?.pts ?? 0}</td>
      <td>${h.fila?.pj ?? 0}</td>
      <td>${h.fila ? `${h.fila.g}-${h.fila.n}-${h.fila.p}` : "–"}</td>
      <td>${h.fila ? (h.fila.dif > 0 ? `+${h.fila.dif}` : h.fila.dif) : "–"}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function equipo(ctx, id) {
  const e = ctx.equipos.get(id);
  if (!e) {
    return `<div class="contenedor pila"><header class="pagina-cabeza"><h1>Équipe introuvable</h1><p>Cette équipe n'existe plus ou le lien est incomplet.</p></header><a class="enlace-mas" href="#equipes">Voir toutes les équipes</a></div>`;
  }
  const fila = ctx.posiciones.get(id);
  const historial = historialEquipo(ctx.d, id);
  if (!fila) {
    return `<section class="equipo-cabeza" style="${estiloEquipo(e)}">
      <div class="equipo-cabeza-in">
        <a class="volver" href="#equipes">Toutes les équipes</a>
        <div class="equipo-identidad">${escudoEquipo(e, "xl")}<div><h1>${esc(e.nombre)}</h1><p>Pas inscrite à la ${esc(ctx.temporada.nombre)}</p></div></div>
      </div>
    </section>
    <div class="contenedor pila">
      <div class="pagina-fila">${selectorTemporada(ctx)}</div>
      ${historial.length ? `<section class="seccion" aria-labelledby="t-historial"><div class="seccion-cabeza"><h2 id="t-historial">Ses saisons</h2></div>${tablaHistorialEquipo(historial)}</section>` : ""}
    </div>`;
  }
  const plantilla = plantillaDe(ctx.d, ctx.t, id);
  const suyos = ctx.d.partidos.filter((m) => m.temporada === ctx.t && (m.local === id || m.visitante === id));
  const aEvento = (m) => ({ tipo: "partido", fecha: m.fecha, hora: m.hora, dato: m });
  const proximos = suyos.filter((m) => !m.goles).sort(porFecha).map(aEvento);
  const jugados = suyos.filter((m) => m.goles).sort((a, b) => porFecha(b, a)).map(aEvento);
  const resumen = fila.pj ? `${ordinal(fila.posicion)} de la ${esc(ctx.temporada.nombre)} avec ${plural(fila.pts, "point", "points")}` : `Pas encore de match joué cette saison`;
  const cifras = [["Joués", fila.pj], ["Gagnés", fila.g], ["Nuls", fila.n], ["Perdus", fila.p], ["Buts pour", fila.gf], ["Buts contre", fila.gc]];
  return `<section class="equipo-cabeza${e.foto ? " con-foto" : ""}" style="${estiloEquipo(e)}">
    <div class="equipo-cabeza-in">
      <div class="equipo-cabeza-texto">
        <a class="volver" href="#equipes">Toutes les équipes</a>
        <div class="equipo-identidad">
          ${escudoEquipo(e, "xl")}
          <div><h1>${esc(e.nombre)}</h1><p>${resumen}</p></div>
        </div>
        <dl class="equipo-cifras">${cifras.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join("")}</dl>
        ${ctx.creador ? herramientas(`${btnCreador("editar-equipo", "Modifier l'équipe", { id, icono: ICONOS.lapiz })}${btnCreador("borrar-equipo", "Retirer de la saison", { id, icono: ICONOS.papelera })}`, "herramientas-equipo") : ""}
      </div>
      ${e.foto ? `<figure class="equipo-foto"><img src="${img(e.foto)}" alt="Photo de l'équipe ${esc(e.nombre)}"></figure>` : ""}
    </div>
  </section>
  <div class="contenedor pila">
    <div class="pagina-fila">${selectorTemporada(ctx)}</div>
    <section class="seccion" aria-labelledby="t-efectivo">
      <div class="seccion-cabeza"><h2 id="t-efectivo">Effectif</h2>${ctx.creador ? `<div class="acciones-creador">${btnCreador("nuevo-jugador", "Ajouter un joueur", { id })}</div>` : ""}</div>
      ${plantilla.length ? `<div class="fichas">${plantilla.map((p) => ficha(ctx, p)).join("")}</div>` : vacio("Les joueurs de cette équipe n'ont pas encore été ajoutés.")}
    </section>
    <section class="seccion" aria-labelledby="t-proximos">
      <div class="seccion-cabeza"><h2 id="t-proximos">Prochains matchs</h2></div>
      ${proximos.length ? listaDias(ctx, proximos) : vacio("Aucun match prévu pour cette équipe.")}
    </section>
    ${jugados.length ? `<section class="seccion" aria-labelledby="t-resultados">
      <div class="seccion-cabeza"><h2 id="t-resultados">Résultats</h2></div>
      ${listaDias(ctx, jugados)}
    </section>` : ""}
    ${historial.length > 1 ? `<section class="seccion" aria-labelledby="t-historial"><div class="seccion-cabeza"><h2 id="t-historial">Ses saisons</h2></div>${tablaHistorialEquipo(historial)}</section>` : ""}
  </div>`;
}

function filaRanking(ctx, f, puesto) {
  return `<tr${puesto ? "" : ' class="no-clasificado"'}>
    <td class="c-pos">${puesto ?? "–"}</td>
    <th scope="row" class="c-jugador"><a href="#joueur-${esc(f.jugador.id)}">${avatar(f.jugador, f.equipo, "mini-foto")}<span class="cj-texto"><span class="cj-nombre">${esc(f.jugador.nombre)}</span><span class="cj-equipo">${placa(f.equipo)}</span></span></a></th>
    <td>${f.pj}</td>
    <td>${mediaChip(f.media)}</td>
    <td class="c-goles">${f.goles}</td>
    <td class="c-op">${f.mejor === null ? "–" : nota(f.mejor)}</td>
    <td class="c-op">${f.mvp}</td>
    <td class="c-op">${tarjetas(f.amarillas || 0, f.rojas || 0) || "–"}</td>
  </tr>`;
}

function jugadores(ctx) {
  const porNota = ctx.ordenJugadores !== "buts";
  const min = ctx.d.sitio.minimoNotas;
  let filas;
  if (porNota) {
    const aptos = ctx.ranking.filter((f) => f.notas >= min && f.media !== null).sort(porMedia);
    const resto = ctx.ranking.filter((f) => !(f.notas >= min && f.media !== null)).sort(porMedia);
    filas = [...aptos.map((f) => [f, aptos.findIndex((o) => o.media === f.media) + 1]), ...resto.map((f) => [f, null])];
  } else {
    const orden = ctx.ranking.slice().sort(porGoles);
    filas = orden.map((f) => [f, f.goles > 0 ? orden.findIndex((o) => o.goles === f.goles) + 1 : null]);
  }
  return `<div class="contenedor pila">
    ${paginaCabeza(ctx, "Joueurs", "Le classement des joueurs de la saison, d'après les notes données à chaque match.")}
    <section class="seccion" aria-labelledby="t-mejores">
      <div class="seccion-cabeza"><h2 id="t-mejores">${porNota ? "Meilleurs joueurs" : "Meilleurs buteurs"}</h2><p class="seccion-nota">${porNota ? `Moyenne des notes, à partir de ${plural(min, "match noté", "matchs notés")}.` : "Nombre de buts marqués dans la saison."}</p></div>
      ${podio(ctx, porNota ? ctx.mejores : ctx.goleadores, porNota ? "media" : "goles")}
    </section>
    <section class="seccion" aria-labelledby="t-ranking">
      <div class="seccion-cabeza"><h2 id="t-ranking">Classement</h2>
        <div class="pestanas" role="group" aria-label="Classer par">
          <button type="button" class="pestana" data-accion="orden-jugadores" data-valor="nota" aria-pressed="${porNota}">Par note</button>
          <button type="button" class="pestana" data-accion="orden-jugadores" data-valor="buts" aria-pressed="${!porNota}">Par buts</button>
        </div>
      </div>
      ${filas.length ? `<div class="tabla-marco"><table class="clasif ranking">
        <caption class="sr">Classement des joueurs ${porNota ? "par moyenne des notes" : "par buts"}</caption>
        <thead><tr>
          <th scope="col" class="c-pos">#</th>
          <th scope="col" class="c-jugador">Joueur</th>
          <th scope="col"><abbr title="Matchs joués">J</abbr></th>
          <th scope="col">Moy.</th>
          <th scope="col" class="c-goles">Buts</th>
          <th scope="col" class="c-op"><abbr title="Meilleure note">Max</abbr></th>
          <th scope="col" class="c-op"><abbr title="Homme du match">HdM</abbr></th>
          <th scope="col" class="c-op">Cartons</th>
        </tr></thead>
        <tbody>${filas.map(([f, p]) => filaRanking(ctx, f, p)).join("")}</tbody>
      </table></div>
      ${porNota ? `<p class="tabla-nota">Les joueurs sans numéro de place n'ont pas encore ${plural(min, "match noté", "matchs notés")}.</p>` : ""}` : vacio("Les joueurs apparaîtront ici une fois ajoutés aux équipes.")}
    </section>
    <a class="enlace-mas" href="#palmares">Le palmarès de la ligue</a>
  </div>`;
}

function jugador(ctx, id) {
  const j = ctx.jugadores.get(id);
  if (!j) {
    return `<div class="contenedor pila"><header class="pagina-cabeza"><h1>Joueur introuvable</h1><p>Ce joueur n'existe plus ou le lien est incomplet.</p></header><a class="enlace-mas" href="#joueurs">Voir tous les joueurs</a></div>`;
  }
  const suyas = temporadasDeJugador(ctx.d, id);
  const st = suyas.some((t) => t.id === ctx.t) || !suyas.length ? ctx.t : suyas[suyas.length - 1].id;
  const temporada = ctx.d.temporadas.find((t) => t.id === st);
  const stats = st === ctx.t ? ctx.stats : estadisticas(ctx.d, st);
  const s = stats.get(id) || { pj: 0, notas: 0, goles: 0, amarillas: 0, rojas: 0, media: null, mejor: null, mvp: 0, equipo: "" };
  const p = ctx.d.plantillas.find((x) => x.temporada === st && x.jugador === id);
  const e = ctx.equipos.get(p?.equipo || s.equipo);
  const partidos = new Map(ctx.d.partidos.map((m) => [m.id, m]));
  const actuaciones = ctx.d.actuaciones
    .filter((a) => a.jugador === id && partidos.get(a.partido)?.temporada === st)
    .map((a) => ({ ...a, m: partidos.get(a.partido) }))
    .sort((a, b) => porFecha(b.m, a.m));
  const historial = historialJugador(ctx.d, id);
  const videosSuyos = ctx.d.videos.filter((v) => actuaciones.some((a) => a.partido === v.partido));
  const cifras = [
    ["Moyenne", mediaChip(s.media, "nota-grande")],
    ["Matchs", s.pj],
    ["Buts", s.goles],
    ["Meilleure note", s.mejor === null ? "–" : nota(s.mejor)],
    ["Homme du match", s.mvp],
    ["Cartons", tarjetas(s.amarillas, s.rojas, true)]
  ];
  const filaMatch = (a) => {
    const rival = ctx.equipos.get(a.m.local === a.equipo ? a.m.visitante : a.m.local);
    const propio = a.m.local === a.equipo ? a.m.goles[0] : a.m.goles[1];
    const contra = a.m.local === a.equipo ? a.m.goles[1] : a.m.goles[0];
    const resultado = propio > contra ? "V" : propio === contra ? "N" : "D";
    const mvp = ctx.mvps.get(a.m.id)?.jugador === id;
    return `<tr>
      <td class="c-fecha">${esc(fechaMini(a.m.fecha))}</td>
      <th scope="row" class="c-equipo"><a class="rival" href="#match-${esc(a.m.id)}">contre ${placa(rival)}<span class="rival-nombre">${esc(rival?.nombre || "")}</span></a></th>
      <td><span class="resultado"><i class="forma-${resultado}">${resultado}</i>${propio}-${contra}</span></td>
      <td>${notaChip(a.nota)}${mvp ? `<span class="mvp-icono" title="Homme du match">${ICONOS.estrella}<span class="sr">Homme du match</span></span>` : ""}</td>
      <td class="c-goles">${a.goles || ""}</td>
      <td>${tarjetas(a.amarillas || 0, a.rojas || 0)}</td>
    </tr>`;
  };
  const acciones = ctx.creador && p && st === ctx.t ? herramientas(`${btnCreador("editar-jugador", "Modifier le joueur", { id, icono: ICONOS.lapiz })}${btnCreador("borrar-jugador", "Retirer de la saison", { id, icono: ICONOS.papelera })}`, "herramientas-equipo") : "";
  return `<section class="jugador-cabeza" style="${estiloEquipo(e)}">
    <div class="jugador-cabeza-in">
      ${avatar(j, e, `jugador-foto${j.foto ? " con-foto" : ""}`)}
      <div class="jugador-datos">
        ${e ? `<a class="volver" href="#equipe-${esc(e.id)}">${esc(e.nombre)}</a>` : `<a class="volver" href="#joueurs">Tous les joueurs</a>`}
        <h1>${p?.numero !== null && p?.numero !== undefined ? `<span class="jugador-num">${p.numero}</span>` : ""}${esc(j.nombre)}</h1>
        <p class="jugador-sub">${esc([j.puesto, p?.capitan ? "Capitaine" : "", temporada?.nombre].filter(Boolean).join(", "))}</p>
        <dl class="jugador-cifras">${cifras.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join("")}</dl>
        ${acciones}
      </div>
    </div>
  </section>
  <div class="contenedor pila">
    <div class="pagina-fila">${selectorTemporada(ctx)}${st !== ctx.t ? `<p class="saison-nota">Pas de match pour ce joueur dans la saison choisie : tu vois la ${esc(temporada?.nombre || "")}.</p>` : ""}</div>
    ${j.descripcion ? `<section class="seccion" aria-labelledby="t-presentacion"><div class="seccion-cabeza"><h2 id="t-presentacion">Présentation</h2></div><div class="prosa">${parrafos(j.descripcion)}</div></section>` : ""}
    <section class="seccion" aria-labelledby="t-matchs">
      <div class="seccion-cabeza"><h2 id="t-matchs">Ses matchs</h2></div>
      ${actuaciones.length ? `<div class="tabla-marco"><table class="clasif tabla-matchs">
        <thead><tr><th scope="col" class="c-fecha">Date</th><th scope="col" class="c-equipo">Match</th><th scope="col">Score</th><th scope="col">Note</th><th scope="col" class="c-goles">Buts</th><th scope="col">Cartons</th></tr></thead>
        <tbody>${actuaciones.map(filaMatch).join("")}</tbody>
      </table></div>` : vacio("Pas encore de note pour ce joueur cette saison.")}
    </section>
    ${historial.length ? `<section class="seccion" aria-labelledby="t-carrera">
      <div class="seccion-cabeza"><h2 id="t-carrera">Ses saisons</h2></div>
      <div class="tabla-marco"><table class="clasif tabla-simple">
        <thead><tr><th scope="col" class="c-equipo">Saison</th><th scope="col" class="c-equipo">Équipe</th><th scope="col"><abbr title="Matchs joués">J</abbr></th><th scope="col">Moy.</th><th scope="col" class="c-goles">Buts</th></tr></thead>
        <tbody>${historial.map((h) => `<tr><th scope="row" class="c-equipo">${esc(h.temporada.nombre)}</th><td class="c-equipo">${h.equipo ? `<a href="#equipe-${esc(h.equipo.id)}">${placa(h.equipo)}<span>${esc(h.equipo.nombre)}</span></a>` : "–"}</td><td>${h.pj}</td><td>${mediaChip(h.media)}</td><td class="c-goles">${h.goles}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>` : ""}
    ${videosSuyos.length ? `<section class="seccion" aria-labelledby="t-videos-j">
      <div class="seccion-cabeza"><h2 id="t-videos-j">Ses matchs en vidéo</h2></div>
      <div class="videos">${ordenarVideos(videosSuyos).map((v) => tarjetaVideo(ctx, v, false)).join("")}</div>
    </section>` : ""}
  </div>`;
}

function videos(ctx) {
  const lista = ordenarVideos(ctx.d.videos.filter((v) => v.temporada === ctx.t));
  const vacioTexto = ctx.creador ? "Colle le lien d'un live YouTube pour ajouter le premier récap de la saison." : "Les récaps des lives de cette saison arriveront ici.";
  return `<div class="contenedor pila">
    ${paginaCabeza(ctx, "Vidéos", "Les récaps des lives de la ligue, à revoir quand tu veux.", ctx.creador ? `<div class="acciones-creador">${btnCreador("nuevo-video", "Ajouter une vidéo")}</div>` : "")}
    ${lista.length ? `<div class="videos">${lista.map((v, i) => tarjetaVideo(ctx, v, i === 0)).join("")}</div>` : vacio(vacioTexto)}
    ${ctx.d.sitio.youtube ? `<a class="enlace-mas" href="${esc(ctx.d.sitio.youtube)}" target="_blank" rel="noopener">Toutes les vidéos sur la chaîne YouTube</a>` : ""}
  </div>`;
}

function tarjetaPremio(ctx, premio) {
  const j = premio.jugador ? ctx.jugadores.get(premio.jugador) : null;
  const plantilla = j ? ctx.d.plantillas.find((p) => p.temporada === premio.temporada && p.jugador === j.id) : null;
  const e = premio.equipo ? ctx.equipos.get(premio.equipo) : plantilla ? ctx.equipos.get(plantilla.equipo) : null;
  const ganador = premio.pronostiqueur
    ? `<span class="premio-foto premio-pseudo" style="--c:var(--terrain);--t:var(--sur-terrain)" aria-hidden="true">${esc(iniciales(premio.pronostiqueur))}</span><span class="premio-ganador"><span class="premio-pseudo-nombre">${esc(premio.pronostiqueur)}</span><span class="premio-equipo">Pronostiqueur</span></span>`
    : j
    ? `${avatar(j, e, "premio-foto")}<span class="premio-ganador"><a href="#joueur-${esc(j.id)}">${esc(j.nombre)}</a>${e ? `<span class="premio-equipo">${placa(e)}<span>${esc(e.nombre)}</span></span>` : ""}</span>`
    : e ? `${escudoEquipo(e, "md")}<span class="premio-ganador"><a href="#equipe-${esc(e.id)}">${esc(e.nombre)}</a></span>` : `<span class="premio-ganador">À décerner</span>`;
  const acciones = ctx.creador ? herramientas(`${btnIcono("editar-premio", "Modifier le prix", premio.id, ICONOS.lapiz)}${btnIcono("borrar-premio", "Supprimer le prix", premio.id, ICONOS.papelera)}`, "herramientas-premio") : "";
  return `<article class="premio">
    <h3 class="premio-nombre">${esc(premio.nombre)}</h3>
    <div class="premio-cuerpo">${ganador}</div>
    ${premio.detalle ? `<p class="premio-detalle">${esc(premio.detalle)}</p>` : ""}
    ${acciones}
  </article>`;
}

function palmares(ctx) {
  const temporadas = [...ctx.d.temporadas].reverse();
  return `<div class="contenedor pila">
    ${paginaCabeza(ctx, "Palmarès", "Les champions et les prix de chaque saison de la ligue.", "", false)}
    ${temporadas.map((t) => {
      const premios = ctx.d.premios.filter((p) => p.temporada === t.id);
      const ganador = campeon(ctx.d, t.id);
      const tienePremioCampeon = ganador && premios.some((p) => p.equipo === ganador.equipo.id);
      const enCurso = t.id === ctx.actual;
      return `<section class="seccion palmares-saison" aria-labelledby="t-pal-${esc(t.id)}">
        <div class="seccion-cabeza"><h2 id="t-pal-${esc(t.id)}">${esc(t.nombre)}${enCurso ? ' <span class="etiqueta">en cours</span>' : ""}</h2>${ctx.creador ? btnCreador("nuevo-premio", "Ajouter un prix", { id: t.id }) : ""}</div>
        ${ganador && !tienePremioCampeon ? `<a class="campeon" href="#equipe-${esc(ganador.equipo.id)}" style="${estiloEquipo(ganador.equipo)}">${escudoEquipo(ganador.equipo, "md")}<span><span class="campeon-titulo">Champion</span><span class="campeon-nombre">${esc(ganador.equipo.nombre)}</span><span class="campeon-detalle">${plural(ganador.pts, "point", "points")}, ${ganador.g}-${ganador.n}-${ganador.p}</span></span></a>` : ""}
        ${premios.length ? `<div class="premios">${premios.map((p) => tarjetaPremio(ctx, p)).join("")}</div>` : vacio(enCurso ? "Les prix de la saison seront remis à la fin du championnat." : "Aucun prix enregistré pour cette saison.")}
        ${ctx.pronosticos ? palmaresProno(ctx, t, enCurso) : ""}
      </section>`;
    }).join("")}
  </div>`;
}

function confidencialidad(ctx) {
  const { sitio } = ctx.d;
  const responsable = sitio.responsable ? `${esc(sitio.responsable)}, organisateur de la ligue,` : "l'organisateur de la ligue,";
  const correo = sitio.correo ? `<a href="mailto:${esc(sitio.correo)}">${esc(sitio.correo)}</a>` : `<span class="falta">adresse e-mail à compléter dans les paramètres</span>`;
  const nube = ctx.modo === "nube";
  return `<div class="contenedor pila">
    ${paginaCabeza(ctx, "Politique de confidentialité", `Comment la ${sitio.nombre} utilise les noms, les photos, les notes et les vidéos des joueurs, et ce que le site fait quand vous le visitez.`, "", false)}
    <div class="prosa legal">
      <h2>Qui est responsable du site</h2>
      <p>Le site de la ${esc(sitio.nombre)} est édité par ${responsable} qui en est aussi le directeur de la publication. Pour toute question ou demande : ${correo}.</p>

      <h2>Ce que le site publie</h2>
      <p>Pour faire vivre la ligue, le site affiche le nom ou le surnom des joueurs, leur numéro, leur poste, leur équipe, les buts marqués, la note sportive donnée par l'organisateur après chaque match et, s'ils le souhaitent, leur photo. Il publie aussi le calendrier, les résultats, les classements, le palmarès et les vidéos des matchs. Ces informations sont conservées d'une saison à l'autre pour l'historique de la ligue.</p>
      <p>Ces informations servent uniquement à présenter la ligue. Elles ne sont ni vendues, ni utilisées pour de la publicité, ni transmises à d'autres organisateurs.</p>

      <h2>Photos, vidéos et droit à l'image</h2>
      <p>Les matchs de la ligue peuvent être filmés, diffusés en direct sur YouTube puis publiés en récap. Chaque joueur en est informé avant de rejoindre la ligue et donne son accord pour l'utilisation de son image. Pour un joueur mineur, l'accord d'un parent est obligatoire.</p>
      <p>Un joueur peut demander à tout moment le retrait de sa photo, de sa fiche ou d'un passage vidéo qui le concerne en écrivant à ${correo}. La demande est traitée dans un délai d'un mois.</p>

      <h2>Base légale et durée de conservation</h2>
      <p>La publication des photos et des vidéos repose sur le consentement des joueurs. La publication des résultats, des buts, des notes, des classements et du palmarès repose sur l'intérêt légitime de la ligue à présenter ses compétitions. Les fiches restent en ligne pendant la saison et dans l'historique de la ligue, sauf demande de retrait.</p>

      ${nube ? `<h2>Comptes et pronostics</h2>
      <p>Pour jouer aux pronostics, vous pouvez créer un compte avec un pseudo, une adresse e-mail et un mot de passe. Votre pseudo et vos résultats (pronostics joués, bons pronostics, crédits) apparaissent dans le classement public. Votre adresse e-mail et le détail de vos pronostics ne sont visibles que par vous ; l'organisateur n'y accède que pour la gestion technique du site.</p>
      <p>Ces données servent uniquement au jeu de pronostics, qui est gratuit et sans argent. Elles sont conservées tant que votre compte existe. Vous pouvez supprimer votre compte à tout moment depuis « Mon compte » : votre pseudo, votre adresse e-mail et vos pronostics sont alors effacés. La base légale est l'exécution du service que vous demandez en créant votre compte. Si vous avez moins de 15 ans, demandez l'accord d'un parent avant de créer un compte.</p>` : ""}

      <h2>Votre visite sur le site</h2>
      <p>Le site ne dépose aucun cookie de suivi, ne mesure pas l'audience et ne demande ${nube ? "un compte que pour les pronostics" : "aucun compte aux visiteurs"}. Il utilise seulement le stockage local de votre navigateur pour fonctionner${nube ? " (une copie des contenus publics pour s'afficher plus vite et votre connexion si vous avez un compte)" : ""}.</p>
      <p>Les polices de caractères sont chargées depuis Google Fonts, ce qui transmet votre adresse IP à Google.</p>

      <h2>Vidéos YouTube</h2>
      <p>Les vidéos sont hébergées par YouTube, un service de Google. Les miniatures sont chargées depuis les serveurs de YouTube. Le lecteur ne se charge que lorsque vous cliquez sur une vidéo, en mode de confidentialité renforcée ; YouTube peut alors utiliser des cookies selon sa propre <a href="https://policies.google.com/privacy?hl=fr" target="_blank" rel="noopener">politique de confidentialité</a>.</p>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis), qui peut enregistrer l'adresse IP des visiteurs pour la sécurité du service.${nube ? " Les contenus de la ligue et les photos des joueurs sont stockés chez Supabase, dans un centre de données situé dans l'Union européenne." : ""}</p>

      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous pouvez demander l'accès, la rectification ou l'effacement des informations qui vous concernent, ou vous opposer à leur publication, en écrivant à ${correo}. Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener">cnil.fr</a>).</p>

      <h2>Conception</h2>
      <p>Site conçu par A2WD Studio (<a href="https://a2wdstudio.com" target="_blank" rel="noopener">a2wdstudio.com</a>).</p>
    </div>
  </div>`;
}

function acceso(ctx) {
  return `<div class="contenedor pila">
    <section class="acceso" aria-labelledby="t-acceso">
      <h1 id="t-acceso">Espace créateur</h1>
      <p>Connecte-toi pour modifier les équipes, le calendrier, les notes, les résultats et les vidéos.</p>
      ${ctx.modo === "local" ? "" : "<p>Garde cette adresse dans tes favoris : c'est ton accès au mode créateur. L'adresse du site sans « ?createur » montre toujours la version publique.</p>"}
      ${ctx.modo === "local" ? "<p>Le mode créateur est déjà ouvert sur cet appareil.</p>" : ctx.modo === "repo" ? `<form class="formulario" id="form-acceso" novalidate>
        <label class="campo" for="acceso-llave"><span class="campo-etiqueta">Clé d'accès GitHub</span><input id="acceso-llave" name="llave" type="password" autocomplete="off" spellcheck="false" required aria-describedby="acceso-llave-ayuda"></label>
        <small class="campo-ayuda" id="acceso-llave-ayuda">Une clé « fine-grained » limitée au dépôt du site, avec la permission « Contents » en lecture et écriture. <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Créer une clé sur GitHub</a>. Elle reste enregistrée dans ce navigateur.</small>
        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="btn btn-principal">Se connecter</button>
      </form>` : `<form class="formulario" id="form-acceso" novalidate>
        <label class="campo"><span class="campo-etiqueta">E-mail</span><input id="acceso-correo" name="correo" type="email" autocomplete="username" required></label>
        <label class="campo"><span class="campo-etiqueta">Mot de passe</span><input id="acceso-clave" name="clave" type="password" autocomplete="current-password" required></label>
        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="btn btn-principal">Se connecter</button>
      </form>`}
    </section>
  </div>`;
}

function pie(ctx) {
  const { sitio } = ctx.d;
  const redes = [["YouTube", sitio.youtube], ["Instagram", sitio.instagram]].filter(([, url]) => url);
  const enlaceRed = ([nombre, url]) => {
    const usuario = usuarioRed(url);
    return `<a href="${esc(url)}" target="_blank" rel="noopener"><span class="red-nombre">${nombre}</span>${usuario ? `<span class="red-usuario">${esc(usuario)}</span>` : ""}</a>`;
  };
  const faltan = ctx.creador && redes.length < 2 ? `<button type="button" class="btn-creador" data-accion="ajustes">${ICONOS.lapiz}<span>Ajouter les liens YouTube et Instagram</span></button>` : "";
  return `<div class="pie-in">
    <div class="pie-marca">
      ${marcaLiga(sitio, "pie-logo")}
      <div class="pie-textos">
        <span class="pie-nombre">${esc(sitio.nombre)}</span>
        ${sitio.lema ? `<span>${esc(sitio.lema)}</span>` : ""}
        ${sitio.responsable ? `<span>Organisée par ${esc(sitio.responsable)}</span>` : ""}
      </div>
    </div>
    <nav class="pie-redes" aria-label="Réseaux sociaux">${redes.map(enlaceRed).join("")}${faltan}</nav>
    <nav class="pie-legal" aria-label="Informations">
      <a href="#palmares">Palmarès</a>
      <a href="#confidentialite">Politique de confidentialité</a>
    </nav>
    <p class="pie-credito">Site créé par <a href="https://a2wdstudio.com" target="_blank" rel="noopener">A2WD Studio</a></p>
  </div>`;
}

function nombreCorto(nombre) {
  return nombre.length > 14 ? `${nombre.slice(0, 13)}…` : nombre;
}

function pion(ctx, m, c, e, mvp, stats, enCampo) {
  const j = c.jugador;
  const a = c.actuacion;
  const fid = `ficha-${m.id}-${j.id}`.replace(/[^\w-]/g, "_");
  const posicion = enCampo ? `--x:${c.x};--y:${c.y};` : "";
  const clases = ["pion", enCampo ? "en-campo" : "en-banco"];
  if (enCampo) {
    clases.push(c.y < 45 ? "h-abajo" : "h-arriba", c.x < 45 ? "v-abajo" : "v-arriba");
    if (c.x < 24) clases.push("h-izq");
    if (c.x > 76) clases.push("h-der");
    if (c.y < 24) clases.push("v-izq");
    if (c.y > 76) clases.push("v-der");
  }
  const s = stats.get(j.id);
  const marca = a?.rojas ? '<span class="pion-carton carton-rouge" aria-hidden="true"></span>' : a?.amarillas ? '<span class="pion-carton carton-jaune" aria-hidden="true"></span>' : "";
  const cifras = a
    ? `<div><dt>Note</dt><dd>${notaChip(a.nota)}</dd></div><div><dt>Buts</dt><dd>${a.goles}</dd></div><div><dt>Cartons</dt><dd>${tarjetas(a.amarillas, a.rojas, true)}</dd></div>`
    : `<div><dt>Moyenne</dt><dd>${mediaChip(s?.media ?? null)}</dd></div><div><dt>Matchs</dt><dd>${s?.pj || 0}</dd></div><div><dt>Buts</dt><dd>${s?.goles || 0}</dd></div>`;
  return `<div class="${clases.join(" ")}" style="${posicion}${estiloEquipo(e)}">
    <button type="button" class="pion-boton" data-accion="pion" aria-expanded="false" aria-describedby="${fid}">
      <span class="pion-foto">${j.foto ? `<img src="${img(j.foto)}" alt="" loading="lazy">` : `<span aria-hidden="true">${esc(iniciales(j.nombre))}</span>`}</span>
      <span class="sr">${esc(j.nombre)}</span>
      ${c.numero !== null ? `<span class="pion-num" aria-hidden="true">${c.numero}</span>` : ""}
      ${a?.nota !== null && a?.nota !== undefined ? `<span class="pion-nota nota-${nivelNota(a.nota)}" aria-hidden="true">${nota(a.nota)}</span>` : ""}
      ${mvp === j.id ? `<span class="pion-mvp" title="Homme du match">${ICONOS.estrella}</span>` : ""}
      ${marca}
    </button>
    <span class="pion-nombre" aria-hidden="true">${esc(nombreCorto(j.nombre))}</span>
    <div class="pion-ficha" id="${fid}" role="tooltip">
      <div class="pf-cabeza">${avatar(j, e, "pf-foto")}<div class="pf-texto"><strong class="pf-nombre">${c.numero !== null ? `<span>${c.numero}</span>` : ""}${esc(j.nombre)}</strong><span class="pf-sub">${esc([j.puesto, c.capitan ? "Capitaine" : "", e.nombre].filter(Boolean).join(" · "))}</span></div></div>
      <dl class="pf-cifras">${cifras}</dl>
      ${a?.comentario ? `<p class="pf-comentario">${esc(a.comentario)}</p>` : ""}
      ${j.descripcion ? `<p class="pf-descripcion">${esc(j.descripcion)}</p>` : ""}
      <a class="pf-enlace" href="#joueur-${esc(j.id)}">Voir sa fiche</a>
    </div>
  </div>`;
}

function terreno(ctx, m, al, mvp, stats) {
  const piezas = [["local", m.local], ["visitante", m.visitante]].flatMap(([lado, eid]) => al[lado].campo.map((c) => pion(ctx, m, c, ctx.equipos.get(eid), mvp, stats, true)));
  if (!piezas.length) return vacio("Les joueurs apparaîtront ici dès qu'ils seront ajoutés aux équipes.");
  return `<div class="terreno" role="group" aria-label="Les joueurs sur le terrain">${LINEAS_TERRENO.h}${LINEAS_TERRENO.v}${piezas.join("")}</div>`;
}

function bancos(ctx, m, al, mvp, stats) {
  const bloques = [["local", m.local], ["visitante", m.visitante]].filter(([lado]) => al[lado].banco.length).map(([lado, eid]) => {
    const e = ctx.equipos.get(eid);
    return `<div class="banco" style="${estiloEquipo(e)}">
      <p class="banco-titulo">${placa(e)}<span>${m.goles ? "Ont aussi joué" : "Remplaçants"}</span></p>
      <div class="banco-lista">${al[lado].banco.map((c) => pion(ctx, m, c, e, mvp, stats, false)).join("")}</div>
    </div>`;
  });
  return bloques.length ? `<div class="bancos">${bloques.join("")}</div>` : "";
}

function valoracionesPartido(ctx, m) {
  if (!m.valoraciones) return "";
  const tarjeta = (v, eid) => {
    const e = ctx.equipos.get(eid);
    if (v.nota === null && !v.texto) return "";
    return `<article class="valoracion" style="${estiloEquipo(e)}">
      <header class="valoracion-cabeza">${placa(e)}<h3>${esc(e.nombre)}</h3>${v.nota !== null ? notaChip(v.nota, "nota-grande") : ""}</header>
      ${v.texto ? `<div class="prosa">${parrafos(v.texto)}</div>` : ""}
    </article>`;
  };
  return `<section class="seccion" aria-labelledby="t-valoracion">
    <div class="seccion-cabeza"><h2 id="t-valoracion">Évaluation des équipes</h2><p class="seccion-nota">L'avis de l'organisateur sur le match de chaque équipe.</p></div>
    <div class="valoraciones">${tarjeta(m.valoraciones[0], m.local)}${tarjeta(m.valoraciones[1], m.visitante)}</div>
  </section>`;
}

function resumenPartido(ctx, m) {
  const lista = ctx.porPartido.get(m.id) || [];
  const columna = (eid) => {
    const e = ctx.equipos.get(eid);
    const propias = lista.filter((a) => a.equipo === eid);
    const nombre = (a) => `<a href="#joueur-${esc(a.jugador)}">${esc(ctx.jugadores.get(a.jugador)?.nombre || "")}</a>`;
    const goles = propias.filter((a) => a.goles > 0).sort((x, y) => y.goles - x.goles).map((a) => `<li><span class="ev-but">But${a.goles > 1 ? "s" : ""}</span>${nombre(a)}${a.goles > 1 ? ` <span class="veces">×${a.goles}</span>` : ""}</li>`);
    const cartones = propias.filter((a) => a.amarillas || a.rojas).map((a) => `<li>${tarjetas(a.amarillas, a.rojas)}${nombre(a)}</li>`);
    const items = [...goles, ...cartones];
    return `<div class="resumen-equipo" style="${estiloEquipo(e)}"><h3>${placa(e)}<span>${esc(e.nombre)}</span></h3>${items.length ? `<ul>${items.join("")}</ul>` : '<p class="resumen-vacio">Ni but ni carton.</p>'}</div>`;
  };
  return `<section class="seccion" aria-labelledby="t-resumen">
    <div class="seccion-cabeza"><h2 id="t-resumen">Buts et cartons</h2></div>
    ${lineaMvp(ctx, m)}
    <div class="resumen">${columna(m.local)}${columna(m.visitante)}</div>
  </section>`;
}

function partido(ctx, id) {
  const m = ctx.d.partidos.find((x) => x.id === id);
  if (!m) {
    return `<div class="contenedor pila"><header class="pagina-cabeza"><h1>Match introuvable</h1><p>Ce match n'existe plus ou le lien est incomplet.</p></header><a class="enlace-mas" href="#calendrier">Voir le calendrier</a></div>`;
  }
  const a = ctx.equipos.get(m.local);
  const b = ctx.equipos.get(m.visitante);
  const jugado = Boolean(m.goles);
  const diferencia = jugado ? Math.sign(m.goles[0] - m.goles[1]) : 0;
  const temporada = ctx.d.temporadas.find((t) => t.id === m.temporada);
  const meta = [diaLargo(m.fecha), m.hora ? hora(m.hora) : "", m.jornada, m.lugar, m.temporada !== ctx.actual ? temporada?.nombre : ""].filter(Boolean);
  const stats = m.temporada === ctx.t ? ctx.stats : estadisticas(ctx.d, m.temporada);
  const al = alineacion(ctx.d, m);
  const mvp = ctx.mvps.get(m.id)?.jugador || "";
  const video = ctx.d.videos.find((v) => v.partido === m.id);
  const lado = (e, clase, ganador) => `<a class="duelo-equipo ${clase}${ganador ? " es-ganador" : ""}" href="#equipe-${esc(e.id)}" style="${estiloEquipo(e)}">${escudoEquipo(e, "md")}<span class="duelo-nombre">${esc(e.nombre)}</span></a>`;
  const acciones = ctx.creador ? herramientas(`${btnCreador("resultado", jugado ? "Modifier la feuille de match" : "Feuille de match", { id: m.id, icono: ICONOS.hoja })}${btnCreador("editar-partido", "Modifier le match", { id: m.id, icono: ICONOS.lapiz })}${btnCreador("borrar-partido", "Supprimer", { id: m.id, icono: ICONOS.papelera })}`, "herramientas-equipo") : "";
  return `<section class="partido-cabeza">
    <div class="partido-cabeza-in">
      <a class="volver" href="#calendrier">Calendrier</a>
      <p class="partido-cabeza-meta">${meta.map(esc).join(" · ")}</p>
      <div class="duelo">
        ${lado(a, "duelo-izq", diferencia === 1)}
        <div class="duelo-centro">${jugado ? `<span class="duelo-tanteo" aria-label="Score : ${m.goles[0]} à ${m.goles[1]}"><span>${m.goles[0]}</span><span>${m.goles[1]}</span></span>` : `<span class="duelo-hora">${m.hora ? hora(m.hora) : "vs"}</span>`}</div>
        ${lado(b, "duelo-der", diferencia === -1)}
      </div>
      ${acciones}
    </div>
  </section>
  <div class="contenedor pila">
    ${bloqueProno(ctx, m)}
    <section class="seccion" aria-labelledby="t-terreno">
      <div class="seccion-cabeza"><h2 id="t-terreno">${jugado ? "Les joueurs du match" : "Les équipes"}</h2><p class="seccion-nota">Passe sur un joueur, ou touche sa photo, pour voir sa fiche${jugado ? ", sa note et ses cartons" : ""}.</p></div>
      ${terreno(ctx, m, al, mvp, stats)}
      ${bancos(ctx, m, al, mvp, stats)}
    </section>
    ${valoracionesPartido(ctx, m)}
    ${jugado ? resumenPartido(ctx, m) : ""}
    ${video ? `<section class="seccion" aria-labelledby="t-video-m"><div class="seccion-cabeza"><h2 id="t-video-m">Le récap</h2></div><div class="videos videos-uno">${tarjetaVideo(ctx, video, true)}</div></section>` : ""}
  </div>`;
}

function puestos(lista) {
  return lista.map((f, i) => ({ ...f, puesto: lista.findIndex((o) => o.creditos === f.creditos) + 1 || i + 1 }));
}

function tablaProno(ctx, lista) {
  if (lista === undefined) return '<p class="cargando">Chargement du classement…</p>';
  if (lista === null) return vacio("Le classement n'a pas pu être chargé. Recharge la page pour réessayer.");
  if (!lista.length) return vacio("Le classement apparaîtra après le premier match pronostiqué.");
  const filas = puestos(lista);
  const podio = filas.filter((f) => f.creditos > 0).slice(0, 3);
  return `${podio.length ? `<ol class="podio-prono">${podio.map((f) => `<li class="pp pp-${Math.min(f.puesto, 3)}${f.propio ? " es-propio" : ""}"><span class="pp-puesto">${f.puesto}</span><span class="pp-pseudo">${esc(f.pseudo)}</span><span class="pp-creditos"><strong>${f.creditos}</strong> crédits</span></li>`).join("")}</ol>` : ""}
  <div class="tabla-marco"><table class="clasif ranking-prono">
    <caption class="sr">Classement des pronostiqueurs</caption>
    <thead><tr><th scope="col" class="c-pos">#</th><th scope="col" class="c-equipo">Pseudo</th><th scope="col"><abbr title="Bons pronostics">Bons</abbr></th><th scope="col"><abbr title="Pronostics joués">Joués</abbr></th><th scope="col" class="c-pts">Crédits</th></tr></thead>
    <tbody>${filas.map((f) => `<tr${f.propio ? ' class="es-propio"' : ""}><td class="c-pos">${f.puesto}</td><th scope="row" class="c-equipo">${esc(f.pseudo)}${f.propio ? ' <span class="etiqueta">toi</span>' : ""}</th><td>${f.aciertos}</td><td>${f.jugados}</td><td class="c-pts">${f.creditos}</td></tr>`).join("")}</tbody>
  </table></div>`;
}

function tarjetaProno(ctx, m) {
  const a = ctx.equipos.get(m.local);
  const b = ctx.equipos.get(m.visitante);
  return `<article class="tarjeta-prono">
    <a class="tp-equipos" href="#match-${esc(m.id)}">${placa(a)}<span>${esc(a.nombre)}</span><b>vs</b><span>${esc(b.nombre)}</span>${placa(b)}</a>
    <p class="tp-fecha">${esc(diaLargo(m.fecha))}${m.hora ? ` à ${hora(m.hora)}` : ""}${m.jornada ? ` · ${esc(m.jornada)}` : ""}</p>
    ${cotas(ctx, m)}
    ${botonesProno(ctx, m)}
  </article>`;
}

function pronosticos(ctx) {
  const n = plural(ctx.d.sitio.creditosAcierto, "crédit", "crédits");
  const abiertos = ctx.d.partidos.filter((m) => m.temporada === ctx.t && pronosticoAbierto(m, ctx.ahora)).sort(porFecha);
  return `<div class="contenedor pila">
    ${paginaCabeza(ctx, "Pronostics", `Avant chaque match, choisis l'équipe qui va gagner. Chaque bon pronostic rapporte ${n} ; le meilleur pronostiqueur de la saison est récompensé à la remise des prix.`)}
    <section class="seccion reglas-prono" aria-labelledby="t-como">
      <div class="seccion-cabeza"><h2 id="t-como">Comment ça marche</h2></div>
      <ol class="pasos-prono">
        <li>${ctx.pronosticos && !ctx.cuenta ? '<a href="#compte">Crée ton compte gratuit</a>' : "Crée ton compte gratuit"} avec un pseudo.</li>
        <li>Sur la fiche d'un match, choisis l'équipe qui va gagner. Tu peux changer d'avis jusqu'au coup d'envoi.</li>
        <li>Les cotes sont fixées par l'organisateur. Un bon pronostic rapporte ${n} ; un match nul ne rapporte rien.</li>
        <li>C'est un jeu gratuit, sans argent : les crédits ne s'achètent pas et ne s'échangent pas.</li>
      </ol>
    </section>
    ${!ctx.pronosticos ? vacio("Les pronostics ouvriront bientôt, avec les comptes visiteurs.") : `<section class="seccion" aria-labelledby="t-abiertos">
      <div class="seccion-cabeza"><h2 id="t-abiertos">Matchs ouverts</h2></div>
      ${abiertos.length ? `<div class="tarjetas-prono">${abiertos.map((m) => tarjetaProno(ctx, m)).join("")}</div>` : vacio(ctx.creador ? "Aucun match ouvert : fixe une cote dans « Modifier le match » pour ouvrir les pronostics." : "Aucun match ouvert aux pronostics pour l'instant.")}
    </section>
    <section class="seccion" aria-labelledby="t-clasif-prono">
      <div class="seccion-cabeza"><h2 id="t-clasif-prono">Classement</h2><p class="seccion-nota">Crédits gagnés avec les bons pronostics de la ${esc(ctx.temporada.nombre)}.</p></div>
      ${tablaProno(ctx, ctx.clasif.get(ctx.t))}
    </section>`}
  </div>`;
}

function palmaresProno(ctx, t, enCurso) {
  if (enCurso) return `<a class="enlace-mas" href="#pronostics">Le classement des pronostiqueurs en cours</a>`;
  const lista = ctx.clasif.get(t.id);
  if (!lista || !lista.length) return "";
  const podio = puestos(lista).filter((f) => f.creditos > 0).slice(0, 3);
  if (!podio.length) return "";
  return `<div class="palmares-prono"><h3>Meilleurs pronostiqueurs</h3><ol>${podio.map((f) => `<li><span class="pp-puesto">${f.puesto}</span><span class="pp-pseudo">${esc(f.pseudo)}</span><span class="pp-creditos">${f.creditos} crédits</span></li>`).join("")}</ol></div>`;
}

function cuenta(ctx) {
  if (!ctx.pronosticos) {
    return `<div class="contenedor pila"><header class="pagina-cabeza"><h1>Mon compte</h1><p>Les comptes visiteurs et les pronostics ouvriront bientôt.</p></header></div>`;
  }
  if (!ctx.cuenta) {
    return `<div class="contenedor pila">
      <header class="pagina-cabeza"><h1>Mon compte</h1><p>Un compte gratuit pour faire tes pronostics et entrer dans le classement des pronostiqueurs.</p></header>
      <div class="cuenta-formularios">
        <section class="acceso-caja" aria-labelledby="t-entrar">
          <h2 id="t-entrar">Se connecter</h2>
          <form class="formulario" id="form-entrar" novalidate>
            <label class="campo"><span class="campo-etiqueta">E-mail</span><input name="correo" type="email" autocomplete="username" required></label>
            <label class="campo"><span class="campo-etiqueta">Mot de passe</span><input name="clave" type="password" autocomplete="current-password" required></label>
            <p class="form-error" role="alert" hidden></p>
            <button type="submit" class="btn btn-principal">Se connecter</button>
          </form>
        </section>
        <section class="acceso-caja" aria-labelledby="t-registro">
          <h2 id="t-registro">Créer un compte</h2>
          <form class="formulario" id="form-registro" novalidate>
            <label class="campo"><span class="campo-etiqueta">Pseudo</span><input name="pseudo" type="text" minlength="3" maxlength="20" autocomplete="nickname" required aria-describedby="ayuda-pseudo"><small class="campo-ayuda" id="ayuda-pseudo">Visible dans le classement. De 3 à 20 caractères.</small></label>
            <label class="campo"><span class="campo-etiqueta">E-mail</span><input name="correo" type="email" autocomplete="email" required aria-describedby="ayuda-correo"><small class="campo-ayuda" id="ayuda-correo">Reste privé.</small></label>
            <label class="campo"><span class="campo-etiqueta">Mot de passe</span><input name="clave" type="password" minlength="8" autocomplete="new-password" required aria-describedby="ayuda-clave"><small class="campo-ayuda" id="ayuda-clave">Au moins 8 caractères.</small></label>
            <label class="campo-casilla"><input name="acepto" type="checkbox" required><span>J'accepte le <a href="#pronostics">fonctionnement des pronostics</a> et la <a href="#confidentialite">politique de confidentialité</a>. Moins de 15 ans : avec l'accord d'un parent.</span></label>
            <p class="form-error" role="alert" hidden></p>
            <button type="submit" class="btn btn-principal">Créer mon compte</button>
          </form>
        </section>
      </div>
    </div>`;
  }
  const lista = ctx.clasif.get(ctx.actual);
  const propio = Array.isArray(lista) ? puestos(lista).find((f) => f.propio) : null;
  const partidos = new Map(ctx.d.partidos.map((m) => [m.id, m]));
  const mios = [...ctx.misPronos.entries()].map(([pid, eleccion]) => ({ m: partidos.get(pid), eleccion })).filter((x) => x.m && x.m.temporada === ctx.actual).sort((x, y) => porFecha(y.m, x.m));
  const creditos = ctx.d.sitio.creditosAcierto;
  const estado = (x) => {
    const r = resultadoPartido(x.m);
    if (!r) return '<span class="mi-prono">En attente</span>';
    if (r === "nul") return '<span class="mi-prono">Match nul</span>';
    return r === x.eleccion ? `<span class="mi-prono es-acierto">+${creditos}</span>` : '<span class="mi-prono es-fallo">Raté</span>';
  };
  const cifras = [["Crédits", propio ? propio.creditos : 0], ["Place", propio ? ordinal(propio.puesto) : "–"], ["Bons pronostics", propio ? propio.aciertos : 0], ["Pronostics", mios.length]];
  return `<div class="contenedor pila">
    <header class="pagina-cabeza"><h1>${esc(ctx.cuenta.pseudo)}</h1><p>Connecté avec ${esc(ctx.cuenta.email || "ton compte")}. Tes résultats de la ${esc(ctx.temporadaActual.nombre)}.</p></header>
    <dl class="cuenta-cifras">${cifras.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join("")}</dl>
    <section class="seccion" aria-labelledby="t-mios">
      <div class="seccion-cabeza"><h2 id="t-mios">Mes pronostics</h2><a class="enlace-mas" href="#pronostics">Matchs ouverts et classement</a></div>
      ${mios.length ? `<div class="tabla-marco"><table class="clasif tabla-matchs">
        <thead><tr><th scope="col" class="c-fecha">Date</th><th scope="col" class="c-equipo">Match</th><th scope="col">Mon pronostic</th><th scope="col">Résultat</th></tr></thead>
        <tbody>${mios.map((x) => {
          const a = ctx.equipos.get(x.m.local);
          const b = ctx.equipos.get(x.m.visitante);
          return `<tr><td class="c-fecha">${esc(fechaMini(x.m.fecha))}</td><th scope="row" class="c-equipo"><a class="rival" href="#match-${esc(x.m.id)}">${placa(a)}${x.m.goles ? ` ${x.m.goles[0]}-${x.m.goles[1]} ` : " – "}${placa(b)}</a></th><td>${placa(x.eleccion === "local" ? a : b)}</td><td>${estado(x)}</td></tr>`;
        }).join("")}</tbody>
      </table></div>` : vacio("Tu n'as encore fait aucun pronostic cette saison.", '<a class="btn btn-principal" href="#pronostics">Voir les matchs ouverts</a>')}
    </section>
    <section class="seccion" aria-labelledby="t-ajustes-cuenta">
      <div class="seccion-cabeza"><h2 id="t-ajustes-cuenta">Mon compte</h2></div>
      <form class="formulario acceso-caja" id="form-pseudo" novalidate>
        <label class="campo"><span class="campo-etiqueta">Pseudo</span><input name="pseudo" type="text" minlength="3" maxlength="20" value="${esc(ctx.cuenta.pseudo)}" required></label>
        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="btn btn-secundario">Changer de pseudo</button>
      </form>
      <div class="cuenta-acciones">
        <button type="button" class="btn btn-secundario" data-accion="salir-cuenta">Se déconnecter</button>
        <button type="button" class="btn btn-peligro" data-accion="borrar-cuenta">Supprimer mon compte</button>
      </div>
    </section>
  </div>`;
}

function cargando() {
  return `<div class="contenedor pila"><p class="cargando">Chargement de la ligue…</p></div>`;
}

function errorCarga() {
  return `<div class="contenedor pila"><section class="vacio"><p>Impossible de charger la ligue. Vérifie ta connexion puis recharge la page.</p><button type="button" class="btn btn-principal" data-accion="recargar">Recharger</button></section></div>`;
}

export { ICONOS, cabecera, barraCreador, inicio, calendario, equipos, equipo, jugadores, jugador, partido, pronosticos, cuenta, videos, palmares, confidencialidad, acceso, pie, cargando, errorCarga };
