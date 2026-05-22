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

## Estructura del constructor

`constructor/`
- `index.html` — estructura de la herramienta (3 columnas + modales).
- `constructor.css` — estilos de la APP (no de los emails generados).
- `constructor.js` — lógica: estado, render de columnas, generación del HTML.
- `icons/index.js` — iconos SVG inline de los botones de bloque. Exporta
  `icons`. Son solo para la interfaz, nunca van dentro del email generado.
