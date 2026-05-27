import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { gzipSync, brotliCompressSync } from "zlib";

function compressPlugin() {
  return {
    name: "compress-plugin",
    apply: "build" as const,
    enforce: "post" as const,
    generateBundle(this: any, _: any, bundle: any) {
      for (const fileName in bundle) {
        const asset = bundle[fileName];
        let code: any;
        if (asset.type === "asset") {
          code = asset.source;
        } else if (asset.type === "chunk") {
          code = asset.code;
        } else {
          continue;
        }

        const buffer = typeof code === "string" ? Buffer.from(code, "utf-8") : code;
        if (buffer && buffer.length > 500) {
          try {
            const gzipped = gzipSync(buffer);
            this.emitFile({
              type: "asset",
              fileName: `${fileName}.gz`,
              source: gzipped,
            });

            const brotli = brotliCompressSync(buffer);
            this.emitFile({
              type: "asset",
              fileName: `${fileName}.br`,
              source: brotli,
            });
          } catch (err) {
            console.error(`Compression failed for ${fileName}:`, err);
          }
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
    tsConfigPaths(),
    compressPlugin(),
  ],
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor";
          }
          if (
            id.includes("node_modules/@tanstack/react-router") ||
            id.includes("node_modules/@tanstack/router-core") ||
            id.includes("node_modules/@tanstack/history") ||
            id.includes("node_modules/@tanstack/store")
          ) {
            return "tanstack-router";
          }
          if (id.includes("routes/cartilla/maestro") || id.includes("components/maestro")) {
            if (id.includes("analitica")) return "route-analitica";
            if (id.includes("autoria")) return "route-autoria";
            return "route-maestro";
          }
          if (id.includes("routes/cartilla/alumno") || id.includes("components/alumno")) {
            return "route-alumno";
          }
          if (id.includes("routes/cartilla/familia") || id.includes("components/familia")) {
            return "route-familia";
          }
          if (id.includes("routes/cartilla/binder") || id.includes("components/print")) {
            return "route-binder";
          }
          if (id.includes("routes/cartilla/kiosko") || id.includes("components/kiosko")) {
            return "route-kiosko";
          }
          if (id.includes("content/") || id.includes("lesson-catalog") || id.includes("seed")) {
            return "content-bundle";
          }
        },
      },
    },
  },
});
