# Proyecto: emails / Constructor de emails

## Idioma del código: identificadores en inglés

Los **nombres de funciones y variables** van SIEMPRE en inglés, con nombres
claros y descriptivos. Nunca en español.

- ✅ `openCodeModal`, `renderEmail`, `emailBlocks`, `escapeHtml`, `isValidHex`
- ❌ `abrirModalCodigo`, `renderEmail` mezclado con `emailEnConstruccion`,
  `escaparHtml`, `esHexValido`

Aplica al crear código nuevo y al refactorizar: si encuentro un identificador
en español, lo paso a inglés.

Excepciones (de momento, por no ser un cambio masivo):
- Los **comentarios** pueden seguir en español — son para la usuaria.
- Las **claves de los objetos de datos** (`blockTypes`, los campos `etiqueta`,
  `campos`, `porDefecto`, `dibujar`, los tipos `cabecera`/`texto`/...) y los
  **`id` del HTML/CSS** siguen en español por ahora. Si se renombran, hay que
  hacerlo de forma coordinada en `index.html`, `constructor.css` y el `.js`.

Recordatorio global vigente: nombres de variables siempre palabras completas,
nunca de una sola letra ni abreviaturas crípticas (`event`, no `e`; `index`,
no `i`).

## Mantener PROYECTO.md al día

Cada vez que se haga una implementación nueva o un cambio relevante
(bloque nuevo, archivo nuevo, decisión de arquitectura, funcionalidad
añadida), actualizar `PROYECTO.md` en el mismo trabajo, sin preguntar.

- Hacerlo siempre, como parte de terminar la tarea — no es opcional ni
  hay que pedir permiso para ello.
- Tocar la sección que corresponda: árbol de archivos, lista de bloques
  del constructor, decisiones de diseño, estado actual, etc.
- No registrar cambios triviales (un ajuste de CSS, renombrar una
  variable): solo lo que cambia QUÉ hace el proyecto o CÓMO está montado.

## Estructura del constructor

`constructor/`
- `index.html` — estructura de la herramienta (3 columnas + modales).
- `constructor.css` — estilos de la APP (no de los emails generados).
- `constructor.js` — lógica: estado, render de columnas, generación del HTML.
- `icons/index.js` — iconos SVG inline de los botones de bloque. Exporta
  `icons`. Son solo para la interfaz, nunca van dentro del email generado.
