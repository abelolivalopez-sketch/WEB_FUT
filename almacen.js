import { uid } from "./logica.js";
import { reducirImagen, blobADataUrl, dataUrlABlob } from "./imagen.js";
import { cambios, vacio, desdeServidor } from "./sincronizar.js";

const CLAVE_DATOS = "ligue-s:datos";
const CLAVE_COPIA = "ligue-s:copia";
const CUBO = "ligue-s";
const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm";

const config = window.LIGUE_S || {};
const modo = config.supabaseUrl && config.supabaseClave ? "nube" : "local";

let cliente = null;
let version = 0;
let base = null;

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

async function conectar() {
  if (cliente) return cliente;
  const { createClient } = await import(SUPABASE_JS);
  cliente = createClient(config.supabaseUrl, config.supabaseClave, { auth: { persistSession: true, autoRefreshToken: true } });
  return cliente;
}

function error(codigo, original) {
  const e = new Error(codigo);
  e.codigo = codigo;
  e.original = original;
  return e;
}

async function cargar() {
  if (modo === "local") return { datos: leer(CLAVE_DATOS), sinConexion: false };
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

async function guardar(datos) {
  if (modo === "local") {
    if (!escribir(CLAVE_DATOS, datos)) throw error("memoria");
    return;
  }
  const c = cambios(base, datos);
  if (vacio(c)) return;
  const sb = await conectar();
  const { data, error: fallo } = await sb.rpc("guardar_cambios", { p_cambios: c, p_version: version });
  if (fallo) {
    const mensaje = `${fallo.message || ""} ${fallo.code || ""}`;
    if (mensaje.includes("conflicto")) throw error("conflicto", fallo);
    if (mensaje.includes("prohibido") || mensaje.includes("42501")) throw error("prohibido", fallo);
    throw error("red", fallo);
  }
  version = data;
  base = structuredClone(datos);
  escribir(CLAVE_COPIA, base);
}

async function subirImagen(archivo, carpeta) {
  const blob = archivo instanceof Blob && archivo.type.startsWith("image/") ? await reducirImagen(archivo, modo === "local" ? 480 : 900) : null;
  if (!blob) throw error("imagen");
  if (modo === "local") return blobADataUrl(blob);
  const sb = await conectar();
  const ruta = `${carpeta}/${uid()}.${blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg"}`;
  const { error: fallo } = await sb.storage.from(CUBO).upload(ruta, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (fallo) throw error("subida", fallo);
  return sb.storage.from(CUBO).getPublicUrl(ruta).data.publicUrl;
}

async function borrarImagen(url) {
  if (modo === "local" || !url) return;
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
  if (modo === "local") return datos;
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
  const sb = await conectar();
  const { data } = await sb.auth.getSession();
  return data.session?.user ?? null;
}

async function esCreador() {
  if (modo === "local") return true;
  const sb = await conectar();
  const { data, error: fallo } = await sb.rpc("es_creador");
  return !fallo && data === true;
}

async function entrar(correo, clave) {
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
  const sb = await conectar();
  await sb.auth.signOut();
}

async function alCambiarSesion(funcion) {
  if (modo === "local") return;
  const sb = await conectar();
  sb.auth.onAuthStateChange((evento) => funcion(evento));
}

export { modo, cargar, guardar, subirImagen, borrarImagen, subirIncrustadas, usuario, esCreador, entrar, salir, alCambiarSesion };
