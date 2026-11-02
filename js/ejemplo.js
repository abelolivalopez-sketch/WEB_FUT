import { SITIO_BASE, hoyISO, normalizar, rankingJugadores, mejoresJugadores, mejoresGoleadores, campeon, media, plural } from "./logica.js";

const EQUIPOS = [
  ["faucons", "Les Faucons", "FAU", "#1D4ED8", ["Yanis B.", "Lucas M.", "Moussa D.", "Théo R.", "Karim S.", "Hugo P."]],
  ["bitume", "Real Bitume", "RBI", "#1F2937", ["Ilyes A.", "Nathan G.", "Samba K.", "Enzo L.", "Rayan T.", "Maxime C."]],
  ["beton", "Atlético Béton", "ATB", "#DC2626", ["Adam F.", "Sofiane H.", "Louis V.", "Bilal O.", "Mathis E.", "Ousmane N."]],
  ["canal", "Olympique Canal", "OCA", "#0E7490", ["Ethan J.", "Mehdi Z.", "Jules P.", "Aboubakar S.", "Noah D.", "Kenzo R."]],
  ["dynamo", "Dynamo Cinq", "DYN", "#B45309", ["Gabriel L.", "Anis B.", "Raphaël M.", "Hamza C.", "Léo F.", "Ibrahim T."]],
  ["lampadaires", "AS Lampadaires", "ASL", "#15803D", ["Arthur G.", "Walid K.", "Paul D.", "Mamadou B.", "Adrien S.", "Younes L."]],
  ["parking", "Sporting Parking", "SPK", "#7C3AED", ["Timothée V.", "Nassim R.", "Kylian D.", "Bakary S."]]
];

const PUESTOS_EJEMPLO = [["Gardien", 1], ["Défenseur", 4], ["Milieu", 6], ["Milieu", 8], ["Attaquant", 10], ["Attaquant", 9]];

const JORNADAS = [[[0, 1], [2, 3], [4, 5]], [[0, 2], [1, 4], [3, 5]], [[0, 3], [1, 5], [2, 4]], [[0, 4], [1, 3], [2, 5]], [[0, 5], [1, 2], [3, 4]]];

const HORAS = ["19:00", "20:00", "21:00"];

function generador(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sumarDias(fecha, dias) {
  const f = new Date(fecha);
  f.setDate(f.getDate() + dias);
  return f;
}

function proximoSabado(hoy) {
  const faltan = (6 - hoy.getDay() + 7) % 7 || 7;
  return sumarDias(hoy, faltan);
}

function cuarto(n) {
  return Math.min(10, Math.max(0, Math.round(n * 4) / 4));
}

function repartirGoles(azar, plantilla, total) {
  const pesos = plantilla.map((p) => ({ Gardien: 0, Défenseur: 1, Milieu: 2, Attaquant: 4 })[p.puesto] ?? 2);
  const suma = pesos.reduce((a, b) => a + b, 0);
  const cuenta = new Map();
  for (let i = 0; i < total; i += 1) {
    let r = azar() * suma;
    const indice = pesos.findIndex((p) => (r -= p) < 0);
    const jugador = plantilla[indice === -1 ? plantilla.length - 1 : indice];
    cuenta.set(jugador.jugador, (cuenta.get(jugador.jugador) || 0) + 1);
  }
  return cuenta;
}

function actuacionesDe(azar, partido, plantilla, equipo, marcados, recibidos) {
  const goles = repartirGoles(azar, plantilla, marcados);
  const resultado = marcados > recibidos ? 0.75 : marcados === recibidos ? 0 : -0.75;
  return plantilla.filter(() => azar() > 0.08).map((p) => {
    const g = goles.get(p.jugador) || 0;
    const base = 6.25 + p.nivel + resultado + g * 0.5 + (azar() - 0.5) * 2;
    return { id: `${partido.id}-${p.jugador}`, partido: partido.id, jugador: p.jugador, equipo, nota: cuarto(base), goles: g };
  });
}

function crearEjemplo(hoy = new Date()) {
  const azar = generador(20261102);
  const temporadas = [
    { id: "ej-saison-4", nombre: "Saison 4", orden: 4 },
    { id: "ej-saison-5", nombre: "Saison 5", orden: 5 }
  ];
  const equipos = EQUIPOS.map(([id, nombre, sigla, color]) => ({ id: `ej-${id}`, nombre, sigla, color, logo: "", foto: "" }));
  const jugadores = [];
  const nivel = new Map();
  EQUIPOS.forEach(([id, , , , nombres]) => nombres.forEach((nombre, k) => {
    const jid = `ej-${id}-${k + 1}`;
    jugadores.push({ id: jid, nombre, puesto: PUESTOS_EJEMPLO[k][0], foto: "" });
    nivel.set(jid, (azar() - 0.4) * 1.6);
  }));
  const plantillaBase = (equipo, temporada) => jugadores
    .filter((j) => j.id.startsWith(`${equipo}-`))
    .map((j, k) => ({ id: `${temporada}-${j.id}`, temporada, equipo, jugador: j.id, numero: PUESTOS_EJEMPLO[k][1], capitan: k === 4 }));

  const s4 = ["faucons", "bitume", "beton", "canal", "dynamo", "lampadaires"].map((x) => `ej-${x}`);
  const s5 = ["faucons", "bitume", "beton", "canal", "dynamo", "parking"].map((x) => `ej-${x}`);
  const inscripciones = [
    ...s4.map((e) => ({ id: `ej-saison-4-${e}`, temporada: "ej-saison-4", equipo: e })),
    ...s5.map((e) => ({ id: `ej-saison-5-${e}`, temporada: "ej-saison-5", equipo: e }))
  ];
  const plantillas = [
    ...s4.flatMap((e) => plantillaBase(e, "ej-saison-4")),
    ...s5.flatMap((e) => plantillaBase(e, "ej-saison-5")),
    { id: "ej-saison-5-ej-lampadaires-5", temporada: "ej-saison-5", equipo: "ej-parking", jugador: "ej-lampadaires-5", numero: 11, capitan: false },
    { id: "ej-saison-5-ej-lampadaires-2", temporada: "ej-saison-5", equipo: "ej-parking", jugador: "ej-lampadaires-2", numero: 5, capitan: false }
  ];
  const conNivel = (p) => ({ ...p, puesto: jugadores.find((j) => j.id === p.jugador).puesto, nivel: nivel.get(p.jugador) });
  const plantillaDe = (t, e) => plantillas.filter((p) => p.temporada === t && p.equipo === e).map(conNivel);

  const partidos = [];
  const actuaciones = [];
  const lives = [];
  const sabado = proximoSabado(hoy);
  const temporadaJornadas = [
    ["ej-saison-4", s4, -26, 5],
    ["ej-saison-5", s5, -3, 3]
  ];
  temporadaJornadas.forEach(([t, equiposT, desfase, jugadas]) => {
    JORNADAS.forEach((cruces, j) => {
      const fecha = hoyISO(sumarDias(sabado, (desfase + j) * 7));
      const jugada = j < jugadas;
      cruces.forEach(([a, b], k) => {
        const goles = jugada ? [Math.floor(azar() * 6), Math.floor(azar() * 5)] : null;
        const partido = { id: `${t}-j${j + 1}-${k + 1}`, temporada: t, fecha, hora: HORAS[k], local: equiposT[a], visitante: equiposT[b], jornada: `Journée ${j + 1}`, lugar: k === 1 ? "Terrain 2" : "Terrain 1", goles };
        partidos.push(partido);
        if (goles) {
          actuaciones.push(...actuacionesDe(azar, partido, plantillaDe(t, equiposT[a]), equiposT[a], goles[0], goles[1]));
          actuaciones.push(...actuacionesDe(azar, partido, plantillaDe(t, equiposT[b]), equiposT[b], goles[1], goles[0]));
        }
      });
      if (!jugada && t === "ej-saison-5") lives.push({ id: `ej-live-${j + 1}`, temporada: t, titulo: `Live de la journée ${j + 1}`, fecha, hora: "18:45", enlace: "" });
    });
  });

  const datos = {
    esquema: 3,
    sitio: structuredClone(SITIO_BASE),
    temporadaActual: "ej-saison-5",
    temporadas,
    equipos,
    jugadores,
    inscripciones,
    plantillas,
    partidos,
    actuaciones,
    lives,
    videos: [],
    premios: [],
    ejemplo: true
  };

  const d = normalizar(datos);
  const ranking = rankingJugadores(d, "ej-saison-4");
  const mejor = mejoresJugadores(d, "ej-saison-4", ranking, 1)[0];
  const goleador = mejoresGoleadores(d, "ej-saison-4", ranking, 1)[0];
  const gardien = ranking.filter((f) => f.jugador.puesto === "Gardien" && f.notas >= d.sitio.minimoNotas).sort((a, b) => b.media - a.media)[0];
  const ganador = campeon({ ...d, temporadaActual: "ej-saison-5" }, "ej-saison-4");
  datos.premios = [
    ganador && { id: "ej-premio-1", temporada: "ej-saison-4", nombre: "Champion", jugador: "", equipo: ganador.equipo.id, detalle: plural(ganador.pts, "point", "points"), orden: 1 },
    mejor && { id: "ej-premio-2", temporada: "ej-saison-4", nombre: "Ballon d'or Ligue S", jugador: mejor.jugador.id, equipo: "", detalle: `Moyenne ${media(mejor.media)}`, orden: 2 },
    goleador && { id: "ej-premio-3", temporada: "ej-saison-4", nombre: "Meilleur buteur", jugador: goleador.jugador.id, equipo: "", detalle: plural(goleador.goles, "but", "buts"), orden: 3 },
    gardien && { id: "ej-premio-4", temporada: "ej-saison-4", nombre: "Meilleur gardien", jugador: gardien.jugador.id, equipo: "", detalle: `Moyenne ${media(gardien.media)}`, orden: 4 }
  ].filter(Boolean);
  return datos;
}

export { crearEjemplo };
