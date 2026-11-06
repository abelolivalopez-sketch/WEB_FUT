import { fuenteImagen } from "./imagen.js";
import { PUESTOS, COLORES, esc, uid, entero, enlaceSeguro, idYoutube, siglaAuto, porFecha, porNombre, diaLargo, iniciales, hoyISO, leerNota, nota, media, plural, equiposDe, plantillaDe, rankingJugadores, mejoresJugadores, mejoresGoleadores, clasificacion, siguienteNombreTemporada } from "./logica.js";

const dialogo = document.getElementById("dialogo");

const CERRAR = '<button type="button" class="btn-icono" data-cerrar aria-label="Fermer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';

const ERRORES_NOTA = {
  formato: "n'est pas un nombre",
  rango: "doit être entre 0 et 10",
  cuarto: "doit aller de 0,25 en 0,25 (par exemple 7, 7,25, 7,5 ou 7,75)"
};

const SUGERENCIAS_PREMIOS = ["Champion", "Ballon d'or Ligue S", "Meilleur joueur", "Meilleur buteur", "Meilleur gardien", "Meilleur jeune", "Fair-play", "Meilleur pronostiqueur"];

function campoHtml(c, valor) {
  const id = `campo-${c.nombre}`;
  const requerido = c.requerido ? " required" : "";
  const ayuda = c.ayuda ? `<small class="campo-ayuda" id="${id}-ayuda">${esc(c.ayuda)}</small>` : "";
  const describe = c.ayuda ? ` aria-describedby="${id}-ayuda"` : "";
  const etiqueta = `<span class="campo-etiqueta">${esc(c.etiqueta)}${c.requerido ? "" : ' <span class="opcional">facultatif</span>'}</span>`;
  const raiz = `data-campo="${c.nombre}"`;
  if (c.tipo === "textarea") {
    return `<label class="campo" for="${id}" ${raiz}>${etiqueta}<textarea id="${id}" name="${c.nombre}" rows="${c.filas || 5}"${requerido}${describe}>${esc(valor)}</textarea>${ayuda}</label>`;
  }
  if (c.tipo === "select") {
    const opciones = c.opciones.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(valor ?? "") ? " selected" : ""}>${esc(t)}</option>`).join("");
    return `<label class="campo" for="${id}" ${raiz}>${etiqueta}<select id="${id}" name="${c.nombre}"${requerido}${describe}>${opciones}</select>${ayuda}</label>`;
  }
  if (c.tipo === "casilla") {
    return `<label class="campo campo-casilla" for="${id}" ${raiz}><input id="${id}" type="checkbox" name="${c.nombre}"${valor ? " checked" : ""}${describe}><span class="campo-etiqueta">${esc(c.etiqueta)}</span>${ayuda}</label>`;
  }
  if (c.tipo === "imagen") {
    const vista = valor ? `<img src="${esc(fuenteImagen(valor))}" alt="">` : `<span>${esc(c.vacio || "")}</span>`;
    return `<div class="campo campo-imagen" ${raiz}>
      <span class="campo-etiqueta">${esc(c.etiqueta)} <span class="opcional">facultatif</span></span>
      <div class="imagen-fila">
        <span class="imagen-vista${c.forma ? ` imagen-${c.forma}` : ""}" data-vista="${c.nombre}">${vista}</span>
        <div class="imagen-controles">
          <label class="btn btn-secundario" for="${id}">${valor ? "Changer l'image" : "Choisir une image"}<input id="${id}" class="sr" type="file" name="${c.nombre}" accept="image/*"></label>
          ${valor ? `<label class="campo-casilla" for="${id}-quitar"><input id="${id}-quitar" type="checkbox" name="${c.nombre}-quitar"><span>Retirer l'image</span></label>` : ""}
        </div>
      </div>
      ${ayuda}
    </div>`;
  }
  const tipos = { texto: "text", numero: "number", fecha: "date", hora: "time", color: "color", url: "url", correo: "email" };
  const lista = c.sugerencias ? ` list="${id}-lista"` : "";
  const datalist = c.sugerencias ? `<datalist id="${id}-lista">${c.sugerencias.map((s) => `<option value="${esc(s)}"></option>`).join("")}</datalist>` : "";
  const extra = [c.min !== undefined ? ` min="${c.min}"` : "", c.max !== undefined ? ` max="${c.max}"` : "", c.maxlength ? ` maxlength="${c.maxlength}"` : "", c.placeholder ? ` placeholder="${esc(c.placeholder)}"` : "", c.autocompletar ? ` autocomplete="${c.autocompletar}"` : ' autocomplete="off"'].join("");
  return `<label class="campo" for="${id}" ${raiz}>${etiqueta}<input id="${id}" type="${tipos[c.tipo] || "text"}" name="${c.nombre}" value="${esc(valor ?? "")}"${requerido}${extra}${lista}${describe}>${datalist}${ayuda}</label>`;
}

function camposHtml(campos, valores) {
  return campos.map((c) => (Array.isArray(c) ? `<div class="campos-fila">${c.map((x) => campoHtml(x, valores[x.nombre])).join("")}</div>` : campoHtml(c, valores[c.nombre]))).join("");
}

function leerCampos(formulario, campos) {
  const datos = new FormData(formulario);
  const valores = {};
  campos.flat().forEach((c) => {
    const valor = datos.get(c.nombre);
    if (c.tipo === "casilla") valores[c.nombre] = valor === "on";
    else if (c.tipo === "imagen") valores[c.nombre] = { archivo: valor instanceof File && valor.size ? valor : null, quitar: datos.get(`${c.nombre}-quitar`) === "on" };
    else valores[c.nombre] = typeof valor === "string" ? valor.trim() : "";
  });
  return { valores, datos };
}

function cerrar() {
  if (dialogo.open) dialogo.close();
}

function abrir(html) {
  dialogo.innerHTML = html;
  if (!dialogo.open) dialogo.showModal();
  dialogo.scrollTop = 0;
}

function mostrarCampos(formulario, nombres, visible) {
  nombres.forEach((n) => {
    const campo = formulario.querySelector(`[data-campo="${n}"]`);
    if (!campo) return;
    campo.hidden = !visible;
    campo.querySelectorAll("input, select, textarea").forEach((c) => {
      if (c.dataset.requerido === undefined) c.dataset.requerido = c.required ? "1" : "0";
      c.required = visible && c.dataset.requerido === "1";
    });
  });
}

function abrirFormulario({ titulo, intro = "", campos, valores = {}, boton = "Enregistrer", extra = "", acciones = "", ancho = false, alMontar, alEnviar }) {
  abrir(`<form class="formulario${ancho ? " formulario-ancho" : ""}" method="dialog" novalidate>
    <header class="dialogo-cabeza"><h2>${esc(titulo)}</h2>${CERRAR}</header>
    ${intro ? `<p class="dialogo-intro">${intro}</p>` : ""}
    <div class="dialogo-cuerpo">${camposHtml(campos, valores)}${extra}</div>
    <p class="form-error" role="alert" hidden></p>
    <footer class="dialogo-pie">${acciones}<span class="hueco"></span><button type="button" class="btn btn-secundario" data-cerrar>Annuler</button><button type="submit" class="btn btn-principal">${esc(boton)}</button></footer>
  </form>`);
  dialogo.classList.toggle("dialogo-ancho", ancho);
  const formulario = dialogo.querySelector("form");
  const error = formulario.querySelector(".form-error");
  const enviar = formulario.querySelector('button[type="submit"]');
  formulario.querySelectorAll('input[type="file"]').forEach((entrada) => entrada.addEventListener("change", () => {
    const vista = formulario.querySelector(`[data-vista="${entrada.name}"]`);
    const archivo = entrada.files[0];
    if (vista && archivo) vista.innerHTML = `<img src="${URL.createObjectURL(archivo)}" alt="">`;
  }));
  if (alMontar) alMontar(formulario);
  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    error.hidden = true;
    const faltante = [...formulario.querySelectorAll("[required]")].find((c) => !c.closest("[hidden]") && !c.value.trim());
    if (faltante) {
      error.textContent = `Remplis le champ « ${faltante.closest(".campo")?.querySelector(".campo-etiqueta")?.firstChild?.textContent?.trim() || "obligatoire"} ».`;
      error.hidden = false;
      faltante.focus();
      return;
    }
    enviar.disabled = true;
    enviar.textContent = "Enregistrement…";
    try {
      const { valores: v, datos } = leerCampos(formulario, campos);
      const resultado = await alEnviar(v, datos, formulario);
      if (typeof resultado === "string") {
        error.textContent = resultado;
        error.hidden = false;
        return;
      }
      if (resultado !== false && resultado !== "abierto") cerrar();
    } catch {
      error.textContent = "L'enregistrement n'a pas abouti. Vérifie l'image ou ta connexion, puis réessaie.";
      error.hidden = false;
    } finally {
      enviar.disabled = false;
      enviar.textContent = boton;
    }
  });
  formulario.querySelector(".dialogo-cuerpo :is(input:not([type=file]):not([type=checkbox]), textarea, select)")?.focus();
}

function confirmar({ titulo, mensaje, boton = "Supprimer" }) {
  return new Promise((resolver) => {
    dialogo.classList.remove("dialogo-ancho");
    abrir(`<div class="formulario confirmar">
      <header class="dialogo-cabeza"><h2>${esc(titulo)}</h2></header>
      <p class="dialogo-intro">${esc(mensaje)}</p>
      <footer class="dialogo-pie"><span class="hueco"></span><button type="button" class="btn btn-secundario" data-respuesta="no">Annuler</button><button type="button" class="btn btn-peligro" data-respuesta="si">${esc(boton)}</button></footer>
    </div>`);
    const responder = (valor) => {
      dialogo.removeEventListener("click", alPulsar);
      dialogo.removeEventListener("close", alCerrar);
      cerrar();
      resolver(valor);
    };
    const alPulsar = (e) => {
      const b = e.target.closest("[data-respuesta]");
      if (b) responder(b.dataset.respuesta === "si");
    };
    const alCerrar = () => responder(false);
    dialogo.addEventListener("click", alPulsar);
    dialogo.addEventListener("close", alCerrar);
    dialogo.querySelector('[data-respuesta="no"]').focus();
  });
}

async function imagenFinal(api, campo, anterior, carpeta) {
  if (campo.archivo) return { url: await api.subirImagen(campo.archivo, carpeta), sobra: anterior || "" };
  if (campo.quitar) return { url: "", sobra: anterior || "" };
  return { url: anterior || "", sobra: "" };
}

async function guardarConImagenes(api, imagenes, mutar, mensaje) {
  const hecho = await api.aplicar(mutar, mensaje);
  if (hecho) imagenes.filter((i) => i.sobra).forEach((i) => api.borrarImagen(i.sobra));
  return hecho;
}

function opcionesEquipos(d, t) {
  return equiposDe(d, t).sort(porNombre).map((e) => [e.id, e.nombre]);
}

function nombreTemporada(d, t) {
  return d.temporadas.find((x) => x.id === t)?.nombre || "la saison";
}

function editarPresentacion(api) {
  const { sitio } = api.datos();
  abrirFormulario({
    titulo: "Texte de présentation",
    campos: [
      { nombre: "titulo", etiqueta: "Titre", tipo: "texto", requerido: true, maxlength: 140 },
      { nombre: "texto", etiqueta: "Texte", tipo: "textarea", requerido: true, filas: 9, ayuda: "Laisse une ligne vide entre deux paragraphes." }
    ],
    valores: sitio.presentacion,
    alEnviar: (v) => api.aplicar((d) => {
      d.sitio.presentacion = { titulo: v.titulo, texto: v.texto };
    }, "Texte enregistré")
  });
}

function editarReglas(api) {
  const { sitio } = api.datos();
  abrirFormulario({
    titulo: "Les règles",
    campos: [{ nombre: "reglas", etiqueta: "Règles", tipo: "textarea", requerido: true, filas: 10, ayuda: "Une règle par ligne. Les points du classement se règlent dans « Paramètres »." }],
    valores: { reglas: sitio.reglas.join("\n") },
    alEnviar: (v) => api.aplicar((d) => {
      d.sitio.reglas = v.reglas.split("\n").map((r) => r.trim()).filter(Boolean);
    }, "Règles enregistrées")
  });
}

function editarAjustes(api) {
  const { sitio } = api.datos();
  abrirFormulario({
    titulo: "Paramètres du site",
    campos: [
      { nombre: "nombre", etiqueta: "Nom de la ligue", tipo: "texto", requerido: true, maxlength: 60 },
      { nombre: "lema", etiqueta: "Phrase sous le nom", tipo: "texto", maxlength: 140 },
      { nombre: "logo", etiqueta: "Logo de la ligue", tipo: "imagen", vacio: "S", ayuda: "Sans image, le site utilise le logo officiel de la Ligue S. Une image carrée, de préférence blanche sur fond transparent." },
      { nombre: "youtube", etiqueta: "Chaîne YouTube", tipo: "url", placeholder: "https://www.youtube.com/@…" },
      { nombre: "instagram", etiqueta: "Compte Instagram", tipo: "url", placeholder: "https://www.instagram.com/…" },
      [
        { nombre: "victoria", etiqueta: "Points victoire", tipo: "numero", requerido: true, min: 0, max: 10 },
        { nombre: "empate", etiqueta: "Points nul", tipo: "numero", requerido: true, min: 0, max: 10 },
        { nombre: "derrota", etiqueta: "Points défaite", tipo: "numero", requerido: true, min: 0, max: 10 }
      ],
      { nombre: "minimoNotas", etiqueta: "Matchs notés minimum", tipo: "numero", requerido: true, min: 1, max: 50, ayuda: "Pour entrer dans le classement des meilleurs joueurs, un joueur doit avoir au moins ce nombre de matchs notés dans la saison." },
      { nombre: "creditosAcierto", etiqueta: "Crédits par bon pronostic", tipo: "numero", requerido: true, min: 1, max: 100, ayuda: "Ce que gagne un visiteur quand il trouve le vainqueur d'un match. Le classement des pronostiqueurs se recalcule avec la nouvelle valeur." },
      { nombre: "responsable", etiqueta: "Organisateur de la ligue", tipo: "texto", maxlength: 120, ayuda: "Affiché en bas du site et dans la politique de confidentialité." },
      { nombre: "correo", etiqueta: "E-mail de contact", tipo: "correo", maxlength: 200, ayuda: "Pour les demandes de retrait de photo ou de vidéo." }
    ],
    valores: { ...sitio, ...sitio.puntos },
    alEnviar: async (v) => {
      for (const clave of ["youtube", "instagram"]) if (v[clave] && !enlaceSeguro(v[clave])) return `Le lien ${clave === "youtube" ? "YouTube" : "Instagram"} doit commencer par https://`;
      if (v.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo)) return "L'adresse e-mail n'est pas valide.";
      const logo = await imagenFinal(api, v.logo, sitio.logo, "sitio");
      return guardarConImagenes(api, [logo], (d) => {
        Object.assign(d.sitio, {
          nombre: v.nombre,
          lema: v.lema,
          logo: logo.url,
          youtube: enlaceSeguro(v.youtube),
          instagram: enlaceSeguro(v.instagram),
          responsable: v.responsable,
          correo: v.correo,
          minimoNotas: entero(v.minimoNotas, 1, 50) ?? 3,
          creditosAcierto: entero(v.creditosAcierto, 1, 100) ?? 5,
          puntos: { victoria: entero(v.victoria, 0, 10) ?? 3, empate: entero(v.empate, 0, 10) ?? 1, derrota: entero(v.derrota, 0, 10) ?? 0 }
        });
      }, "Paramètres enregistrés");
    }
  });
}

function editarEquipo(api, id) {
  const d = api.datos();
  const t = api.temporada();
  const actual = d.equipos.find((e) => e.id === id);
  const inscritos = new Set(equiposDe(d, t).map((e) => e.id));
  const antiguos = actual ? [] : d.equipos.filter((e) => !inscritos.has(e.id)).sort(porNombre);
  const color = actual?.color || COLORES[inscritos.size % COLORES.length];
  const propios = ["nombre", "sigla", "color", "logo", "foto"];
  abrirFormulario({
    titulo: actual ? "Modifier l'équipe" : `Inscrire une équipe à la ${nombreTemporada(d, t)}`,
    campos: [
      ...(antiguos.length ? [{ nombre: "reprendre", etiqueta: "Équipe", tipo: "select", requerido: true, opciones: [["", "Nouvelle équipe"], ...antiguos.map((e) => [e.id, `${e.nombre} (déjà venue)`])], ayuda: "Une équipe qui revient garde son nom, son logo et son historique." }] : []),
      { nombre: "nombre", etiqueta: "Nom de l'équipe", tipo: "texto", requerido: true, maxlength: 60 },
      [
        { nombre: "sigla", etiqueta: "Abréviation", tipo: "texto", maxlength: 4, ayuda: "3 lettres, comme à la télé." },
        { nombre: "color", etiqueta: "Couleur", tipo: "color" }
      ],
      { nombre: "logo", etiqueta: "Logo", tipo: "imagen", vacio: actual ? actual.sigla || siglaAuto(actual.nombre) : "" },
      { nombre: "foto", etiqueta: "Photo de l'équipe", tipo: "imagen", forma: "ancha", ayuda: "Une photo de groupe, affichée en haut de la page de l'équipe." }
    ],
    valores: { reprendre: "", nombre: actual?.nombre || "", sigla: actual?.sigla || "", color, logo: actual?.logo || "", foto: actual?.foto || "" },
    boton: actual ? "Enregistrer" : "Inscrire l'équipe",
    alMontar: (f) => {
      const nombre = f.elements.nombre;
      const siglaCampo = f.elements.sigla;
      const sugerir = () => {
        siglaCampo.placeholder = nombre.value.trim() ? siglaAuto(nombre.value) : "ABC";
      };
      nombre.addEventListener("input", sugerir);
      sugerir();
      const reprendre = f.elements.reprendre;
      if (reprendre) {
        const alternar = () => mostrarCampos(f, propios, !reprendre.value);
        reprendre.required = false;
        reprendre.addEventListener("change", alternar);
        alternar();
      }
    },
    alEnviar: async (v) => {
      if (v.reprendre) {
        return api.aplicar((dd) => {
          dd.inscripciones.push({ id: uid(), temporada: t, equipo: v.reprendre });
        }, "Équipe inscrite");
      }
      const repetido = d.equipos.find((e) => e.id !== id && e.nombre.toLowerCase() === v.nombre.toLowerCase());
      if (repetido) return inscritos.has(repetido.id) ? "Une équipe porte déjà ce nom dans cette saison." : "Cette équipe existe déjà : choisis-la dans la liste « Équipe » pour la réinscrire.";
      const logo = await imagenFinal(api, v.logo, actual?.logo, "equipos");
      const foto = await imagenFinal(api, v.foto, actual?.foto, "equipos");
      const datos = { nombre: v.nombre, sigla: v.sigla.toUpperCase().replace(/[^A-Z0-9]/g, ""), color: v.color, logo: logo.url, foto: foto.url };
      return guardarConImagenes(api, [logo, foto], (dd) => {
        const e = dd.equipos.find((x) => x.id === id);
        if (e) {
          Object.assign(e, datos);
          return;
        }
        const nuevo = uid();
        dd.equipos.push({ id: nuevo, ...datos });
        dd.inscripciones.push({ id: uid(), temporada: t, equipo: nuevo });
      }, actual ? "Équipe enregistrée" : "Équipe inscrite");
    }
  });
}

function editarJugador(api, { id, equipo }) {
  const d = api.datos();
  const t = api.temporada();
  const actual = d.jugadores.find((j) => j.id === id);
  const plantilla = actual ? d.plantillas.find((p) => p.temporada === t && p.jugador === id) : null;
  const ocupados = new Set(d.plantillas.filter((p) => p.temporada === t).map((p) => p.jugador));
  const antiguos = actual ? [] : d.jugadores.filter((j) => !ocupados.has(j.id)).sort(porNombre);
  const propios = ["nombre", "puesto", "foto", "descripcion"];
  const opciones = opcionesEquipos(d, t);
  if (!opciones.length) {
    api.avisar("Inscris d'abord une équipe dans cette saison.", "error");
    return;
  }
  abrirFormulario({
    titulo: actual ? `Modifier ${actual.nombre}` : "Nouveau joueur",
    campos: [
      ...(antiguos.length ? [{ nombre: "reprendre", etiqueta: "Joueur", tipo: "select", requerido: true, opciones: [["", "Nouveau joueur"], ...antiguos.map((j) => [j.id, `${j.nombre} (saisons passées)`])], ayuda: "Un joueur qui revient garde sa fiche, ses notes et son historique." }] : []),
      { nombre: "nombre", etiqueta: "Nom ou surnom", tipo: "texto", requerido: true, maxlength: 60, ayuda: "Comme il doit apparaître sur le site, par exemple « Karim S. »." },
      [
        { nombre: "numero", etiqueta: "Numéro", tipo: "numero", min: 0, max: 99 },
        { nombre: "puesto", etiqueta: "Poste", tipo: "select", opciones: [["", "Non précisé"], ...PUESTOS.map((p) => [p, p])] }
      ],
      { nombre: "equipo", etiqueta: "Équipe", tipo: "select", requerido: true, opciones },
      { nombre: "foto", etiqueta: "Photo", tipo: "imagen", forma: "retrato", vacio: actual ? iniciales(actual.nombre) : "", ayuda: "Seulement avec l'accord du joueur. Un portrait vertical rend le mieux ; une photo détourée (fond transparent, PNG) donne l'effet du podium." },
      { nombre: "descripcion", etiqueta: "Description", tipo: "textarea", filas: 3, ayuda: "Quelques mots sur le joueur (600 caractères au plus). Elle s'affiche sur sa fiche et quand on passe sur sa photo dans le terrain d'un match." },
      { nombre: "capitan", etiqueta: "Capitaine de l'équipe", tipo: "casilla" }
    ],
    valores: { reprendre: "", nombre: actual?.nombre || "", numero: plantilla?.numero ?? "", puesto: actual?.puesto || "", equipo: plantilla?.equipo || equipo || opciones[0][0], foto: actual?.foto || "", descripcion: actual?.descripcion || "", capitan: plantilla?.capitan || false },
    boton: actual ? "Enregistrer" : "Ajouter le joueur",
    alMontar: (f) => {
      const reprendre = f.elements.reprendre;
      if (!reprendre) return;
      const alternar = () => mostrarCampos(f, propios, !reprendre.value);
      reprendre.required = false;
      reprendre.addEventListener("change", alternar);
      alternar();
    },
    alEnviar: async (v) => {
      const jugadorId = v.reprendre || id;
      const numero = v.numero === "" ? null : entero(v.numero, 0, 99);
      if (numero !== null && d.plantillas.some((p) => p.temporada === t && p.jugador !== jugadorId && p.equipo === v.equipo && p.numero === numero)) return `Le numéro ${numero} est déjà pris dans cette équipe.`;
      if (!v.reprendre && d.jugadores.some((j) => j.id !== id && j.nombre.toLowerCase() === v.nombre.toLowerCase() && !ocupados.has(j.id))) return "Un joueur des saisons passées porte déjà ce nom : choisis-le dans la liste « Joueur » pour garder son historique.";
      if (v.descripcion.length > 600) return `La description fait ${v.descripcion.length} caractères : 600 au plus.`;
      const foto = v.reprendre ? { url: "", sobra: "" } : await imagenFinal(api, v.foto, actual?.foto, "jugadores");
      return guardarConImagenes(api, [foto], (dd) => {
        let jid = jugadorId;
        if (!v.reprendre) {
          const j = dd.jugadores.find((x) => x.id === id);
          const datos = { nombre: v.nombre, puesto: v.puesto, foto: foto.url, descripcion: v.descripcion };
          if (j) Object.assign(j, datos);
          else {
            jid = uid();
            dd.jugadores.push({ id: jid, ...datos });
          }
        }
        if (v.capitan) dd.plantillas.forEach((p) => { if (p.temporada === t && p.equipo === v.equipo && p.jugador !== jid) p.capitan = false; });
        const p = dd.plantillas.find((x) => x.temporada === t && x.jugador === jid);
        const datosPlantilla = { equipo: v.equipo, numero, capitan: v.capitan };
        if (p) Object.assign(p, datosPlantilla);
        else dd.plantillas.push({ id: uid(), temporada: t, jugador: jid, ...datosPlantilla });
      }, actual ? "Joueur enregistré" : "Joueur ajouté");
    }
  });
}

function editarPartido(api, id) {
  const d = api.datos();
  const actual = d.partidos.find((m) => m.id === id);
  const t = actual?.temporada || api.temporada();
  const opciones = opcionesEquipos(d, t);
  if (opciones.length < 2) {
    api.avisar("Inscris d'abord au moins deux équipes dans cette saison.", "error");
    return;
  }
  const ultimo = d.partidos.filter((m) => m.temporada === t).sort(porFecha).pop();
  abrirFormulario({
    titulo: actual ? "Modifier le match" : "Nouveau match",
    campos: [
      [
        { nombre: "local", etiqueta: "Équipe 1", tipo: "select", requerido: true, opciones },
        { nombre: "visitante", etiqueta: "Équipe 2", tipo: "select", requerido: true, opciones }
      ],
      [
        { nombre: "fecha", etiqueta: "Date", tipo: "fecha", requerido: true },
        { nombre: "hora", etiqueta: "Heure", tipo: "hora" }
      ],
      [
        { nombre: "jornada", etiqueta: "Journée", tipo: "texto", maxlength: 40, placeholder: "Journée 1" },
        { nombre: "lugar", etiqueta: "Lieu", tipo: "texto", maxlength: 80, placeholder: "Terrain 1" }
      ],
      { nombre: "cota", etiqueta: "Pronostics : cote de l'équipe 1, en %", tipo: "numero", min: 1, max: 99, placeholder: "50", ayuda: "Les chances de victoire de l'équipe 1 selon toi, de 1 à 99 ; l'équipe 2 a le reste. Laisse vide pour garder les pronostics fermés. Ils se ferment seuls au coup d'envoi." }
    ],
    intro: actual ? "Changer une équipe efface les notes et les pronostics déjà faits pour ce match." : "",
    valores: actual ? { ...actual, cota: actual.cota ?? "" } : { local: opciones[0][0], visitante: opciones[1][0], fecha: ultimo?.fecha && ultimo.fecha >= hoyISO() ? ultimo.fecha : "", hora: "", jornada: ultimo?.jornada || "", lugar: ultimo?.lugar || "", cota: "" },
    boton: actual ? "Enregistrer" : "Ajouter le match",
    alMontar: (f) => {
      const ayuda = f.querySelector("#campo-cota-ayuda");
      const base = ayuda.textContent;
      const actualizar = () => {
        const n = entero(f.elements.cota.value, 1, 99);
        const uno = f.elements.local.selectedOptions[0]?.textContent || "Équipe 1";
        const dos = f.elements.visitante.selectedOptions[0]?.textContent || "Équipe 2";
        ayuda.textContent = f.elements.cota.value.trim() && n !== null ? `${uno} ${n} %, ${dos} ${100 - n} %. ${base}` : base;
      };
      ["cota", "local", "visitante"].forEach((c) => f.elements[c].addEventListener("input", actualizar));
      actualizar();
    },
    alEnviar: (v) => {
      if (v.local === v.visitante) return "Choisis deux équipes différentes.";
      const cota = v.cota === "" ? null : entero(v.cota, 1, 99);
      if (v.cota !== "" && (cota === null || String(cota) !== String(Number(v.cota)))) return "La cote doit être un nombre entier entre 1 et 99.";
      const datos = { local: v.local, visitante: v.visitante, fecha: v.fecha, hora: v.hora, jornada: v.jornada, lugar: v.lugar, cota };
      return api.aplicar((dd) => {
        const m = dd.partidos.find((x) => x.id === id);
        if (m) {
          const cambianEquipos = m.local !== datos.local || m.visitante !== datos.visitante;
          Object.assign(m, datos);
          if (cambianEquipos) {
            dd.actuaciones = dd.actuaciones.filter((a) => a.partido !== id);
            m.valoraciones = null;
          }
        } else dd.partidos.push({ id: uid(), temporada: t, ...datos, goles: null, valoraciones: null });
      }, actual ? "Match enregistré" : "Match ajouté");
    }
  });
}

function filasHoja(d, m, lado) {
  const equipoId = lado === 0 ? m.local : m.visitante;
  const equipo = d.equipos.find((e) => e.id === equipoId);
  const previas = new Map(d.actuaciones.filter((a) => a.partido === m.id && a.equipo === equipoId).map((a) => [a.jugador, a]));
  const plantilla = plantillaDe(d, m.temporada, equipoId).map((p) => ({ jugador: p.datos, numero: p.numero }));
  const fuera = [...previas.keys()].filter((j) => !plantilla.some((p) => p.jugador.id === j)).map((j) => ({ jugador: d.jugadores.find((x) => x.id === j), numero: null })).filter((p) => p.jugador);
  const filas = [...plantilla, ...fuera].map(({ jugador, numero }) => {
    const a = previas.get(jugador.id);
    const jid = esc(jugador.id);
    const nombre = esc(jugador.nombre);
    return `<div class="hoja-jugador">
      <div class="hoja-fila">
        <span class="hoja-nombre">${numero !== null ? `<b>${numero}</b>` : ""}${nombre}</span>
        <input id="n-${jid}" name="n-${jid}" type="text" inputmode="decimal" maxlength="5" placeholder="–" value="${a?.nota !== null && a?.nota !== undefined ? esc(nota(a.nota)) : ""}" aria-label="Note de ${nombre}" data-jugador="${jid}" data-lado="${lado}" data-nombre="${nombre}" class="hoja-nota">
        <input id="g-${jid}" name="g-${jid}" type="number" min="0" max="20" inputmode="numeric" value="${a?.goles || 0}" aria-label="Buts de ${nombre}" data-lado="${lado}" class="hoja-goles">
        <input id="a-${jid}" name="a-${jid}" type="number" min="0" max="2" inputmode="numeric" value="${a?.amarillas || 0}" aria-label="Cartons jaunes de ${nombre}" class="hoja-carton hoja-jaune">
        <input id="r-${jid}" name="r-${jid}" type="number" min="0" max="1" inputmode="numeric" value="${a?.rojas || 0}" aria-label="Carton rouge de ${nombre}" class="hoja-carton hoja-rouge">
      </div>
      <input id="c-${jid}" name="c-${jid}" type="text" maxlength="300" value="${esc(a?.comentario || "")}" placeholder="Commentaire sur son match (facultatif)" aria-label="Commentaire sur le match de ${nombre}" class="hoja-comentario">
    </div>`;
  }).join("");
  const v = m.valoraciones?.[lado] || { nota: null, texto: "" };
  return `<fieldset class="hoja-bloque" style="--c:${equipo.color}">
    <legend>${esc(equipo.nombre)}</legend>
    <p class="goleadores-cuenta" data-cuenta="${lado}"></p>
    ${filas ? `<div class="hoja-fila hoja-titulos" aria-hidden="true"><span>Joueur</span><span>Note</span><span>Buts</span><span title="Cartons jaunes">J</span><span title="Carton rouge">R</span></div>${filas}` : `<p class="campo-ayuda">Ajoute les joueurs de l'équipe pour leur donner une note.</p>`}
    <div class="hoja-valoracion">
      <p class="hoja-valoracion-titulo">Évaluation de l'équipe <span class="opcional">facultatif</span></p>
      <div class="hoja-valoracion-fila">
        <input id="vn-${lado}" name="vn-${lado}" type="text" inputmode="decimal" maxlength="5" placeholder="Note" value="${v.nota !== null ? esc(nota(v.nota)) : ""}" aria-label="Note de l'équipe ${esc(equipo.nombre)}" data-nombre="l'équipe ${esc(equipo.nombre)}" class="hoja-nota-equipo">
        <textarea id="vt-${lado}" name="vt-${lado}" rows="2" maxlength="600" placeholder="Ton avis sur le match de l'équipe" aria-label="Évaluation de l'équipe ${esc(equipo.nombre)}">${esc(v.texto)}</textarea>
      </div>
    </div>
  </fieldset>`;
}

function editarResultado(api, id) {
  const d = api.datos();
  const m = d.partidos.find((x) => x.id === id);
  if (!m) return;
  const a = d.equipos.find((e) => e.id === m.local);
  const b = d.equipos.find((e) => e.id === m.visitante);
  abrirFormulario({
    titulo: "Feuille de match",
    intro: `${esc(a.nombre)} contre ${esc(b.nombre)}, ${esc(diaLargo(m.fecha).toLowerCase())}. Donne une note de 0 à 10 à chaque joueur qui a joué (par quarts de point : 6,25, 6,5, 6,75…), ses buts et ses cartons (J : jaunes, R : rouge). Laisse la note vide pour un joueur absent.`,
    campos: [[
      { nombre: "golesA", etiqueta: `Score ${a.nombre}`, tipo: "numero", requerido: true, min: 0, max: 99 },
      { nombre: "golesB", etiqueta: `Score ${b.nombre}`, tipo: "numero", requerido: true, min: 0, max: 99 }
    ]],
    valores: { golesA: m.goles ? m.goles[0] : "", golesB: m.goles ? m.goles[1] : "" },
    extra: `<div class="hoja">${filasHoja(d, m, 0)}${filasHoja(d, m, 1)}</div>`,
    acciones: m.goles ? '<button type="button" class="btn btn-secundario" data-quitar-resultado>Effacer la feuille</button>' : "",
    boton: "Enregistrer la feuille",
    ancho: true,
    alMontar: (f) => {
      const actualizar = () => {
        [0, 1].forEach((lado) => {
          const total = [...f.querySelectorAll(`input.hoja-goles[data-lado="${lado}"]`)].reduce((s, i) => s + (entero(i.value, 0, 99) || 0), 0);
          const notas = [...f.querySelectorAll(`input.hoja-nota[data-lado="${lado}"]`)].filter((i) => i.value.trim()).length;
          const marcado = entero(f.elements[lado === 0 ? "golesA" : "golesB"].value, 0, 99);
          const salida = f.querySelector(`[data-cuenta="${lado}"]`);
          salida.textContent = `${plural(notas, "joueur noté", "joueurs notés")}, ${total} ${total > 1 ? "buts" : "but"}${marcado === null ? "" : ` sur ${marcado}`}`;
          salida.classList.toggle("es-distinto", marcado !== null && total !== marcado);
        });
        f.querySelectorAll("input.hoja-nota, input.hoja-nota-equipo").forEach((i) => i.classList.toggle("es-invalida", Boolean(leerNota(i.value).error)));
      };
      f.addEventListener("input", actualizar);
      actualizar();
      f.querySelector("[data-quitar-resultado]")?.addEventListener("click", async () => {
        await api.aplicar((dd) => {
          const p = dd.partidos.find((x) => x.id === id);
          p.goles = null;
          p.valoraciones = null;
          dd.actuaciones = dd.actuaciones.filter((x) => x.partido !== id);
        }, "Feuille effacée");
        cerrar();
      });
    },
    alEnviar: (v, datos, f) => {
      const goles = [entero(v.golesA, 0, 99), entero(v.golesB, 0, 99)];
      if (goles.includes(null)) return "Indique le score des deux équipes.";
      const filas = [];
      for (const entrada of f.querySelectorAll("input.hoja-nota")) {
        const leida = leerNota(entrada.value);
        if (leida.error) {
          entrada.focus();
          return `La note de ${entrada.dataset.nombre} ${ERRORES_NOTA[leida.error]}.`;
        }
        const lado = Number(entrada.dataset.lado);
        const jugador = entrada.dataset.jugador;
        const g = entero(datos.get(`g-${jugador}`), 0, 20) || 0;
        const amarillas = entero(datos.get(`a-${jugador}`), 0, 2) || 0;
        const rojas = entero(datos.get(`r-${jugador}`), 0, 1) || 0;
        const comentario = String(datos.get(`c-${jugador}`) || "").trim().slice(0, 300);
        if (leida.vacia && g === 0 && amarillas === 0 && rojas === 0 && !comentario) continue;
        filas.push({ id: uid(), partido: id, jugador, equipo: lado === 0 ? m.local : m.visitante, nota: leida.vacia ? null : leida.valor, goles: g, amarillas, rojas, comentario });
      }
      const valoraciones = [];
      for (const lado of [0, 1]) {
        const entrada = f.elements[`vn-${lado}`];
        const leida = leerNota(entrada.value);
        if (leida.error) {
          entrada.focus();
          return `La note de ${entrada.dataset.nombre} ${ERRORES_NOTA[leida.error]}.`;
        }
        valoraciones.push({ nota: leida.vacia ? null : leida.valor, texto: String(datos.get(`vt-${lado}`) || "").trim().slice(0, 600) });
      }
      const porLado = [m.local, m.visitante].map((e) => filas.filter((x) => x.equipo === e).reduce((s, x) => s + x.goles, 0));
      if (porLado[0] > goles[0] || porLado[1] > goles[1]) return "Il y a plus de buts notés pour les joueurs que de buts marqués.";
      const previas = new Map(d.actuaciones.filter((x) => x.partido === id).map((x) => [x.jugador, x.id]));
      filas.forEach((x) => {
        if (previas.has(x.jugador)) x.id = previas.get(x.jugador);
      });
      return api.aplicar((dd) => {
        const p = dd.partidos.find((x) => x.id === id);
        p.goles = goles;
        p.valoraciones = valoraciones.some((x) => x.nota !== null || x.texto) ? valoraciones : null;
        dd.actuaciones = [...dd.actuaciones.filter((x) => x.partido !== id), ...filas];
      }, "Feuille de match enregistrée");
    }
  });
}

function editarComentario(api, clave) {
  const [partidoId, jugadorId] = String(clave || "").split("|");
  const d = api.datos();
  const m = d.partidos.find((x) => x.id === partidoId);
  const j = d.jugadores.find((x) => x.id === jugadorId);
  if (!m || !j || !m.goles) return;
  const actual = d.actuaciones.find((x) => x.partido === m.id && x.jugador === j.id);
  const equipo = actual?.equipo || d.plantillas.find((p) => p.temporada === m.temporada && p.jugador === j.id && (p.equipo === m.local || p.equipo === m.visitante))?.equipo;
  if (!equipo) return;
  const rival = d.equipos.find((e) => e.id === (equipo === m.local ? m.visitante : m.local));
  abrirFormulario({
    titulo: `Commentaire sur ${j.nombre}`,
    intro: `Son match contre ${esc(rival?.nombre || "")}, ${esc(diaLargo(m.fecha).toLowerCase())}. Le commentaire s'affiche dans sa carte, sur le terrain de la fiche du match.`,
    campos: [{ nombre: "comentario", etiqueta: "Commentaire", tipo: "textarea", filas: 4, ayuda: "300 caractères au plus. Laisse vide pour l'effacer." }],
    valores: { comentario: actual?.comentario || "" },
    alEnviar: (v) => {
      const texto = v.comentario;
      if (texto.length > 300) return `Le commentaire fait ${texto.length} caractères : 300 au plus.`;
      return api.aplicar((dd) => {
        const fila = dd.actuaciones.find((x) => x.partido === m.id && x.jugador === j.id);
        if (fila) {
          fila.comentario = texto;
          if (fila.nota === null && !fila.goles && !fila.amarillas && !fila.rojas && !texto) dd.actuaciones = dd.actuaciones.filter((x) => x !== fila);
        } else if (texto) {
          dd.actuaciones.push({ id: uid(), partido: m.id, jugador: j.id, equipo, nota: null, goles: 0, amarillas: 0, rojas: 0, comentario: texto });
        }
      }, texto ? "Commentaire enregistré" : "Commentaire effacé");
    }
  });
}

function editarLive(api, id) {
  const d = api.datos();
  const actual = d.lives.find((l) => l.id === id);
  const t = actual?.temporada || api.temporada();
  const proximo = d.partidos.filter((m) => m.temporada === t && !m.goles && m.fecha >= hoyISO()).sort(porFecha)[0];
  abrirFormulario({
    titulo: actual ? "Modifier le live" : "Nouveau live",
    campos: [
      { nombre: "titulo", etiqueta: "Titre", tipo: "texto", requerido: true, maxlength: 100, placeholder: "Live de la journée 4" },
      [
        { nombre: "fecha", etiqueta: "Date", tipo: "fecha", requerido: true },
        { nombre: "hora", etiqueta: "Heure", tipo: "hora" }
      ],
      { nombre: "enlace", etiqueta: "Lien du live", tipo: "url", placeholder: "https://www.youtube.com/live/…", ayuda: "Sans lien, le bouton mène à la chaîne YouTube." }
    ],
    valores: actual || { titulo: proximo?.jornada ? `Live de la ${proximo.jornada.toLowerCase()}` : "Live", fecha: proximo?.fecha || "", hora: "", enlace: "" },
    boton: actual ? "Enregistrer" : "Ajouter le live",
    alEnviar: (v) => {
      if (v.enlace && !enlaceSeguro(v.enlace)) return "Le lien doit commencer par https://";
      const datos = { titulo: v.titulo, fecha: v.fecha, hora: v.hora, enlace: enlaceSeguro(v.enlace) };
      return api.aplicar((dd) => {
        const l = dd.lives.find((x) => x.id === id);
        if (l) Object.assign(l, datos);
        else dd.lives.push({ id: uid(), temporada: t, ...datos });
      }, actual ? "Live enregistré" : "Live ajouté");
    }
  });
}

function editarVideo(api, id) {
  const d = api.datos();
  const actual = d.videos.find((v) => v.id === id);
  const t = actual?.temporada || api.temporada();
  const jugados = d.partidos.filter((m) => m.temporada === t && m.goles).sort((a, b) => porFecha(b, a));
  const nombre = (eid) => d.equipos.find((e) => e.id === eid)?.nombre || "";
  abrirFormulario({
    titulo: actual ? "Modifier la vidéo" : "Nouvelle vidéo",
    campos: [
      { nombre: "enlace", etiqueta: "Lien YouTube", tipo: "url", requerido: true, placeholder: "https://www.youtube.com/watch?v=…", ayuda: "Le lien de la vidéo ou du live, copié depuis YouTube." },
      { nombre: "titulo", etiqueta: "Titre", tipo: "texto", requerido: true, maxlength: 140, placeholder: "Récap de la journée 3" },
      { nombre: "fecha", etiqueta: "Date", tipo: "fecha" },
      { nombre: "partido", etiqueta: "Match concerné", tipo: "select", opciones: [["", "Aucun en particulier"], ...jugados.map((m) => [m.id, `${nombre(m.local)} ${m.goles[0]}-${m.goles[1]} ${nombre(m.visitante)}`])] }
    ],
    valores: actual ? { ...actual, enlace: `https://www.youtube.com/watch?v=${actual.youtube}` } : { enlace: "", titulo: "", fecha: hoyISO(), partido: "" },
    boton: actual ? "Enregistrer" : "Ajouter la vidéo",
    alEnviar: (v) => {
      const youtube = idYoutube(v.enlace);
      if (!youtube) return "Ce lien ne ressemble pas à une vidéo YouTube. Copie l'adresse de la vidéo depuis YouTube.";
      const datos = { titulo: v.titulo, youtube, fecha: v.fecha, partido: v.partido };
      return api.aplicar((dd) => {
        const x = dd.videos.find((y) => y.id === id);
        if (x) Object.assign(x, datos);
        else dd.videos.push({ id: uid(), temporada: t, ...datos });
      }, actual ? "Vidéo enregistrée" : "Vidéo ajoutée");
    }
  });
}

function sugerenciasPremios(d, t) {
  const ranking = rankingJugadores(d, t);
  const mejor = mejoresJugadores(d, t, ranking, 1)[0];
  const goleador = mejoresGoleadores(d, t, ranking, 1)[0];
  const primero = clasificacion(d, t)[0];
  const partes = [
    primero?.pj ? `${t === d.temporadaActual ? "en tête" : "champion"} : ${esc(primero.equipo.nombre)} (${plural(primero.pts, "pt", "pts")})` : "",
    mejor ? `meilleure moyenne : ${esc(mejor.jugador.nombre)} (${media(mejor.media)})` : "",
    goleador ? `meilleur buteur : ${esc(goleador.jugador.nombre)} (${plural(goleador.goles, "but", "buts")})` : ""
  ].filter(Boolean);
  return partes.length ? `D'après les résultats de la saison, ${partes.join(", ")}.` : "";
}

function editarPremio(api, { id, temporada }) {
  const d = api.datos();
  const actual = d.premios.find((p) => p.id === id);
  const t = actual?.temporada || temporada || api.temporada();
  const ocupados = new Set(d.plantillas.filter((p) => p.temporada === t).map((p) => p.jugador));
  const jugadoresT = d.jugadores.filter((j) => ocupados.has(j.id) || j.id === actual?.jugador).sort(porNombre);
  const equiposT = equiposDe(d, t).sort(porNombre);
  abrirFormulario({
    titulo: actual ? "Modifier le prix" : `Nouveau prix, ${nombreTemporada(d, t)}`,
    intro: sugerenciasPremios(d, t),
    campos: [
      { nombre: "nombre", etiqueta: "Nom du prix", tipo: "texto", requerido: true, maxlength: 80, sugerencias: SUGERENCIAS_PREMIOS, placeholder: "Ballon d'or Ligue S" },
      { nombre: "tipo", etiqueta: "Remis à", tipo: "select", requerido: true, opciones: [["jugador", "Un joueur"], ["equipo", "Une équipe"], ["pronostiqueur", "Un pronostiqueur"]] },
      { nombre: "jugador", etiqueta: "Joueur", tipo: "select", requerido: true, opciones: [["", "Choisir un joueur"], ...jugadoresT.map((j) => [j.id, j.nombre])] },
      { nombre: "equipo", etiqueta: "Équipe", tipo: "select", requerido: true, opciones: [["", "Choisir une équipe"], ...equiposT.map((e) => [e.id, e.nombre])] },
      { nombre: "pronostiqueur", etiqueta: "Pseudo du pronostiqueur", tipo: "texto", requerido: true, maxlength: 30, ayuda: "Tel qu'il apparaît dans le classement des pronostiqueurs." },
      { nombre: "detalle", etiqueta: "Précision", tipo: "texto", maxlength: 120, placeholder: "Moyenne 8,12 ou 14 buts" }
    ],
    valores: { nombre: actual?.nombre || "", tipo: actual?.pronostiqueur ? "pronostiqueur" : actual?.equipo && !actual?.jugador ? "equipo" : "jugador", jugador: actual?.jugador || "", equipo: actual?.equipo || "", pronostiqueur: actual?.pronostiqueur || "", detalle: actual?.detalle || "" },
    boton: actual ? "Enregistrer" : "Ajouter le prix",
    alMontar: (f) => {
      const alternar = () => {
        const tipo = f.elements.tipo.value;
        mostrarCampos(f, ["jugador"], tipo === "jugador");
        mostrarCampos(f, ["equipo"], tipo === "equipo");
        mostrarCampos(f, ["pronostiqueur"], tipo === "pronostiqueur");
      };
      f.elements.tipo.addEventListener("change", alternar);
      alternar();
    },
    alEnviar: (v) => {
      const datos = { nombre: v.nombre, jugador: v.tipo === "jugador" ? v.jugador : "", equipo: v.tipo === "equipo" ? v.equipo : "", pronostiqueur: v.tipo === "pronostiqueur" ? v.pronostiqueur : "", detalle: v.detalle };
      return api.aplicar((dd) => {
        const p = dd.premios.find((x) => x.id === id);
        if (p) Object.assign(p, datos);
        else dd.premios.push({ id: uid(), temporada: t, orden: Math.max(0, ...dd.premios.map((x) => x.orden)) + 1, ...datos });
      }, actual ? "Prix enregistré" : "Prix ajouté");
    }
  });
}

function gestionarTemporadas(api) {
  const d = api.datos();
  const filas = [...d.temporadas].reverse().map((t) => {
    const partidos = d.partidos.filter((m) => m.temporada === t.id).length;
    const equipos = d.inscripciones.filter((i) => i.temporada === t.id).length;
    return `<div class="temporada-fila">
      <label class="campo" for="tn-${esc(t.id)}"><span class="campo-etiqueta">Nom</span><input id="tn-${esc(t.id)}" name="tn-${esc(t.id)}" type="text" maxlength="60" value="${esc(t.nombre)}" required></label>
      <label class="campo-casilla temporada-actual" for="ta-${esc(t.id)}"><input id="ta-${esc(t.id)}" type="radio" name="actual" value="${esc(t.id)}"${t.id === d.temporadaActual ? " checked" : ""}><span>Saison en cours</span></label>
      <p class="temporada-datos">${plural(equipos, "équipe", "équipes")}, ${plural(partidos, "match", "matchs")}</p>
      ${t.id !== d.temporadaActual ? `<button type="button" class="btn-icono" data-borrar-temporada="${esc(t.id)}" aria-label="Supprimer ${esc(t.nombre)}" title="Supprimer ${esc(t.nombre)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M10 7V4h4v3"/><path d="M6.5 7l1 13h9l1-13"/></svg></button>` : ""}
    </div>`;
  }).join("");
  abrirFormulario({
    titulo: "Saisons",
    intro: "La saison en cours est celle que le site montre par défaut. Les saisons passées restent consultables avec le sélecteur de saison.",
    campos: [],
    extra: `<div class="temporadas-lista">${filas}</div><div class="nueva-temporada"><button type="button" class="btn btn-secundario" data-nueva-temporada>Ouvrir une nouvelle saison</button></div>`,
    alMontar: (f) => {
      f.querySelector("[data-nueva-temporada]").addEventListener("click", () => nuevaTemporada(api));
      f.querySelectorAll("[data-borrar-temporada]").forEach((b) => b.addEventListener("click", () => api.borrarTemporada(b.dataset.borrarTemporada)));
    },
    alEnviar: (v, datos) => {
      const nombres = d.temporadas.map((t) => [t.id, String(datos.get(`tn-${t.id}`) || "").trim()]);
      if (nombres.some(([, n]) => !n)) return "Chaque saison doit avoir un nom.";
      return api.aplicar((dd) => {
        nombres.forEach(([tid, n]) => {
          dd.temporadas.find((t) => t.id === tid).nombre = n;
        });
        dd.temporadaActual = String(datos.get("actual") || dd.temporadaActual);
      }, "Saisons enregistrées");
    }
  });
}

function nuevaTemporada(api) {
  const d = api.datos();
  const base = d.temporadaActual;
  const equipos = equiposDe(d, base).sort(porNombre);
  const bloques = equipos.map((e) => {
    const plantilla = plantillaDe(d, base, e.id);
    return `<details class="reinscripcion" style="--c:${e.color}">
      <summary><label class="campo-casilla" for="eq-${esc(e.id)}"><input id="eq-${esc(e.id)}" type="checkbox" name="eq-${esc(e.id)}" checked><span>${esc(e.nombre)}</span></label><span class="reinscripcion-cuenta">${plural(plantilla.length, "joueur", "joueurs")}</span></summary>
      <div class="reinscripcion-jugadores">${plantilla.map((p) => `<label class="campo-casilla" for="ju-${esc(p.jugador)}"><input id="ju-${esc(p.jugador)}" type="checkbox" name="ju-${esc(p.jugador)}" checked><span>${p.numero !== null ? `<b>${p.numero}</b> ` : ""}${esc(p.datos.nombre)}</span></label>`).join("") || '<p class="campo-ayuda">Aucun joueur.</p>'}</div>
    </details>`;
  }).join("");
  abrirFormulario({
    titulo: "Ouvrir une nouvelle saison",
    intro: `Coche les équipes de la ${esc(nombreTemporada(d, base))} qui se réinscrivent, puis ouvre chaque équipe pour choisir les joueurs qui continuent. Les autres restent dans l'historique. Les nouvelles équipes s'ajoutent ensuite avec « Inscrire une équipe ».`,
    campos: [{ nombre: "nombre", etiqueta: "Nom de la nouvelle saison", tipo: "texto", requerido: true, maxlength: 60 }],
    valores: { nombre: siguienteNombreTemporada(d) },
    extra: equipos.length ? `<fieldset class="reinscripciones"><legend>Équipes qui se réinscrivent</legend>${bloques}</fieldset>` : "",
    boton: "Ouvrir la saison",
    alMontar: (f) => {
      f.querySelectorAll("details summary label").forEach((l) => l.addEventListener("click", (e) => e.stopPropagation()));
    },
    alEnviar: async (v, datos) => {
      if (d.temporadas.some((t) => t.nombre.toLowerCase() === v.nombre.toLowerCase())) return "Une saison porte déjà ce nom.";
      const id = uid();
      const siguen = equipos.filter((e) => datos.get(`eq-${e.id}`) === "on");
      const hecho = await api.aplicar((dd) => {
        dd.temporadas.push({ id, nombre: v.nombre, orden: Math.max(0, ...dd.temporadas.map((t) => t.orden)) + 1 });
        dd.temporadaActual = id;
        siguen.forEach((e) => {
          dd.inscripciones.push({ id: uid(), temporada: id, equipo: e.id });
          plantillaDe(d, base, e.id).filter((p) => datos.get(`ju-${p.jugador}`) === "on").forEach((p) => {
            dd.plantillas.push({ id: uid(), temporada: id, equipo: e.id, jugador: p.jugador, numero: p.numero, capitan: p.capitan });
          });
        });
      }, `${v.nombre} ouverte`);
      if (hecho) api.verTemporada(id);
      return hecho;
    }
  });
}

function abrirDatos(api) {
  const local = api.modo === "local";
  dialogo.classList.remove("dialogo-ancho");
  abrir(`<div class="formulario">
    <header class="dialogo-cabeza"><h2>Données de la ligue</h2>${CERRAR}</header>
    <div class="dialogo-cuerpo datos-lista">
      ${local ? `<div class="datos-opcion datos-publicar">
        <div><h3>Publier sur le site</h3><p>Télécharge le fichier datos.json avec tout le contenu actuel. Remplace ce fichier à la racine du dépôt GitHub : une à deux minutes après, tout le monde voit ces données.</p></div>
        <button type="button" class="btn btn-principal" data-datos="publicar">Télécharger datos.json</button>
      </div>` : ""}
      ${api.modo !== "nube" && api.apartado() ? `<div class="datos-opcion">
        <div><h3>Modifications mises de côté</h3><p>Une nouvelle version publiée a remplacé ce que tu avais modifié dans ce navigateur le ${esc(new Date(api.apartado()).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }))}. Tu peux le récupérer.</p></div>
        <button type="button" class="btn btn-secundario" data-datos="recuperar">Récupérer</button>
      </div>` : ""}
      <div class="datos-opcion">
        <div><h3>Sauvegarde</h3><p>Télécharge toute la ligue dans un fichier : saisons, équipes, joueurs, matchs, notes, lives, vidéos, prix et textes.</p></div>
        <button type="button" class="btn btn-secundario" data-datos="exportar">Télécharger</button>
      </div>
      <div class="datos-opcion">
        <div><h3>Importer une sauvegarde</h3><p>Remplace tout le contenu actuel par celui d'un fichier de sauvegarde.</p></div>
        <label class="btn btn-secundario" for="importar-archivo">Choisir le fichier<input id="importar-archivo" class="sr" type="file" accept="application/json,.json"></label>
      </div>
      ${local ? `<div class="datos-opcion">
        <div><h3>Revenir à l'exemple</h3><p>Remet les deux saisons d'exemple pour faire des essais.</p></div>
        <button type="button" class="btn btn-secundario" data-datos="ejemplo">Remettre l'exemple</button>
      </div>` : ""}
      <div class="datos-opcion">
        <div><h3>Tout effacer</h3><p>Supprime les équipes, les joueurs, les matchs, les notes, les lives, les vidéos et les prix de toutes les saisons. Les textes, les paramètres et la saison en cours restent.</p></div>
        <button type="button" class="btn btn-peligro" data-datos="vaciar">Tout effacer</button>
      </div>
    </div>
  </div>`);
  dialogo.querySelector('[data-datos="exportar"]').addEventListener("click", () => api.exportar());
  dialogo.querySelector('[data-datos="publicar"]')?.addEventListener("click", () => api.publicar());
  dialogo.querySelector('[data-datos="recuperar"]')?.addEventListener("click", () => api.recuperarApartado());
  dialogo.querySelector("#importar-archivo").addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (archivo) api.importar(archivo);
  });
  dialogo.querySelector('[data-datos="ejemplo"]')?.addEventListener("click", () => api.reiniciar(true));
  dialogo.querySelector('[data-datos="vaciar"]').addEventListener("click", () => api.reiniciar(false));
}

function prepararDialogo() {
  dialogo.addEventListener("click", (e) => {
    if (e.target === dialogo || e.target.closest("[data-cerrar]")) cerrar();
  });
}

export { prepararDialogo, cerrar, confirmar, editarPresentacion, editarReglas, editarAjustes, editarEquipo, editarJugador, editarPartido, editarResultado, editarComentario, editarLive, editarVideo, editarPremio, gestionarTemporadas, nuevaTemporada, abrirDatos };
