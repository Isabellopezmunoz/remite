/* ============================================================
   Constructor de emails — lógica de la herramienta
   ============================================================
   FASE 1: añadir bloques, editarlos, reordenarlos con botones y
   generar el HTML del email para copiar.

   Cómo está organizado:
   · blockTypes     → define los 7 bloques: campos editables,
                      valores por defecto y cómo se dibujan.
   · emailBlocks    → el array con los bloques que la usuaria ha
                      ido añadiendo. Es la "fuente de la verdad":
                      todo se redibuja a partir de él.
   · render*()      → funciones que pintan cada parte de la app.
   · generateEmailHtml() → arma el .html final del email.
   ============================================================ */

import { icons, actionIcons } from "./icons/index.js";

/* ------------------------------------------------------------
   Utilidad: escapar texto para que sea seguro meterlo en HTML.
   Evita que un "<" escrito por la usuaria rompa el email.
   ------------------------------------------------------------ */
function escapeHtml(text) {
  return String(text)
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
function isValidHex(text) {
  return /^#[0-9a-fA-F]{6}$/.test(text);
}

/* ------------------------------------------------------------
   Conecta un selector de color (<input type="color">) con un
   campo de texto de hex editable. Quedan sincronizados en los
   dos sentidos: cambiar uno actualiza el otro.

   · colorPicker / hexField → los dos <input> del DOM
   · onChange(value) → se llama con el hex cuando hay un color
                       válido nuevo (para aplicarlo y redibujar)

   Si el texto escrito no es un hex válido, el campo se marca en
   rojo y NO se llama a onChange: no se aplica nada.
   ------------------------------------------------------------ */
function connectColorField(colorPicker, hexField, onChange) {
  // el selector de color: actualiza el texto y aplica
  colorPicker.addEventListener("input", () => {
    hexField.value = colorPicker.value;
    hexField.classList.remove("invalido");
    onChange(colorPicker.value);
  });

  // el campo de texto: valida lo escrito antes de aplicar
  hexField.addEventListener("input", () => {
    const text = hexField.value.trim().toLowerCase();
    if (isValidHex(text)) {
      hexField.classList.remove("invalido");
      colorPicker.value = text;
      onChange(text);
    } else {
      hexField.classList.add("invalido");
    }
  });

  // al salir del campo, si quedó algo inválido, se recupera el
  // color válido actual del selector (no se queda texto roto).
  hexField.addEventListener("blur", () => {
    if (!isValidHex(hexField.value.trim().toLowerCase())) {
      hexField.value = colorPicker.value;
      hexField.classList.remove("invalido");
    }
  });
}

/* ------------------------------------------------------------
   Paleta del proyecto: valores por defecto de los bloques.
   ------------------------------------------------------------ */
const colors = {
  lavandaFuerte: "#8b76c4",
  lavandaClaro: "#f3f0fb",
  melocotonFuerte: "#e0916a",
  tinta: "#3a3550",
  tintaSuave: "#6b6580",
  blanco: "#ffffff",
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
const blockTypes = {

  cabecera: {
    etiqueta: "Cabecera con logo",
    icono: icons.cabecera,
    campos: [
      { clave: "titulo", etiqueta: "Texto del logo", tipo: "text" },
      { clave: "colorFondo", etiqueta: "Color de fondo", tipo: "color" },
      { clave: "colorTexto", etiqueta: "Color del texto", tipo: "color" },
    ],
    porDefecto: {
      titulo: "Mi Empresa",
      colorFondo: colors.lavandaFuerte,
      colorTexto: colors.blanco,
    },
    dibujar(contenido) {
      return `      <tr>
        <td align="center" style="background-color:${contenido.colorFondo}; padding:26px 32px;">
          <span style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; font-weight:bold; color:${contenido.colorTexto};">
            ${escapeHtml(contenido.titulo)}
          </span>
        </td>
      </tr>`;
    },
  },

  texto: {
    etiqueta: "Texto",
    icono: icons.texto,
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
      colorTexto: colors.tinta,
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
          ${escapeHtml(contenido.contenido)}
        </td>
      </tr>`;
    },
  },

  boton: {
    etiqueta: "Botón",
    icono: icons.boton,
    campos: [
      { clave: "texto", etiqueta: "Texto del botón", tipo: "text" },
      { clave: "enlace", etiqueta: "Enlace (URL)", tipo: "url" },
      { clave: "colorFondo", etiqueta: "Color del botón", tipo: "color" },
      { clave: "colorTexto", etiqueta: "Color del texto", tipo: "color" },
    ],
    porDefecto: {
      texto: "Ver más",
      enlace: "https://ejemplo.com",
      colorFondo: colors.lavandaFuerte,
      colorTexto: colors.blanco,
    },
    dibujar(contenido) {
      // Botón "bulletproof": rama [if mso] para Outlook + enlace normal.
      const enlace = escapeHtml(contenido.enlace);
      const texto = escapeHtml(contenido.texto);
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
    icono: icons.imagen,
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
      const ancho = escapeHtml(contenido.ancho);
      return `      <tr>
        <td style="padding:16px 32px;">
          <img src="${escapeHtml(contenido.url)}" width="${ancho}" alt="${escapeHtml(contenido.alt)}" style="display:block; width:100%; max-width:${ancho}px; height:auto; border:0; border-radius:8px;" />
        </td>
      </tr>`;
    },
  },

  columnas: {
    etiqueta: "Dos columnas",
    icono: icons.columnas,
    campos: [
      { clave: "textoIzquierda", etiqueta: "Texto columna izquierda", tipo: "textarea" },
      { clave: "textoDerecha", etiqueta: "Texto columna derecha", tipo: "textarea" },
      { clave: "colorTexto", etiqueta: "Color del texto", tipo: "color" },
    ],
    porDefecto: {
      textoIzquierda: "Texto de la primera columna.",
      textoDerecha: "Texto de la segunda columna.",
      colorTexto: colors.tinta,
    },
    dibujar(contenido) {
      // La clase "columna-movil" se apila en móvil (media query del email).
      return `      <tr>
        <td style="padding:16px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="columna-movil" width="260" valign="top" style="width:260px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:23px; color:${contenido.colorTexto};">
                ${escapeHtml(contenido.textoIzquierda)}
              </td>
              <td width="16" style="width:16px; font-size:0; line-height:0;">&nbsp;</td>
              <td class="columna-movil" width="260" valign="top" style="width:260px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:23px; color:${contenido.colorTexto};">
                ${escapeHtml(contenido.textoDerecha)}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    },
  },

  separador: {
    etiqueta: "Separador",
    icono: icons.separador,
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
    icono: icons.pie,
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
        <td align="center" style="background-color:${colors.lavandaClaro}; padding:26px 32px;">
          <p style="margin:0 0 10px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px; color:${colors.tintaSuave};">
            ${escapeHtml(contenido.datos)}
          </p>
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px;">
            <a href="${escapeHtml(contenido.enlaceBaja)}" style="color:${colors.lavandaFuerte}; text-decoration:underline;">${escapeHtml(contenido.textoBaja)}</a>
          </p>
        </td>
      </tr>`;
    },
  },

};

/* El orden en que se muestran los bloques en la columna izquierda. */
const blockOrder = ["cabecera", "texto", "boton", "imagen", "columnas", "separador", "pie"];

/* ============================================================
   ESTADO DE LA APP
   ------------------------------------------------------------
   emailBlocks: lista de bloques que la usuaria añadió.
   Cada elemento es { id, tipo, contenido }.
   selectedId: el id del bloque que se está editando.
   idCounter: para dar un id único a cada bloque nuevo.
   emailSettings: colores generales del email (marco y fondo).
   ============================================================ */
let emailBlocks = [];
let selectedId = null;
let idCounter = 0;

const emailSettings = {
  // color del marco exterior (lo que rodea al email de 600px)
  colorMarco: "#d8cef0",
  // color de fondo del email en sí (la zona de 600px con el contenido)
  colorFondo: "#ffffff",
};

/* Referencias a los elementos del DOM que se usan a menudo. */
const availableBlocksList = document.getElementById("lista-bloques-disponibles");
const canvasMail = document.getElementById("lienzo-mail");
const canvasEmpty = document.getElementById("lienzo-vacio");
const blockEditor = document.getElementById("editor-bloque");
const editorNoSelection = document.getElementById("editor-sin-seleccion");

/* ============================================================
   COLUMNA 1 — pintar la lista de bloques disponibles
   ============================================================ */
function renderAvailableBlocks() {
  blockOrder.forEach((tipo) => {
    const definicion = blockTypes[tipo];
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "bloque-disponible";
    boton.innerHTML = `<span class="icono">${definicion.icono}</span> ${definicion.etiqueta}`;
    boton.addEventListener("click", () => addBlock(tipo));
    availableBlocksList.appendChild(boton);
  });
}

/* ============================================================
   AÑADIR / BORRAR / MOVER bloques del email
   ============================================================ */
function addBlock(tipo) {
  idCounter += 1;
  const definicion = blockTypes[tipo];
  const nuevoBloque = {
    id: idCounter,
    tipo: tipo,
    // copia de los valores por defecto, para no compartir referencia
    contenido: Object.assign({}, definicion.porDefecto),
  };
  emailBlocks.push(nuevoBloque);
  selectedId = nuevoBloque.id;
  renderEmail();
  renderEditor();
}

function deleteBlock(id) {
  emailBlocks = emailBlocks.filter((bloque) => bloque.id !== id);
  if (selectedId === id) {
    selectedId = null;
  }
  renderEmail();
  renderEditor();
}

function moveBlock(id, direccion) {
  const posicion = emailBlocks.findIndex((bloque) => bloque.id === id);
  const posicionDestino = posicion + direccion;
  if (posicionDestino < 0 || posicionDestino >= emailBlocks.length) {
    return;
  }
  // intercambia el bloque con su vecino
  const bloqueMovido = emailBlocks[posicion];
  emailBlocks[posicion] = emailBlocks[posicionDestino];
  emailBlocks[posicionDestino] = bloqueMovido;
  renderEmail();
}

/* Pide vaciar: si hay bloques, abre el modal de confirmación.
   El vaciado real lo hace confirmClear(), al pulsar "Sí". */
function requestClearEmail() {
  if (emailBlocks.length === 0) {
    return;
  }
  confirmModal.hidden = false;
}

function confirmClear() {
  emailBlocks = [];
  selectedId = null;
  confirmModal.hidden = true;
  renderEmail();
  renderEditor();
}

/* ============================================================
   COLUMNA 2 — pintar el email montado (vista previa)
   ============================================================ */
function renderEmail() {
  canvasMail.innerHTML = "";
  canvasEmpty.hidden = emailBlocks.length > 0;

  // el marco de la vista previa usa el color elegido en los ajustes
  canvasMail.style.backgroundColor = emailSettings.colorMarco;

  emailBlocks.forEach((bloque, indice) => {
    const definicion = blockTypes[bloque.tipo];

    const contenedorBloque = document.createElement("div");
    contenedorBloque.className = "bloque-en-email";
    if (bloque.id === selectedId) {
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
        `style="background-color:${emailSettings.colorFondo}; border-radius:6px; overflow:hidden;">` +
        definicion.dibujar(bloque.contenido) +
        `</table>`;
    }
    contenedorBloque.appendChild(vistaPrevia);

    // barra de acciones: subir, bajar, borrar
    const acciones = document.createElement("div");
    acciones.className = "bloque-acciones";

    const botonSubir = createActionButton(actionIcons.subir, "Subir", () => moveBlock(bloque.id, -1));
    botonSubir.disabled = indice === 0;
    const botonBajar = createActionButton(actionIcons.bajar, "Bajar", () => moveBlock(bloque.id, 1));
    botonBajar.disabled = indice === emailBlocks.length - 1;
    const botonBorrar = createActionButton(actionIcons.borrar, "Borrar", () => deleteBlock(bloque.id));
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
      selectedId = bloque.id;
      renderEmail();
      renderEditor();
    });

    canvasMail.appendChild(contenedorBloque);
  });
}

function createActionButton(iconSvg, titulo, onClick) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "bloque-accion";
  boton.innerHTML = iconSvg;
  boton.title = titulo;
  boton.setAttribute("aria-label", titulo);
  boton.addEventListener("click", onClick);
  return boton;
}

/* ============================================================
   COLUMNA 3 — pintar el editor del bloque seleccionado
   ============================================================ */
function renderEditor() {
  blockEditor.innerHTML = "";

  const bloque = emailBlocks.find((elemento) => elemento.id === selectedId);
  if (!bloque) {
    blockEditor.appendChild(editorNoSelection);
    editorNoSelection.hidden = false;
    return;
  }

  const definicion = blockTypes[bloque.tipo];

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

      const colorPicker = document.createElement("input");
      colorPicker.type = "color";
      colorPicker.id = idCampo;
      colorPicker.value = bloque.contenido[campo.clave];

      const hexField = document.createElement("input");
      hexField.type = "text";
      hexField.className = "hex-texto";
      hexField.maxLength = 7;
      hexField.spellcheck = false;
      hexField.setAttribute("aria-label", `Hex de ${campo.etiqueta}`);
      hexField.value = bloque.contenido[campo.clave];

      connectColorField(colorPicker, hexField, (color) => {
        bloque.contenido[campo.clave] = color;
        renderEmail();
      });

      fila.appendChild(colorPicker);
      fila.appendChild(hexField);
      contenedorCampo.appendChild(fila);
      blockEditor.appendChild(contenedorCampo);
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
    blockEditor.appendChild(contenedorCampo);
  });
}

/* ============================================================
   GENERAR EL HTML FINAL DEL EMAIL
   ------------------------------------------------------------
   Arma el .html completo: doctype XHTML, cabecera con charset y
   viewport, el <style> con la media query de móvil, el
   preheader oculto y las dos tablas anidadas con los bloques.
   ============================================================ */
function generateEmailHtml() {
  // las filas <tr> de todos los bloques, una tras otra
  const filasBloques = emailBlocks
    .map((bloque) => blockTypes[bloque.tipo].dibujar(bloque.contenido))
    .join("\n");

  // colores del email elegidos en el panel de ajustes
  const marco = emailSettings.colorMarco;
  const fondo = emailSettings.colorFondo;

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
const modalBackdrop = document.getElementById("modal-fondo");
const codeOutput = document.getElementById("salida-codigo");
const copiedNotice = document.getElementById("aviso-copiado");

/* Modal de confirmación al vaciar (lo usa requestClearEmail). */
const confirmModal = document.getElementById("modal-confirmar");

function openCodeModal() {
  if (emailBlocks.length === 0) {
    window.alert("Añade al menos un bloque antes de generar el código.");
    return;
  }
  codeOutput.textContent = generateEmailHtml();
  copiedNotice.hidden = true;
  modalBackdrop.hidden = false;
}

function closeCodeModal() {
  modalBackdrop.hidden = true;
}

function copyCode() {
  const codigo = codeOutput.textContent;
  navigator.clipboard.writeText(codigo).then(
    () => {
      copiedNotice.hidden = false;
    },
    () => {
      window.alert("No se pudo copiar automáticamente. Selecciona el código y cópialo a mano.");
    }
  );
}

/* ============================================================
   PANEL DE AJUSTES DEL EMAIL — colores de marco y fondo
   ============================================================ */
function connectEmailSettings() {
  connectColorField(
    document.getElementById("ajuste-marco"),
    document.getElementById("hex-marco"),
    (color) => {
      emailSettings.colorMarco = color;
      renderEmail();
    }
  );
  connectColorField(
    document.getElementById("ajuste-fondo"),
    document.getElementById("hex-fondo"),
    (color) => {
      emailSettings.colorFondo = color;
      renderEmail();
    }
  );
}

/* ============================================================
   ARRANQUE: conectar los eventos y pintar la app
   ============================================================ */
document.getElementById("boton-ver-codigo").addEventListener("click", openCodeModal);
document.getElementById("boton-cerrar-modal").addEventListener("click", closeCodeModal);
document.getElementById("boton-copiar").addEventListener("click", copyCode);
document.getElementById("boton-vaciar").addEventListener("click", requestClearEmail);

// botones del modal de confirmación de vaciado
document.getElementById("boton-confirmar-vaciar").addEventListener("click", confirmClear);
document.getElementById("boton-cancelar-vaciar").addEventListener("click", () => {
  confirmModal.hidden = true;
});

// cerrar cualquier modal al pulsar fuera de él
modalBackdrop.addEventListener("click", (evento) => {
  if (evento.target === modalBackdrop) {
    closeCodeModal();
  }
});
confirmModal.addEventListener("click", (evento) => {
  if (evento.target === confirmModal) {
    confirmModal.hidden = true;
  }
});

// cerrar el modal abierto con la tecla Escape
document.addEventListener("keydown", (evento) => {
  if (evento.key !== "Escape") {
    return;
  }
  if (!modalBackdrop.hidden) {
    closeCodeModal();
  }
  if (!confirmModal.hidden) {
    confirmModal.hidden = true;
  }
});

connectEmailSettings();
renderAvailableBlocks();
renderEmail();
renderEditor();
