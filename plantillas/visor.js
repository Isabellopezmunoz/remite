/* ============================================================
   Visor de plantillas — lógica compartida
   ------------------------------------------------------------
   Lo usan newsletter-preview.html y transaccional-preview.html.
   Lee el archivo .html de la plantilla con fetch() y lo muestra
   en un modal para copiar. Una sola fuente de la verdad: el
   código mostrado es siempre el del email real.

   Cada visor indica qué plantilla lee mediante el atributo
   data-plantilla del <body> (p. ej. "newsletter.html").
   ============================================================ */

const archivoPlantilla = document.body.dataset.plantilla;

const modalFondo = document.getElementById("modal-fondo");
const salidaCodigo = document.getElementById("salida-codigo");
const avisoCopiado = document.getElementById("aviso-copiado");

/* Guarda el código de la plantilla una vez leído, para no
   volver a pedir el archivo cada vez que se abre el modal. */
let codigoPlantilla = null;

/* ------------------------------------------------------------
   Abrir el modal: lee la plantilla (si no se leyó antes) y la
   muestra en el bloque de código.
   ------------------------------------------------------------ */
async function abrirModalCodigo() {
  avisoCopiado.hidden = true;

  if (codigoPlantilla === null) {
    salidaCodigo.textContent = "Cargando el código…";
    modalFondo.hidden = false;
    try {
      const respuesta = await fetch(archivoPlantilla);
      if (!respuesta.ok) {
        throw new Error("respuesta no válida");
      }
      codigoPlantilla = await respuesta.text();
    } catch (error) {
      salidaCodigo.textContent =
        "No se pudo leer la plantilla. Esto necesita un servidor: " +
        "ejecuta «npm run dev» y abre el visor desde ahí.";
      return;
    }
  }

  salidaCodigo.textContent = codigoPlantilla;
  modalFondo.hidden = false;
}

function cerrarModalCodigo() {
  modalFondo.hidden = true;
}

/* ------------------------------------------------------------
   Copiar el código al portapapeles.
   ------------------------------------------------------------ */
function copiarCodigo() {
  if (!codigoPlantilla) {
    return;
  }
  navigator.clipboard.writeText(codigoPlantilla).then(
    () => {
      avisoCopiado.hidden = false;
    },
    () => {
      window.alert(
        "No se pudo copiar automáticamente. Selecciona el código y cópialo a mano."
      );
    }
  );
}

/* ------------------------------------------------------------
   Conectar los eventos.
   ------------------------------------------------------------ */
document.getElementById("boton-ver-codigo").addEventListener("click", abrirModalCodigo);
document.getElementById("boton-cerrar-modal").addEventListener("click", cerrarModalCodigo);
document.getElementById("boton-copiar").addEventListener("click", copiarCodigo);

modalFondo.addEventListener("click", (evento) => {
  if (evento.target === modalFondo) {
    cerrarModalCodigo();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !modalFondo.hidden) {
    cerrarModalCodigo();
  }
});
