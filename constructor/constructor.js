/* ============================================================
   Constructor de emails — lógica de la herramienta
   ============================================================
   FASE 1: añadir bloques, editarlos, reordenarlos con botones y
   generar el HTML del email para copiar.

   Cómo está organizado:
   · tiposDeBloque  → define los 7 bloques: campos editables,
                      valores por defecto y cómo se dibujan.
   · emailEnConstruccion → el array con los bloques que la
                      usuaria ha ido añadiendo. Es la "fuente de
                      la verdad": todo se redibuja a partir de él.
   · render*()      → funciones que pintan cada parte de la app.
   · generarHtmlEmail() → arma el .html final del email.
   ============================================================ */

/* ------------------------------------------------------------
   Utilidad: escapar texto para que sea seguro meterlo en HTML.
   Evita que un "<" escrito por la usuaria rompa el email.
   ------------------------------------------------------------ */
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ------------------------------------------------------------
   Comprueba si un texto es un color hex válido de 6 dígitos
   (#rrggbb). En email solo se usan los de 6 dígitos: los de 3
   no son fiables en todos los clientes (ver Bloque 03 de la doc).
   ------------------------------------------------------------ */
function esHexValido(texto) {
  return /^#[0-9a-fA-F]{6}$/.test(texto);
}

/* ------------------------------------------------------------
   Conecta un selector de color (<input type="color">) con un
   campo de texto de hex editable. Quedan sincronizados en los
   dos sentidos: cambiar uno actualiza el otro.

   · selectorColor / campoHex → los dos <input> del DOM
   · alCambiar(valor) → se llama con el hex cuando hay un color
                        válido nuevo (para aplicarlo y redibujar)

   Si el texto escrito no es un hex válido, el campo se marca en
   rojo y NO se llama a alCambiar: no se aplica nada.
   ------------------------------------------------------------ */
function conectarCampoColor(selectorColor, campoHex, alCambiar) {
  // el selector de color: actualiza el texto y aplica
  selectorColor.addEventListener("input", () => {
    campoHex.value = selectorColor.value;
    campoHex.classList.remove("invalido");
    alCambiar(selectorColor.value);
  });

  // el campo de texto: valida lo escrito antes de aplicar
  campoHex.addEventListener("input", () => {
    const texto = campoHex.value.trim().toLowerCase();
    if (esHexValido(texto)) {
      campoHex.classList.remove("invalido");
      selectorColor.value = texto;
      alCambiar(texto);
    } else {
      campoHex.classList.add("invalido");
    }
  });

  // al salir del campo, si quedó algo inválido, se recupera el
  // color válido actual del selector (no se queda texto roto).
  campoHex.addEventListener("blur", () => {
    if (!esHexValido(campoHex.value.trim().toLowerCase())) {
      campoHex.value = selectorColor.value;
      campoHex.classList.remove("invalido");
    }
  });
}

/* ------------------------------------------------------------
   Paleta del proyecto: valores por defecto de los bloques.
   ------------------------------------------------------------ */
const colores = {
  lavandaFuerte: "#8b76c4",
  lavandaClaro: "#f3f0fb",
  melocotonFuerte: "#e0916a",
  tinta: "#3a3550",
  tintaSuave: "#6b6580",
  blanco: "#ffffff",
};

/* ------------------------------------------------------------
   Iconos SVG de línea para los botones de bloque.
   Son SVG inline (van solo en la INTERFAZ, no en el email).
   crearIcono() envuelve el contenido del trazo con los
   atributos comunes del <svg>.
   ------------------------------------------------------------ */
function crearIcono(trazo) {
  return (
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${trazo}</svg>`
  );
}

const iconos = {
  // cabecera: una franja superior sobre un panel
  cabecera: crearIcono('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>'),
  // texto: tres líneas de párrafo
  texto: crearIcono('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>'),
  // botón: un rectángulo redondeado pequeño centrado
  boton: crearIcono('<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M9 12h6"/>'),
  // imagen: marco con sol y montaña
  imagen: crearIcono('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 16l-5-5L5 21"/>'),
  // columnas: dos paneles lado a lado
  columnas: crearIcono('<rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/>'),
  // separador: una línea horizontal
  separador: crearIcono('<path d="M4 12h16"/>'),
  // pie: una franja inferior sobre un panel
  pie: crearIcono('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/>'),
};

/* ============================================================
   DEFINICIÓN DE LOS 7 TIPOS DE BLOQUE
   ------------------------------------------------------------
   Cada tipo tiene:
   · etiqueta   → nombre visible en la lista de bloques
   · icono      → SVG de línea para la lista de bloques
   · campos     → qué se puede editar (clave, etiqueta, tipo)
   · porDefecto → valores iniciales al añadir el bloque
   · dibujar(contenido) → devuelve el HTML del bloque para el
                  email final (las filas <tr> de la tabla).
   ============================================================ */
const tiposDeBloque = {

  cabecera: {
    etiqueta: "Cabecera con logo",
    icono: iconos.cabecera,
    campos: [
      { clave: "titulo", etiqueta: "Texto del logo", tipo: "text" },
      { clave: "colorFondo", etiqueta: "Color de fondo", tipo: "color" },
      { clave: "colorTexto", etiqueta: "Color del texto", tipo: "color" },
    ],
    porDefecto: {
      titulo: "Mi Empresa",
      colorFondo: colores.lavandaFuerte,
      colorTexto: colores.blanco,
    },
    dibujar(contenido) {
      return `      <tr>
        <td align="center" style="background-color:${contenido.colorFondo}; padding:26px 32px;">
          <span style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-weight:bold; color:${contenido.colorTexto};">
            ${escaparHtml(contenido.titulo)}
          </span>
        </td>
      </tr>`;
    },
  },

  texto: {
    etiqueta: "Texto",
    icono: iconos.texto,
    campos: [
      { clave: "contenido", etiqueta: "Texto del párrafo", tipo: "textarea" },
      {
        clave: "tamano", etiqueta: "Tamaño", tipo: "select",
        opciones: [
          { valor: "titulo", etiqueta: "Título grande" },
          { valor: "normal", etiqueta: "Texto normal" },
          { valor: "pequeno", etiqueta: "Texto pequeño" },
        ],
      },
      { clave: "colorTexto", etiqueta: "Color del texto", tipo: "color" },
    ],
    porDefecto: {
      contenido: "Escribe aquí el texto de tu email.",
      tamano: "normal",
      colorTexto: colores.tinta,
    },
    dibujar(contenido) {
      const medidas = {
        titulo: "font-size:26px; line-height:34px; font-weight:bold;",
        normal: "font-size:16px; line-height:25px;",
        pequeno: "font-size:13px; line-height:20px;",
      };
      const estilo = medidas[contenido.tamano] || medidas.normal;
      return `      <tr>
        <td style="padding:16px 32px; font-family:Arial, Helvetica, sans-serif; color:${contenido.colorTexto}; ${estilo}">
          ${escaparHtml(contenido.contenido)}
        </td>
      </tr>`;
    },
  },

  boton: {
    etiqueta: "Botón",
    icono: iconos.boton,
    campos: [
      { clave: "texto", etiqueta: "Texto del botón", tipo: "text" },
      { clave: "enlace", etiqueta: "Enlace (URL)", tipo: "url" },
      { clave: "colorFondo", etiqueta: "Color del botón", tipo: "color" },
      { clave: "colorTexto", etiqueta: "Color del texto", tipo: "color" },
    ],
    porDefecto: {
      texto: "Ver más",
      enlace: "https://ejemplo.com",
      colorFondo: colores.lavandaFuerte,
      colorTexto: colores.blanco,
    },
    dibujar(contenido) {
      // Botón "bulletproof": rama [if mso] para Outlook + enlace normal.
      const enlace = escaparHtml(contenido.enlace);
      const texto = escaparHtml(contenido.texto);
      return `      <tr>
        <td align="center" style="padding:24px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td align="center" bgcolor="${contenido.colorFondo}" style="border-radius:8px;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${enlace}" arcsize="17%" style="height:46px;width:220px;v-text-anchor:middle;" stroke="f" fillcolor="${contenido.colorFondo}">
                <center style="color:${contenido.colorTexto};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${texto}</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-->
                <a href="${enlace}" style="display:inline-block; padding:14px 32px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:bold; color:${contenido.colorTexto}; text-decoration:none; border-radius:8px;">
                  ${texto}
                </a>
                <!--<![endif]-->
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    },
  },

  imagen: {
    etiqueta: "Imagen",
    icono: iconos.imagen,
    campos: [
      { clave: "url", etiqueta: "URL de la imagen", tipo: "url" },
      { clave: "alt", etiqueta: "Texto alternativo (alt)", tipo: "text" },
      { clave: "ancho", etiqueta: "Ancho en píxeles", tipo: "text" },
    ],
    porDefecto: {
      url: "https://placehold.co/536x220/d8cef0/8b76c4?text=Imagen",
      alt: "Describe aquí la imagen",
      ancho: "536",
    },
    dibujar(contenido) {
      const ancho = escaparHtml(contenido.ancho);
      return `      <tr>
        <td style="padding:16px 32px;">
          <img src="${escaparHtml(contenido.url)}" width="${ancho}" alt="${escaparHtml(contenido.alt)}" style="display:block; width:100%; max-width:${ancho}px; height:auto; border:0; border-radius:8px;" />
        </td>
      </tr>`;
    },
  },

  columnas: {
    etiqueta: "Dos columnas",
    icono: iconos.columnas,
    campos: [
      { clave: "textoIzquierda", etiqueta: "Texto columna izquierda", tipo: "textarea" },
      { clave: "textoDerecha", etiqueta: "Texto columna derecha", tipo: "textarea" },
      { clave: "colorTexto", etiqueta: "Color del texto", tipo: "color" },
    ],
    porDefecto: {
      textoIzquierda: "Texto de la primera columna.",
      textoDerecha: "Texto de la segunda columna.",
      colorTexto: colores.tinta,
    },
    dibujar(contenido) {
      // La clase "columna-movil" se apila en móvil (media query del email).
      return `      <tr>
        <td style="padding:16px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="columna-movil" width="260" valign="top" style="width:260px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:23px; color:${contenido.colorTexto};">
                ${escaparHtml(contenido.textoIzquierda)}
              </td>
              <td width="16" style="width:16px; font-size:0; line-height:0;">&nbsp;</td>
              <td class="columna-movil" width="260" valign="top" style="width:260px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:23px; color:${contenido.colorTexto};">
                ${escaparHtml(contenido.textoDerecha)}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    },
  },

  separador: {
    etiqueta: "Separador",
    icono: iconos.separador,
    campos: [
      {
        clave: "estilo", etiqueta: "Tipo", tipo: "select",
        opciones: [
          { valor: "linea", etiqueta: "Línea divisoria" },
          { valor: "espacio", etiqueta: "Espacio en blanco" },
        ],
      },
    ],
    porDefecto: {
      estilo: "linea",
    },
    dibujar(contenido) {
      if (contenido.estilo === "espacio") {
        return `      <tr>
        <td style="height:24px; line-height:24px; font-size:0;">&nbsp;</td>
      </tr>`;
      }
      return `      <tr>
        <td style="padding:8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-top:1px solid #e7e2f2; font-size:0; line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>`;
    },
    // Vista previa propia: el separador real es casi de altura cero
    // y dentro de la caja del constructor se ve vacío. Aquí se
    // muestra de forma clara (esto NO va al email generado).
    dibujarVistaPrevia(contenido) {
      if (contenido.estilo === "espacio") {
        return `<div class="vista-separador">Espacio en blanco</div>`;
      }
      return `<div class="vista-separador"><span class="linea-separador"></span>Línea divisoria</div>`;
    },
  },

  pie: {
    etiqueta: "Pie",
    icono: iconos.pie,
    campos: [
      { clave: "datos", etiqueta: "Datos del remitente", tipo: "textarea" },
      { clave: "textoBaja", etiqueta: "Texto del enlace de baja", tipo: "text" },
      { clave: "enlaceBaja", etiqueta: "Enlace de baja (URL)", tipo: "url" },
    ],
    porDefecto: {
      datos: "Mi Empresa · Calle de Ejemplo 12, 28000 Madrid",
      textoBaja: "Darme de baja",
      enlaceBaja: "https://ejemplo.com/baja",
    },
    dibujar(contenido) {
      return `      <tr>
        <td align="center" style="background-color:${colores.lavandaClaro}; padding:26px 32px;">
          <p style="margin:0 0 10px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px; color:${colores.tintaSuave};">
            ${escaparHtml(contenido.datos)}
          </p>
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px;">
            <a href="${escaparHtml(contenido.enlaceBaja)}" style="color:${colores.lavandaFuerte}; text-decoration:underline;">${escaparHtml(contenido.textoBaja)}</a>
          </p>
        </td>
      </tr>`;
    },
  },

};

/* El orden en que se muestran los bloques en la columna izquierda. */
const ordenBloques = ["cabecera", "texto", "boton", "imagen", "columnas", "separador", "pie"];

/* ============================================================
   ESTADO DE LA APP
   ------------------------------------------------------------
   emailEnConstruccion: lista de bloques que la usuaria añadió.
   Cada elemento es { id, tipo, contenido }.
   idSeleccionado: el id del bloque que se está editando.
   contadorId: para dar un id único a cada bloque nuevo.
   ajustesEmail: colores generales del email (marco y fondo).
   ============================================================ */
let emailEnConstruccion = [];
let idSeleccionado = null;
let contadorId = 0;

const ajustesEmail = {
  // color del marco exterior (lo que rodea al email de 600px)
  colorMarco: "#d8cef0",
  // color de fondo del email en sí (la zona de 600px con el contenido)
  colorFondo: "#ffffff",
};

/* Referencias a los elementos del DOM que se usan a menudo. */
const listaBloquesDisponibles = document.getElementById("lista-bloques-disponibles");
const lienzoMail = document.getElementById("lienzo-mail");
const lienzoVacio = document.getElementById("lienzo-vacio");
const editorBloque = document.getElementById("editor-bloque");
const editorSinSeleccion = document.getElementById("editor-sin-seleccion");

/* ============================================================
   COLUMNA 1 — pintar la lista de bloques disponibles
   ============================================================ */
function renderBloquesDisponibles() {
  ordenBloques.forEach((tipo) => {
    const definicion = tiposDeBloque[tipo];
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "bloque-disponible";
    boton.innerHTML = `<span class="icono">${definicion.icono}</span> ${definicion.etiqueta}`;
    boton.addEventListener("click", () => anadirBloque(tipo));
    listaBloquesDisponibles.appendChild(boton);
  });
}

/* ============================================================
   AÑADIR / BORRAR / MOVER bloques del email
   ============================================================ */
function anadirBloque(tipo) {
  contadorId += 1;
  const definicion = tiposDeBloque[tipo];
  const nuevoBloque = {
    id: contadorId,
    tipo: tipo,
    // copia de los valores por defecto, para no compartir referencia
    contenido: Object.assign({}, definicion.porDefecto),
  };
  emailEnConstruccion.push(nuevoBloque);
  idSeleccionado = nuevoBloque.id;
  renderEmail();
  renderEditor();
}

function borrarBloque(id) {
  emailEnConstruccion = emailEnConstruccion.filter((bloque) => bloque.id !== id);
  if (idSeleccionado === id) {
    idSeleccionado = null;
  }
  renderEmail();
  renderEditor();
}

function moverBloque(id, direccion) {
  const posicion = emailEnConstruccion.findIndex((bloque) => bloque.id === id);
  const posicionDestino = posicion + direccion;
  if (posicionDestino < 0 || posicionDestino >= emailEnConstruccion.length) {
    return;
  }
  // intercambia el bloque con su vecino
  const bloqueMovido = emailEnConstruccion[posicion];
  emailEnConstruccion[posicion] = emailEnConstruccion[posicionDestino];
  emailEnConstruccion[posicionDestino] = bloqueMovido;
  renderEmail();
}

/* Pide vaciar: si hay bloques, abre el modal de confirmación.
   El vaciado real lo hace confirmarVaciado(), al pulsar "Sí". */
function pedirVaciarEmail() {
  if (emailEnConstruccion.length === 0) {
    return;
  }
  modalConfirmar.hidden = false;
}

function confirmarVaciado() {
  emailEnConstruccion = [];
  idSeleccionado = null;
  modalConfirmar.hidden = true;
  renderEmail();
  renderEditor();
}

/* ============================================================
   COLUMNA 2 — pintar el email montado (vista previa)
   ============================================================ */
function renderEmail() {
  lienzoMail.innerHTML = "";
  lienzoVacio.hidden = emailEnConstruccion.length > 0;

  // el marco de la vista previa usa el color elegido en los ajustes
  lienzoMail.style.backgroundColor = ajustesEmail.colorMarco;

  emailEnConstruccion.forEach((bloque, indice) => {
    const definicion = tiposDeBloque[bloque.tipo];

    const contenedorBloque = document.createElement("div");
    contenedorBloque.className = "bloque-en-email";
    if (bloque.id === idSeleccionado) {
      contenedorBloque.classList.add("seleccionado");
    }

    // vista previa: si el bloque tiene dibujarVistaPrevia (p. ej. el
    // separador), se usa esa; si no, una mini-tabla con el bloque real.
    const vistaPrevia = document.createElement("div");
    if (definicion.dibujarVistaPrevia) {
      vistaPrevia.innerHTML = definicion.dibujarVistaPrevia(bloque.contenido);
    } else {
      vistaPrevia.innerHTML =
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
        `style="background-color:${ajustesEmail.colorFondo}; border-radius:6px; overflow:hidden;">` +
        definicion.dibujar(bloque.contenido) +
        `</table>`;
    }
    contenedorBloque.appendChild(vistaPrevia);

    // barra de acciones: subir, bajar, borrar
    const acciones = document.createElement("div");
    acciones.className = "bloque-acciones";

    const botonSubir = crearBotonAccion("↑", "Subir", () => moverBloque(bloque.id, -1));
    botonSubir.disabled = indice === 0;
    const botonBajar = crearBotonAccion("↓", "Bajar", () => moverBloque(bloque.id, 1));
    botonBajar.disabled = indice === emailEnConstruccion.length - 1;
    const botonBorrar = crearBotonAccion("✕", "Borrar", () => borrarBloque(bloque.id));
    botonBorrar.classList.add("borrar");

    acciones.appendChild(botonSubir);
    acciones.appendChild(botonBajar);
    acciones.appendChild(botonBorrar);
    contenedorBloque.appendChild(acciones);

    // al pulsar el bloque, se selecciona para editarlo
    contenedorBloque.addEventListener("click", (evento) => {
      // si se pulsó un botón de acción, no seleccionar
      if (evento.target.closest(".bloque-accion")) {
        return;
      }
      idSeleccionado = bloque.id;
      renderEmail();
      renderEditor();
    });

    lienzoMail.appendChild(contenedorBloque);
  });
}

function crearBotonAccion(simbolo, titulo, alPulsar) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "bloque-accion";
  boton.textContent = simbolo;
  boton.title = titulo;
  boton.setAttribute("aria-label", titulo);
  boton.addEventListener("click", alPulsar);
  return boton;
}

/* ============================================================
   COLUMNA 3 — pintar el editor del bloque seleccionado
   ============================================================ */
function renderEditor() {
  editorBloque.innerHTML = "";

  const bloque = emailEnConstruccion.find((elemento) => elemento.id === idSeleccionado);
  if (!bloque) {
    editorBloque.appendChild(editorSinSeleccion);
    editorSinSeleccion.hidden = false;
    return;
  }

  const definicion = tiposDeBloque[bloque.tipo];

  definicion.campos.forEach((campo) => {
    const contenedorCampo = document.createElement("div");
    contenedorCampo.className = "campo-editor";

    const etiqueta = document.createElement("label");
    etiqueta.textContent = campo.etiqueta;
    const idCampo = `campo-${bloque.id}-${campo.clave}`;
    etiqueta.setAttribute("for", idCampo);
    contenedorCampo.appendChild(etiqueta);

    if (campo.tipo === "color") {
      // campo de color: selector + hex editable, en una fila
      const fila = document.createElement("div");
      fila.className = "campo-color";

      const selectorColor = document.createElement("input");
      selectorColor.type = "color";
      selectorColor.id = idCampo;
      selectorColor.value = bloque.contenido[campo.clave];

      const campoHex = document.createElement("input");
      campoHex.type = "text";
      campoHex.className = "hex-texto";
      campoHex.maxLength = 7;
      campoHex.spellcheck = false;
      campoHex.setAttribute("aria-label", `Hex de ${campo.etiqueta}`);
      campoHex.value = bloque.contenido[campo.clave];

      conectarCampoColor(selectorColor, campoHex, (color) => {
        bloque.contenido[campo.clave] = color;
        renderEmail();
      });

      fila.appendChild(selectorColor);
      fila.appendChild(campoHex);
      contenedorCampo.appendChild(fila);
      editorBloque.appendChild(contenedorCampo);
      return;
    }

    // resto de campos: textarea, select, text o url
    let control;
    if (campo.tipo === "textarea") {
      control = document.createElement("textarea");
    } else if (campo.tipo === "select") {
      control = document.createElement("select");
      campo.opciones.forEach((opcion) => {
        const elementoOpcion = document.createElement("option");
        elementoOpcion.value = opcion.valor;
        elementoOpcion.textContent = opcion.etiqueta;
        control.appendChild(elementoOpcion);
      });
    } else {
      control = document.createElement("input");
      control.type = campo.tipo === "url" ? "url" : "text";
    }

    control.id = idCampo;
    control.value = bloque.contenido[campo.clave];

    // al cambiar el campo, se actualiza el bloque y se redibuja
    control.addEventListener("input", () => {
      bloque.contenido[campo.clave] = control.value;
      renderEmail();
    });

    contenedorCampo.appendChild(control);
    editorBloque.appendChild(contenedorCampo);
  });
}

/* ============================================================
   GENERAR EL HTML FINAL DEL EMAIL
   ------------------------------------------------------------
   Arma el .html completo: doctype XHTML, cabecera con charset y
   viewport, el <style> con la media query de móvil, el
   preheader oculto y las dos tablas anidadas con los bloques.
   ============================================================ */
function generarHtmlEmail() {
  // las filas <tr> de todos los bloques, una tras otra
  const filasBloques = emailEnConstruccion
    .map((bloque) => tiposDeBloque[bloque.tipo].dibujar(bloque.contenido))
    .join("\n");

  // colores del email elegidos en el panel de ajustes
  const marco = ajustesEmail.colorMarco;
  const fondo = ajustesEmail.colorFondo;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email</title>
  <style>
    /* Mejora opcional para móvil: apila las columnas dobles. */
    @media screen and (max-width: 600px) {
      .email-ancho-completo { width: 100% !important; max-width: 100% !important; }
      .columna-movil { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${marco};">

  <!-- PREHEADER: cambia este texto por la vista previa de tu email.
       El color va igual al marco para que el texto quede oculto. -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${marco};">
    Texto de vista previa del email.
  </div>

  <!-- Tabla exterior: centra y pinta el fondo -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${marco};">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Tabla interior: el email (600px) -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-ancho-completo" style="width:600px; max-width:600px; background-color:${fondo}; border-radius:14px; overflow:hidden;">
${filasBloques}
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* ============================================================
   MODAL DEL CÓDIGO — abrir, cerrar, copiar
   ============================================================ */
const modalFondo = document.getElementById("modal-fondo");
const salidaCodigo = document.getElementById("salida-codigo");
const avisoCopiado = document.getElementById("aviso-copiado");

/* Modal de confirmación al vaciar (lo usa pedirVaciarEmail). */
const modalConfirmar = document.getElementById("modal-confirmar");

function abrirModalCodigo() {
  if (emailEnConstruccion.length === 0) {
    window.alert("Añade al menos un bloque antes de generar el código.");
    return;
  }
  salidaCodigo.textContent = generarHtmlEmail();
  avisoCopiado.hidden = true;
  modalFondo.hidden = false;
}

function cerrarModalCodigo() {
  modalFondo.hidden = true;
}

function copiarCodigo() {
  const codigo = salidaCodigo.textContent;
  navigator.clipboard.writeText(codigo).then(
    () => {
      avisoCopiado.hidden = false;
    },
    () => {
      window.alert("No se pudo copiar automáticamente. Selecciona el código y cópialo a mano.");
    }
  );
}

/* ============================================================
   PANEL DE AJUSTES DEL EMAIL — colores de marco y fondo
   ============================================================ */
function conectarAjustesEmail() {
  conectarCampoColor(
    document.getElementById("ajuste-marco"),
    document.getElementById("hex-marco"),
    (color) => {
      ajustesEmail.colorMarco = color;
      renderEmail();
    }
  );
  conectarCampoColor(
    document.getElementById("ajuste-fondo"),
    document.getElementById("hex-fondo"),
    (color) => {
      ajustesEmail.colorFondo = color;
      renderEmail();
    }
  );
}

/* ============================================================
   ARRANQUE: conectar los eventos y pintar la app
   ============================================================ */
document.getElementById("boton-ver-codigo").addEventListener("click", abrirModalCodigo);
document.getElementById("boton-cerrar-modal").addEventListener("click", cerrarModalCodigo);
document.getElementById("boton-copiar").addEventListener("click", copiarCodigo);
document.getElementById("boton-vaciar").addEventListener("click", pedirVaciarEmail);

// botones del modal de confirmación de vaciado
document.getElementById("boton-confirmar-vaciar").addEventListener("click", confirmarVaciado);
document.getElementById("boton-cancelar-vaciar").addEventListener("click", () => {
  modalConfirmar.hidden = true;
});

// cerrar cualquier modal al pulsar fuera de él
modalFondo.addEventListener("click", (evento) => {
  if (evento.target === modalFondo) {
    cerrarModalCodigo();
  }
});
modalConfirmar.addEventListener("click", (evento) => {
  if (evento.target === modalConfirmar) {
    modalConfirmar.hidden = true;
  }
});

// cerrar el modal abierto con la tecla Escape
document.addEventListener("keydown", (evento) => {
  if (evento.key !== "Escape") {
    return;
  }
  if (!modalFondo.hidden) {
    cerrarModalCodigo();
  }
  if (!modalConfirmar.hidden) {
    modalConfirmar.hidden = true;
  }
});

conectarAjustesEmail();
renderBloquesDisponibles();
renderEmail();
renderEditor();
