import { uid } from "./logica.js";
import { reducirImagen, blobADataUrl, dataUrlABlob, usarResolver } from "./imagen.js";
import { cambios, vacio, desdeServidor } from "./sincronizar.js";
import * as github from "./github.js";

const CLAVE_DATOS = "ligue-s:datos";
const CLAVE_COPIA = "ligue-s:copia";
const CLAVE_BASE = "ligue-s:base";
const CLAVE_MODIFICADO = "ligue-s:modificado";
const CLAVE_APARTADO = "ligue-s:apartado";
const CLAVE_LLAVE = "ligue-s:llave-github";
const CLAVE_CUENTA = "ligue-s:cuenta-github";
const ARCHIVO_PUBLICADO = "datos.json";
const CUBO = "ligue-s";
const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm";
const RUTA_IMAGEN = /^img\/[a-z]+\/[\w.-]+\.(webp|jpe?g|png)$/;

const config = window.LIGUE_S || {};
const modo = config.supabaseUrl && config.supabaseClave ? "nube" : config.github?.usuario && config.github?.repositorio ? "repo" : "local";

let cliente = null;
let version = 0;
let base = null;
let shaDatos = null;
const porBorrar = new Set();

if (modo === "repo") github.configurar(config.github);

function leer(clave) {
  try {
    const t = localStorage.getItem(clave);
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

function leerTexto(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribirTexto(clave, valor) {
  try {
    if (valor === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, valor);
  } catch {
    return;
  }
}

function error(codigo, original) {
  const e = new Error(codigo);
  e.codigo = codigo;
  e.original = original;
  return e;
}

async function cargarPublicados() {
  try {
    const respuesta = await fetch(`${ARCHIVO_PUBLICADO}?v=${Date.now()}`, { cache: "no-store" });
    if (!respuesta.ok) return null;
    const datos = await respuesta.json();
    if (!datos || typeof datos !== "object" || !Array.isArray(datos.equipos)) return null;
    return { datos, sello: typeof datos.publicado === "string" ? datos.publicado : "" };
  } catch {
    return null;
  }
}

async function cargarLocal() {
  const locales = leer(CLAVE_DATOS);
  const publicados = await cargarPublicados();
  const base = leerTexto(CLAVE_BASE) || "";
  if (publicados && (!locales || publicados.sello > base)) {
    const apartado = Boolean(locales) && leerTexto(CLAVE_MODIFICADO) === "1";
    if (apartado) escribir(CLAVE_APARTADO, { datos: locales, fecha: new Date().toISOString() });
    escribir(CLAVE_DATOS, publicados.datos);
    escribirTexto(CLAVE_BASE, publicados.sello);
    escribirTexto(CLAVE_MODIFICADO, null);
    return { datos: publicados.datos, sinConexion: false, publicado: true, apartado };
  }
  return { datos: locales, sinConexion: false, publicado: Boolean(publicados), apartado: false };
}

function olvidarLlave() {
  escribirTexto(CLAVE_LLAVE, null);
  escribirTexto(CLAVE_CUENTA, null);
  github.usarLlave("");
  usarResolver((u) => u);
}

function activarResolver() {
  usarResolver((u) => (typeof u === "string" && RUTA_IMAGEN.test(u) ? github.urlCruda(u) : u));
}

async function cargarRepo(conLlave) {
  const llave = conLlave ? leerTexto(CLAVE_LLAVE) : null;
  if (llave) {
    github.usarLlave(llave);
    try {
      const r = await github.leerDatos();
      shaDatos = r.sha;
      activarResolver();
      const locales = leer(CLAVE_DATOS);
      const conCambios = Boolean(locales) && leerTexto(CLAVE_MODIFICADO) === "1";
      if (r.datos) {
        if (conCambios) {
          escribir(CLAVE_APARTADO, { datos: locales, fecha: new Date().toISOString() });
          escribirTexto(CLAVE_MODIFICADO, null);
        }
        return { datos: r.datos, sinConexion: false, editor: true, apartado: conCambios };
      }
      return { datos: locales, sinConexion: false, editor: true, pendiente: Boolean(locales) };
    } catch (e) {
      if ([401, 403, 404].includes(e.estado)) {
        olvidarLlave();
        return { ...(await cargarPublicadosRepo()), llaveCaducada: true };
      }
      throw error("carga", e);
    }
  }
  return cargarPublicadosRepo();
}

async function cargarPublicadosRepo() {
  const publicados = await cargarPublicados();
  return { datos: publicados?.datos || null, sinConexion: false, publicado: Boolean(publicados) };
}

function marcarPublicado(sello) {
  escribirTexto(CLAVE_BASE, sello);
  escribirTexto(CLAVE_MODIFICADO, null);
}

function leerApartado() {
  const a = leer(CLAVE_APARTADO);
  return a && a.datos ? a : null;
}

function borrarApartado() {
  escribirTexto(CLAVE_APARTADO, null);
}

async function conectar() {
  if (cliente) return cliente;
  const { createClient } = await import(SUPABASE_JS);
  cliente = createClient(config.supabaseUrl, config.supabaseClave, { auth: { persistSession: true, autoRefreshToken: true } });
  return cliente;
}

async function cargar(conLlave = true) {
  if (modo === "local") return cargarLocal();
  if (modo === "repo") return cargarRepo(conLlave);
  try {
    const sb = await conectar();
    const { data, error: fallo } = await sb.rpc("leer_ligue");
    if (fallo) throw fallo;
    version = data?.version ?? 0;
    base = desdeServidor(data);
    escribir(CLAVE_COPIA, base);
    return { datos: base, sinConexion: false };
  } catch (fallo) {
    const copia = leer(CLAVE_COPIA);
    if (copia) return { datos: copia, sinConexion: true };
    throw error("carga", fallo);
  }
}

async function sacarImagenes(datos) {
  const archivos = [];
  const pasar = async (valor, carpeta) => {
    if (typeof valor !== "string" || !valor.startsWith("data:image/")) return valor;
    const blob = await dataUrlABlob(valor);
    const extension = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp";
    const ruta = `img/${carpeta}/${uid()}.${extension}`;
    archivos.push({ ruta, bytes: new Uint8Array(await blob.arrayBuffer()) });
    return ruta;
  };
  datos.sitio.logo = await pasar(datos.sitio.logo, "sitio");
  for (const e of datos.equipos) {
    e.logo = await pasar(e.logo, "equipos");
    e.foto = await pasar(e.foto, "equipos");
  }
  for (const j of datos.jugadores) j.foto = await pasar(j.foto, "jugadores");
  return archivos;
}

function imagenesUsadas(datos) {
  return new Set([datos.sitio.logo, ...datos.equipos.flatMap((e) => [e.logo, e.foto]), ...datos.jugadores.map((j) => j.foto)].filter(Boolean));
}

async function guardarRepo(datos, mensaje) {
  const copia = structuredClone(datos);
  const archivos = await sacarImagenes(copia);
  const usadas = imagenesUsadas(copia);
  const borrar = [...porBorrar].filter((r) => !usadas.has(r));
  try {
    shaDatos = await github.guardarDatos({ datos: copia, shaPrevio: shaDatos, archivos, borrar, mensaje: `Ligue S : ${mensaje || "modification"}` });
  } catch (e) {
    if (e.estado === 409 || e.estado === 422) throw error("conflicto", e);
    if (e.estado === 401) throw error("llave", e);
    if (e.estado === 403 || e.estado === 404) throw error("prohibido", e);
    throw error("red", e);
  }
  borrar.forEach((r) => porBorrar.delete(r));
  datos.sitio.logo = copia.sitio.logo;
  datos.equipos.forEach((e, i) => Object.assign(e, { logo: copia.equipos[i].logo, foto: copia.equipos[i].foto }));
  datos.jugadores.forEach((j, i) => { j.foto = copia.jugadores[i].foto; });
  escribirTexto(CLAVE_MODIFICADO, null);
}

async function guardar(datos, mensaje) {
  if (modo === "local") {
    if (!escribir(CLAVE_DATOS, datos)) throw error("memoria");
    escribirTexto(CLAVE_MODIFICADO, "1");
    return;
  }
  if (modo === "repo") return guardarRepo(datos, mensaje);
  const c = cambios(base, datos);
  if (vacio(c)) return;
  const sb = await conectar();
  const { data, error: fallo } = await sb.rpc("guardar_cambios", { p_cambios: c, p_version: version });
  if (fallo) {
    const texto = `${fallo.message || ""} ${fallo.code || ""}`;
    if (texto.includes("conflicto")) throw error("conflicto", fallo);
    if (texto.includes("prohibido") || texto.includes("42501")) throw error("prohibido", fallo);
    throw error("red", fallo);
  }
  version = data;
  base = structuredClone(datos);
  escribir(CLAVE_COPIA, base);
}

async function subirImagen(archivo, carpeta) {
  const blob = archivo instanceof Blob && archivo.type.startsWith("image/") ? await reducirImagen(archivo, modo === "local" ? 480 : 900) : null;
  if (!blob) throw error("imagen");
  if (modo !== "nube") return blobADataUrl(blob);
  const sb = await conectar();
  const ruta = `${carpeta}/${uid()}.${blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg"}`;
  const { error: fallo } = await sb.storage.from(CUBO).upload(ruta, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (fallo) throw error("subida", fallo);
  return sb.storage.from(CUBO).getPublicUrl(ruta).data.publicUrl;
}

async function borrarImagen(url) {
  if (!url) return;
  if (modo === "repo") {
    if (RUTA_IMAGEN.test(url)) porBorrar.add(url);
    return;
  }
  if (modo === "local") return;
  const marca = `/storage/v1/object/public/${CUBO}/`;
  const posicion = url.indexOf(marca);
  if (posicion === -1) return;
  try {
    const sb = await conectar();
    await sb.storage.from(CUBO).remove([decodeURIComponent(url.slice(posicion + marca.length))]);
  } catch {
    return;
  }
}

async function subirIncrustadas(datos) {
  if (modo !== "nube") return datos;
  const pasar = async (valor, carpeta) => (typeof valor === "string" && valor.startsWith("data:image/") ? subirImagen(await dataUrlABlob(valor), carpeta) : valor);
  datos.sitio.logo = await pasar(datos.sitio.logo, "sitio");
  for (const e of datos.equipos) {
    e.logo = await pasar(e.logo, "equipos");
    e.foto = await pasar(e.foto, "equipos");
  }
  for (const j of datos.jugadores) j.foto = await pasar(j.foto, "jugadores");
  return datos;
}

async function usuario() {
  if (modo === "local") return null;
  if (modo === "repo") return leerTexto(CLAVE_LLAVE) ? { email: leerTexto(CLAVE_CUENTA) || "GitHub" } : null;
  const sb = await conectar();
  const { data } = await sb.auth.getSession();
  return data.session?.user ?? null;
}

async function esCreador() {
  if (modo === "local") return true;
  if (modo === "repo") return Boolean(leerTexto(CLAVE_LLAVE));
  const sb = await conectar();
  const { data, error: fallo } = await sb.rpc("es_creador");
  return !fallo && data === true;
}

async function entrarRepo(llave) {
  github.usarLlave(llave);
  let r;
  try {
    r = await github.comprobar();
  } catch (e) {
    github.usarLlave("");
    throw error(e.estado === 0 ? "red" : "acceso", e);
  }
  if (!r.puede) {
    github.usarLlave("");
    throw error("sin-permiso");
  }
  escribirTexto(CLAVE_LLAVE, llave);
  escribirTexto(CLAVE_CUENTA, config.github.usuario);
  return { email: config.github.usuario };
}

async function entrar(correo, clave) {
  if (modo === "repo") return entrarRepo(correo);
  const sb = await conectar();
  const { error: fallo } = await sb.auth.signInWithPassword({ email: correo, password: clave });
  if (fallo) throw error("acceso", fallo);
  if (!(await esCreador())) {
    await sb.auth.signOut();
    throw error("sin-permiso");
  }
  return usuario();
}

async function salir() {
  if (modo === "local") return;
  if (modo === "repo") {
    olvidarLlave();
    return;
  }
  const sb = await conectar();
  await sb.auth.signOut();
}

async function alCambiarSesion(funcion) {
  if (modo !== "nube") return;
  const sb = await conectar();
  sb.auth.onAuthStateChange((evento) => funcion(evento));
}

export { modo, cargar, guardar, marcarPublicado, leerApartado, borrarApartado, subirImagen, borrarImagen, subirIncrustadas, usuario, esCreador, entrar, salir, alCambiarSesion };
