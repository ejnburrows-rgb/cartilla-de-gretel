import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/routes/cartilla/cuaderno.tsx");const $$splitComponentImporter = () => import("/src/routes/cartilla/cuaderno.tsx?tsr-split=component");
import { lazyRouteComponent } from "/@fs/D:/Downloads/La Cartilla de Gretel/node_modules/.pnpm/@tanstack+react-router@1.17_715463edbca5e6c25fe7440ed11a80c3/node_modules/@tanstack/react-router/dist/esm/index.dev.js?v=28ad61c8";
import { createFileRoute } from "/@fs/D:/Downloads/La Cartilla de Gretel/node_modules/.pnpm/@tanstack+react-router@1.17_715463edbca5e6c25fe7440ed11a80c3/node_modules/@tanstack/react-router/dist/esm/index.dev.js?v=28ad61c8";
import "/src/styles/lesson-fit.css";
const TSRSplitComponent = (() => {
  const hot2 = import.meta.hot;
  const hotData = hot2 ? hot2.data ??= {} : void 0;
  return hotData?.["tsr-split-component:component"] ?? lazyRouteComponent($$splitComponentImporter, "component");
})();
if (import.meta.hot) {
  (import.meta.hot.data ??= {})["tsr-split-component:component"] = TSRSplitComponent;
}
export const Route = createFileRoute("/cartilla/cuaderno")({
  component: TSRSplitComponent,
  head: () => ({
    meta: [{
      title: "Cuaderno completo — La Cartilla de Gretel"
    }, {
      name: "description",
      content: "Cuaderno digital interactivo con páginas fieles."
    }]
  })
});
const hot = import.meta.hot;
if (hot && typeof window !== "undefined") {
  hot.data ??= {};
  const tsrReactRefresh = window.__TSR_REACT_REFRESH__ ??= (() => {
    const ignoredExportsById = /* @__PURE__ */ new Map();
    const previousGetIgnoredExports = window.__getReactRefreshIgnoredExports;
    window.__getReactRefreshIgnoredExports = (ctx) => {
      const ignoredExports = previousGetIgnoredExports?.(ctx) ?? [];
      const moduleIgnored = ignoredExportsById.get(ctx.id) ?? [];
      return [...ignoredExports, ...moduleIgnored];
    };
    return {
      ignoredExportsById
    };
  })();
  tsrReactRefresh.ignoredExportsById.set("D:/Downloads/cartilla-1247-continuation-work/test-repairs/src/routes/cartilla/cuaderno.tsx", ["Route"]);
}
export function TSRFastRefreshAnchor() {
  return null;
}
_c = TSRFastRefreshAnchor;
if (import.meta.hot) {
  const hot2 = import.meta.hot;
  const hotData = hot2.data ??= {};
  hot2.accept((newModule) => {
    if (Route && newModule && newModule.Route) {
      const routeId = hotData["tsr-route-id"] ?? "/cartilla/cuaderno";
      if (routeId) {
        hotData["tsr-route-id"] = routeId;
      }
      (function handleRouteUpdate(routeId2, newRoute) {
        const router = window.__TSR_ROUTER__;
        const oldRoute = router.routesById[routeId2];
        if (!oldRoute) return;
        const generatedRouteOptionKeys = /* @__PURE__ */ new Set(["id", "path", "getParentRoute"]);
        const generatedRouteOptions = {};
        generatedRouteOptionKeys.forEach((key) => {
          if (key in oldRoute.options) generatedRouteOptions[key] = oldRoute.options[key];
        });
        const removedKeys = /* @__PURE__ */ new Set();
        Object.keys(oldRoute.options).forEach((key) => {
          if (!generatedRouteOptionKeys.has(key) && !(key in newRoute.options)) {
            removedKeys.add(key);
            delete oldRoute.options[key];
          }
        });
        const preserveComponentIdentity = "shellComponent" in oldRoute.options === "shellComponent" in newRoute.options;
        const componentKeys = ["component", "shellComponent", "pendingComponent", "errorComponent", "notFoundComponent"];
        if (preserveComponentIdentity) componentKeys.forEach((key) => {
          if (key in oldRoute.options && key in newRoute.options) newRoute.options[key] = oldRoute.options[key];
        });
        const nextOptions = {
          ...newRoute.options,
          ...generatedRouteOptions
        };
        oldRoute.options = nextOptions;
        oldRoute.update(nextOptions);
        oldRoute._componentsPromise = void 0;
        oldRoute._lazyPromise = void 0;
        router.setRoutes(router.buildRouteTree());
        router.resolvePathCache.clear();
        const filter = (m) => m.routeId === oldRoute.id;
        const activeMatch = router.stores.matches.get().find(filter);
        const pendingMatch = router.stores.pendingMatches.get().find(filter);
        const cachedMatches = router.stores.cachedMatches.get().filter(filter);
        if (activeMatch || pendingMatch || cachedMatches.length > 0) {
          if (removedKeys.has("loader") || removedKeys.has("beforeLoad")) {
            const matchIds = [activeMatch?.id, pendingMatch?.id, ...cachedMatches.map((match) => match.id)].filter(Boolean);
            router.batch(() => {
              for (const matchId of matchIds) {
                const store = router.stores.pendingMatchStores.get(matchId) || router.stores.matchStores.get(matchId) || router.stores.cachedMatchStores.get(matchId);
                if (store) store.set((prev) => {
                  const next = {
                    ...prev
                  };
                  if (removedKeys.has("loader")) next.loaderData = void 0;
                  if (removedKeys.has("beforeLoad")) {
                    next.__beforeLoadContext = void 0;
                    next.context = rebuildMatchContextWithoutBeforeLoad(next);
                  }
                  return next;
                });
              }
            });
          }
          router.invalidate({
            filter,
            sync: true
          });
        }
        function getStoreMatch(matchId) {
          return router.stores.pendingMatchStores.get(matchId)?.get() || router.stores.matchStores.get(matchId)?.get() || router.stores.cachedMatchStores.get(matchId)?.get();
        }
        function getMatchList(matchId) {
          const pendingMatches = router.stores.pendingMatches.get();
          if (pendingMatches.some((match) => match.id === matchId)) return pendingMatches;
          const activeMatches = router.stores.matches.get();
          if (activeMatches.some((match) => match.id === matchId)) return activeMatches;
          const cachedMatches2 = router.stores.cachedMatches.get();
          if (cachedMatches2.some((match) => match.id === matchId)) return cachedMatches2;
          return [];
        }
        function getParentMatch(match) {
          const matchList = getMatchList(match.id);
          const matchIndex = matchList.findIndex((item) => item.id === match.id);
          if (matchIndex <= 0) return;
          const parentMatch = matchList[matchIndex - 1];
          return getStoreMatch(parentMatch.id) || parentMatch;
        }
        function rebuildMatchContextWithoutBeforeLoad(match) {
          const parentMatch = getParentMatch(match);
          const getParentContext = router.getParentContext;
          return {
            ...(getParentContext ? getParentContext.call(router, parentMatch) : parentMatch?.context ?? router.options.context) ?? {},
            ...match.__routeContext ?? {}
          };
        }
      })(routeId, newModule.Route);
    }
  });
}
var _c;
$RefreshReg$(_c, "TSRFastRefreshAnchor");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("D:/Downloads/cartilla-1247-continuation-work/test-repairs/src/routes/cartilla/cuaderno.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("D:/Downloads/cartilla-1247-continuation-work/test-repairs/src/routes/cartilla/cuaderno.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, "D:/Downloads/cartilla-1247-continuation-work/test-repairs/src/routes/cartilla/cuaderno.tsx " + id);
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}
