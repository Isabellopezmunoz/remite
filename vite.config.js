import { defineConfig } from "vite";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Vite se usa SOLO como servidor de desarrollo (recarga en vivo).
// No hay build ni bundling: la doc y las plantillas son .html autocontenidos.
// Por eso este proyecto no tiene "build" en los scripts de package.json.

// Las plantillas de email usan el doctype XHTML 1.0 Transitional (obligatorio
// en email, ver Bloque 01). El parser HTML5 de Vite rechaza ese doctype, así
// que este plugin sirve los emails de plantillas/ tal cual, sin transformarlos:
// son .html que deben poder copiarse y funcionar sin Vite.
//
// Los visores (plantillas/*-preview.html) NO entran aquí: son HTML5 normal y
// se dejan pasar por Vite para que conserven la recarga en vivo.
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

export default defineConfig({
  root: ".",
  plugins: [serveRawTemplates()],
  server: {
    open: "/index.html",
  },
});
