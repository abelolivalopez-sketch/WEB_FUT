import * as almacen from "./almacen.js";
import * as vistas from "./vistas.js";
import * as editor from "./editor.js";
import { normalizar, clasificacion, estadisticas, rankingJugadores, mejoresJugadores, mejoresGoleadores, mejorDe, hoyISO, TEMPORADA_INICIAL } from "./logica.js";
import { crearEjemplo } from "./ejemplo.js";

const RUTAS = ["inicio", "calendrier", "equipes", "joueurs", "pronostics", "videos", "palmares", "confidentialite", "compte", "createur"];
const TITULOS = { inicio: "", calendrier: "Calendrier", equipes: "Classement", joueurs: "Joueurs", pronostics: "Pronostics", videos: "Vidéos", palmares: "Palmarès", confidentialite: "Politique de confidentialité", compte: "Mon compte", createur: "Espace créateur" };
const ERRORES_CUENTA = {
  credenciales: "E-mail ou mot de passe incorrect.",
  "sin-confirmar": "Confirme d'abord ton adresse e-mail avec le lien reçu, puis connecte-toi.",
  "correo-usado": "Un compte existe déjà avec cet e-mail. Connecte-toi.",
  "sin-correo": "Les inscriptions ouvrent très bientôt. Réessaie dans quelques jours.",
  "clave-debil": "Mot de passe trop faible : au moins 8 caractères.",
  demasiados: "Trop de tentatives. Réessaie dans quelques minutes.",
  "pseudo-usado": "Ce pseudo est déjà pris. Choisis-en un autre.",
  "pseudo-corto": "Le pseudo doit faire au moins 3 caractères.",
  cerrado: "Les pronostics de ce match sont fermés.",
  "sin-sesion": "Ta session a expiré. Reconnecte-toi.",
  red: "Impossible de joindre le serveur. Vérifie ta connexion et réessaie."
};
const CLAVE_PUBLICO = "ligue-s:vista-publica";
const CLAVE_VISTA_LOCAL = "ligue-s:vista";

const cabeceraEl = document.getElementById("cabecera");
const barraEl = document.getElementById("barra");
const vistaEl = document.getElementById("vista");
const pieEl = document.getElementById("pie");
const avisosEl = document.getElementById("avisos");

const estado = {
  datos: null,
  error: false,
  puedeEditar: false,
  creador: false,
  usuario: null,
  filtro: "proximos",
  ordenJugadores: "nota",
  temporada: null,
  sinConexion: false,
  pendiente: false,
  cuenta: null,
  misPronos: new Map(),
  clasif: new Map(),
  pedidas: new Set(),
  volver: ""
};

function leerSesion(clave) {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

function leerLocal(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribirLocal(clave, valor) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    return;
  }
}

function escribirSesion(clave, valor) {
  try {
    if (valor === null) sessionStorage.removeItem(clave);
    else sessionStorage.setItem(clave, valor);
  } catch {
    return;
  }
}

function enlaceCreador() {
  return new URLSearchParams(location.search).has("createur");
}

function irAlEnlaceCreador() {
  location.replace(`${location.pathname}?createur#createur`);
}

function ruta() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith("equipe-")) return { nombre: "equipe", id: h.slice(7) };
  if (h.startsWith("joueur-")) return { nombre: "joueur", id: h.slice(7) };
  if (h.startsWith("match-")) return { nombre: "match", id: h.slice(6) };
  return { nombre: RUTAS.includes(h) ? h : "inicio" };
}

function temporadaVista() {
  const d = estado.datos;
  return d.temporadas.some((t) => t.id === estado.temporada) ? estado.temporada : d.temporadaActual;
}

function agrupar(lista, clave) {
  const mapa = new Map();
  lista.forEach((x) => {
    if (!mapa.has(x[clave])) mapa.set(x[clave], []);
    mapa.get(x[clave]).push(x);
  });
  return mapa;
}

function contexto() {
  const d = estado.datos;
  const t = temporadaVista();
  const porPartido = agrupar(d.actuaciones, "partido");
  const mvps = new Map([...porPartido].map(([id, lista]) => [id, mejorDe(lista)]).filter(([, a]) => a));
  const tabla = clasificacion(d, t);
  const stats = estadisticas(d, t, mvps);
  const ranking = rankingJugadores(d, t, stats);
  return {
    d,
    modo: almacen.modo,
    puedeEditar: estado.puedeEditar,
    creador: estado.creador && estado.puedeEditar,
    usuario: estado.usuario,
    filtro: estado.filtro,
    ordenJugadores: estado.ordenJugadores,
    pendiente: estado.pendiente,
    hoy: hoyISO(),
    t,
    temporada: d.temporadas.find((x) => x.id === t),
    actual: d.temporadaActual,
    temporadaActual: d.temporadas.find((x) => x.id === d.temporadaActual),
    esActual: t === d.temporadaActual,
    tabla,
    posiciones: new Map(tabla.map((f) => [f.equipo.id, f])),
    porPartido,
    mvps,
    stats,
    ranking,
    mejores: mejoresJugadores(d, t, ranking),
    goleadores: mejoresGoleadores(d, t, ranking),
    equipos: new Map(d.equipos.map((e) => [e.id, e])),
    jugadores: new Map(d.jugadores.map((j) => [j.id, j])),
    pronosticos: almacen.modo === "nube",
    cuenta: estado.cuenta,
    misPronos: estado.misPronos,
    clasif: estado.clasif,
    ahora: new Date()
  };
}

function clasifNecesarias(r, ctx) {
  if (!ctx.pronosticos) return [];
  if (r.nombre === "pronostics") return [ctx.t];
  if (r.nombre === "compte") return estado.cuenta ? [ctx.actual] : [];
  if (r.nombre === "palmares") return ctx.d.temporadas.filter((t) => t.id !== ctx.actual).map((t) => t.id);
  return [];
}

function pedirClasif(ids) {
  ids.filter((id) => !estado.clasif.has(id) && !estado.pedidas.has(id)).forEach((id) => {
    estado.pedidas.add(id);
    almacen.clasificacionPronosticos(id)
      .then((lista) => estado.clasif.set(id, lista))
      .catch(() => estado.clasif.set(id, null))
      .finally(() => {
        estado.pedidas.delete(id);
        pintar();
      });
  });
}

async function refrescarCuenta() {
  try {
    estado.cuenta = await almacen.cuenta();
    estado.misPronos = estado.cuenta ? await almacen.misPronosticos() : new Map();
  } catch {
    estado.cuenta = null;
    estado.misPronos = new Map();
  }
  estado.clasif.clear();
}

function pintar() {
  const r = ruta();
  if (!estado.datos) {
    vistaEl.innerHTML = estado.error ? vistas.errorCarga() : vistas.cargando();
    return;
  }
  const ctx = contexto();
  const activa = { equipe: "equipes", joueur: "joueurs", match: "calendrier" }[r.nombre] || r.nombre;
  cabeceraEl.innerHTML = vistas.cabecera(ctx, activa);
  barraEl.innerHTML = vistas.barraCreador(ctx) + (estado.sinConexion ? '<p class="aviso-ejemplo">Pas de connexion : tu vois la dernière version enregistrée.</p>' : "");
  const paginas = {
    inicio: () => vistas.inicio(ctx),
    calendrier: () => vistas.calendario(ctx),
    equipes: () => vistas.equipos(ctx),
    equipe: () => vistas.equipo(ctx, r.id),
    joueurs: () => vistas.jugadores(ctx),
    joueur: () => vistas.jugador(ctx, r.id),
    match: () => vistas.partido(ctx, r.id),
    pronostics: () => vistas.pronosticos(ctx),
    compte: () => vistas.cuenta(ctx),
    videos: () => vistas.videos(ctx),
    palmares: () => vistas.palmares(ctx),
    confidentialite: () => vistas.confidencialidad(ctx),
    createur: () => vistas.acceso(ctx)
  };
  vistaEl.innerHTML = paginas[r.nombre]();
  pieEl.innerHTML = vistas.pie(ctx);
  const partidoVisto = r.nombre === "match" ? ctx.d.partidos.find((m) => m.id === r.id) : null;
  const nombre = r.nombre === "equipe" ? ctx.equipos.get(r.id)?.nombre : r.nombre === "joueur" ? ctx.jugadores.get(r.id)?.nombre : partidoVisto ? `${ctx.equipos.get(partidoVisto.local)?.nombre} – ${ctx.equipos.get(partidoVisto.visitante)?.nombre}` : "";
  const titulo = nombre || TITULOS[r.nombre];
  document.title = titulo ? `${titulo} | ${ctx.d.sitio.nombre}` : `${ctx.d.sitio.nombre} | ${ctx.d.sitio.lema || "Foot à 5"}`;
  pedirClasif(clasifNecesarias(r, ctx));
}

function alCambiarRuta(evento) {
  const r = ruta();
  if (r.nombre === "compte" && evento?.oldURL) {
    const previo = new URL(evento.oldURL).hash;
    estado.volver = !estado.cuenta && previo && previo !== "#compte" ? previo : "";
  }
  if (r.nombre === "createur" && almacen.modo !== "local" && !enlaceCreador()) {
    irAlEnlaceCreador();
    return;
  }
  if (r.nombre === "createur" && estado.puedeEditar) {
    activarCreador(true);
    location.replace("#inicio");
    return;
  }
  pintar();
  window.scrollTo(0, 0);
  vistaEl.focus({ preventScroll: true });
}

function avisar(mensaje, tipo = "ok", accion = null) {
  const aviso = document.createElement("div");
  aviso.className = `aviso aviso-${tipo}`;
  aviso.setAttribute("role", tipo === "error" ? "alert" : "status");
  aviso.innerHTML = `<span></span>${accion ? `<button type="button">${accion.texto}</button>` : ""}`;
  aviso.querySelector("span").textContent = mensaje;
  if (accion) aviso.querySelector("button").addEventListener("click", accion.alPulsar);
  avisosEl.append(aviso);
  setTimeout(() => aviso.remove(), accion ? 12000 : 4000);
}

function textoError(error) {
  const codigos = {
    memoria: "La mémoire du navigateur est pleine. Retire quelques photos ou télécharge une sauvegarde.",
    conflicto: "La ligue a été modifiée depuis un autre appareil. Recharge la page pour voir la dernière version.",
    prohibido: "Ton compte n'a pas le droit de modifier la ligue.",
    imagen: "Cette image ne peut pas être lue. Essaie avec une photo en JPG ou PNG.",
    subida: "La photo n'a pas pu être envoyée. Vérifie ta connexion et réessaie.",
    llave: "Ta clé GitHub n'est plus valable. Reconnecte-toi depuis l'espace créateur."
  };
  return codigos[error?.codigo] || "L'enregistrement n'a pas abouti. Vérifie ta connexion et réessaie.";
}

async function aplicar(mutar, mensaje) {
  const antes = JSON.stringify(estado.datos);
  try {
    const copia = JSON.parse(antes);
    mutar(copia);
    const nuevos = normalizar(copia);
    await almacen.guardar(nuevos, mensaje);
    estado.datos = nuevos;
    estado.pendiente = false;
    pintar();
    avisar(mensaje);
    return true;
  } catch (error) {
    estado.datos = normalizar(JSON.parse(antes));
    pintar();
    avisar(textoError(error), "error", error?.codigo === "conflicto" ? { texto: "Recharger", alPulsar: () => location.reload() } : null);
    return false;
  }
}

async function subirImagen(archivo, carpeta) {
  try {
    return await almacen.subirImagen(archivo, carpeta);
  } catch (error) {
    avisar(textoError(error), "error");
    throw error;
  }
}

function podar(d) {
  const temporadas = new Set(d.temporadas.map((t) => t.id));
  d.inscripciones = d.inscripciones.filter((i) => temporadas.has(i.temporada));
  const inscritos = new Set(d.inscripciones.map((i) => `${i.temporada}|${i.equipo}`));
  d.plantillas = d.plantillas.filter((p) => inscritos.has(`${p.temporada}|${p.equipo}`));
  d.partidos = d.partidos.filter((m) => inscritos.has(`${m.temporada}|${m.local}`) && inscritos.has(`${m.temporada}|${m.visitante}`));
  const partidos = new Set(d.partidos.map((m) => m.id));
  d.actuaciones = d.actuaciones.filter((a) => partidos.has(a.partido));
  ["lives", "videos", "premios"].forEach((k) => {
    d[k] = d[k].filter((x) => temporadas.has(x.temporada));
  });
  return d;
}

function quitarHuerfanos(d) {
  const equiposVivos = new Set(d.inscripciones.map((i) => i.equipo));
  const jugadoresVivos = new Set([...d.plantillas.map((p) => p.jugador), ...d.actuaciones.map((a) => a.jugador)]);
  const sobran = [
    ...d.equipos.filter((e) => !equiposVivos.has(e.id)).flatMap((e) => [e.logo, e.foto]),
    ...d.jugadores.filter((j) => !jugadoresVivos.has(j.id)).map((j) => j.foto)
  ].filter(Boolean);
  d.equipos = d.equipos.filter((e) => equiposVivos.has(e.id));
  d.jugadores = d.jugadores.filter((j) => jugadoresVivos.has(j.id));
  return sobran;
}

function descargar(contenido, nombre) {
  const blob = new Blob([JSON.stringify(contenido, null, 2)], { type: "application/json" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
}

function exportar() {
  descargar(estado.datos, `ligue-s-${hoyISO()}.json`);
  avisar("Sauvegarde téléchargée");
}

function publicar() {
  const sello = new Date().toISOString();
  descargar({ ...estado.datos, publicado: sello }, "datos.json");
  almacen.marcarPublicado(sello);
  if (!leerLocal(CLAVE_VISTA_LOCAL)) escribirLocal(CLAVE_VISTA_LOCAL, "creador");
  editor.cerrar();
  avisar("datos.json téléchargé : remplace-le dans le dépôt GitHub pour publier");
}

async function recuperarApartado() {
  const apartado = almacen.leerApartado();
  if (!apartado) return;
  const ok = await editor.confirmar({ titulo: "Récupérer tes modifications ?", mensaje: "Le contenu actuel sera remplacé par les modifications que tu avais faites dans ce navigateur avant la dernière publication.", boton: "Récupérer" });
  if (!ok) return;
  const hecho = await aplicar((d) => Object.assign(d, normalizar(apartado.datos)), "Modifications récupérées");
  if (hecho) almacen.borrarApartado();
}

async function importar(archivo) {
  let nuevos;
  try {
    const leido = JSON.parse(await archivo.text());
    if (!leido || typeof leido !== "object" || !Array.isArray(leido.equipos)) throw new Error("formato");
    nuevos = normalizar(leido);
  } catch {
    editor.cerrar();
    avisar("Ce fichier n'est pas une sauvegarde de la ligue.", "error");
    return;
  }
  const ok = await editor.confirmar({
    titulo: "Importer la sauvegarde ?",
    mensaje: `Le contenu actuel sera remplacé par ${nuevos.temporadas.length} saisons, ${nuevos.equipos.length} équipes, ${nuevos.jugadores.length} joueurs, ${nuevos.partidos.length} matchs et ${nuevos.videos.length} vidéos.`,
    boton: "Importer"
  });
  if (!ok) return;
  try {
    await almacen.subirIncrustadas(nuevos);
  } catch (error) {
    avisar(textoError(error), "error");
    return;
  }
  const hecho = await aplicar((d) => Object.assign(d, nuevos), "Sauvegarde importée");
  if (hecho) estado.temporada = null;
}

async function reiniciar(conEjemplo) {
  const ok = await editor.confirmar(conEjemplo
    ? { titulo: "Remettre l'exemple ?", mensaje: "Tout le contenu actuel sera remplacé par les deux saisons d'exemple.", boton: "Remettre l'exemple" }
    : { titulo: "Tout effacer ?", mensaje: "Les équipes, les joueurs, les matchs, les notes, les lives, les vidéos et les prix de toutes les saisons seront supprimés. Pense à télécharger une sauvegarde avant.", boton: "Tout effacer" });
  if (!ok) return;
  const hecho = await aplicar((d) => {
    if (conEjemplo) {
      Object.assign(d, crearEjemplo());
      return;
    }
    const actual = d.temporadas.find((t) => t.id === d.temporadaActual) || { ...TEMPORADA_INICIAL };
    Object.assign(d, { temporadas: [actual], temporadaActual: actual.id, equipos: [], jugadores: [], inscripciones: [], plantillas: [], partidos: [], actuaciones: [], lives: [], videos: [], premios: [], ejemplo: false });
  }, conEjemplo ? "Exemple remis" : "Tout est effacé");
  if (hecho) estado.temporada = null;
  pintar();
}

async function borrarTemporada(id) {
  const d = estado.datos;
  const t = d.temporadas.find((x) => x.id === id);
  if (!t || id === d.temporadaActual) return;
  const ok = await editor.confirmar({ titulo: `Supprimer la ${t.nombre} ?`, mensaje: "Ses matchs, ses notes, ses lives, ses vidéos et ses prix seront supprimés. Les équipes et les joueurs restent s'ils ont joué une autre saison." });
  if (!ok) {
    editor.gestionarTemporadas(api);
    return;
  }
  let sobran = [];
  const hecho = await aplicar((dd) => {
    dd.temporadas = dd.temporadas.filter((x) => x.id !== id);
    podar(dd);
    sobran = quitarHuerfanos(dd);
  }, `${t.nombre} supprimée`);
  if (hecho) sobran.forEach((url) => almacen.borrarImagen(url));
}

async function borrar(tipo, id) {
  const d = estado.datos;
  const t = temporadaVista();
  const nombreT = d.temporadas.find((x) => x.id === t)?.nombre || "la saison";
  const textos = {
    equipo: () => {
      const e = d.equipos.find((x) => x.id === id);
      const otras = d.inscripciones.filter((i) => i.equipo === id && i.temporada !== t).length;
      const j = d.plantillas.filter((p) => p.temporada === t && p.equipo === id).length;
      const m = d.partidos.filter((x) => x.temporada === t && (x.local === id || x.visitante === id)).length;
      return e && { titulo: `Retirer ${e.nombre} de la ${nombreT} ?`, mensaje: `Ses ${j} joueurs et ses ${m} matchs de cette saison seront retirés.${otras ? " L'équipe reste dans l'historique des autres saisons." : " L'équipe n'a pas joué d'autre saison : elle sera supprimée."}`, ok: "Équipe retirée" };
    },
    jugador: () => {
      const j = d.jugadores.find((x) => x.id === id);
      return j && { titulo: `Retirer ${j.nombre} de la ${nombreT} ?`, mensaje: "Sa fiche et ses notes de cette saison disparaîtront. S'il a joué d'autres saisons, son historique reste.", ok: "Joueur retiré" };
    },
    partido: () => d.partidos.some((x) => x.id === id) && { titulo: "Supprimer ce match ?", mensaje: "Le match, son score et ses notes disparaîtront du calendrier et des classements.", ok: "Match supprimé" },
    live: () => d.lives.some((x) => x.id === id) && { titulo: "Supprimer ce live ?", mensaje: "Il disparaîtra du calendrier.", ok: "Live supprimé" },
    video: () => d.videos.some((x) => x.id === id) && { titulo: "Supprimer cette vidéo du site ?", mensaje: "Elle restera sur YouTube.", ok: "Vidéo supprimée" },
    premio: () => d.premios.some((x) => x.id === id) && { titulo: "Supprimer ce prix ?", mensaje: "Il disparaîtra du palmarès.", ok: "Prix supprimé" }
  };
  const info = textos[tipo]();
  if (!info) return;
  if (!(await editor.confirmar({ titulo: info.titulo, mensaje: info.mensaje, boton: tipo === "equipo" || tipo === "jugador" ? "Retirer" : "Supprimer" }))) return;
  let sobran = [];
  const hecho = await aplicar((dd) => {
    if (tipo === "equipo") {
      dd.inscripciones = dd.inscripciones.filter((i) => !(i.temporada === t && i.equipo === id));
      podar(dd);
      sobran = quitarHuerfanos(dd);
      return;
    }
    if (tipo === "jugador") {
      const deT = new Set(dd.partidos.filter((m) => m.temporada === t).map((m) => m.id));
      dd.plantillas = dd.plantillas.filter((p) => !(p.temporada === t && p.jugador === id));
      dd.actuaciones = dd.actuaciones.filter((a) => !(a.jugador === id && deT.has(a.partido)));
      sobran = quitarHuerfanos(dd);
      return;
    }
    const lista = { partido: "partidos", live: "lives", video: "videos", premio: "premios" }[tipo];
    dd[lista] = dd[lista].filter((x) => x.id !== id);
    podar(dd);
  }, info.ok);
  if (hecho) sobran.forEach((url) => almacen.borrarImagen(url));
  const r = ruta();
  if (hecho && tipo === "equipo" && r.nombre === "equipe") location.hash = "#equipes";
  if (hecho && tipo === "jugador" && r.nombre === "joueur" && !estado.datos.jugadores.some((j) => j.id === id)) location.hash = "#joueurs";
}

function reproducir(id) {
  const v = estado.datos.videos.find((x) => x.id === id);
  const marco = document.querySelector(`[data-marco="${CSS.escape(id)}"]`);
  if (!v || !marco) return;
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&rel=0`;
  iframe.title = v.titulo;
  iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  marco.replaceChildren(iframe);
}

function activarCreador(activo) {
  estado.creador = activo;
  if (almacen.modo === "local") escribirLocal(CLAVE_VISTA_LOCAL, activo ? "creador" : "publico");
  else escribirSesion(CLAVE_PUBLICO, activo ? null : "1");
  pintar();
}

function verTemporada(id) {
  estado.temporada = id;
  pintar();
}

async function salir() {
  await almacen.salir();
  location.replace(`${location.pathname}#inicio`);
}

const api = {
  datos: () => estado.datos,
  temporada: () => temporadaVista(),
  modo: almacen.modo,
  aplicar,
  avisar,
  subirImagen,
  borrarImagen: (url) => almacen.borrarImagen(url),
  exportar,
  publicar,
  apartado: () => almacen.leerApartado()?.fecha || null,
  recuperarApartado,
  importar,
  reiniciar,
  verTemporada,
  borrarTemporada
};

function cerrarMenus(excepto = null) {
  document.querySelectorAll('.menu-desplegar[aria-expanded="true"]').forEach((b) => {
    if (b === excepto) return;
    b.setAttribute("aria-expanded", "false");
    document.getElementById(b.getAttribute("aria-controls")).hidden = true;
  });
}

function alternarMenu(boton) {
  const abierto = boton.getAttribute("aria-expanded") === "true";
  cerrarMenus(boton);
  boton.setAttribute("aria-expanded", String(!abierto));
  const lista = document.getElementById(boton.getAttribute("aria-controls"));
  lista.hidden = abierto;
  if (!abierto) lista.querySelector("a")?.focus();
}

function cerrarPiones(excepto = null) {
  document.querySelectorAll(".pion.abierto").forEach((p) => {
    if (p === excepto) return;
    p.classList.remove("abierto");
    p.querySelector(".pion-boton")?.setAttribute("aria-expanded", "false");
  });
}

function alternarPion(boton) {
  const pieza = boton.closest(".pion");
  const abierto = pieza.classList.toggle("abierto");
  boton.setAttribute("aria-expanded", String(abierto));
  cerrarPiones(pieza);
}

async function pronosticar(boton) {
  if (!estado.cuenta) {
    location.hash = "#compte";
    return;
  }
  const id = boton.dataset.id;
  const valor = boton.dataset.valor;
  document.querySelectorAll(`[data-accion="pronostiquer"][data-id="${CSS.escape(id)}"]`).forEach((b) => { b.disabled = true; });
  try {
    await almacen.pronosticar(id, valor);
    estado.misPronos.set(id, valor);
    pintar();
    avisar("Pronostic enregistré");
  } catch (error) {
    pintar();
    avisar(ERRORES_CUENTA[error?.codigo] || ERRORES_CUENTA.red, "error");
    if (error?.codigo === "sin-sesion") await refrescarCuenta();
  }
}

async function salirCuenta() {
  await almacen.salirVisitante();
  await refrescarCuenta();
  pintar();
  avisar("Tu es déconnecté");
}

async function borrarCuenta() {
  const ok = await editor.confirmar({ titulo: "Supprimer ton compte ?", mensaje: "Ton pseudo, ton adresse e-mail et tous tes pronostics seront effacés. Tu disparais du classement des pronostiqueurs.", boton: "Supprimer mon compte" });
  if (!ok) return;
  try {
    await almacen.borrarCuenta();
    await refrescarCuenta();
    location.hash = "#inicio";
    pintar();
    avisar("Ton compte a été supprimé");
  } catch (error) {
    avisar(ERRORES_CUENTA[error?.codigo] || ERRORES_CUENTA.red, "error");
  }
}

const acciones = {
  "modo-creador": () => activarCreador(true),
  "modo-publico": () => activarCreador(false),
  salir,
  recargar: () => location.reload(),
  saltar: () => vistaEl.focus(),
  reproducir,
  ajustes: () => editor.editarAjustes(api),
  temporadas: () => editor.gestionarTemporadas(api),
  datos: () => editor.abrirDatos(api),
  "editar-presentacion": () => editor.editarPresentacion(api),
  "editar-reglas": () => editor.editarReglas(api),
  "nuevo-equipo": () => editor.editarEquipo(api, null),
  "editar-equipo": (id) => editor.editarEquipo(api, id),
  "borrar-equipo": (id) => borrar("equipo", id),
  "nuevo-jugador": (id) => editor.editarJugador(api, { id: null, equipo: id }),
  "editar-jugador": (id) => editor.editarJugador(api, { id }),
  "borrar-jugador": (id) => borrar("jugador", id),
  "nuevo-partido": () => {
    estado.filtro = "proximos";
    editor.editarPartido(api, null);
  },
  "editar-partido": (id) => editor.editarPartido(api, id),
  resultado: (id) => editor.editarResultado(api, id),
  "comentario-joueur": (id) => editor.editarComentario(api, id),
  "borrar-partido": (id) => borrar("partido", id),
  "nuevo-live": () => {
    estado.filtro = "proximos";
    editor.editarLive(api, null);
  },
  "editar-live": (id) => editor.editarLive(api, id),
  "borrar-live": (id) => borrar("live", id),
  "nuevo-video": () => editor.editarVideo(api, null),
  "editar-video": (id) => editor.editarVideo(api, id),
  "borrar-video": (id) => borrar("video", id),
  "nuevo-premio": (id) => editor.editarPremio(api, { id: null, temporada: id }),
  "editar-premio": (id) => editor.editarPremio(api, { id }),
  "borrar-premio": (id) => borrar("premio", id),
  "guardar-pendiente": () => aplicar(() => {}, "Données enregistrées sur GitHub")
};

const publicas = new Set(["modo-creador", "recargar", "saltar", "reproducir"]);

function alPulsar(evento) {
  if (!evento.target.closest(".menu-grupo")) cerrarMenus();
  if (!evento.target.closest(".pion")) cerrarPiones();
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;
  const accion = boton.dataset.accion;
  if (accion === "menu") {
    alternarMenu(boton);
    return;
  }
  if (accion === "pion") {
    alternarPion(boton);
    return;
  }
  if (accion === "pronostiquer") {
    pronosticar(boton);
    return;
  }
  if (accion === "salir-cuenta") {
    salirCuenta();
    return;
  }
  if (accion === "borrar-cuenta") {
    borrarCuenta();
    return;
  }
  if (accion === "filtro") {
    estado.filtro = boton.dataset.valor;
    pintar();
    return;
  }
  if (accion === "orden-jugadores") {
    estado.ordenJugadores = boton.dataset.valor;
    pintar();
    return;
  }
  if (!acciones[accion]) return;
  if (!publicas.has(accion) && !(estado.puedeEditar && estado.creador)) return;
  if (accion === "modo-creador" && !estado.puedeEditar) return;
  acciones[accion](boton.dataset.id || null);
}

function alCambiar(evento) {
  if (evento.target.id !== "selector-temporada") return;
  verTemporada(evento.target.value);
  document.getElementById("selector-temporada")?.focus();
}

function irDespuesDeEntrar() {
  const destino = estado.volver && estado.volver !== "#compte" ? estado.volver : "";
  estado.volver = "";
  if (destino) location.hash = destino;
  else pintar();
}

async function enviarCuenta(form) {
  const error = form.querySelector(".form-error");
  const boton = form.querySelector('button[type="submit"]');
  const datos = new FormData(form);
  const valor = (k) => String(datos.get(k) || "").trim();
  const mostrar = (texto) => {
    error.textContent = texto;
    error.hidden = false;
  };
  error.hidden = true;
  const textoBoton = boton.textContent;
  if (form.id === "form-entrar") {
    if (!valor("correo") || !datos.get("clave")) return mostrar("Indique ton e-mail et ton mot de passe.");
  }
  if (form.id === "form-registro") {
    if (valor("pseudo").length < 3 || valor("pseudo").length > 20) return mostrar("Le pseudo doit faire de 3 à 20 caractères.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor("correo"))) return mostrar("L'adresse e-mail n'est pas valide.");
    if (String(datos.get("clave") || "").length < 8) return mostrar("Le mot de passe doit faire au moins 8 caractères.");
    if (datos.get("acepto") !== "on") return mostrar("Coche la case pour accepter le fonctionnement des pronostics et la politique de confidentialité.");
  }
  if (form.id === "form-pseudo" && (valor("pseudo").length < 3 || valor("pseudo").length > 20)) return mostrar("Le pseudo doit faire de 3 à 20 caractères.");
  boton.disabled = true;
  boton.textContent = "Un instant…";
  try {
    if (form.id === "form-entrar") {
      await almacen.entrarVisitante(valor("correo"), String(datos.get("clave")));
      await refrescarCuenta();
      avisar(`Connecté : bonjour ${estado.cuenta?.pseudo || ""}`);
      irDespuesDeEntrar();
      return;
    }
    if (form.id === "form-registro") {
      const r = await almacen.registrar({ pseudo: valor("pseudo"), correo: valor("correo"), clave: String(datos.get("clave")) });
      if (r.confirmar) {
        form.reset();
        mostrar("Compte créé. Ouvre le lien reçu par e-mail pour confirmer ton adresse, puis connecte-toi.");
        error.classList.add("es-ok");
        return;
      }
      await refrescarCuenta();
      avisar(`Bienvenue ${estado.cuenta?.pseudo || ""} !`);
      irDespuesDeEntrar();
      return;
    }
    if (form.id === "form-pseudo") {
      const nuevo = await almacen.guardarPseudo(valor("pseudo"));
      estado.cuenta = { ...estado.cuenta, pseudo: nuevo };
      estado.clasif.clear();
      pintar();
      avisar("Pseudo enregistré");
    }
  } catch (fallo) {
    mostrar(ERRORES_CUENTA[fallo?.codigo] || ERRORES_CUENTA.red);
  } finally {
    if (document.body.contains(boton)) {
      boton.disabled = false;
      boton.textContent = textoBoton;
    }
  }
}

async function alEnviarAcceso(evento) {
  if (["form-entrar", "form-registro", "form-pseudo"].includes(evento.target.id)) {
    evento.preventDefault();
    await enviarCuenta(evento.target);
    return;
  }
  if (evento.target.id !== "form-acceso") return;
  evento.preventDefault();
  const form = evento.target;
  const error = form.querySelector(".form-error");
  const boton = form.querySelector('button[type="submit"]');
  const correo = (form.elements.llave || form.elements.correo).value.trim();
  const clave = form.elements.clave?.value || "";
  error.hidden = true;
  if (!correo || (!clave && almacen.modo !== "repo")) {
    error.textContent = almacen.modo === "repo" ? "Colle ta clé d'accès GitHub." : "Indique ton e-mail et ton mot de passe.";
    error.hidden = false;
    return;
  }
  boton.disabled = true;
  boton.textContent = "Connexion…";
  try {
    estado.usuario = await almacen.entrar(correo, clave);
    if (almacen.modo === "repo") {
      location.hash = "#inicio";
      location.reload();
      return;
    }
    estado.puedeEditar = true;
    estado.creador = true;
    escribirSesion(CLAVE_PUBLICO, null);
    location.hash = "#inicio";
    pintar();
    avisar("Connecté : le mode créateur est ouvert");
  } catch (fallo) {
    const mensajes = almacen.modo === "repo"
      ? { "sin-permiso": "Cette clé n'a pas le droit de modifier le dépôt du site.", red: "Impossible de joindre GitHub. Vérifie ta connexion." }
      : { "sin-permiso": "Ce compte n'a pas accès à l'espace créateur." };
    error.textContent = mensajes[fallo.codigo] || (almacen.modo === "repo" ? "Clé invalide ou expirée." : "E-mail ou mot de passe incorrect.");
    error.hidden = false;
    boton.disabled = false;
    boton.textContent = "Se connecter";
  }
}

function ocultarMiniaturaRota(evento) {
  if (evento.target instanceof HTMLImageElement && evento.target.classList.contains("miniatura")) evento.target.hidden = true;
}

async function arrancar() {
  const sesion = almacen.modo === "local" || enlaceCreador();
  if (!sesion && ruta().nombre === "createur") {
    irAlEnlaceCreador();
    return;
  }
  editor.prepararDialogo();
  document.addEventListener("click", alPulsar);
  document.addEventListener("change", alCambiar);
  document.addEventListener("submit", alEnviarAcceso);
  document.addEventListener("error", ocultarMiniaturaRota, true);
  window.addEventListener("hashchange", alCambiarRuta);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const abierto = document.querySelector('.menu-desplegar[aria-expanded="true"]');
    cerrarMenus();
    cerrarPiones();
    abierto?.focus();
  });
  pintar();
  let carga;
  try {
    carga = await almacen.cargar(sesion);
    const { datos, sinConexion } = carga;
    estado.sinConexion = sinConexion;
    const viejoEjemplo = datos && datos.ejemplo && (Number(datos.esquema) || 1) < 3;
    estado.datos = normalizar(almacen.modo !== "nube" && (!datos || viejoEjemplo) ? crearEjemplo() : datos || {});
    estado.pendiente = Boolean(carga.pendiente) && !viejoEjemplo;
  } catch {
    estado.error = true;
    pintar();
    return;
  }
  if (almacen.modo === "local") {
    estado.puedeEditar = true;
  } else if (almacen.modo === "repo") {
    estado.puedeEditar = Boolean(carga.editor);
    estado.usuario = estado.puedeEditar ? await almacen.usuario() : null;
  } else {
    try {
      if (sesion) {
        estado.usuario = await almacen.usuario();
        estado.puedeEditar = Boolean(estado.usuario) && (await almacen.esCreador());
      }
      await refrescarCuenta();
      await almacen.alCambiarSesion((evento) => {
        if (evento !== "SIGNED_OUT" || (!estado.cuenta && !estado.puedeEditar)) return;
        estado.cuenta = null;
        estado.misPronos = new Map();
        estado.clasif.clear();
        if (estado.puedeEditar) {
          estado.puedeEditar = false;
          estado.creador = false;
          estado.usuario = null;
        }
        pintar();
      });
    } catch {
      estado.puedeEditar = false;
    }
  }
  if (almacen.modo === "local") {
    const preferencia = leerLocal(CLAVE_VISTA_LOCAL);
    estado.creador = preferencia ? preferencia === "creador" : !carga.publicado;
  } else {
    estado.creador = estado.puedeEditar && leerSesion(CLAVE_PUBLICO) !== "1";
  }
  if (ruta().nombre === "createur" && estado.puedeEditar) location.replace("#inicio");
  if (sesion && !estado.puedeEditar && !location.hash) location.replace("#createur");
  pintar();
  if (carga.llaveCaducada) avisar("Ta clé GitHub n'est plus valable. Reconnecte-toi depuis l'espace créateur.", "error");
  if (carga.apartado) avisar("Le site a été mis à jour. Tes modifications non publiées sont gardées dans « Données ».", "ok", { texto: "Voir", alPulsar: () => editor.abrirDatos(api) });
}

arrancar();
