/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vitest" />
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, configDefaults } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { gzipSync, brotliCompressSync } from "zlib";

function compressPlugin() {
  return {
    name: "compress-plugin",
    apply: "build" as const,
    enforce: "post" as const,
    generateBundle(this: any, _: unknown, bundle: any) {
      for (const fileName in bundle) {
        const asset = bundle[fileName];
        let code: string | Uint8Array;
        if (asset.type === "asset") {
          code =
            typeof asset.source === "string"
              ? asset.source
              : new Uint8Array(asset.source);
        } else if (asset.type === "chunk") {
          code = asset.code;
        } else {
          continue;
        }

        const buffer =
          typeof code === "string" ? Buffer.from(code, "utf-8") : code;
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

export default defineConfig(({ mode }) => ({
  define: {
    // Open access (no login) is the shipped product decision, so this stays
    // "true" by default for every build, including production. It is only
    // overridable so the E2E lane can boot a second, login-gated server and
    // keep exercising the join-by-code screens, which are unreachable while
    // open access is on. Production never sets the variable.
    "import.meta.env.VITE_CRM_REVIEW": JSON.stringify(
      process.env.VITE_CRM_REVIEW ?? "true",
    ),
  },
  plugins: [
    // The tracked route tree is already committed. Worker/browser verification
    // uses --mode worker so dev startup cannot rewrite tracked generated files.
    ...(mode === "worker"
      ? []
      : [
          TanStackRouterVite({
            target: "react",
            autoCodeSplitting: true,
            routeFileIgnorePattern: "__tests__",
          }),
        ]),
    viteReact(),
    tailwindcss(),
    tsConfigPaths(),
    compressPlugin(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // Route-module tests can spend >5s transforming the full generated tree
    // under highly parallel/slow CI workers; keep the assertion timeout above
    // that startup cost without adding product-side sleeps.
    testTimeout: 25_000,
    hookTimeout: 180_000,
    // Playwright E2E specs live in tests/e2e and must not be run by Vitest
    // (they use @playwright/test, not the jsdom unit runner).
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
  esbuild: {
    // Only strip debugger statements and no-op console.log/debug/info calls.
    // console.warn/console.error must survive into production — several
    // "never a silent fallback" behaviors (TTS voice fallback, etc.) rely on
    // console.warn actually firing in shipped code, not just in dev.
    drop: ["debugger"],
    pure: ["console.log", "console.debug", "console.info"],
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        manualChunks(id) {
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "lucide";
          }
          // Let PDF.js/react-pdf and Supabase follow their actual import graph.
          // Forcing either family into a manual shared chunk made Vite preload
          // them on lightweight student/game routes that do not need them.
          if (id.includes("node_modules/recharts")) {
            return "recharts";
          }
          if (
            id.includes("node_modules/@tanstack/react-router") ||
            id.includes("node_modules/@tanstack/router-core") ||
            id.includes("node_modules/@tanstack/history") ||
            id.includes("node_modules/@tanstack/store")
          ) {
            return "tanstack-router";
          }
        },
      },
    },
  },
}));
