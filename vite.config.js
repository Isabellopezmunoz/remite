import { defineConfig } from "vite";
import { readFile, mkdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";

// Vite se usa como servidor de desarrollo (recarga en vivo) y para el
// build que despliega Vercel. La doc y los visores son HTML5 normal y
// Vite sí los procesa; las plantillas de email NO (su doctype XHTML).

// Las plantillas de email usan el doctype XHTML 1.0 Transitional (obligatorio
// en email, ver Bloque 01). El parser HTML5 de Vite rechaza ese doctype, así
// que las tratamos aparte: en dev las sirve un middleware crudo y en build
// se copian tal cual al dist/. Los visores (plantillas/*-preview.html) SÍ
// son HTML5 normal y pasan por Vite con normalidad.

// --- Plantillas de email que no procesa Vite (se copian crudas) ---
const plantillasEmail = [
  "plantillas/newsletter.html",
  "plantillas/transaccional.html",
];

// --- Páginas que Vite SÍ procesa: son las entradas del build ---
const paginasProcesadas = {
  index: "index.html",
  fundamentos: "01-fundamentos/index.html",
  estructura: "02-estructura/index.html",
  estilos: "03-estilos/index.html",
  botonesImagenes: "04-botones-imagenes/index.html",
  darkMode: "05-dark-mode/index.html",
  testing: "06-testing/index.html",
  preheaderAccesibilidad: "07-preheader-accesibilidad/index.html",
  constructor: "constructor/index.html",
  newsletterPreview: "plantillas/newsletter-preview.html",
  transaccionalPreview: "plantillas/transaccional-preview.html",
};

// DEV: sirve las plantillas de email crudas, sin que Vite las transforme.
function serveRawTemplates() {
  return {
    name: "serve-raw-templates",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = (request.url || "").split("?")[0];
        const isEmailTemplate =
          path.startsWith("/plantillas/") &&
          path.endsWith(".html") &&
          !path.endsWith("-preview.html");
        if (isEmailTemplate) {
          try {
            const file = join(process.cwd(), path);
            const content = await readFile(file, "utf-8");
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(content);
            return;
          } catch {
            // Si no existe, deja que Vite responda con su 404 normal.
          }
        }
        next();
      });
    },
  };
}

// BUILD: copia las plantillas de email crudas al dist/, sin procesarlas.
// Así conservan su doctype XHTML intacto y funcionan en producción.
function copyEmailTemplates() {
  return {
    name: "copy-email-templates",
    async closeBundle() {
      for (const ruta of plantillasEmail) {
        const origen = join(process.cwd(), ruta);
        const destino = join(process.cwd(), "dist", ruta);
        await mkdir(dirname(destino), { recursive: true });
        await copyFile(origen, destino);
      }
    },
  };
}

export default defineConfig({
  root: ".",
  plugins: [serveRawTemplates(), copyEmailTemplates()],
  server: {
    open: "/index.html",
  },
  build: {
    rollupOptions: {
      input: paginasProcesadas,
    },
  },
});
