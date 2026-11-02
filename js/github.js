const API = "https://api.github.com";
const ARCHIVO = "datos.json";

let ajustes = { usuario: "", repositorio: "", rama: "main" };
let llave = "";

function configurar(c) {
  ajustes = { rama: "main", ...c };
}

function usarLlave(valor) {
  llave = valor || "";
}

function fallo(estado, cuerpo) {
  const e = new Error(`github ${estado}`);
  e.estado = estado;
  e.cuerpo = cuerpo;
  return e;
}

async function pedir(ruta, { metodo = "GET", cuerpo } = {}) {
  const cabeceras = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (llave) cabeceras.Authorization = `Bearer ${llave}`;
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";
  let respuesta;
  try {
    respuesta = await fetch(`${API}/repos/${ajustes.usuario}/${ajustes.repositorio}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      cache: "no-store"
    });
  } catch {
    throw fallo(0, "red");
  }
  if (!respuesta.ok) throw fallo(respuesta.status, await respuesta.text().catch(() => ""));
  return respuesta.status === 204 ? null : respuesta.json();
}

function aBase64(bytes) {
  let texto = "";
  for (let i = 0; i < bytes.length; i += 0x8000) texto += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(texto);
}

function deBase64(valor) {
  const texto = atob(valor.replace(/\s/g, ""));
  const bytes = new Uint8Array(texto.length);
  for (let i = 0; i < texto.length; i += 1) bytes[i] = texto.charCodeAt(i);
  return bytes;
}

async function comprobar() {
  const repo = await pedir("");
  return { puede: Boolean(repo.permissions?.push), privado: Boolean(repo.private) };
}

async function estadoActual() {
  const ref = await pedir(`/git/ref/heads/${ajustes.rama}`);
  const commit = await pedir(`/git/commits/${ref.object.sha}`);
  const arbol = await pedir(`/git/trees/${commit.tree.sha}?recursive=1`);
  const rutas = new Map(arbol.tree.filter((e) => e.type === "blob").map((e) => [e.path, e.sha]));
  return { commit: ref.object.sha, arbol: commit.tree.sha, rutas };
}

async function leerDatos() {
  const estado = await estadoActual();
  const sha = estado.rutas.get(ARCHIVO) || null;
  if (!sha) return { datos: null, sha: null };
  const blob = await pedir(`/git/blobs/${sha}`);
  return { datos: JSON.parse(new TextDecoder().decode(deBase64(blob.content))), sha };
}

async function crearBlob(bytes) {
  const blob = await pedir("/git/blobs", { metodo: "POST", cuerpo: { content: aBase64(bytes), encoding: "base64" } });
  return blob.sha;
}

async function guardarDatos({ datos, shaPrevio, archivos = [], borrar = [], mensaje }) {
  for (let intento = 0; intento < 2; intento += 1) {
    const estado = await estadoActual();
    if ((estado.rutas.get(ARCHIVO) || null) !== shaPrevio) throw fallo(409, "conflicto");
    const entradas = [];
    for (const a of archivos) entradas.push({ path: a.ruta, mode: "100644", type: "blob", sha: await crearBlob(a.bytes) });
    const shaDatos = await crearBlob(new TextEncoder().encode(`${JSON.stringify(datos, null, 2)}\n`));
    entradas.push({ path: ARCHIVO, mode: "100644", type: "blob", sha: shaDatos });
    borrar.filter((r) => estado.rutas.has(r)).forEach((r) => entradas.push({ path: r, mode: "100644", type: "blob", sha: null }));
    const arbol = await pedir("/git/trees", { metodo: "POST", cuerpo: { base_tree: estado.arbol, tree: entradas } });
    const commit = await pedir("/git/commits", { metodo: "POST", cuerpo: { message: mensaje, tree: arbol.sha, parents: [estado.commit] } });
    try {
      await pedir(`/git/refs/heads/${ajustes.rama}`, { metodo: "PATCH", cuerpo: { sha: commit.sha, force: false } });
      return shaDatos;
    } catch (e) {
      if (e.estado !== 422 || intento === 1) throw e;
    }
  }
  throw fallo(409, "conflicto");
}

function urlCruda(ruta) {
  return `https://raw.githubusercontent.com/${ajustes.usuario}/${ajustes.repositorio}/${ajustes.rama}/${ruta}`;
}

export { configurar, usarLlave, comprobar, leerDatos, guardarDatos, urlCruda };
