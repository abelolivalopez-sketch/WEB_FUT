const TABLAS = ["temporadas", "equipos", "jugadores", "inscripciones", "plantillas", "partidos", "actuaciones", "lives", "videos", "premios"];

const NULOS = {
  partidos: ["hora"],
  lives: ["hora"],
  videos: ["fecha", "partido"],
  premios: ["jugador", "equipo"]
};

function ordenado(valor) {
  if (Array.isArray(valor)) return valor.map(ordenado);
  if (valor && typeof valor === "object") return Object.fromEntries(Object.keys(valor).sort().map((k) => [k, ordenado(valor[k])]));
  return valor;
}

function firma(valor) {
  return JSON.stringify(ordenado(valor));
}

function aFila(tabla, fila) {
  const salida = { ...fila };
  (NULOS[tabla] || []).forEach((k) => {
    if (salida[k] === "" || salida[k] === undefined) salida[k] = null;
  });
  return salida;
}

function cambios(antes, despues) {
  const salida = {};
  TABLAS.forEach((tabla) => {
    const previas = new Map((antes?.[tabla] || []).map((f) => [f.id, firma(aFila(tabla, f))]));
    const ids = new Set();
    const poner = [];
    (despues[tabla] || []).forEach((f) => {
      ids.add(f.id);
      const fila = aFila(tabla, f);
      if (previas.get(f.id) !== firma(fila)) poner.push(fila);
    });
    const quitar = [...previas.keys()].filter((id) => !ids.has(id));
    if (poner.length || quitar.length) salida[tabla] = { poner, quitar };
  });
  if (!antes || firma(antes.sitio || {}) !== firma(despues.sitio) || antes.temporadaActual !== despues.temporadaActual) {
    salida.ajustes = { sitio: despues.sitio, temporada_actual: despues.temporadaActual };
  }
  return salida;
}

function vacio(c) {
  return Object.keys(c).length === 0;
}

function desdeServidor(r) {
  const salida = { esquema: 3, sitio: r?.sitio || {}, temporadaActual: r?.temporadaActual || "" };
  TABLAS.forEach((tabla) => {
    salida[tabla] = Array.isArray(r?.[tabla]) ? r[tabla] : [];
  });
  return salida;
}

export { TABLAS, cambios, vacio, desdeServidor, firma };
