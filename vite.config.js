import { defineConfig } from "vite";
import { readFile, mkdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";

// --- Fragmentos HTML reutilizables (header, footer) ---
// Para no repetir el header y el footer en cada página, se guardan una
// sola vez en partials/ y se insertan con un marcador en el HTML:
//
//   <!--#include partials/footer.html-->
//
// El plugin htmlIncludes() sustituye ese marcador por el contenido del
// fragmento, tanto en dev como en build. Dentro de los fragmentos, el
// marcador {{base}} se reemplaza por la ruta relativa a la raíz: vacío
// para páginas en la raíz y "../" para las de una subcarpeta. Así un
// mismo fragmento sirve para la portada y para las páginas de bloque.
function htmlIncludes() {
  const includePattern = /<!--#include\s+([^\s]+?)\s*-->/g;

  // Resuelve los <!--#include--> de un HTML. pagePath es la ruta de la
  // página que se está procesando, para calcular su {{base}}.
  async function resolveIncludes(html, pagePath) {
    // depth = cuántas carpetas hay entre la página y la raíz
    const depth = pagePath.split("/").length - 1;
    const base = "../".repeat(depth);

    const matches = [...html.matchAll(includePattern)];
    for (const match of matches) {
      const partialPath = join(process.cwd(), match[1]);
      let partial = await readFile(partialPath, "utf-8");
      partial = partial.replaceAll("{{base}}", base);
      html = html.replace(match[0], partial.trimEnd());
    }
    return html;
  }

  return {
    name: "html-includes",
    // DEV: resuelve los includes al servir cada página.
    transformIndexHtml: {
      order: "pre",
      async handler(html, context) {
        // context.path llega como "/01-fundamentos/index.html"
        return resolveIncludes(html, context.path.replace(/^\//, ""));
      },
    },
  };
}

// Vite se usa como servidor de desarrollo (recarga en vivo) y para el
// build que despliega Vercel. La doc y los visores son HTML5 normal y
// Vite sí los procesa; las plantillas de email NO (su doctype XHTML).

// Las plantillas de email usan el doctype XHTML 1.0 Transitional (obligatorio
// en email, ver Bloque 01). El parser HTML5 de Vite rechaza ese doctype, así
// que las tratamos aparte: en dev las sirve un middleware crudo y en build
// se copian tal cual al dist/. Los visores (plantillas/*-preview.html) SÍ
// son HTML5 normal y pasan por Vite con normalidad.

// --- Plantillas de email que no procesa Vite (se copian crudas) ---
const emailTemplates = [
  "plantillas/newsletter.html",
  "plantillas/transaccional.html",
];

// --- Páginas que Vite SÍ procesa: son las entradas del build ---
const processedPages = {
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
      for (const templatePath of emailTemplates) {
        const source = join(process.cwd(), templatePath);
        const target = join(process.cwd(), "dist", templatePath);
        await mkdir(dirname(target), { recursive: true });
        await copyFile(source, target);
      }
    },
  };
}

export default defineConfig({
  root: ".",
  plugins: [htmlIncludes(), serveRawTemplates(), copyEmailTemplates()],
  server: {
    open: "/index.html",
  },
  build: {
    rollupOptions: {
      input: processedPages,
    },
  },
});
