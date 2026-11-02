import * as almacen from "./almacen.js";
import * as vistas from "./vistas.js";
import * as editor from "./editor.js";
import { normalizar, clasificacion, estadisticas, rankingJugadores, mejoresJugadores, mejoresGoleadores, mejorDe, hoyISO, TEMPORADA_INICIAL } from "./logica.js";
import { crearEjemplo } from "./ejemplo.js";

const RUTAS = ["inicio", "calendrier", "equipes", "joueurs", "videos", "palmares", "confidentialite", "createur"];
const TITULOS = { inicio: "", calendrier: "Calendrier", equipes: "Équipes", joueurs: "Joueurs", videos: "Vidéos", palmares: "Palmarès", confidentialite: "Politique de confidentialité", createur: "Espace créateur" };
const CLAVE_PUBLICO = "ligue-s:vista-publica";

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
  sinConexion: false
};

function leerSesion(clave) {
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
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

function ruta() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith("equipe-")) return { nombre: "equipe", id: h.slice(7) };
  if (h.startsWith("joueur-")) return { nombre: "joueur", id: h.slice(7) };
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
    jugadores: new Map(d.jugadores.map((j) => [j.id, j]))
  };
}

function pintar() {
  const r = ruta();
  if (!estado.datos) {
    vistaEl.innerHTML = estado.error ? vistas.errorCarga() : vistas.cargando();
    return;
  }
  const ctx = contexto();
  const activa = r.nombre === "equipe" ? "equipes" : r.nombre === "joueur" ? "joueurs" : r.nombre;
  cabeceraEl.innerHTML = vistas.cabecera(ctx, activa);
  barraEl.innerHTML = vistas.barraCreador(ctx) + (estado.sinConexion ? '<p class="aviso-ejemplo">Pas de connexion : tu vois la dernière version enregistrée.</p>' : "");
  const paginas = {
    inicio: () => vistas.inicio(ctx),
    calendrier: () => vistas.calendario(ctx),
    equipes: () => vistas.equipos(ctx),
    equipe: () => vistas.equipo(ctx, r.id),
    joueurs: () => vistas.jugadores(ctx),
    joueur: () => vistas.jugador(ctx, r.id),
    videos: () => vistas.videos(ctx),
    palmares: () => vistas.palmares(ctx),
    confidentialite: () => vistas.confidencialidad(ctx),
    createur: () => vistas.acceso(ctx)
  };
  vistaEl.innerHTML = paginas[r.nombre]();
  pieEl.innerHTML = vistas.pie(ctx);
  const nombre = r.nombre === "equipe" ? ctx.equipos.get(r.id)?.nombre : r.nombre === "joueur" ? ctx.jugadores.get(r.id)?.nombre : "";
  const titulo = nombre || TITULOS[r.nombre];
  document.title = titulo ? `${titulo} | ${ctx.d.sitio.nombre}` : `${ctx.d.sitio.nombre} | ${ctx.d.sitio.lema || "Foot à 5"}`;
}

function alCambiarRuta() {
  const r = ruta();
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
    subida: "La photo n'a pas pu être envoyée. Vérifie ta connexion et réessaie."
  };
  return codigos[error?.codigo] || "L'enregistrement n'a pas abouti. Vérifie ta connexion et réessaie.";
}

async function aplicar(mutar, mensaje) {
  const antes = JSON.stringify(estado.datos);
  try {
    const copia = JSON.parse(antes);
    mutar(copia);
    const nuevos = normalizar(copia);
    await almacen.guardar(nuevos);
    estado.datos = nuevos;
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

function exportar() {
  const blob = new Blob([JSON.stringify(estado.datos, null, 2)], { type: "application/json" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `ligue-s-${hoyISO()}.json`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
  avisar("Sauvegarde téléchargée");
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
  escribirSesion(CLAVE_PUBLICO, activo ? null : "1");
  pintar();
}

function verTemporada(id) {
  estado.temporada = id;
  pintar();
}

async function salir() {
  await almacen.salir();
  estado.puedeEditar = false;
  estado.creador = false;
  estado.usuario = null;
  pintar();
  avisar("Tu es déconnecté");
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
  importar,
  reiniciar,
  verTemporada,
  borrarTemporada
};

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
  "borrar-premio": (id) => borrar("premio", id)
};

const publicas = new Set(["modo-creador", "recargar", "saltar", "reproducir"]);

function alPulsar(evento) {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;
  const accion = boton.dataset.accion;
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

async function alEnviarAcceso(evento) {
  if (evento.target.id !== "form-acceso") return;
  evento.preventDefault();
  const form = evento.target;
  const error = form.querySelector(".form-error");
  const boton = form.querySelector('button[type="submit"]');
  const correo = form.elements.correo.value.trim();
  const clave = form.elements.clave.value;
  error.hidden = true;
  if (!correo || !clave) {
    error.textContent = "Indique ton e-mail et ton mot de passe.";
    error.hidden = false;
    return;
  }
  boton.disabled = true;
  boton.textContent = "Connexion…";
  try {
    estado.usuario = await almacen.entrar(correo, clave);
    estado.puedeEditar = true;
    estado.creador = true;
    escribirSesion(CLAVE_PUBLICO, null);
    location.hash = "#inicio";
    pintar();
    avisar("Connecté : le mode créateur est ouvert");
  } catch (fallo) {
    error.textContent = fallo.codigo === "sin-permiso" ? "Ce compte n'a pas accès à l'espace créateur." : "E-mail ou mot de passe incorrect.";
    error.hidden = false;
    boton.disabled = false;
    boton.textContent = "Se connecter";
  }
}

function ocultarMiniaturaRota(evento) {
  if (evento.target instanceof HTMLImageElement && evento.target.classList.contains("miniatura")) evento.target.hidden = true;
}

async function arrancar() {
  editor.prepararDialogo();
  document.addEventListener("click", alPulsar);
  document.addEventListener("change", alCambiar);
  document.addEventListener("submit", alEnviarAcceso);
  document.addEventListener("error", ocultarMiniaturaRota, true);
  window.addEventListener("hashchange", alCambiarRuta);
  pintar();
  try {
    const { datos, sinConexion } = await almacen.cargar();
    estado.sinConexion = sinConexion;
    const viejoEjemplo = datos && datos.ejemplo && (Number(datos.esquema) || 1) < 3;
    estado.datos = normalizar(almacen.modo === "local" && (!datos || viejoEjemplo) ? crearEjemplo() : datos || {});
  } catch {
    estado.error = true;
    pintar();
    return;
  }
  if (almacen.modo === "local") {
    estado.puedeEditar = true;
  } else {
    try {
      estado.usuario = await almacen.usuario();
      estado.puedeEditar = Boolean(estado.usuario) && (await almacen.esCreador());
      await almacen.alCambiarSesion((evento) => {
        if (evento === "SIGNED_OUT" && estado.puedeEditar) {
          estado.puedeEditar = false;
          estado.creador = false;
          estado.usuario = null;
          pintar();
        }
      });
    } catch {
      estado.puedeEditar = false;
    }
  }
  estado.creador = estado.puedeEditar && leerSesion(CLAVE_PUBLICO) !== "1";
  if (ruta().nombre === "createur" && estado.puedeEditar) location.replace("#inicio");
  pintar();
}

arrancar();
