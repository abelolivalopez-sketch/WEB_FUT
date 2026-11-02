function cargarImagen(archivo) {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolver(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("imagen"));
    };
    img.src = url;
  });
}

function aBlob(lienzo, tipo, calidad) {
  return new Promise((resolver) => lienzo.toBlob(resolver, tipo, calidad));
}

function dibujar(img, ancho, alto, fondo) {
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (fondo) {
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, ancho, alto);
  }
  ctx.drawImage(img, 0, 0, ancho, alto);
  return lienzo;
}

async function reducirImagen(archivo, lado) {
  const img = await cargarImagen(archivo);
  const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
  const ancho = Math.max(1, Math.round(img.naturalWidth * escala));
  const alto = Math.max(1, Math.round(img.naturalHeight * escala));
  const webp = await aBlob(dibujar(img, ancho, alto), "image/webp", 0.82);
  if (webp && webp.type === "image/webp") return webp;
  if (webp && webp.type === "image/png" && webp.size < 1800000) return webp;
  return aBlob(dibujar(img, ancho, alto, "#FFFFFF"), "image/jpeg", 0.85);
}

function blobADataUrl(blob) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(new Error("imagen"));
    lector.readAsDataURL(blob);
  });
}

async function dataUrlABlob(url) {
  const respuesta = await fetch(url);
  return respuesta.blob();
}

let resolver = (url) => url;

function usarResolver(funcion) {
  resolver = funcion;
}

function fuenteImagen(url) {
  return resolver(url);
}

export { reducirImagen, blobADataUrl, dataUrlABlob, usarResolver, fuenteImagen };
