const PUESTOS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

const COLORES = ["#1D4ED8", "#DC2626", "#15803D", "#B45309", "#0E7490", "#7C3AED", "#BE185D", "#1F2937"];

const ESQUEMA = 3;

const SITIO_BASE = {
  nombre: "Ligue S",
  lema: "La ligue de foot à 5 amateur",
  logo: "",
  presentacion: {
    titulo: "Du foot à 5, une vraie saison",
    texto: "La Ligue S est une ligue de foot à 5 amateur. Les équipes s'affrontent tout au long de la saison et chaque match compte pour le classement. On joue pour le plaisir, mais on joue pour gagner.\n\nTous les matchs sont filmés. Ils passent en direct sur YouTube, puis les récaps arrivent ici avec les résultats, le classement, les notes et les fiches des joueurs."
  },
  reglas: [
    "Cinq contre cinq : quatre joueurs de champ et un gardien.",
    "Deux mi-temps de 25 minutes.",
    "Changements illimités, à tout moment du match.",
    "Pas de tacle glissé.",
    "Le respect de l'arbitre et des adversaires passe avant le score."
  ],
  puntos: { victoria: 3, empate: 1, derrota: 0 },
  minimoNotas: 3,
  youtube: "https://www.youtube.com/@Ligue.S",
  instagram: "https://www.instagram.com/ligue._s/",
  responsable: "Tom Hallé",
  correo: ""
};

const TEMPORADA_INICIAL = { id: "saison-5", nombre: "Saison 5", orden: 5 };

const FORMATO_DIA = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const FORMATO_DIA_ANIO = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const FORMATO_SEMANA = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const FORMATO_MES = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const FORMATO_CORTO = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const FORMATO_FECHA_MINI = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const FORMATO_NOTA = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const FORMATO_MEDIA = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function texto(valor, max = 500) {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

function entero(valor, min = 0, max = 999) {
  const n = Number.parseInt(valor, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;
}

function enlaceSeguro(valor) {
  const t = texto(valor, 2000);
  if (!t) return "";
  try {
    const u = new URL(t);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
  } catch {
    return "";
  }
}

function imagenSegura(valor) {
  if (typeof valor === "string" && /^data:image\/(webp|jpeg|png|gif|avif);base64,/.test(valor)) return valor;
  if (typeof valor === "string" && /^img\/[a-z]+\/[\w.-]+\.(webp|jpe?g|png)$/.test(valor)) return valor;
  return enlaceSeguro(valor);
}

function colorSeguro(valor, porDefecto = COLORES[0]) {
  return typeof valor === "string" && /^#[0-9a-f]{6}$/i.test(valor) ? valor.toUpperCase() : porDefecto;
}

function fechaSegura(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return "";
  const [a, m, d] = valor.split("-").map(Number);
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d ? valor : "";
}

function horaSegura(valor) {
  const t = typeof valor === "string" ? valor.slice(0, 5) : "";
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : "";
}

function leerNota(valor) {
  if (valor === null || valor === undefined) return { vacia: true };
  const t = String(valor).trim().replace(",", ".");
  if (!t) return { vacia: true };
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(t)) return { error: "formato" };
  const n = Number(t);
  if (n < 0 || n > 10) return { error: "rango" };
  if (Math.abs(n * 4 - Math.round(n * 4)) > 1e-9) return { error: "cuarto" };
  return { valor: Math.round(n * 4) / 4 };
}

function notaSegura(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(String(valor).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 10) return null;
  return Math.round(n * 4) / 4;
}

function nota(n) {
  return n === null || n === undefined ? "" : FORMATO_NOTA.format(n);
}

function media(n) {
  return n === null || n === undefined ? "" : FORMATO_MEDIA.format(n);
}

function nivelNota(n) {
  if (n === null || n === undefined) return "sin";
  if (n >= 8) return "alta";
  if (n >= 6.5) return "buena";
  if (n >= 5) return "media";
  return "baja";
}

function idYoutube(valor) {
  const t = texto(valor, 500);
  if (/^[\w-]{11}$/.test(t)) return t;
  try {
    const u = new URL(t);
    const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1, 12);
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:live|shorts|embed|v)\/([\w-]{11})/) || [])[1] || "";
    }
    return /^[\w-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

function siglaAuto(nombre) {
  const palabras = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const utiles = palabras.filter((p) => !["les", "le", "la", "l", "de", "du", "des", "fc", "as", "us", "sc", "ac"].includes(p.toLowerCase()));
  const base = utiles.length ? utiles : palabras;
  if (!base.length) return "EQ";
  if (base.length === 1) return base[0].slice(0, 3).toUpperCase();
  if (base.length === 2) return (base[0][0] + base[1].slice(0, 2)).toUpperCase();
  return base.slice(0, 3).map((p) => p[0]).join("").toUpperCase();
}

function usuarioRed(url) {
  try {
    const parte = new URL(url).pathname.split("/").filter(Boolean)[0] || "";
    if (!parte || ["channel", "c", "user"].includes(parte)) return "";
    return parte.startsWith("@") ? parte : `@${parte}`;
  } catch {
    return "";
  }
}

function sigla(equipo) {
  return equipo?.sigla || siglaAuto(equipo?.nombre || "");
}

function tinta(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#0D1A36" : "#FFFFFF";
}

function iniciales(nombre) {
  const partes = texto(nombre, 80).replace(/\./g, "").split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  return (partes[0][0] + (partes[1]?.[0] || "")).toUpperCase();
}

function plural(n, uno, varios) {
  return `${n} ${Math.abs(n) <= 1 ? uno : varios}`;
}

function ordinal(n) {
  return n === 1 ? "1er" : `${n}e`;
}

function hoyISO(fecha = new Date()) {
  return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, "0"), String(fecha.getDate()).padStart(2, "0")].join("-");
}

function aFecha(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function mayuscula(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function diaLargo(iso) {
  const f = aFecha(iso);
  return mayuscula((f.getFullYear() === new Date().getFullYear() ? FORMATO_DIA : FORMATO_DIA_ANIO).format(f));
}

function partesDia(iso) {
  const f = aFecha(iso);
  return { semana: FORMATO_SEMANA.format(f), numero: f.getDate(), mes: FORMATO_MES.format(f) };
}

function fechaCorta(iso) {
  return iso ? FORMATO_CORTO.format(aFecha(iso)) : "";
}

function fechaMini(iso) {
  return iso ? FORMATO_FECHA_MINI.format(aFecha(iso)) : "";
}

function claveTiempo(e) {
  return `${e.fecha} ${e.hora || "99:99"}`;
}

function porFecha(a, b) {
  return claveTiempo(a).localeCompare(claveTiempo(b));
}

function porNombre(a, b) {
  return a.nombre.localeCompare(b.nombre, "fr");
}

function lista(v) {
  return Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : [];
}

function migrar(v) {
  const t = TEMPORADA_INICIAL;
  const equipos = lista(v.equipos);
  const jugadores = lista(v.jugadores);
  const equipoDe = new Map(jugadores.map((j) => [j.id, j.equipo]));
  const partidos = lista(v.partidos);
  return {
    esquema: v.esquema,
    sitio: v.sitio,
    temporadaActual: t.id,
    temporadas: [{ ...t }],
    equipos,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puesto: j.puesto, foto: j.foto })),
    inscripciones: equipos.map((e) => ({ id: `${t.id}-${e.id}`, temporada: t.id, equipo: e.id })),
    plantillas: jugadores.map((j) => ({ id: `${t.id}-${j.id}`, temporada: t.id, equipo: j.equipo, jugador: j.id, numero: j.numero, capitan: j.capitan })),
    partidos: partidos.map((m) => ({ ...m, temporada: t.id })),
    actuaciones: partidos.flatMap((m) => (m.goles ? lista(m.goleadores).map((g) => ({ id: `${m.id}-${g.jugador}`, partido: m.id, jugador: g.jugador, equipo: equipoDe.get(g.jugador), nota: null, goles: g.goles })) : [])),
    lives: lista(v.lives).map((l) => ({ ...l, temporada: t.id })),
    videos: lista(v.videos).map((x) => ({ ...x, temporada: t.id })),
    premios: [],
    ejemplo: v.ejemplo
  };
}

function normalizarSitio(s, esquema) {
  const p = s.puntos && typeof s.puntos === "object" ? s.puntos : {};
  const pres = s.presentacion && typeof s.presentacion === "object" ? s.presentacion : {};
  const cadena = (clave, max) => (typeof s[clave] === "string" ? texto(s[clave], max) : SITIO_BASE[clave]);
  const nuevo = (clave) => (typeof s[clave] === "string" && (s[clave] || esquema >= 2) ? s[clave] : SITIO_BASE[clave]);
  return {
    nombre: texto(s.nombre, 60) || SITIO_BASE.nombre,
    lema: cadena("lema", 140),
    logo: imagenSegura(s.logo),
    presentacion: {
      titulo: typeof pres.titulo === "string" ? texto(pres.titulo, 140) : SITIO_BASE.presentacion.titulo,
      texto: typeof pres.texto === "string" ? texto(pres.texto, 4000) : SITIO_BASE.presentacion.texto
    },
    reglas: Array.isArray(s.reglas) ? s.reglas.map((r) => texto(r, 300)).filter(Boolean).slice(0, 30) : [...SITIO_BASE.reglas],
    puntos: {
      victoria: entero(p.victoria, 0, 10) ?? SITIO_BASE.puntos.victoria,
      empate: entero(p.empate, 0, 10) ?? SITIO_BASE.puntos.empate,
      derrota: entero(p.derrota, 0, 10) ?? SITIO_BASE.puntos.derrota
    },
    minimoNotas: entero(s.minimoNotas, 1, 50) ?? SITIO_BASE.minimoNotas,
    youtube: enlaceSeguro(nuevo("youtube")),
    instagram: enlaceSeguro(nuevo("instagram")),
    responsable: texto(nuevo("responsable"), 120),
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(s.correo, 200)) ? texto(s.correo, 200) : ""
  };
}

function normalizar(origen) {
  const bruto = origen && typeof origen === "object" ? origen : {};
  const esquema = entero(bruto.esquema, 1, 99) ?? 1;
  const d = esquema < 3 || !Array.isArray(bruto.temporadas) ? migrar(bruto) : bruto;
  const vistos = new Set();
  const unico = (id) => {
    const t = texto(id, 80) || uid();
    const final = vistos.has(t) ? uid() : t;
    vistos.add(final);
    return final;
  };
  const clave = (...partes) => partes.join("|");

  let temporadas = lista(d.temporadas).map((t, i) => ({
    id: unico(t.id),
    nombre: texto(t.nombre, 60) || `Saison ${i + 1}`,
    orden: entero(t.orden, 0, 9999) ?? i + 1
  }));
  if (!temporadas.length) temporadas = [{ ...TEMPORADA_INICIAL }];
  temporadas.sort((a, b) => a.orden - b.orden);
  const idsTemporadas = new Set(temporadas.map((t) => t.id));
  const temporadaActual = idsTemporadas.has(d.temporadaActual) ? d.temporadaActual : temporadas[temporadas.length - 1].id;

  const equipos = lista(d.equipos).filter((e) => texto(e.nombre, 60)).map((e, i) => ({
    id: unico(e.id),
    nombre: texto(e.nombre, 60),
    sigla: texto(e.sigla, 4).toUpperCase().replace(/[^A-Z0-9]/g, ""),
    color: colorSeguro(e.color, COLORES[i % COLORES.length]),
    logo: imagenSegura(e.logo),
    foto: imagenSegura(e.foto)
  }));
  const idsEquipos = new Set(equipos.map((e) => e.id));

  const jugadores = lista(d.jugadores).filter((j) => texto(j.nombre, 60)).map((j) => ({
    id: unico(j.id),
    nombre: texto(j.nombre, 60),
    puesto: PUESTOS.includes(j.puesto) ? j.puesto : "",
    foto: imagenSegura(j.foto)
  }));
  const idsJugadores = new Set(jugadores.map((j) => j.id));

  const inscritos = new Set();
  const inscripciones = lista(d.inscripciones).filter((i) => {
    const k = clave(i.temporada, i.equipo);
    if (!idsTemporadas.has(i.temporada) || !idsEquipos.has(i.equipo) || inscritos.has(k)) return false;
    inscritos.add(k);
    return true;
  }).map((i) => ({ id: unico(i.id), temporada: i.temporada, equipo: i.equipo }));

  const conJugador = new Set();
  const conCapitan = new Set();
  const dorsales = new Set();
  const plantillas = lista(d.plantillas).filter((p) => {
    const k = clave(p.temporada, p.jugador);
    if (!inscritos.has(clave(p.temporada, p.equipo)) || !idsJugadores.has(p.jugador) || conJugador.has(k)) return false;
    conJugador.add(k);
    return true;
  }).map((p) => {
    const equipo = clave(p.temporada, p.equipo);
    let numero = entero(p.numero, 0, 99);
    if (numero !== null && dorsales.has(clave(equipo, numero))) numero = null;
    if (numero !== null) dorsales.add(clave(equipo, numero));
    const capitan = Boolean(p.capitan) && !conCapitan.has(equipo);
    if (capitan) conCapitan.add(equipo);
    return { id: unico(p.id), temporada: p.temporada, equipo: p.equipo, jugador: p.jugador, numero, capitan };
  });
  const equipoDe = new Map(plantillas.map((p) => [clave(p.temporada, p.jugador), p.equipo]));

  const partidos = lista(d.partidos).filter((m) => fechaSegura(m.fecha) && idsTemporadas.has(m.temporada) && m.local !== m.visitante && inscritos.has(clave(m.temporada, m.local)) && inscritos.has(clave(m.temporada, m.visitante))).map((m) => {
    const goles = Array.isArray(m.goles) && m.goles.length === 2 && m.goles.every((g) => entero(g, 0, 99) !== null) ? m.goles.map((g) => entero(g, 0, 99)) : null;
    return {
      id: unico(m.id),
      temporada: m.temporada,
      fecha: m.fecha,
      hora: horaSegura(m.hora),
      local: m.local,
      visitante: m.visitante,
      jornada: texto(m.jornada, 40),
      lugar: texto(m.lugar, 80),
      goles
    };
  });
  const partidosPorId = new Map(partidos.map((m) => [m.id, m]));

  const notados = new Set();
  const actuaciones = lista(d.actuaciones).map((a) => {
    const m = partidosPorId.get(a.partido);
    if (!m || !m.goles || !idsJugadores.has(a.jugador) || notados.has(clave(a.partido, a.jugador))) return null;
    const lados = [m.local, m.visitante];
    const equipo = lados.includes(a.equipo) ? a.equipo : equipoDe.get(clave(m.temporada, a.jugador));
    if (!lados.includes(equipo)) return null;
    const notaFinal = notaSegura(a.nota);
    const goles = entero(a.goles, 0, 99) || 0;
    if (notaFinal === null && goles === 0) return null;
    notados.add(clave(a.partido, a.jugador));
    return { id: unico(a.id), partido: a.partido, jugador: a.jugador, equipo, nota: notaFinal, goles };
  }).filter(Boolean);

  const lives = lista(d.lives).filter((l) => fechaSegura(l.fecha) && idsTemporadas.has(l.temporada)).map((l) => ({
    id: unico(l.id),
    temporada: l.temporada,
    titulo: texto(l.titulo, 100) || "Live",
    fecha: l.fecha,
    hora: horaSegura(l.hora),
    enlace: enlaceSeguro(l.enlace)
  }));

  const videos = lista(d.videos).filter((v) => idYoutube(v.youtube || v.enlace) && idsTemporadas.has(v.temporada)).map((v) => {
    const m = partidosPorId.get(v.partido);
    return {
      id: unico(v.id),
      temporada: v.temporada,
      titulo: texto(v.titulo, 140) || "Récap",
      youtube: idYoutube(v.youtube || v.enlace),
      fecha: fechaSegura(v.fecha),
      partido: m && m.temporada === v.temporada ? m.id : ""
    };
  });

  const premios = lista(d.premios).filter((p) => texto(p.nombre, 80) && idsTemporadas.has(p.temporada)).map((p, i) => ({
    id: unico(p.id),
    temporada: p.temporada,
    nombre: texto(p.nombre, 80),
    jugador: idsJugadores.has(p.jugador) ? p.jugador : "",
    equipo: idsEquipos.has(p.equipo) ? p.equipo : "",
    detalle: texto(p.detalle, 120),
    orden: entero(p.orden, 0, 9999) ?? i + 1
  })).sort((a, b) => a.orden - b.orden);

  return {
    esquema: ESQUEMA,
    sitio: normalizarSitio(d.sitio && typeof d.sitio === "object" ? d.sitio : {}, esquema),
    temporadaActual,
    temporadas,
    equipos,
    jugadores,
    inscripciones,
    plantillas,
    partidos,
    actuaciones,
    lives,
    videos,
    premios,
    ejemplo: Boolean(d.ejemplo)
  };
}

function equiposDe(d, t) {
  const ids = new Set(d.inscripciones.filter((i) => i.temporada === t).map((i) => i.equipo));
  return d.equipos.filter((e) => ids.has(e.id));
}

function plantillaDe(d, t, equipoId) {
  const jugadores = new Map(d.jugadores.map((j) => [j.id, j]));
  return d.plantillas
    .filter((p) => p.temporada === t && p.equipo === equipoId)
    .map((p) => ({ ...p, datos: jugadores.get(p.jugador) }))
    .sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999) || porNombre(a.datos, b.datos));
}

function temporadasDeJugador(d, jugadorId) {
  const partidos = new Map(d.partidos.map((m) => [m.id, m.temporada]));
  const ids = new Set([
    ...d.plantillas.filter((p) => p.jugador === jugadorId).map((p) => p.temporada),
    ...d.actuaciones.filter((a) => a.jugador === jugadorId).map((a) => partidos.get(a.partido))
  ]);
  return d.temporadas.filter((t) => ids.has(t.id));
}

function sumar(fila, pro, contra, puntos) {
  fila.pj += 1;
  fila.gf += pro;
  fila.gc += contra;
  if (pro > contra) {
    fila.g += 1;
    fila.pts += puntos.victoria;
    fila.forma.push("V");
  } else if (pro === contra) {
    fila.n += 1;
    fila.pts += puntos.empate;
    fila.forma.push("N");
  } else {
    fila.p += 1;
    fila.pts += puntos.derrota;
    fila.forma.push("D");
  }
}

function clasificacion(d, t) {
  const filas = new Map(equiposDe(d, t).map((e) => [e.id, { equipo: e, pj: 0, g: 0, n: 0, p: 0, gf: 0, gc: 0, pts: 0, forma: [] }]));
  d.partidos.filter((m) => m.temporada === t && m.goles).sort(porFecha).forEach((m) => {
    const a = filas.get(m.local);
    const b = filas.get(m.visitante);
    if (!a || !b) return;
    sumar(a, m.goles[0], m.goles[1], d.sitio.puntos);
    sumar(b, m.goles[1], m.goles[0], d.sitio.puntos);
  });
  return [...filas.values()]
    .map((f) => ({ ...f, dif: f.gf - f.gc, forma: f.forma.slice(-5) }))
    .sort((x, y) => y.pts - x.pts || y.dif - x.dif || y.gf - x.gf || porNombre(x.equipo, y.equipo))
    .map((f, i) => ({ ...f, posicion: i + 1 }));
}

function mejorDe(lista) {
  return lista
    .filter((a) => a.nota !== null)
    .sort((a, b) => b.nota - a.nota || b.goles - a.goles)[0] || null;
}

function hombresDelPartido(d, t) {
  const porPartido = new Map();
  const jugados = new Set(d.partidos.filter((m) => m.temporada === t && m.goles).map((m) => m.id));
  d.actuaciones.filter((a) => jugados.has(a.partido)).forEach((a) => {
    if (!porPartido.has(a.partido)) porPartido.set(a.partido, []);
    porPartido.get(a.partido).push(a);
  });
  return new Map([...porPartido].map(([id, lista]) => [id, mejorDe(lista)]).filter(([, a]) => a));
}

function estadisticas(d, t, mvps = hombresDelPartido(d, t)) {
  const jugados = new Set(d.partidos.filter((m) => m.temporada === t && m.goles).map((m) => m.id));
  const filas = new Map();
  const fila = (id) => {
    if (!filas.has(id)) filas.set(id, { pj: 0, notas: 0, suma: 0, goles: 0, mejor: null, mvp: 0, equipo: "" });
    return filas.get(id);
  };
  d.actuaciones.filter((a) => jugados.has(a.partido)).forEach((a) => {
    const f = fila(a.jugador);
    f.pj += 1;
    f.goles += a.goles;
    f.equipo = a.equipo;
    if (a.nota !== null) {
      f.notas += 1;
      f.suma += a.nota;
      f.mejor = Math.max(f.mejor ?? 0, a.nota);
    }
  });
  mvps.forEach((a, partido) => {
    if (jugados.has(partido)) fila(a.jugador).mvp += 1;
  });
  filas.forEach((f) => {
    f.media = f.notas ? Math.round((f.suma / f.notas) * 100) / 100 : null;
  });
  return filas;
}

function rankingJugadores(d, t, stats = estadisticas(d, t)) {
  const jugadores = new Map(d.jugadores.map((j) => [j.id, j]));
  const equipos = new Map(d.equipos.map((e) => [e.id, e]));
  const plantilla = new Map(d.plantillas.filter((p) => p.temporada === t).map((p) => [p.jugador, p]));
  const ids = new Set([...plantilla.keys(), ...stats.keys()]);
  const vacio = { pj: 0, notas: 0, goles: 0, media: null, mejor: null, mvp: 0, equipo: "" };
  return [...ids]
    .filter((id) => jugadores.has(id))
    .map((id) => {
      const s = stats.get(id) || vacio;
      const p = plantilla.get(id);
      return { ...s, jugador: jugadores.get(id), equipo: equipos.get(p?.equipo || s.equipo), numero: p?.numero ?? null };
    })
    .filter((f) => f.equipo);
}

function porMedia(a, b) {
  return (b.media ?? -1) - (a.media ?? -1) || b.notas - a.notas || b.goles - a.goles || porNombre(a.jugador, b.jugador);
}

function porGoles(a, b) {
  return b.goles - a.goles || (b.media ?? -1) - (a.media ?? -1) || porNombre(a.jugador, b.jugador);
}

function conPuestos(filas, valor) {
  return filas.map((f, i) => ({ ...f, puesto: filas.findIndex((o) => valor(o) === valor(f)) + 1 || i + 1 }));
}

function mejoresJugadores(d, t, ranking = rankingJugadores(d, t), cuantos = 3) {
  const aptos = ranking.filter((f) => f.notas >= d.sitio.minimoNotas && f.media !== null).sort(porMedia).slice(0, cuantos);
  return conPuestos(aptos, (f) => f.media);
}

function mejoresGoleadores(d, t, ranking = rankingJugadores(d, t), cuantos = 3) {
  const aptos = ranking.filter((f) => f.goles > 0).sort(porGoles).slice(0, cuantos);
  return conPuestos(aptos, (f) => f.goles);
}

function campeon(d, t) {
  if (t === d.temporadaActual) return null;
  const tabla = clasificacion(d, t);
  return tabla.length && tabla[0].pj ? tabla[0] : null;
}

function historialEquipo(d, equipoId) {
  return d.temporadas
    .filter((t) => d.inscripciones.some((i) => i.temporada === t.id && i.equipo === equipoId))
    .map((t) => ({ temporada: t, fila: clasificacion(d, t.id).find((f) => f.equipo.id === equipoId) }))
    .reverse();
}

function historialJugador(d, jugadorId) {
  return temporadasDeJugador(d, jugadorId)
    .map((t) => {
      const s = estadisticas(d, t.id).get(jugadorId) || { pj: 0, notas: 0, goles: 0, media: null, mejor: null, mvp: 0, equipo: "" };
      const p = d.plantillas.find((x) => x.temporada === t.id && x.jugador === jugadorId);
      return { ...s, temporada: t, equipo: d.equipos.find((e) => e.id === (p?.equipo || s.equipo)), numero: p?.numero ?? null };
    })
    .reverse();
}

function agenda(d, t, hoy = hoyISO()) {
  const eventos = [
    ...d.partidos.filter((m) => m.temporada === t).map((m) => ({ tipo: "partido", fecha: m.fecha, hora: m.hora, dato: m })),
    ...d.lives.filter((l) => l.temporada === t).map((l) => ({ tipo: "live", fecha: l.fecha, hora: l.hora, dato: l }))
  ];
  const esPasado = (e) => (e.tipo === "partido" ? Boolean(e.dato.goles) : e.fecha < hoy);
  return {
    proximos: eventos.filter((e) => !esPasado(e)).sort(porFecha),
    pasados: eventos.filter(esPasado).sort((a, b) => porFecha(b, a))
  };
}

function agruparPorDia(eventos) {
  const grupos = [];
  eventos.forEach((e) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.fecha === e.fecha) ultimo.eventos.push(e);
    else grupos.push({ fecha: e.fecha, eventos: [e] });
  });
  return grupos;
}

function siguienteLive(d, t, hoy = hoyISO()) {
  return d.lives.filter((l) => l.temporada === t && l.fecha >= hoy).sort(porFecha)[0] || null;
}

function siguientePartido(d, t) {
  return d.partidos.filter((m) => m.temporada === t && !m.goles).sort(porFecha)[0] || null;
}

function siguienteNombreTemporada(d) {
  const ultima = d.temporadas[d.temporadas.length - 1];
  const numero = Number.parseInt((ultima?.nombre.match(/(\d+)\s*$/) || [])[1], 10);
  return Number.isFinite(numero) ? ultima.nombre.replace(/(\d+)\s*$/, String(numero + 1)) : `Saison ${d.temporadas.length + 1}`;
}

export {
  PUESTOS,
  COLORES,
  SITIO_BASE,
  TEMPORADA_INICIAL,
  uid,
  esc,
  texto,
  entero,
  enlaceSeguro,
  leerNota,
  notaSegura,
  nota,
  media,
  nivelNota,
  idYoutube,
  usuarioRed,
  sigla,
  siglaAuto,
  tinta,
  iniciales,
  plural,
  ordinal,
  hoyISO,
  aFecha,
  diaLargo,
  partesDia,
  fechaCorta,
  fechaMini,
  porFecha,
  porNombre,
  porMedia,
  porGoles,
  normalizar,
  equiposDe,
  plantillaDe,
  temporadasDeJugador,
  clasificacion,
  hombresDelPartido,
  estadisticas,
  mejorDe,
  rankingJugadores,
  mejoresJugadores,
  mejoresGoleadores,
  campeon,
  historialEquipo,
  historialJugador,
  agenda,
  agruparPorDia,
  siguienteLive,
  siguientePartido,
  siguienteNombreTemporada
};
