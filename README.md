# Remite

**Remite** es un proyecto para aprender a crear emails HTML y tener
plantillas reutilizables. El nombre juega con "remitir / remitente".

Tiene dos partes:

- **Doc de aprendizaje** — páginas por bloques que explican cómo se construye
  un email HTML, en español y muy visual.
- **Plantillas** — emails de ejemplo listos para adaptar (carpeta `plantillas/`).

## Cómo abrirlo

Es HTML plano. Puedes abrir cualquier `.html` directamente en el navegador.

Para desarrollar con recarga en vivo:

```
npm install
npm run dev
```

Vite se usa **solo como servidor de desarrollo**, no hay build: las páginas y
las plantillas son `.html` autocontenidos y funcionan sin Vite.

## Estructura

```
emails/
├── index.html         portada / índice
├── 01-fundamentos/     por qué los emails son distintos
├── 02-estructura/      maquetación con tablas
├── 03-estilos/         CSS inline y estilos
├── plantillas/         emails reales reutilizables
├── package.json        scripts (npm run dev)
└── vite.config.js      config del dev server
```

Ver `PROYECTO.md` para el contexto completo y el plan.
