# Proyecto: Remite — doc de aprendizaje + plantillas de emails HTML

> El proyecto se llama **Remite** (juego con "remitir / remitente"). Es el
> nombre que aparece en el logo y los títulos. "Emails HTML" se usa solo
> como descripción de lo que es, no como nombre.

> Documento de contexto. Léelo al empezar para saber qué es este proyecto,
> de dónde viene y qué hay que hacer.

## Qué es este proyecto

Un proyecto para **aprender a crear emails HTML** y a la vez tener
**plantillas reutilizables**. Tiene dos partes:

1. **Doc de aprendizaje** — páginas HTML por bloques que explican cómo se
   construye un email HTML, muy visual, con ejemplos. Estilo "documentación
   en español".
2. **Plantillas reales** — emails de ejemplo ya montados (newsletter,
   transaccional) listos para adaptar.

La usuaria va a crear emails en su trabajo, todavía no está definido si
serán newsletters de marketing, transaccionales (confirmaciones, recuperar
contraseña, facturas) o ambos — así que la doc debe cubrir lo general.

## De dónde viene

Es un proyecto **hermano** de `www/bootstrap/`, que es una doc visual de
Bootstrap 5 en español que la usuaria montó antes (paleta pastel lavanda +
melocotón, páginas por bloques con ejemplo + código). Este proyecto de
emails replica esa filosofía (doc por bloques, muy visual, en español) pero
es **independiente**: su propia carpeta, su propio git, su propio deploy.

## Decisiones ya tomadas

- **HTML con tablas a mano**, sin herramientas tipo MJML/Maizzle. Es más
  tedioso pero la usuaria quiere APRENDER cómo funciona un email por dentro.
  Más adelante, si quiere, se puede introducir una herramienta.
- **Vite SOLO como servidor de desarrollo.** Se usa `npm run dev` para tener
  recarga en vivo mientras se edita la doc. NO hay build ni bundling: la doc y
  las plantillas siguen siendo `.html` autocontenidos, sin procesar. Un email
  de la carpeta `plantillas/` debe poder copiarse tal cual y funcionar sin
  Vite. (Decisión revisada: el PROYECTO original decía "sin Vite ni npm";
  se añadió Vite por comodidad del dev server, manteniendo el HTML plano.)
  - **Detalle técnico:** las plantillas usan el doctype XHTML 1.0 Transitional
    (obligatorio en email). El parser HTML5 de Vite rechaza ese doctype y
    devuelve error 500. Por eso `vite.config.js` lleva un plugin
    (`serveRawTemplates`) que sirve `plantillas/*.html` tal cual, sin
    transformarlas. Si se añaden plantillas nuevas, esto las cubre solas.
- **Idioma: español.** Todo el contenido y las explicaciones en español.
- **Nombres de variables**: palabras completas, nunca de una sola letra
  (regla global de la usuaria).
- **Git**: nunca hacer commit ni push sin que la usuaria lo pida
  explícitamente (regla global).

## Paleta de colores

Paleta pastel **lavanda + melocotón**, heredada en espíritu del proyecto
hermano de Bootstrap. Se usa tanto en la doc como en las plantillas. Los
colores van siempre en hexadecimal de 6 dígitos (regla de email, ver Bloque
03).

| Nombre            | Hex       | Uso típico                                 |
|-------------------|-----------|--------------------------------------------|
| Lavanda fuerte    | `#8b76c4` | Acentos, cabeceras, enlaces, botón primario |
| Lavanda           | `#d8cef0` | Fondos de la tabla exterior, bordes suaves  |
| Lavanda claro     | `#f3f0fb` | Fondos de pie, cajas, separadores           |
| Lavanda texto     | `#5a4a8a` | Texto sobre fondos lavanda claro            |
| Melocotón fuerte  | `#e0916a` | Acento cálido, botón secundario             |
| Melocotón         | `#f5cbb0` | Detalles cálidos                            |
| Melocotón claro   | `#fdf0e7` | Fondos de bloques destacados (CTA)          |
| Tinta             | `#3a3550` | Texto principal                             |
| Tinta suave       | `#6b6580` | Texto secundario / apoyo                    |
| Fondo             | `#faf8fd` | Fondo general de las páginas de doc         |
| Blanco            | `#ffffff` | Fondo del email / tarjetas                  |
| Borde             | `#e7e2f2` | Bordes y líneas divisorias                  |

## Por qué los emails HTML son "raros" (contexto técnico clave)

Los clientes de correo (Outlook, Gmail, Apple Mail) renderizan HTML de
forma muy limitada y anticuada. Por eso:

- Se maquetan con `<table>` anidadas, NO con flexbox ni grid.
- El CSS va **inline** (atributo `style=""` en cada etiqueta), porque muchos
  clientes ignoran o eliminan los `<style>` y los CSS externos.
- Anchura típica fija: ~600px.
- Outlook usa el motor de Word para renderizar — el peor caso, requiere
  trucos específicos (comentarios condicionales `<!--[if mso]>`).
- No hay `position`, poco `margin` fiable (mejor `padding` en celdas), etc.

## Estructura del proyecto

```
emails/
├── PROYECTO.md            ← este archivo
├── README.md
├── package.json           ← scripts del dev server (npm run dev)
├── vite.config.js         ← config de Vite (solo dev server)
├── index.html             ← portada / índice (HECHO)
├── 01-fundamentos/        ← por qué los emails son raros, doctype, estructura mínima (HECHO)
├── 02-estructura/         ← layout con tablas anidadas, el ancho de 600px (HECHO)
├── 03-estilos/            ← CSS inline, por qué no hay clases, fuentes, colores (HECHO)
├── 04-botones-imagenes/   ← botones bulletproof e imágenes en email (HECHO)
├── 05-dark-mode/          ← dark mode en email, prefers-color-scheme (HECHO)
├── 06-testing/            ← testing en clientes, checklist, anti-spam (HECHO)
├── 07-preheader-accesibilidad/  ← preheader y accesibilidad en email (HECHO)
├── partials/              ← fragmentos HTML reutilizables (header, footer)
│   ├── header-portada.html ← cabecera con navbar (portada y bloques de doc)
│   ├── header-bloque.html  ← cabecera solo con logo (solo el constructor)
│   └── footer.html         ← pie del sitio
├── constructor/           ← herramienta visual para montar emails (HECHO)
│   ├── index.html         ← interfaz del constructor
│   ├── constructor.css    ← estilos de la herramienta
│   ├── constructor.js     ← lógica: bloques, editor, generar HTML
│   └── icons/index.js     ← iconos SVG inline de la interfaz del constructor
└── plantillas/            ← emails reales listos para adaptar
    ├── newsletter.html              ← email de marketing (HECHO)
    ├── newsletter-preview.html      ← visor del email (barra + iframe)
    ├── transaccional.html           ← recuperar contraseña (HECHO)
    ├── transaccional-preview.html   ← visor del email (barra + iframe)
    ├── visor.css                    ← estilos compartidos de los visores
    └── visor.js                     ← lógica compartida de los visores
```

El header y el footer se escriben una sola vez en `partials/` y se insertan
en cada página con un marcador `<!--#include partials/footer.html-->`. Un
plugin propio de Vite (`htmlIncludes` en `vite.config.js`) lo sustituye por
el contenido real, en dev y en build. Dentro de los fragmentos, el marcador
`{{base}}` se reemplaza por la ruta relativa a la raíz según la profundidad
de la página. Así un mismo fragmento sirve para la portada y las subpáginas.

Los `*-preview.html` son **páginas visor**, no emails: envuelven la plantilla
en un `<iframe>` y le añaden una barra con breadcrumb para volver al índice.
La portada enlaza al visor ("Ver preview"); el visor enlaza al email solo.
Así el email (`newsletter.html`, `transaccional.html`) queda 100% limpio y
copiable, sin nada de navegación dentro.

El visor también tiene un botón **"Ver el código"** que abre un modal para
copiar el HTML de la plantilla. El código se lee del archivo `.html` real
con `fetch()` (una sola fuente de la verdad: lo mostrado siempre coincide
con el email). Por eso el visor necesita un servidor — `npm run dev` — y no
funciona abriendo el archivo suelto. Los dos visores comparten `visor.css`
y `visor.js`; cada uno indica qué plantilla leer con `data-plantilla` en el
`<body>`.

## Plan de arranque (COMPLETADO)

El plan inicial está terminado. Para referencia:

1. ✅ **Portada `index.html`** — índice visual de los bloques y plantillas.
2. ✅ **Bloque 01 — Fundamentos**: qué hace raro a un email, el doctype de
   email, la estructura HTML mínima de un email.
3. ✅ **Bloque 02 — Estructura con tablas**: tabla exterior centrada, tabla de
   contenido de 600px, celdas, anidación.
4. ✅ **Bloque 03 — Estilos**: CSS inline, por qué no usar clases, fuentes
   web-safe, colores, padding en celdas.
5. ✅ **Plantilla newsletter** en `plantillas/`.
6. ✅ **Plantilla transaccional** en `plantillas/` (recuperar contraseña).

## Ampliaciones futuras (cuando lo básico esté)

- ✅ Botones "bulletproof" e imágenes en email — hechos en el Bloque 04.
- ✅ Dark mode en email — hecho en el Bloque 05.
- ✅ Testing de emails y anti-spam — hechos en el Bloque 06.
- ✅ Preheader y accesibilidad — hechos en el Bloque 07.
- ✅ Constructor visual de emails — hecho en `constructor/`.
- Más plantillas (confirmación de pedido, factura, bienvenida).

## El constructor de emails

`constructor/` es una herramienta visual: la usuaria añade bloques, los
edita en un panel y la herramienta genera el HTML del email para copiar y
pegar.

Bloques disponibles (10): cabecera con logo, texto, lista, cita destacada,
botón, imagen, tarjeta de artículo, dos columnas, separador y pie. Cada
tipo se define en `blockTypes` (constructor.js): sus campos editables, sus
valores por defecto y una función `dibujar()` que devuelve el HTML del
bloque para el email final.

El panel "Ajustes del email" tiene controles globales que afectan a todo
el email: color del marco exterior, color de fondo, **fuente** y **texto
de vista previa (preheader)**. La fuente se elige de un selector con
tipografías web-safe y se aplica a todo el texto del email. El preheader
es el texto que se ve en la bandeja de entrada junto al asunto: la usuaria
lo escribe en un campo y se inserta oculto en el HTML generado.

Decisiones de diseño:

- **El JavaScript está SOLO en la herramienta**, nunca en los emails que
  genera. El HTML que produce sigue siendo tablas + CSS inline, sin JS —
  cumple las reglas de email del proyecto.
- El HTML generado aplica todo lo de la documentación: doctype XHTML,
  tablas anidadas, CSS inline, botón bulletproof con `[if mso]`, preheader,
  media query de móvil.
- Los iconos de la interfaz (botones de bloque, acciones subir/bajar/borrar)
  son SVG inline definidos en `constructor/icons/index.js`. Son solo para la
  herramienta — nunca van dentro del email generado.
- El selector de fuente solo ofrece tipografías **web-safe** (Arial,
  Georgia, Verdana, Tahoma, Times New Roman, Trebuchet MS, Courier New),
  definidas en el objeto `fuentes` de `constructor.js`. Son las que vienen
  preinstaladas en la mayoría de sistemas, así que se ven igual en todos
  los clientes de correo. Cada una lleva un "stack" con fuentes de reserva.
  NO se ofrecen fuentes personalizadas (Google Fonts, etc.): no cargan en
  Outlook y muchos clientes, romperían el diseño (ver Bloque 03).
- Estado por fases: **Fase 1 (hecha)** = añadir, editar y reordenar bloques
  con botones ↑↓ + generar código. **Fase 2 (pendiente)** = drag & drop
  para reordenar arrastrando con el ratón.

## Estado actual

El plan de arranque está completo: portada, los tres bloques de doc y las
dos plantillas (newsletter y transaccional) están hechos y funcionando.
También se añadió Vite como dev server y se hizo `git init`.

Añadido después: el **Bloque 04 — Botones e imágenes** (botones bulletproof
con comentarios condicionales para Outlook, e imágenes con ruta absoluta,
alt y adaptables), el **Bloque 05 — Dark mode** (comportamiento de los
clientes, defensa al diseñar y la media query prefers-color-scheme) y el
**Bloque 06 — Testing y envío** (testing manual y con herramientas,
checklist antes de enviar y buenas prácticas anti-spam) y el **Bloque 07 —
Preheader y accesibilidad** (el texto de vista previa de la bandeja y un
repaso de la accesibilidad en email).

También se añadió el **constructor visual de emails** (`constructor/`,
ver sección propia más arriba), probado y funcionando en el navegador.

Lo siguiente que queda en la lista de ampliaciones: más plantillas
(confirmación de pedido, factura, bienvenida) y la Fase 2 del constructor
(drag & drop).
