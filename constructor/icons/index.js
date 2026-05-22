/* ============================================================
   Line SVG icons for the constructor UI.
   These are inline SVGs used only in the interface, never in the
   email. wrapIcon() wraps the path content with the common <svg>
   attributes; size is configurable because block icons (sidebar)
   and action icons (small buttons) need different dimensions.
   ============================================================ */
function wrapIcon(paths, size = 18) {
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${paths}</svg>`
  );
}

// Iconos de los bloques disponibles (columna izquierda, 18px).
export const icons = {
  // cabecera: una franja superior sobre un panel
  cabecera: wrapIcon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>'),
  // texto: tres líneas de párrafo
  texto: wrapIcon('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>'),
  // botón: un rectángulo redondeado pequeño centrado
  boton: wrapIcon('<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M9 12h6"/>'),
  // imagen: marco con sol y montaña
  imagen: wrapIcon('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="M21 16l-5-5L5 21"/>'),
  // columnas: dos paneles lado a lado
  columnas: wrapIcon('<rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/>'),
  // separador: una línea horizontal
  separador: wrapIcon('<path d="M4 12h16"/>'),
  // pie: una franja inferior sobre un panel
  pie: wrapIcon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/>'),
  // lista: tres viñetas con sus líneas
  lista: wrapIcon('<circle cx="5" cy="7" r="1.4"/><circle cx="5" cy="12" r="1.4"/><circle cx="5" cy="17" r="1.4"/><path d="M10 7h10"/><path d="M10 12h10"/><path d="M10 17h10"/>'),
  // tarjeta: marco con una franja de imagen arriba y líneas de texto
  tarjeta: wrapIcon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 11h18"/><path d="M7 15h7"/>'),
  // cita: comillas grandes
  cita: wrapIcon('<path d="M7 7C5 8 4 10 4 13v4h6v-7H6"/><path d="M17 7c-2 1-3 3-3 6v4h6v-7h-4"/>'),
};

// Iconos de los botones de acción de cada bloque (subir, bajar,
// borrar). Van en botones pequeños de 24px, así que el SVG es 14px.
export const actionIcons = {
  // subir: flecha hacia arriba
  subir: wrapIcon('<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>', 14),
  // bajar: flecha hacia abajo
  bajar: wrapIcon('<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/>', 14),
  // borrar: una equis
  borrar: wrapIcon('<path d="M6 6l12 12"/><path d="M18 6L6 18"/>', 14),
};
