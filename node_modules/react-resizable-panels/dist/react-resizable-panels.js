"use client";
import { jsx as W, jsxs as un } from "react/jsx-runtime";
import { useId as dn, useLayoutEffect as Ot, useEffect as qe, useRef as q, useCallback as te, createContext as Nt, useContext as Gt, useState as he, useMemo as Ee, useImperativeHandle as it, useSyncExternalStore as Ke, Children as fn, isValidElement as _t } from "react";
function ke(e) {
  const t = dn();
  return `${e ?? t}`;
}
const ne = typeof window < "u" ? Ot : qe;
function ge(e) {
  const t = q(e);
  return ne(() => {
    t.current = e;
  }, [e]), te(
    (...n) => t.current?.(...n),
    [t]
  );
}
function Be(...e) {
  return ge((t) => {
    e.forEach((n) => {
      if (n)
        switch (typeof n) {
          case "function": {
            n(t);
            break;
          }
          case "object": {
            n.current = t;
            break;
          }
        }
    });
  });
}
function et(e, t) {
  return t ? e * 2 + 1 : e + 1;
}
function mn(e, t) {
  return t ? e * 2 - 1 : e;
}
function mt(e, t, n) {
  const o = et(e, n);
  return t === void 0 ? `${o} / -1` : `${o} / span ${mn(t, n)}`;
}
function pn(e) {
  return `${e * 2} / span 1`;
}
function hn({
  crossCount: e,
  crossSpan: t,
  crossStart: n,
  hasGutters: o
}) {
  const r = t === void 0 ? e : n + t;
  if (n === 0 && r === e)
    return "1 / -1";
  let i = et(n, o), s = et(r - 1, o) + 1;
  return o && (n > 0 && i--, r < e && s++), `${i} / ${s}`;
}
function st(e, t) {
  return Number.isInteger(e) && e >= 1 && e < t;
}
function A(e, t = "Assertion error") {
  if (!e)
    throw Error(t);
}
const Ft = Nt(null);
function qt() {
  const e = Gt(Ft);
  return A(
    e,
    "Grid Context not found; did you render a Cell or Gridline outside of a Grid?"
  ), e;
}
function gn({
  children: e,
  className: t,
  column: n,
  columnSpan: o = 1,
  elementRef: r,
  id: i,
  row: s,
  rowSpan: l = 1,
  style: a,
  ...c
}) {
  const u = ke(i), { gutters: d, registerCell: g } = qt(), m = q(null), y = Be(m, r);
  return ne(() => {
    const f = m.current;
    if (f !== null)
      return g({
        column: n,
        columnSpan: o,
        element: f,
        id: u,
        row: s,
        rowSpan: l
      });
  }, [n, o, u, g, s, l]), /* @__PURE__ */ W(
    "div",
    {
      ...c,
      className: t,
      "data-cell": !0,
      "data-testid": u,
      id: u,
      ref: y,
      style: {
        overflow: "auto",
        ...a,
        // Allow cells to shrink smaller than their content
        minHeight: 0,
        minWidth: 0,
        gridColumn: mt(n, o, d.column),
        gridRow: mt(s, l, d.row)
      },
      children: e
    }
  );
}
gn.displayName = "Cell";
let Ue;
function yn() {
  return Ue === void 0 && (typeof matchMedia == "function" ? Ue = !!matchMedia("(pointer:coarse)").matches : Ue = !1), Ue;
}
function tt({
  expandHitTargets: e,
  axis: t,
  rect: n
}) {
  const o = e ? yn() ? t.resizeTargetMinimumSize.coarse : t.resizeTargetMinimumSize.fine : 0;
  if (n.width < o) {
    const r = o - n.width;
    n = new DOMRect(
      n.x - r / 2,
      n.y,
      n.width + r,
      n.height
    );
  }
  if (n.height < o) {
    const r = o - n.height;
    n = new DOMRect(
      n.x,
      n.y - r / 2,
      n.width,
      n.height + r
    );
  }
  return n;
}
function pt({
  axis: e,
  cells: t,
  index: n,
  rect: o
}) {
  let r = [o];
  for (const i of t) {
    const s = e === "column" ? i.column : i.row, l = e === "column" ? i.columnSpan : i.rowSpan;
    if (s >= n || s + l <= n)
      continue;
    const a = i.element.getBoundingClientRect(), c = e === "column" ? a.top : a.left, u = e === "column" ? a.bottom : a.right;
    u <= c || (r = r.flatMap((d) => {
      const g = e === "column" ? d.top : d.left, m = e === "column" ? d.bottom : d.right;
      if (c >= m || u <= g)
        return [d];
      const y = [], f = (S, p) => {
        y.push(
          e === "column" ? new DOMRect(d.x, S, d.width, p - S) : new DOMRect(S, d.y, p - S, d.height)
        );
      };
      return g < c && f(g, c), m > u && f(u, m), y;
    }));
  }
  return r;
}
function Sn({
  axis: e,
  cells: t,
  crossTrackCount: n,
  expandHitTargets: o,
  resizeAxis: r,
  axisSize: i,
  includeDisabled: s,
  separatorPlacements: l
}) {
  const { items: a, separators: c } = r, u = a.length;
  let d = -1, g = -1, m = 0;
  if (a.forEach((b, x) => {
    b.constraintProps.disabled || (m++, d === -1 && (d = x), g = x);
  }), !s && m < 2)
    return [];
  const y = (b) => s || b > d && b <= g, f = [], S = (b, x, v) => ({
    axis: r,
    axisSize: i,
    items: [a[b - 1], a[b]],
    rect: x,
    separator: v
  }), p = (b, x) => {
    let v;
    for (const E of t) {
      const P = e === "column" ? E.row : E.column, k = e === "column" ? E.rowSpan : E.columnSpan;
      if (x === "start" ? P === b : P + k - 1 === b) {
        const M = E.element.getBoundingClientRect();
        if (x === "start") {
          const z = e === "column" ? M.top : M.left;
          v = v === void 0 ? z : Math.min(v, z);
        } else {
          const z = e === "column" ? M.bottom : M.right;
          v = v === void 0 ? z : Math.max(v, z);
        }
      }
    }
    return v;
  }, h = /* @__PURE__ */ new Set();
  for (const b of c) {
    const x = l.get(b);
    if (!x || x.index < 1 || x.index >= u || (h.add(x.index), !s && (b.disabled || b.element.hasAttribute("aria-disabled"))) || !y(x.index))
      continue;
    let v = b.element.getBoundingClientRect();
    const { crossSpan: E, crossStart: P } = x, k = E === void 0 ? n : P + E;
    let M = e === "column" ? v.top : v.left, z = e === "column" ? v.bottom : v.right;
    if (P > 0) {
      const I = p(P - 1, "end");
      I !== void 0 && I < M && (M = I);
    }
    if (k < n) {
      const I = p(k, "start");
      I !== void 0 && I > z && (z = I);
    }
    v = e === "column" ? new DOMRect(v.x, M, v.width, z - M) : new DOMRect(M, v.y, z - M, v.height), v = tt({ expandHitTargets: o, axis: r, rect: v }), s ? f.push(S(x.index, v, b)) : pt({
      axis: e,
      cells: t,
      index: x.index,
      rect: v
    }).forEach((I) => {
      f.push(S(x.index, I, b));
    });
  }
  const L = (b, x) => {
    pt({
      axis: e,
      cells: t,
      index: b,
      rect: tt({ expandHitTargets: o, axis: r, rect: x })
    }).forEach((v) => {
      f.push(S(b, v));
    });
  }, w = Array.from(
    { length: n },
    () => new Array(u)
  );
  for (const b of t) {
    const [x, v, E, P] = e === "column" ? [b.column, b.columnSpan, b.row, b.rowSpan] : [b.row, b.rowSpan, b.column, b.columnSpan];
    for (let k = Math.max(0, E); k < Math.min(n, E + P); k++)
      for (let M = Math.max(0, x); M < Math.min(u, x + v); M++)
        w[k][M] ??= b;
  }
  const C = /* @__PURE__ */ new Map(), O = (b) => {
    let x = C.get(b);
    if (!x) {
      const v = b.element.getBoundingClientRect();
      x = e === "column" ? {
        crossEnd: v.bottom,
        crossStart: v.top,
        end: v.right,
        start: v.left
      } : {
        crossEnd: v.right,
        crossStart: v.left,
        end: v.bottom,
        start: v.top
      }, C.set(b, x);
    }
    return x;
  }, D = ({ crossEnd: b, crossStart: x, end: v, start: E }) => e === "column" ? new DOMRect(E, x, v - E, b - x) : new DOMRect(x, E, b - x, v - E);
  for (let b = 1; b < u; b++) {
    if (h.has(b) || !y(b))
      continue;
    let x;
    for (let v = 0; v < n; v++) {
      const E = w[v][b - 1], P = w[v][b];
      let k;
      if ((E || P) && E !== P) {
        const M = E ? O(E) : void 0, z = P ? O(P) : void 0, I = M?.end ?? z.start, _ = z?.start ?? M.end, Y = Math.max(
          M?.crossStart ?? -1 / 0,
          z?.crossStart ?? -1 / 0
        ), J = Math.min(
          M?.crossEnd ?? 1 / 0,
          z?.crossEnd ?? 1 / 0
        );
        k = {
          crossEnd: Math.max(Y, J),
          crossStart: Y,
          end: Math.max(I, _),
          start: Math.min(I, _)
        };
      }
      k ? x = x ? {
        crossEnd: Math.max(x.crossEnd, k.crossEnd),
        crossStart: Math.min(x.crossStart, k.crossStart),
        end: Math.max(x.end, k.end),
        start: Math.min(x.start, k.start)
      } : k : x && (L(b, D(x)), x = void 0);
    }
    x && L(b, D(x));
  }
  return f;
}
function le(e) {
  const t = parseFloat(e ?? "");
  return Number.isFinite(t) ? t : 0;
}
function vn({
  axis: e,
  element: t,
  gutterSizes: n,
  hasGutters: o,
  layout: r,
  trackIds: i
}) {
  const s = i.length, l = o ? s * 2 - 1 : s, a = t.ownerDocument.defaultView?.getComputedStyle(t), c = e === "column" ? a?.gridTemplateColumns : a?.gridTemplateRows;
  if (c) {
    const f = c.trim().split(/\s+/);
    if (f.length === l && f.every((S) => /^-?[\d.]+px$/.test(S))) {
      const S = i.map(
        (p, h) => le(f[o ? h * 2 : h])
      );
      return {
        availableSize: S.reduce((p, h) => p + h, 0),
        trackSizes: S
      };
    }
  }
  const u = e === "column" ? t.offsetWidth : t.offsetHeight, d = e === "column" ? le(a?.paddingLeft) + le(a?.paddingRight) + le(a?.borderLeftWidth) + le(a?.borderRightWidth) : le(a?.paddingTop) + le(a?.paddingBottom) + le(a?.borderTopWidth) + le(a?.borderBottomWidth), g = le(e === "column" ? a?.columnGap : a?.rowGap), m = n.reduce((f, S) => f + S, 0), y = Math.max(
    0,
    u - d - g * Math.max(0, l - 1) - m
  );
  return {
    availableSize: y,
    trackSizes: i.map(
      (f) => r && r[f] !== void 0 ? r[f] / 100 * y : y / s
    )
  };
}
function Bt(e) {
  switch (typeof e) {
    case "number":
      return [e, "px"];
    case "string": {
      const t = parseFloat(e);
      return e.endsWith("%") ? [t, "%"] : e.endsWith("px") ? [t, "px"] : e.endsWith("rem") ? [t, "rem"] : e.endsWith("em") ? [t, "em"] : e.endsWith("vh") ? [t, "vh"] : e.endsWith("vw") ? [t, "vw"] : [t, "%"];
    }
  }
}
class Vt {
  #e = {};
  addListener(t, n) {
    const o = this.#e[t];
    return o === void 0 ? this.#e[t] = [n] : o.includes(n) || o.push(n), () => {
      this.removeListener(t, n);
    };
  }
  emit(t, n) {
    const o = this.#e[t];
    if (o !== void 0)
      if (o.length === 1)
        o[0].call(null, n);
      else {
        let r = !1, i = null;
        const s = Array.from(o);
        for (let l = 0; l < s.length; l++) {
          const a = s[l];
          try {
            a.call(null, n);
          } catch (c) {
            i === null && (r = !0, i = c);
          }
        }
        if (r)
          throw i;
      }
  }
  removeAllListeners() {
    this.#e = {};
  }
  removeListener(t, n) {
    const o = this.#e[t];
    if (o !== void 0) {
      const r = o.indexOf(n);
      r >= 0 && o.splice(r, 1);
    }
  }
}
let B = {
  cursorFlags: 0,
  state: "inactive"
};
const at = new Vt();
function fe() {
  return B;
}
function Ht(e) {
  return at.addListener("change", e);
}
function bn(e, t = [], n, o = !1) {
  const r = B, i = { ...B };
  i.cursorFlags = e, i.state === "active" && (i.didPointerMove ||= o, i.previews = t, n && (i.previewLayoutMap = n)), B = i, at.emit("change", {
    prev: r,
    next: i
  });
}
function de(e) {
  const t = B;
  B = e, t.state === "active" && e.state !== "active" && t.didPointerMove && t.hitRegions.forEach(({ separator: n }) => {
    n && n.element.ownerDocument.activeElement === n.element && n.element.blur();
  }), at.emit("change", {
    prev: t,
    next: e
  });
}
function xn(e) {
  B.state !== "active" || !B.previews.some((t) => t.separator === e) || de({
    ...B,
    previews: B.previews.map(
      (t) => t.separator === e ? { ...t } : t
    )
  });
}
function wn(e) {
  if (B.state === "inactive")
    return !1;
  const t = B.hitRegions.filter((o) => o.axis !== e), n = B.state === "active" && B.previews.some((o) => o.axis === e);
  if (t.length === B.hitRegions.length && !n)
    return !1;
  if (t.length === 0)
    de({ cursorFlags: 0, state: "inactive" });
  else if (B.state === "active") {
    const o = new Map(B.initialLayoutMap), r = new Map(B.previewLayoutMap);
    o.delete(e), r.delete(e), de({
      ...B,
      cursorFlags: 0,
      hitRegions: t,
      initialLayoutMap: o,
      previewLayoutMap: r,
      previews: B.previews.filter((i) => i.axis !== e)
    });
  } else
    de({ ...B, hitRegions: t });
  return !0;
}
const zn = (e) => e, Qe = () => {
}, jt = 1, Ut = 2, Wt = 4, Yt = 8, ht = 3, gt = 12;
let We;
function yt() {
  return We === void 0 && (We = !1, typeof window < "u" && (window.navigator.userAgent.includes("Chrome") || window.navigator.userAgent.includes("Firefox")) && (We = !0)), We;
}
function In({
  cursorFlags: e,
  axes: t,
  state: n
}) {
  let o = 0, r = 0;
  switch (n) {
    case "active":
    case "hover":
      t.forEach((i) => {
        if (!i.mutableState.disableCursor)
          switch (i.orientation) {
            case "horizontal": {
              o++;
              break;
            }
            case "vertical": {
              r++;
              break;
            }
          }
      });
  }
  if (!(o === 0 && r === 0)) {
    switch (n) {
      case "active": {
        if (e && yt()) {
          const i = (e & jt) !== 0, s = (e & Ut) !== 0, l = (e & Wt) !== 0, a = (e & Yt) !== 0;
          if (i)
            return l ? "se-resize" : a ? "ne-resize" : "e-resize";
          if (s)
            return l ? "sw-resize" : a ? "nw-resize" : "w-resize";
          if (l)
            return "s-resize";
          if (a)
            return "n-resize";
        }
        break;
      }
    }
    return yt() ? o > 0 && r > 0 ? "move" : o > 0 ? "ew-resize" : "ns-resize" : o > 0 && r > 0 ? "grab" : o > 0 ? "col-resize" : "row-resize";
  }
}
const St = /* @__PURE__ */ new WeakMap();
function Ge(e) {
  if (!e.defaultView || !e.adoptedStyleSheets)
    return;
  let { prevStyle: t, styleSheet: n } = St.get(e) ?? {};
  n === void 0 && (n = new e.defaultView.CSSStyleSheet(), e.adoptedStyleSheets && (Object.isExtensible(e.adoptedStyleSheets) ? e.adoptedStyleSheets.push(n) : e.adoptedStyleSheets = [
    ...e.adoptedStyleSheets,
    n
  ]));
  const o = fe();
  switch (o.state) {
    case "active":
    case "hover": {
      const r = In({
        cursorFlags: o.cursorFlags,
        axes: o.hitRegions.map((s) => s.axis),
        state: o.state
      }), i = `*, *:hover {cursor: ${r} !important; }`;
      if (t === i)
        return;
      t = i, r ? n.cssRules.length === 0 ? n.insertRule(i) : n.replaceSync(i) : n.cssRules.length === 1 && n.deleteRule(0);
      break;
    }
    case "inactive": {
      t = void 0, n.cssRules.length === 1 && n.deleteRule(0);
      break;
    }
  }
  St.set(e, {
    prevStyle: t,
    styleSheet: n
  });
}
function Pe({
  axis: e
}) {
  const { layoutStrategy: t, orientation: n, items: o } = e;
  return t ? t.calculateAvailableSize() : o.reduce((r, i) => (r += n === "horizontal" ? i.element.offsetWidth : i.element.offsetHeight, r), 0);
}
function nt(e, t) {
  return Array.from(t).sort((n, o) => {
    const r = e === "horizontal" ? Ln(n, o) : Cn(n, o);
    if (r !== 0)
      return r;
    const i = n.element.compareDocumentPosition(o.element);
    return i & Node.DOCUMENT_POSITION_DISCONNECTED ? 0 : i & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : i & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
  });
}
function Ln(e, t) {
  const n = e.element.offsetLeft - t.element.offsetLeft;
  return n !== 0 ? n : e.element.offsetWidth - t.element.offsetWidth;
}
function Cn(e, t) {
  const n = e.element.offsetTop - t.element.offsetTop;
  return n !== 0 ? n : e.element.offsetHeight - t.element.offsetHeight;
}
function ot(e) {
  return e !== null && typeof e == "object" && "nodeType" in e && e.nodeType === Node.ELEMENT_NODE;
}
function Kt(e, t) {
  return {
    x: e.x >= t.left && e.x <= t.right ? 0 : Math.min(
      Math.abs(e.x - t.left),
      Math.abs(e.x - t.right)
    ),
    y: e.y >= t.top && e.y <= t.bottom ? 0 : Math.min(
      Math.abs(e.y - t.top),
      Math.abs(e.y - t.bottom)
    )
  };
}
function Rn({
  orientation: e,
  rects: t,
  targetRect: n
}) {
  const o = {
    x: n.x + n.width / 2,
    y: n.y + n.height / 2
  };
  let r, i = Number.MAX_VALUE;
  for (const s of t) {
    const { x: l, y: a } = Kt(o, s), c = e === "horizontal" ? l : a;
    c < i && (i = c, r = s);
  }
  return A(r, "No rect found"), r;
}
function lt({
  expandHitTargets: e = !0,
  axis: t,
  includeDisabled: n = !1
}) {
  if (t.layoutStrategy)
    return t.layoutStrategy.calculateHitRegions({
      expandHitTargets: e,
      axis: t,
      includeDisabled: n
    });
  const { element: o, orientation: r, items: i, separators: s } = t, l = nt(
    r,
    Array.from(o.children).filter(ot).filter((p) => !p.hasAttribute("data-resize-preview")).map((p) => ({ element: p }))
  ).map(({ element: p }) => p), a = [];
  let c = !1, u = !1, d = -1, g, m = -1, y = 0, f, S = [];
  {
    let p = -1;
    for (const h of l)
      h.hasAttribute("data-panel") && (p++, h.hasAttribute("data-disabled") || (y++, d === -1 && (d = p), m = p));
  }
  if (n || y > 1) {
    let p = -1;
    for (const h of l)
      if (h.hasAttribute("data-panel")) {
        p++;
        const L = i.find(
          (w) => w.element === h
        );
        if (L) {
          if (f) {
            const w = f.element.getBoundingClientRect(), C = h.getBoundingClientRect();
            let O;
            if (u) {
              const D = r === "horizontal" ? new DOMRect(
                w.right,
                w.top,
                0,
                w.height
              ) : new DOMRect(
                w.left,
                w.bottom,
                w.width,
                0
              ), b = r === "horizontal" ? new DOMRect(C.left, C.top, 0, C.height) : new DOMRect(C.left, C.top, C.width, 0);
              switch (S.length) {
                case 0: {
                  O = [
                    D,
                    b
                  ];
                  break;
                }
                case 1: {
                  const x = S[0], v = Rn({
                    orientation: r,
                    rects: [w, C],
                    targetRect: x.element.getBoundingClientRect()
                  });
                  O = [
                    x,
                    v === w ? b : D
                  ];
                  break;
                }
                default: {
                  O = S;
                  break;
                }
              }
            } else
              S.length ? O = S : O = [
                r === "horizontal" ? new DOMRect(
                  w.right,
                  C.top,
                  C.left - w.right,
                  C.height
                ) : new DOMRect(
                  C.left,
                  w.bottom,
                  C.width,
                  C.top - w.bottom
                )
              ];
            for (const D of O) {
              const b = tt({
                expandHitTargets: e,
                axis: t,
                rect: "width" in D ? D : D.element.getBoundingClientRect()
              }), x = p <= d || p > m;
              (n || !c && !x) && (g ??= Pe({ axis: t }), a.push({
                axis: t,
                axisSize: g,
                items: [f, L],
                separator: "width" in D ? void 0 : D,
                rect: b
              })), c = !1;
            }
          }
          u = !1, f = L, S = [];
        }
      } else if (h.hasAttribute("data-separator")) {
        h.ariaDisabled !== null && (c = !0);
        const L = s.find(
          (w) => w.element === h
        );
        L ? S.push(L) : (f = void 0, S = []);
      } else
        u = !0;
  }
  return a;
}
function Mn(e, t) {
  const n = getComputedStyle(e), o = parseFloat(n.fontSize);
  return t * o;
}
function En(e, t) {
  const n = getComputedStyle(e.ownerDocument.documentElement), o = parseFloat(n.fontSize);
  return t * o;
}
function Pn(e) {
  return e / 100 * window.innerHeight;
}
function kn(e) {
  return e / 100 * window.innerWidth;
}
function Le({
  axisSize: e,
  itemElement: t,
  styleProp: n
}) {
  let o;
  const [r, i] = Bt(n);
  switch (i) {
    case "%": {
      o = r / 100 * e;
      break;
    }
    case "px": {
      o = r;
      break;
    }
    case "rem": {
      o = En(t, r);
      break;
    }
    case "em": {
      o = Mn(t, r);
      break;
    }
    case "vh": {
      o = Pn(r);
      break;
    }
    case "vw": {
      o = kn(r);
      break;
    }
  }
  return o;
}
function X(e) {
  return parseFloat(e.toFixed(3));
}
function rt(e) {
  const { items: t } = e, n = Pe({ axis: e });
  return n === 0 ? t.map((o) => ({
    groupResizeBehavior: o.constraintProps.groupResizeBehavior,
    collapsedSize: 0,
    collapsible: o.constraintProps.collapsible === !0,
    defaultSize: void 0,
    disabled: o.constraintProps.disabled,
    minSize: 0,
    maxSize: 100,
    itemId: o.id
  })) : t.map((o) => {
    const { element: r, constraintProps: i } = o;
    let s = 0;
    if (i.collapsedSize !== void 0) {
      const d = Le({
        axisSize: n,
        itemElement: r,
        styleProp: i.collapsedSize
      });
      s = X(d / n * 100);
    }
    let l;
    if (i.collapsedThreshold !== void 0) {
      const d = Le({
        axisSize: n,
        itemElement: r,
        styleProp: i.collapsedThreshold
      });
      l = X(d / n * 100);
    }
    let a;
    if (i.defaultSize !== void 0) {
      const d = Le({
        axisSize: n,
        itemElement: r,
        styleProp: i.defaultSize
      });
      a = X(d / n * 100);
    }
    let c = 0;
    if (i.minSize !== void 0) {
      const d = Le({
        axisSize: n,
        itemElement: r,
        styleProp: i.minSize
      });
      c = X(d / n * 100);
    }
    let u = 100;
    if (i.maxSize !== void 0) {
      const d = Le({
        axisSize: n,
        itemElement: r,
        styleProp: i.maxSize
      });
      u = X(d / n * 100);
    }
    return {
      groupResizeBehavior: i.groupResizeBehavior,
      collapsedSize: s,
      collapsedThreshold: l,
      collapsible: i.collapsible === !0,
      defaultSize: a,
      disabled: i.disabled,
      minSize: c,
      maxSize: u,
      itemId: o.id
    };
  });
}
let ue = /* @__PURE__ */ new Map();
const Xt = new Vt();
function $n(e) {
  ue = new Map(ue), ue.delete(e);
}
function Re(e, t) {
  for (const [n] of ue)
    if (n.id === e)
      return n;
}
function ae(e, t) {
  for (const [n, o] of ue)
    if (n.id === e)
      return o;
  if (t)
    throw Error(`Could not find data for Group with id ${e}`);
}
function Se() {
  return ue;
}
function _e(e, t) {
  return Xt.addListener("axisChange", (n) => {
    n.axis.id === e && t(n);
  });
}
function me(e, t, n) {
  const o = ue.get(e);
  ue = new Map(ue), ue.set(e, t), Xt.emit("axisChange", {
    axis: e,
    isUserInteraction: n?.isUserInteraction === !0,
    prev: o,
    next: t
  });
}
function Tn(e, t) {
  if (e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++)
    if (e[n] != t[n])
      return !1;
  return !0;
}
function U(e, t, n = 0) {
  return Math.abs(X(e) - X(t)) <= n;
}
function ce(e, t) {
  return U(e, t) ? 0 : e > t ? 1 : -1;
}
function Me({
  overrideDisabledItems: e,
  itemConstraints: t,
  prevSize: n,
  size: o
}) {
  const {
    collapsedSize: r = 0,
    collapsedThreshold: i,
    collapsible: s,
    disabled: l,
    maxSize: a = 100,
    minSize: c = 0
  } = t;
  if (l && !e)
    return n;
  if (ce(o, c) < 0)
    if (s) {
      const u = i ?? (c - r) / 2, d = ce(n, r) <= 0, g = d ? r + u : c - u, m = ce(o, g);
      ce(o, r) <= 0 || m < 0 || i !== void 0 && d && m === 0 ? o = r : o = c;
    } else
      o = c;
  return o = Math.min(a, o), o = X(o), o;
}
function Fe({
  delta: e,
  initialLayout: t,
  itemConstraints: n,
  pivotIndices: o,
  prevLayout: r,
  trigger: i
}) {
  if (U(e, 0))
    return t;
  const s = i === "imperative-api", l = n.map(
    ({ itemId: y }) => t[y]
  ), a = n.map(
    ({ itemId: y }) => r[y]
  ), c = [...l], [u, d] = o;
  A(u != null, "Invalid first pivot index"), A(d != null, "Invalid second pivot index");
  let g = 0;
  switch (i) {
    case "keyboard": {
      {
        const y = e < 0 ? d : u, f = n[y];
        A(
          f,
          `Panel constraints not found for index ${y}`
        );
        const {
          collapsedSize: S = 0,
          collapsible: p,
          minSize: h = 0
        } = f;
        if (p) {
          const L = l[y];
          if (A(
            L != null,
            `Previous layout not found for panel index ${y}`
          ), U(L, S)) {
            const w = h - L;
            ce(w, Math.abs(e)) > 0 && (e = e < 0 ? 0 - w : w);
          }
        }
      }
      {
        const y = e < 0 ? u : d, f = n[y];
        A(
          f,
          `No panel constraints found for index ${y}`
        );
        const {
          collapsedSize: S = 0,
          collapsible: p,
          minSize: h = 0
        } = f;
        if (p) {
          const L = l[y];
          if (A(
            L != null,
            `Previous layout not found for panel index ${y}`
          ), U(L, h)) {
            const w = L - S;
            ce(w, Math.abs(e)) > 0 && (e = e < 0 ? 0 - w : w);
          }
        }
      }
      break;
    }
    default: {
      const y = e < 0 ? d : u, f = n[y];
      A(
        f,
        `Panel constraints not found for index ${y}`
      );
      const S = l[y], { collapsedSize: p, collapsedThreshold: h, collapsible: L, minSize: w } = f;
      if (L && ce(S, w) < 0) {
        const C = w - p, O = h ?? C / 2, D = S + Math.abs(e);
        if (ce(D, w) < 0) {
          const b = ce(Math.abs(e), O), x = h === void 0 && e < 0;
          b > 0 || b === 0 && x ? e = e < 0 ? -C : C : e = 0;
        }
      }
      break;
    }
  }
  {
    const y = e < 0 ? 1 : -1;
    let f = e < 0 ? d : u, S = 0;
    for (; ; ) {
      const h = l[f];
      A(
        h != null,
        `Previous layout not found for panel index ${f}`
      );
      const w = Me({
        overrideDisabledItems: s,
        itemConstraints: n[f],
        prevSize: h,
        size: 100
      }) - h;
      if (S += w, f += y, f < 0 || f >= n.length)
        break;
    }
    const p = Math.min(Math.abs(e), Math.abs(S));
    e = e < 0 ? 0 - p : p;
  }
  {
    let f = e < 0 ? u : d;
    for (; f >= 0 && f < n.length; ) {
      const S = Math.abs(e) - Math.abs(g), p = l[f];
      A(
        p != null,
        `Previous layout not found for panel index ${f}`
      );
      const h = p - S, L = Me({
        overrideDisabledItems: s,
        itemConstraints: n[f],
        prevSize: p,
        size: h
      });
      if (!U(p, L) && (g += p - L, c[f] = L, g.toFixed(3).localeCompare(Math.abs(e).toFixed(3), void 0, {
        numeric: !0
      }) >= 0))
        break;
      e < 0 ? f-- : f++;
    }
  }
  if (Tn(a, c))
    return r;
  {
    const y = e < 0 ? d : u, f = l[y];
    A(
      f != null,
      `Previous layout not found for panel index ${y}`
    );
    const S = f + g, p = Me({
      overrideDisabledItems: s,
      itemConstraints: n[y],
      prevSize: f,
      size: S
    });
    if (c[y] = p, !U(p, S)) {
      let h = S - p, w = e < 0 ? d : u;
      for (; w >= 0 && w < n.length; ) {
        const C = c[w];
        A(
          C != null,
          `Previous layout not found for panel index ${w}`
        );
        const O = C + h, D = Me({
          overrideDisabledItems: s,
          itemConstraints: n[w],
          prevSize: C,
          size: O
        });
        if (U(C, D) || (h -= D - C, c[w] = D), U(h, 0))
          break;
        e > 0 ? w-- : w++;
      }
    }
  }
  const m = Object.values(c).reduce(
    (y, f) => f + y,
    0
  );
  return U(m, 100, 0.1) ? c.reduce((y, f, S) => (y[n[S].itemId] = f, y), {}) : r;
}
function se(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length)
    return !1;
  for (const n in e)
    if (t[n] === void 0 || ce(e[n], t[n]) !== 0)
      return !1;
  return !0;
}
function ct({
  commit: e,
  document: t,
  event: n,
  hitRegions: o,
  initialLayoutMap: r,
  mountedAxes: i,
  pointerDownAtPoint: s,
  prevCursorFlags: l
}) {
  let a = 0;
  const c = fe();
  let u = c.state === "active" ? c.previews : [];
  const d = new Map(
    c.state === "active" ? c.previewLayoutMap : void 0
  );
  o.forEach((y) => {
    const { axis: f, axisSize: S } = y, { orientation: p, items: h } = f;
    if (e && f.resizePreviewMode !== "separator")
      return;
    const { disableCursor: L } = f.mutableState;
    let w = 0;
    s ? p === "horizontal" ? w = (n.clientX - s.x) / S * 100 : w = (n.clientY - s.y) / S * 100 : p === "horizontal" ? w = n.clientX < 0 ? -100 : 100 : w = n.clientY < 0 ? -100 : 100;
    const C = r.get(f), O = i.get(f);
    if (!C || !O)
      return;
    const {
      defaultLayoutDeferred: D,
      derivedItemConstraints: b,
      axisSize: x,
      layout: v,
      separatorToItems: E
    } = O;
    if (b && v && E) {
      const P = f.resizePreviewMode === "separator" ? d.get(f) ?? v : v, k = Fe({
        delta: w,
        initialLayout: C,
        itemConstraints: b,
        pivotIndices: y.items.map((M) => h.indexOf(M)),
        prevLayout: P,
        trigger: "mouse-or-touch"
      });
      if (f.resizePreviewMode === "separator" && !e && !se(k, P)) {
        d.set(f, k);
        let M = 0;
        const z = h.map((I) => (M += k[I.id] - C[I.id], M * (S / 100)));
        u = u.map((I) => {
          if (I.axis !== f)
            return I;
          const _ = z[I.itemIndex];
          return _ === I.offset ? I : { ...I, offset: _ };
        });
      }
      if (se(k, P) && w !== 0 && !L)
        switch (p) {
          case "horizontal": {
            a |= w < 0 ? jt : Ut;
            break;
          }
          case "vertical": {
            a |= w < 0 ? Wt : Yt;
            break;
          }
        }
      (f.resizePreviewMode !== "separator" || e) && !se(k, v) && me(y.axis, {
        defaultLayoutDeferred: D,
        derivedItemConstraints: b,
        axisSize: x,
        layout: k,
        requestedAxisSize: x,
        requestedLayout: k,
        separatorToItems: E
      });
    }
  });
  let g = 0;
  n.movementX === 0 ? g |= l & ht : g |= a & ht, n.movementY === 0 ? g |= l & gt : g |= a & gt;
  const m = c.state === "active" && (n.clientX !== c.pointerDownAtPoint.x || n.clientY !== c.pointerDownAtPoint.y);
  bn(g, u, d, m), Ge(t);
}
function Jt(e, t) {
  const n = fe(), o = Se();
  let r = !1;
  switch (n.state) {
    case "active":
      ct({
        commit: !0,
        document: e,
        event: t,
        hitRegions: n.hitRegions,
        initialLayoutMap: n.initialLayoutMap,
        mountedAxes: o,
        pointerDownAtPoint: n.pointerDownAtPoint,
        prevCursorFlags: n.cursorFlags
      }), de({
        cursorFlags: 0,
        state: "inactive"
      }), n.hitRegions.length > 0 && (Ge(e), r = !0, n.hitRegions.forEach((i) => {
        if (!o.has(i.axis))
          return;
        const s = ae(i.axis.id, !0);
        me(i.axis, s, {
          isUserInteraction: !0
        });
      }));
  }
  return r;
}
function vt(e) {
  e.defaultPrevented || Jt(e.currentTarget, e);
}
function An(e, t, n) {
  let o, r = {
    x: 1 / 0,
    y: 1 / 0
  };
  for (const i of t) {
    const s = Kt(n, i.rect);
    switch (e) {
      case "horizontal": {
        (s.x < r.x || s.x === r.x && s.y <= r.y) && (o = i, r = s);
        break;
      }
      case "vertical": {
        (s.y < r.y || s.y === r.y && s.x <= r.x) && (o = i, r = s);
        break;
      }
    }
  }
  return o ? {
    distance: r,
    hitRegion: o
  } : void 0;
}
function Dn(e) {
  return e !== null && typeof e == "object" && "nodeType" in e && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
function On(e, t) {
  if (e === t) throw new Error("Cannot compare node with itself");
  const n = {
    a: wt(e),
    b: wt(t)
  };
  let o;
  for (; n.a.at(-1) === n.b.at(-1); )
    o = n.a.pop(), n.b.pop();
  A(
    o,
    "Stacking order can only be calculated for elements with a common ancestor"
  );
  const r = {
    a: xt(bt(n.a)),
    b: xt(bt(n.b))
  };
  if (r.a === r.b) {
    const i = o.childNodes, s = {
      a: n.a.at(-1),
      b: n.b.at(-1)
    };
    let l = i.length;
    for (; l--; ) {
      const a = i[l];
      if (a === s.a) return 1;
      if (a === s.b) return -1;
    }
  }
  return Math.sign(r.a - r.b);
}
const Nn = /\b(?:position|zIndex|opacity|transform|webkitTransform|mixBlendMode|filter|webkitFilter|isolation)\b/;
function Gn(e) {
  const t = getComputedStyle(Zt(e) ?? e).display;
  return t === "flex" || t === "inline-flex";
}
function _n(e) {
  const t = getComputedStyle(e);
  return !!(t.position === "fixed" || t.zIndex !== "auto" && (t.position !== "static" || Gn(e)) || +t.opacity < 1 || "transform" in t && t.transform !== "none" || "webkitTransform" in t && t.webkitTransform !== "none" || "mixBlendMode" in t && t.mixBlendMode !== "normal" || "filter" in t && t.filter !== "none" || "webkitFilter" in t && t.webkitFilter !== "none" || "isolation" in t && t.isolation === "isolate" || Nn.test(t.willChange) || t.webkitOverflowScrolling === "touch");
}
function bt(e) {
  let t = e.length;
  for (; t--; ) {
    const n = e[t];
    if (A(n, "Missing node"), _n(n)) return n;
  }
  return null;
}
function xt(e) {
  return e && Number(getComputedStyle(e).zIndex) || 0;
}
function wt(e) {
  const t = [];
  for (; e; )
    t.push(e), e = Zt(e);
  return t;
}
function Zt(e) {
  const { parentNode: t } = e;
  return Dn(t) ? t.host : t;
}
function Fn(e, t) {
  return e.x < t.x + t.width && e.x + e.width > t.x && e.y < t.y + t.height && e.y + e.height > t.y;
}
function qn(e) {
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
function Bn({
  axisElement: e,
  hitRegion: t,
  pointerEventTarget: n
}) {
  if (ot(n)) {
    const o = n.closest("dialog");
    if (o && !o.contains(e) && qn(o))
      return !1;
  }
  if (!ot(n) || n.contains(e) || e.contains(n))
    return !0;
  if (On(n, e) > 0) {
    let o = n;
    for (; o; ) {
      if (o.contains(e))
        return !0;
      if (Fn(o.getBoundingClientRect(), t))
        return !1;
      o = o.parentElement;
    }
  }
  return !0;
}
function ut(e, t) {
  const n = [];
  return t.forEach((o, r) => {
    if (r.disabled)
      return;
    const i = lt({ axis: r }), s = An(r.orientation, i, {
      x: e.clientX,
      y: e.clientY
    });
    s && s.distance.x <= 0 && s.distance.y <= 0 && Bn({
      axisElement: r.element,
      hitRegion: s.hitRegion.rect,
      pointerEventTarget: e.target
    }) && n.push(s.hitRegion);
  }), n;
}
function ye({
  layout: e,
  itemConstraints: t
}) {
  const n = t.map(({ itemId: s }) => e[s]), o = [...n], r = o.reduce(
    (s, l) => s + l,
    0
  );
  if (Object.keys(e).length !== t.length)
    throw Error(
      `Invalid ${t.length} panel layout: ${Object.values(e).map((s) => `${s}%`).join(", ")}`
    );
  if (!U(r, 100) && o.length > 0)
    for (let s = 0; s < t.length; s++) {
      const l = o[s];
      A(l != null, `No layout data found for index ${s}`);
      const a = 100 / r * l;
      o[s] = a;
    }
  let i = 0;
  for (let s = 0; s < t.length; s++) {
    const l = n[s];
    A(l != null, `No layout data found for index ${s}`);
    const a = o[s];
    A(a != null, `No layout data found for index ${s}`);
    const c = Me({
      overrideDisabledItems: !0,
      itemConstraints: t[s],
      prevSize: l,
      size: a
    });
    a != c && (i += a - c, o[s] = c);
  }
  if (!U(i, 0))
    for (let s = 0; s < t.length; s++) {
      const l = o[s];
      A(l != null, `No layout data found for index ${s}`);
      const a = l + i, c = Me({
        overrideDisabledItems: !0,
        itemConstraints: t[s],
        prevSize: l,
        size: a
      });
      if (l !== c && (i -= c - l, o[s] = c, U(i, 0)))
        break;
    }
  return o.reduce((s, l, a) => (s[t[a].itemId] = l, s), {});
}
function dt({
  axisId: e,
  itemId: t
}) {
  const n = () => {
    const a = Se();
    for (const [
      c,
      {
        defaultLayoutDeferred: u,
        derivedItemConstraints: d,
        layout: g,
        axisSize: m,
        separatorToItems: y
      }
    ] of a)
      if (c.id === e)
        return {
          defaultLayoutDeferred: u,
          derivedItemConstraints: d,
          axis: c,
          axisSize: m,
          layout: g,
          separatorToItems: y
        };
    throw Error(`Group ${e} not found`);
  }, o = () => {
    const a = n().derivedItemConstraints.find(
      (c) => c.itemId === t
    );
    if (a !== void 0)
      return a;
    throw Error(`Panel constraints not found for Panel ${t}`);
  }, r = () => {
    const a = n().axis.items.find((c) => c.id === t);
    if (a !== void 0)
      return a;
    throw Error(`Layout not found for Panel ${t}`);
  }, i = () => {
    const a = n().layout[t];
    if (a !== void 0)
      return a;
    throw Error(`Layout not found for Panel ${t}`);
  }, s = ({
    nextSize: a,
    items: c,
    prevLayout: u,
    derivedItemConstraints: d
  }) => {
    const g = i(), m = c.findIndex((p) => p.id === t), y = m === 0, f = m === c.length - 1;
    if (f && a < g && (y || c.slice(0, m).every((p, h) => {
      const L = d[h];
      return L?.collapsible && U(L.collapsedSize, u[L.itemId]);
    }))) {
      const p = c.slice(0, m).reduce((h, L) => h + u[L.id], 0);
      return {
        ...u,
        [t]: X(100 - p)
      };
    }
    return Fe({
      delta: f ? g - a : a - g,
      initialLayout: u,
      itemConstraints: d,
      pivotIndices: f ? [m - 1, m] : [m, m + 1],
      prevLayout: u,
      trigger: "imperative-api"
    });
  }, l = (a) => {
    const c = i();
    if (a === c)
      return;
    const {
      defaultLayoutDeferred: u,
      derivedItemConstraints: d,
      axis: g,
      axisSize: m,
      layout: y,
      separatorToItems: f
    } = n(), S = s({
      nextSize: a,
      items: g.items,
      prevLayout: y,
      derivedItemConstraints: d
    }), p = ye({
      layout: S,
      itemConstraints: d
    });
    se(y, p) || me(g, {
      defaultLayoutDeferred: u,
      derivedItemConstraints: d,
      axisSize: m,
      layout: p,
      requestedAxisSize: m,
      requestedLayout: p,
      separatorToItems: f
    });
  };
  return {
    collapse: () => {
      const { collapsible: a, collapsedSize: c } = o(), { mutableValues: u } = r(), d = i();
      a && d !== c && (u.expandToSize = d, l(c));
    },
    expand: () => {
      const { collapsible: a, collapsedSize: c, minSize: u } = o(), { mutableValues: d } = r(), g = i();
      if (a && g === c) {
        let m = d.expandToSize ?? u;
        m === 0 && (m = 1), l(m);
      }
    },
    getSize: () => {
      const { axis: a } = n(), c = i(), { element: u } = r(), d = a.layoutStrategy ? a.layoutStrategy.getItemSizeInPixels(t) : a.orientation === "horizontal" ? u.offsetWidth : u.offsetHeight;
      return {
        asPercentage: c,
        inPixels: d
      };
    },
    isCollapsed: () => {
      const { collapsible: a, collapsedSize: c } = o(), u = i();
      return a && U(c, u);
    },
    resize: (a) => {
      const { axis: c } = n(), { element: u } = r(), d = Pe({ axis: c }), g = Le({
        axisSize: d,
        itemElement: u,
        styleProp: a
      }), m = X(g / d * 100);
      l(m);
    }
  };
}
function zt(e) {
  if (e.defaultPrevented)
    return;
  const t = Se();
  ut(e, t).forEach((o) => {
    if (o.separator && !o.separator.disableDoubleClick) {
      const r = o.items.find(
        (i) => i.constraintProps.defaultSize !== void 0
      );
      if (r) {
        const i = r.constraintProps.defaultSize, s = dt({
          axisId: o.axis.id,
          itemId: r.id
        });
        s && i !== void 0 && (s.resize(i), e.preventDefault());
      }
    }
  });
}
function Qt(e) {
  const t = Se();
  for (const [n] of t)
    if (n.separators.some(
      (o) => o.element === e
    ))
      return n;
  throw Error("Could not find parent Group for separator element");
}
function Ne({
  axisId: e
}) {
  const t = () => {
    const n = Se();
    for (const [o, r] of n)
      if (o.id === e)
        return { axis: o, ...r };
    throw Error(`Could not find Group with id "${e}"`);
  };
  return {
    getLayout() {
      const { defaultLayoutDeferred: n, layout: o } = t();
      return n ? {} : o;
    },
    setLayout(n) {
      const {
        defaultLayoutDeferred: o,
        derivedItemConstraints: r,
        axis: i,
        axisSize: s,
        layout: l,
        separatorToItems: a
      } = t(), c = ye({
        layout: n,
        itemConstraints: r
      });
      return o ? l : (se(l, c) || me(i, {
        defaultLayoutDeferred: o,
        derivedItemConstraints: r,
        axisSize: s,
        layout: c,
        requestedAxisSize: s,
        requestedLayout: c,
        separatorToItems: a
      }), c);
    }
  };
}
function xe(e, t) {
  const n = Qt(e), o = ae(n.id, !0), r = n.separators.find(
    (d) => d.element === e
  );
  A(r, "Matching separator not found");
  const i = o.separatorToItems.get(r);
  A(i, "Matching panels not found");
  const s = i.map((d) => n.items.indexOf(d)), a = Ne({ axisId: n.id }).getLayout(), c = Fe({
    delta: t,
    initialLayout: a,
    itemConstraints: o.derivedItemConstraints,
    pivotIndices: s,
    prevLayout: a,
    trigger: "keyboard"
  }), u = ye({
    layout: c,
    itemConstraints: o.derivedItemConstraints
  });
  se(a, u) || me(
    n,
    {
      defaultLayoutDeferred: o.defaultLayoutDeferred,
      derivedItemConstraints: o.derivedItemConstraints,
      axisSize: o.axisSize,
      layout: u,
      requestedAxisSize: o.axisSize,
      requestedLayout: u,
      separatorToItems: o.separatorToItems
    },
    // Keyboard resizes (arrow keys, Home/End, Enter collapse/expand) originate
    // from a real DOM event on the separator, so they are user interactions
    // just like pointer drags. This function is only reached from
    // onDocumentKeyDown. See #716.
    { isUserInteraction: !0 }
  );
}
function It(e) {
  if (e.defaultPrevented)
    return;
  const t = e.currentTarget, n = Qt(t);
  if (!(n.disabled || n.separators.find(
    (r) => r.element === t
  )?.disabled))
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault(), n.orientation === "vertical" && xe(t, 5);
        break;
      }
      case "ArrowLeft": {
        e.preventDefault(), n.orientation === "horizontal" && xe(t, -5);
        break;
      }
      case "ArrowRight": {
        e.preventDefault(), n.orientation === "horizontal" && xe(t, 5);
        break;
      }
      case "ArrowUp": {
        e.preventDefault(), n.orientation === "vertical" && xe(t, -5);
        break;
      }
      case "End": {
        e.preventDefault(), xe(t, 100);
        break;
      }
      case "Enter": {
        e.preventDefault();
        const r = ae(n.id, !0), { derivedItemConstraints: i, layout: s, separatorToItems: l } = r, a = n.separators.find(
          (g) => g.element === t
        );
        A(a, "Matching separator not found");
        const c = l.get(a);
        A(c, "Matching panels not found");
        const u = c[0], d = i.find(
          (g) => g.itemId === u.id
        );
        if (A(d, "Panel metadata not found"), d.collapsible) {
          const g = s[u.id], m = d.collapsedSize === g ? n.mutableState.expandedItemSizes[u.id] ?? d.minSize : d.collapsedSize;
          xe(t, m - g);
        }
        break;
      }
      case "F6": {
        e.preventDefault();
        const r = n.separators.map(
          (a) => a.element
        ), i = Array.from(r).findIndex(
          (a) => a === e.currentTarget
        );
        A(i !== null, "Index not found");
        const s = e.shiftKey ? i > 0 ? i - 1 : r.length - 1 : i + 1 < r.length ? i + 1 : 0;
        r[s].focus({
          preventScroll: !0
        });
        break;
      }
      case "Home": {
        e.preventDefault(), xe(t, -100);
        break;
      }
    }
}
function Vn(e, t) {
  const { element: n, orientation: o, items: r } = e, i = n.getBoundingClientRect(), s = o === "horizontal";
  return lt({
    expandHitTargets: !1,
    axis: e,
    includeDisabled: !0
  }).map(({ items: a, rect: c, separator: u }, d) => {
    const g = r.indexOf(a[0]), m = s ? c.left + c.width / 2 : c.top + c.height / 2;
    return {
      active: t.some((f) => {
        if (f.axis !== e || f.items[0] !== a[0])
          return !1;
        if (u || f.separator)
          return f.separator === u;
        const S = s ? f.rect.left + f.rect.width / 2 : f.rect.top + f.rect.height / 2;
        return U(m, S);
      }),
      axis: e,
      key: u ? `separator-${u.id}` : `panel-${a[0].id}-${d}`,
      offset: 0,
      itemIndex: g,
      rect: new DOMRect(
        (s && !u ? m : c.left) - i.left - n.clientLeft + n.scrollLeft,
        (!s && !u ? m : c.top) - i.top - n.clientTop + n.scrollTop,
        s && !u ? 0 : c.width,
        !s && !u ? 0 : c.height
      ),
      separator: u
    };
  });
}
function Lt(e) {
  if (e.defaultPrevented)
    return;
  if (e.pointerType === "mouse" && e.button > 0)
    return;
  const t = Se(), n = ut(e, t);
  if (n.length === 0)
    return;
  const o = /* @__PURE__ */ new Map();
  let r = !1;
  n.forEach((s) => {
    s.separator && (r || (r = !0, s.separator.element.focus({
      // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#browser_compatibility
      focusVisible: !1,
      preventScroll: !0
    })));
    const l = t.get(s.axis);
    l && o.set(s.axis, l.layout);
  });
  const i = Array.from(o.keys()).flatMap(
    (s) => s.resizePreviewMode === "separator" ? Vn(s, n) : []
  );
  de({
    cursorFlags: 0,
    didPointerMove: !1,
    hitRegions: n,
    initialLayoutMap: o,
    pointerDownAtPoint: { x: e.clientX, y: e.clientY },
    previewLayoutMap: new Map(o),
    previews: i,
    state: "active"
  }), e.preventDefault();
}
function Ct(e) {
  const t = Se(), n = fe();
  switch (n.state) {
    case "active":
      ct({
        commit: !1,
        document: e.currentTarget,
        event: e,
        hitRegions: n.hitRegions,
        initialLayoutMap: n.initialLayoutMap,
        mountedAxes: t,
        prevCursorFlags: n.cursorFlags
      });
  }
}
function Rt(e) {
  if (e.defaultPrevented)
    return;
  const t = fe(), n = Se();
  switch (t.state) {
    case "active": {
      if (
        // Skip this check for "pointerleave" events, else Firefox triggers a false positive (see #514)
        e.buttons === 0
      ) {
        t.previewLayoutMap.forEach((o, r) => {
          const i = n.get(r);
          r.resizePreviewMode === "separator" && i && !se(o, i.layout) && me(r, {
            ...i,
            layout: o,
            requestedAxisSize: i.axisSize,
            requestedLayout: o
          });
        }), de({
          cursorFlags: 0,
          state: "inactive"
        }), t.hitRegions.forEach((o) => {
          if (!n.has(o.axis))
            return;
          const r = ae(o.axis.id, !0);
          me(o.axis, r, {
            isUserInteraction: !0
          });
        }), Ge(e.currentTarget);
        return;
      }
      for (const o of t.hitRegions)
        if (o.separator) {
          const { element: r } = o.separator;
          r.isConnected && !r.hasPointerCapture?.(e.pointerId) && r.setPointerCapture?.(e.pointerId);
        }
      ct({
        commit: !1,
        document: e.currentTarget,
        event: e,
        hitRegions: t.hitRegions,
        initialLayoutMap: t.initialLayoutMap,
        mountedAxes: n,
        pointerDownAtPoint: t.pointerDownAtPoint,
        prevCursorFlags: t.cursorFlags
      });
      break;
    }
    default: {
      const o = ut(e, n);
      o.length === 0 ? t.state !== "inactive" && de({
        cursorFlags: 0,
        state: "inactive"
      }) : de({
        cursorFlags: 0,
        hitRegions: o,
        state: "hover"
      }), Ge(e.currentTarget);
      break;
    }
  }
}
function Mt(e) {
  if (e.relatedTarget instanceof HTMLIFrameElement)
    switch (fe().state) {
      case "hover":
        de({
          cursorFlags: 0,
          state: "inactive"
        });
    }
}
function Et(e) {
  if (e.defaultPrevented)
    return;
  if (e.pointerType === "mouse" && e.button > 0)
    return;
  Jt(
    e.currentTarget,
    e
  ) && e.preventDefault();
}
function Hn(e) {
  let t = 0, n = 0;
  const o = {};
  for (const i of e)
    if (i.defaultSize !== void 0) {
      t++;
      const s = X(i.defaultSize);
      n += s, o[i.itemId] = s;
    } else
      o[i.itemId] = void 0;
  const r = e.length - t;
  if (r !== 0) {
    const i = X((100 - n) / r);
    for (const s of e)
      s.defaultSize === void 0 && (o[s.itemId] = i);
  }
  return o;
}
function jn(e, t) {
  const n = e.map((r) => r.id), o = Object.keys(t);
  if (n.length !== o.length)
    return !1;
  for (const r of n)
    if (!o.includes(r))
      return !1;
  return !0;
}
function Pt({
  axis: e,
  itemConstraints: t
}) {
  const n = e.items.map(({ id: r }) => r).join(","), o = e.mutableState.defaultLayout;
  return e.mutableState.layouts[n] ?? (o && jn(e.items, o) ? o : Hn(t));
}
function kt({
  itemIds: e,
  layout: t
}) {
  return ye({
    layout: t,
    itemConstraints: e.map((n) => ({
      collapsedSize: 0,
      collapsible: !1,
      defaultSize: void 0,
      disabled: void 0,
      itemId: n,
      maxSize: 100,
      minSize: 0
    }))
  });
}
function Un(e, t, n) {
  if (!n[0])
    return;
  const r = e.items.find((c) => c.element === t);
  if (!r || !r.onResize)
    return;
  const i = Pe({ axis: e }), s = e.orientation === "horizontal" ? r.element.offsetWidth : r.element.offsetHeight, l = r.mutableValues.prevSize, a = {
    asPercentage: X(s / i * 100),
    inPixels: s
  };
  r.mutableValues.prevSize = a, r.onResize(a, r.id, l);
}
function en(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length)
    return !1;
  for (const o in e)
    if (e[o] !== t[o])
      return !1;
  return !0;
}
function Wn(e, t) {
  return e.length !== t.length ? !1 : e.every((n, o) => en(n, t[o]));
}
function Yn({
  axis: e,
  nextAxisSize: t,
  prevAxisSize: n,
  prevLayout: o
}) {
  if (n <= 0 || t <= 0 || n === t)
    return o;
  let r = 0, i = 0, s = !1;
  const l = /* @__PURE__ */ new Map(), a = [];
  for (const d of e.items) {
    const g = o[d.id] ?? 0;
    switch (d.constraintProps.groupResizeBehavior) {
      case "preserve-pixel-size": {
        s = !0;
        const m = g / 100 * n, y = X(
          m / t * 100
        );
        l.set(d.id, y), r += y;
        break;
      }
      case "preserve-relative-size":
      default: {
        a.push(d.id), i += g;
        break;
      }
    }
  }
  if (!s || a.length === 0)
    return o;
  const c = 100 - r, u = { ...o };
  if (l.forEach((d, g) => {
    u[g] = d;
  }), i > 0)
    for (const d of a) {
      const g = o[d] ?? 0;
      u[d] = X(
        g / i * c
      );
    }
  else {
    const d = X(c / a.length);
    for (const g of a)
      u[g] = d;
  }
  return u;
}
const Ie = /* @__PURE__ */ new Map();
function tn(e) {
  let t = !0;
  A(
    e.element.ownerDocument.defaultView,
    "Cannot register an unmounted Group"
  );
  const n = e.element.ownerDocument.defaultView.ResizeObserver, o = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), i = new n((m) => {
    for (const y of m) {
      const { borderBoxSize: f, target: S } = y;
      if (S === e.element) {
        if (t) {
          const p = Pe({ axis: e });
          if (p === 0)
            return;
          const h = ae(e.id);
          if (!h)
            return;
          const L = rt(e);
          let w = h.requestedAxisSize, C = h.requestedLayout;
          h.defaultLayoutDeferred && (w = p, C = kt({
            itemIds: e.items.map(({ id: b }) => b),
            layout: Pt({
              axis: e,
              itemConstraints: L
            })
          }));
          const O = Yn({
            axis: e,
            nextAxisSize: p,
            prevAxisSize: w,
            prevLayout: C
          }), D = ye({
            layout: O,
            itemConstraints: L
          });
          if (!h.defaultLayoutDeferred && se(h.layout, D) && Wn(
            h.derivedItemConstraints,
            L
          ) && h.axisSize === p)
            continue;
          me(e, {
            defaultLayoutDeferred: !1,
            derivedItemConstraints: L,
            axisSize: p,
            layout: D,
            requestedAxisSize: w,
            requestedLayout: C,
            separatorToItems: h.separatorToItems
          });
        }
      } else
        Un(e, S, f);
    }
  });
  i.observe(e.element), e.items.forEach((m) => {
    A(
      !o.has(m.id),
      `Panel ids must be unique; id "${m.id}" was used more than once`
    ), o.add(m.id), m.onResize && i.observe(m.element);
  });
  const s = Pe({ axis: e }), l = rt(e), a = Pt({
    axis: e,
    itemConstraints: l
  }), c = ye({
    layout: a,
    itemConstraints: l
  }), u = e.element.ownerDocument;
  Ie.set(
    u,
    (Ie.get(u) ?? 0) + 1
  );
  const d = /* @__PURE__ */ new Map();
  return lt({ axis: e, includeDisabled: !0 }).forEach((m) => {
    m.separator && d.set(m.separator, m.items);
  }), me(e, {
    defaultLayoutDeferred: s === 0,
    derivedItemConstraints: l,
    axisSize: s,
    layout: c,
    requestedAxisSize: s,
    requestedLayout: kt({
      itemIds: e.items.map(({ id: m }) => m),
      layout: a
    }),
    separatorToItems: d
  }), e.separators.forEach((m) => {
    A(
      !r.has(m.id),
      `Separator ids must be unique; id "${m.id}" was used more than once`
    ), r.add(m.id), m.element.addEventListener("keydown", It);
  }), Ie.get(u) === 1 && (u.addEventListener("contextmenu", vt, !0), u.addEventListener("dblclick", zt, !0), u.addEventListener("pointerdown", Lt, !0), u.addEventListener("pointerleave", Ct), u.addEventListener("pointermove", Rt), u.addEventListener("pointerout", Mt), u.addEventListener("pointerup", Et, !0)), function() {
    t = !1, Ie.set(
      u,
      Math.max(0, (Ie.get(u) ?? 0) - 1)
    ), $n(e), wn(e) && Ge(u), e.separators.forEach((y) => {
      y.element.removeEventListener("keydown", It);
    }), Ie.get(u) || (u.removeEventListener(
      "contextmenu",
      vt,
      !0
    ), u.removeEventListener(
      "dblclick",
      zt,
      !0
    ), u.removeEventListener(
      "pointerdown",
      Lt,
      !0
    ), u.removeEventListener("pointerleave", Ct), u.removeEventListener("pointermove", Rt), u.removeEventListener("pointerout", Mt), u.removeEventListener("pointerup", Et, !0)), i.disconnect();
  };
}
function nn({
  derivedItemConstraints: e,
  axis: t,
  layout: n,
  prevLayout: o,
  requestedLayout: r
}) {
  const i = t.items.map(({ id: s }) => s).join(",");
  t.mutableState.layouts[i] = r, o && e.forEach((s) => {
    if (s.collapsible) {
      const l = U(
        s.collapsedSize,
        n[s.itemId]
      ), a = U(
        s.collapsedSize,
        o[s.itemId]
      );
      l && !a && (t.mutableState.expandedItemSizes[s.itemId] = o[s.itemId]);
    }
  });
}
function on() {
  const [e, t] = he({}), n = te(() => t({}), []);
  return [e, n];
}
function Xe(e) {
  const t = q({ ...e });
  return ne(() => {
    for (const n in e)
      t.current[n] = e[n];
  }, [e]), t.current;
}
const ft = Nt(null);
function Kn({
  layout: e,
  itemConstraints: t,
  itemId: n,
  itemIndex: o
}) {
  let r, i;
  const s = e[n], l = t.find(
    (a) => a.itemId === n
  );
  if (l) {
    const a = l.maxSize, c = l.collapsible ? l.collapsedSize : l.minSize, u = [o, o + 1];
    i = ye({
      layout: Fe({
        delta: c - s,
        initialLayout: e,
        itemConstraints: t,
        pivotIndices: u,
        prevLayout: e
      }),
      itemConstraints: t
    })[n], r = ye({
      layout: Fe({
        delta: a - s,
        initialLayout: e,
        itemConstraints: t,
        pivotIndices: u,
        prevLayout: e
      }),
      itemConstraints: t
    })[n];
  }
  return {
    valueControls: n,
    valueMax: r,
    valueMin: i,
    valueNow: s
  };
}
function rn({
  attributes: e,
  axisId: t,
  axisOrientation: n,
  children: o,
  className: r,
  disableCursor: i,
  disabled: s,
  disableDoubleClick: l,
  elementRef: a,
  id: c,
  isSharedHitRegion: u,
  preview: d,
  registerSeparator: g,
  requiredStyle: m,
  style: y,
  styleDefaults: f,
  tabIndex: S = 0,
  updateSeparatorProps: p
}) {
  const h = Xe({
    disabled: s,
    disableDoubleClick: l,
    children: o,
    className: r,
    preview: d,
    style: y
  }), [L, w] = he({}), [C, O] = he("inactive"), [D, b] = he(!1), x = q(null), v = q(null), E = Be(x, a), P = n === "horizontal" ? "vertical" : "horizontal";
  ne(() => {
    const z = x.current;
    if (z !== null) {
      const I = {
        disabled: h.disabled,
        disableDoubleClick: h.disableDoubleClick,
        element: z,
        id: c,
        get children() {
          return h.children;
        },
        get className() {
          return h.className;
        },
        get preview() {
          return h.preview;
        },
        get style() {
          return h.style;
        }
      };
      v.current = I;
      const _ = g(I), Y = Ht(
        (K) => {
          O(
            K.next.state !== "inactive" && K.next.hitRegions.some(
              (oe) => oe.separator === I || (u?.(oe) ?? !1)
            ) ? K.next.state : "inactive"
          );
        }
      ), J = _e(
        t,
        (K) => {
          const { derivedItemConstraints: oe, layout: we, separatorToItems: $e } = K.next, ze = $e.get(I);
          if (ze) {
            const re = ze[0], R = oe.findIndex(
              (N) => N.itemId === re.id
            ), { layoutStrategy: $ } = K.axis;
            w({
              ...Kn({
                layout: we,
                itemConstraints: oe,
                itemId: re.id,
                itemIndex: R
              }),
              // Items without DOM elements of their own (e.g. Grid tracks) control other elements
              ...$?.getItemAriaControls && {
                valueControls: $.getItemAriaControls(
                  re.id
                )
              }
            });
          }
        }
      );
      return () => {
        v.current = null, Y(), J(), _();
      };
    }
  }, [t, c, u, g, h]), ne(() => {
    const z = v.current;
    z && xn(z);
  }, [d]), qe(() => {
    p(c, { disabled: s, disableDoubleClick: l });
  }, [s, l, c, p]);
  let k;
  s && !i && (k = "not-allowed");
  let M;
  if (s)
    M = "disabled";
  else
    switch (C) {
      case "active": {
        M = "active";
        break;
      }
      default:
        D ? M = "focus" : M = C;
    }
  return /* @__PURE__ */ W(
    "div",
    {
      ...e,
      "aria-controls": L.valueControls,
      "aria-disabled": s || void 0,
      "aria-orientation": P,
      "aria-valuemax": L.valueMax,
      "aria-valuemin": L.valueMin,
      "aria-valuenow": L.valueNow,
      children: o,
      className: r,
      "data-separator": M,
      "data-testid": c,
      id: c,
      onBlur: () => b(!1),
      onFocus: () => b(!0),
      ref: E,
      role: "separator",
      style: {
        ...f,
        cursor: k,
        ...y,
        ...m,
        // Inform the browser that the library is handling touch events for this element
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: "none"
      },
      tabIndex: s ? void 0 : S
    }
  );
}
function $t({
  axis: e,
  children: t,
  className: n,
  crossSpan: o,
  crossStart: r,
  disabled: i,
  elementRef: s,
  index: l,
  style: a
}) {
  const c = ke(void 0), {
    getDisableCursor: u,
    getResizeAxisId: d,
    gutters: g,
    registerSeparator: m,
    separatorPlacements: y,
    trackCounts: f,
    updateSeparatorProps: S
  } = qt(), p = d(e), h = e === "column" ? "row" : "column", L = f[h], w = !!i || !st(l, f[e]);
  let C = !0;
  for (const v of y.values())
    if (v.axis === e && v.index === l && !v.disabled && v.crossStart < r) {
      C = !1;
      break;
    }
  const O = te(
    (v) => v.axis.id === p && v.axis.items.indexOf(v.items[1]) === l,
    [p, l]
  ), D = te(
    (v) => m(
      {
        axis: e,
        crossSpan: o,
        crossStart: r,
        disabled: !!i,
        index: l
      },
      v
    ),
    [e, o, r, i, l, m]
  ), b = pn(l), x = hn({
    crossCount: L,
    crossSpan: o,
    crossStart: r,
    hasGutters: g[h]
  });
  return /* @__PURE__ */ W(
    rn,
    {
      axisId: p,
      axisOrientation: e === "column" ? "horizontal" : "vertical",
      className: n,
      disableCursor: u(),
      disabled: w,
      disableDoubleClick: void 0,
      elementRef: s,
      id: c,
      isSharedHitRegion: O,
      registerSeparator: D,
      requiredStyle: {
        gridColumn: e === "column" ? b : x,
        gridRow: e === "row" ? b : x
      },
      style: a,
      tabIndex: C ? 0 : -1,
      updateSeparatorProps: S,
      children: t
    }
  );
}
function sn(e) {
  const { children: t, className: n, disabled: o, elementRef: r, style: i } = e;
  return e.type === "column" ? /* @__PURE__ */ W(
    $t,
    {
      axis: "column",
      className: n,
      crossSpan: e.rowSpan,
      crossStart: e.row ?? 0,
      disabled: o,
      elementRef: r,
      index: e.column,
      style: i,
      children: t
    }
  ) : /* @__PURE__ */ W(
    $t,
    {
      axis: "row",
      className: n,
      crossSpan: e.columnSpan,
      crossStart: e.column ?? 0,
      disabled: o,
      elementRef: r,
      index: e.row,
      style: i,
      children: t
    }
  );
}
sn.displayName = "Gridline";
const Ce = ["column", "row"], Tt = { columns: {}, rows: {} };
function Xn({
  children: e,
  className: t,
  columns: n,
  defaultLayout: o,
  disableCursor: r,
  disabled: i,
  elementRef: s,
  gridRef: l,
  id: a,
  onLayoutChange: c,
  onLayoutChanged: u,
  resizeTargetMinimumSize: d = {
    coarse: 20,
    fine: 10
  },
  rows: g,
  style: m,
  ...y
}) {
  const f = ke(a), S = te(
    (R) => R === "column" ? `${f}:columns` : `${f}:rows`,
    [f]
  ), p = At(n, "columns"), h = At(g, "rows"), L = (R) => R === "column" ? p : h, w = q({
    onLayoutChange: Tt,
    onLayoutChanged: Tt
  }), C = ge((R) => {
    Dt(w.current.onLayoutChange, R) || (w.current.onLayoutChange = R, c?.(R));
  }), O = ge(
    (R, $, N) => {
      Dt(w.current.onLayoutChanged, R) || (w.current.onLayoutChanged = R, u?.(R, { isUserInteraction: $, requestedLayout: N }));
    }
  ), D = q(null), b = Be(D, s), [x, v] = on(), E = q({
    cells: [],
    column: { expandedItemSizes: {}, layouts: {} },
    loggedErrors: /* @__PURE__ */ new Set(),
    row: { expandedItemSizes: {}, layouts: {} },
    separators: /* @__PURE__ */ new Map()
  }), P = { column: !1, row: !1 };
  for (const R of E.current.separators.values())
    P[R.axis] = !0;
  an(e, P);
  const k = Xe({
    defaultLayout: o,
    disableCursor: r,
    resizeTargetMinimumSize: d
  }), M = ge(() => !!k.disableCursor), z = te(
    (R) => {
      const $ = E.current;
      return $.cells = [...$.cells, R], v(), () => {
        $.cells = $.cells.filter(
          (N) => N !== R
        ), v();
      };
    },
    [v]
  ), I = te(
    (R, $) => {
      const N = E.current;
      return N.separators = new Map(N.separators), N.separators.set($, R), v(), () => {
        N.separators = new Map(N.separators), N.separators.delete($), v();
      };
    },
    [v]
  ), _ = te(
    (R, {
      disabled: $,
      disableDoubleClick: N
    }) => {
      for (const G of E.current.separators.keys())
        G.id === R && (G.disabled = $, G.disableDoubleClick = N);
    },
    []
  ), Y = E.current.separators, J = Ee(
    () => ({
      getDisableCursor: M,
      getResizeAxisId: S,
      gutters: {
        column: P.column,
        row: P.row
      },
      id: f,
      registerCell: z,
      registerSeparator: I,
      separatorPlacements: Y,
      trackCounts: {
        column: p.length,
        row: h.length
      },
      updateSeparatorProps: _
    }),
    [
      p.length,
      M,
      S,
      P.column,
      P.row,
      f,
      z,
      I,
      h.length,
      Y,
      _
    ]
  ), K = q([]);
  ne(() => {
    const R = D.current;
    if (R === null)
      return;
    const $ = E.current, N = Zn({
      cells: $.cells,
      separatorPlacements: $.separators,
      trackCounts: { column: p.length, row: h.length }
    });
    N.forEach((T) => {
      $.loggedErrors.has(T) || console.error(T);
    }), $.loggedErrors = new Set(N);
    const G = (T) => Array.from($.separators.entries()).filter(([, j]) => j.axis === T).sort(([, j], [, ve]) => j.index - ve.index).map(([j]) => j), F = (T) => {
      const j = T === "column" ? p : h, ve = T === "column" ? h : p, pe = j.map((Z) => Z.id), Ve = S(T), He = G(T), be = He.length > 0, je = j.map(
        ({ id: Z, ...ee }, Q) => ({
          // Tracks don't have DOM elements of their own;
          // the Grid element is used to resolve relative size constraints (e.g. "em")
          element: R,
          id: pe[Q],
          idIsStable: !0,
          mutableValues: {
            expandToSize: void 0,
            prevSize: void 0
          },
          onResize: void 0,
          constraintProps: ee
        })
      ), Ae = () => {
        const Z = [];
        if (be) {
          for (const [ee, Q] of $.separators)
            if (Q.axis === T && st(Q.index, j.length)) {
              const Oe = ee.element.getBoundingClientRect();
              Z[Q.index] = Math.max(
                Z[Q.index] ?? 0,
                T === "column" ? Oe.width : Oe.height
              );
            }
        }
        return vn({
          axis: T,
          element: R,
          gutterSizes: Z.filter((ee) => ee !== void 0),
          hasGutters: be,
          layout: ae(Ve)?.layout,
          trackIds: pe
        });
      };
      let De;
      const Ze = k.defaultLayout?.[T === "column" ? "columns" : "rows"];
      if (Ze !== void 0 && Object.keys(Ze).length === pe.length) {
        De = {};
        for (const Z of pe) {
          const ee = Ze[Z];
          ee !== void 0 && (De[Z] = ee);
        }
      }
      return {
        disabled: !!i,
        element: R,
        id: Ve,
        layoutStrategy: {
          getItemAriaControls: (Z) => {
            const ee = pe.indexOf(Z);
            return $.cells.filter((Q) => {
              const Oe = T === "column" ? Q.column : Q.row, cn = T === "column" ? Q.columnSpan : Q.rowSpan;
              return Oe <= ee && ee < Oe + cn;
            }).map((Q) => Q.element.id).filter(Boolean).join(" ") || void 0;
          },
          calculateAvailableSize: () => Ae().availableSize,
          calculateHitRegions: ({
            expandHitTargets: Z,
            axis: ee,
            includeDisabled: Q
          }) => Sn({
            axis: T,
            cells: $.cells,
            crossTrackCount: ve.length,
            expandHitTargets: Z,
            resizeAxis: ee,
            axisSize: Ae().availableSize,
            includeDisabled: Q,
            separatorPlacements: $.separators
          }),
          getItemSizeInPixels: (Z) => Ae().trackSizes[pe.indexOf(Z)] ?? 0
        },
        mutableState: {
          defaultLayout: De,
          disableCursor: !!k.disableCursor,
          expandedItemSizes: $[T].expandedItemSizes,
          layouts: $[T].layouts
        },
        orientation: T === "column" ? "horizontal" : "vertical",
        items: je,
        resizePreviewMode: "panel",
        get resizeTargetMinimumSize() {
          return k.resizeTargetMinimumSize;
        },
        separators: He
      };
    }, V = Ce.map(F);
    K.current = V;
    const H = V.map((T) => tn(T)), ie = () => {
      const [T, j] = V.map(
        (ve) => ae(ve.id)
      );
      if (!(!T || !j || T.defaultLayoutDeferred || j.defaultLayoutDeferred))
        return {
          layout: { columns: T.layout, rows: j.layout },
          requestedLayout: {
            columns: T.requestedLayout,
            rows: j.requestedLayout
          }
        };
    };
    {
      const T = ie();
      T && (C(T.layout), O(T.layout, !1, T.requestedLayout));
    }
    const Te = V.map(
      (T) => _e(T.id, (j) => {
        const {
          defaultLayoutDeferred: ve,
          derivedItemConstraints: pe,
          layout: Ve,
          requestedLayout: He
        } = j.next;
        if (ve || pe.length === 0)
          return;
        nn({
          derivedItemConstraints: pe,
          axis: T,
          layout: Ve,
          prevLayout: j.prev?.layout,
          requestedLayout: He
        });
        const be = ie();
        if (be) {
          const je = fe(), Ae = je.state !== "active" || !je.hitRegions.some(
            (De) => V.includes(De.axis)
          );
          C(be.layout), Ae && O(
            be.layout,
            j.isUserInteraction,
            be.requestedLayout
          );
        }
      })
    );
    return () => {
      K.current = [], H.forEach((T) => T()), Te.forEach((T) => T());
    };
  }, [
    p,
    i,
    S,
    f,
    O,
    C,
    h,
    x,
    k
  ]), qe(() => {
    K.current.forEach((R) => {
      R.mutableState.defaultLayout = o?.[R.orientation === "horizontal" ? "columns" : "rows"], R.mutableState.disableCursor = !!r;
    });
  }), it(l, () => {
    const R = () => {
      const [G, F] = Ce.map(S);
      return !Re(G) || !Re(F) ? { columns: {}, rows: {} } : {
        columns: Ne({
          axisId: G
        }).getLayout(),
        rows: Ne({ axisId: F }).getLayout()
      };
    }, $ = (G) => G.map((F) => `"${F}"`).join(", "), N = (G, F) => {
      const V = S(G), H = () => {
        const ie = Re(V);
        return A(ie, `Grid "${f}" has not been mounted`), A(
          ie.items.some((Te) => Te.id === F),
          `Grid "${f}" no longer contains a ${G} with id "${F}"; ${G} ids are ${$(ie.items.map((Te) => Te.id))}`
        ), dt({ axisId: V, itemId: F });
      };
      return {
        collapse: () => H().collapse(),
        expand: () => H().expand(),
        getSize: () => H().getSize(),
        isCollapsed: () => H().isCollapsed(),
        resize: (ie) => H().resize(ie)
      };
    };
    return {
      getLayout: R,
      getTrackById: (G, F) => {
        const V = G === "column" ? p : h, H = `${F}`;
        return A(
          V.some((ie) => ie.id === H),
          `Grid "${f}" does not contain a ${G} with id "${H}"; ${G} ids are ${$(V.map((ie) => ie.id))}`
        ), N(G, H);
      },
      getTrackByIndex: (G, F) => {
        const V = G === "column" ? p : h, H = Number.isInteger(F) ? V[F] : void 0;
        return A(
          H,
          `Grid "${f}" does not contain a ${G} at index ${F}; it has ${V.length} ${G}s`
        ), N(G, H.id);
      },
      setLayout: (G) => (Ce.forEach((F) => {
        const V = G[F === "column" ? "columns" : "rows"], H = S(F);
        V && Re(H) && Ne({ axisId: H }).setLayout(V);
      }), R())
    };
  }, [p, S, f, h]);
  const oe = () => Ce.map((R) => {
    const $ = ae(S(R)), N = L(R);
    return ($ && !$.defaultLayoutDeferred ? N.map((F) => `minmax(0, ${$.layout[F.id] ?? 1}fr)`) : Jn(
      N,
      o?.[R === "column" ? "columns" : "rows"]
    )).join(P[R] ? " auto " : " ");
  }).join("|"), we = te(
    (R) => {
      const $ = Ce.map(
        (N) => _e(S(N), R)
      );
      return () => $.forEach((N) => N());
    },
    [S]
  ), $e = Ke(
    we,
    oe,
    oe
  ), [ze, re] = $e.split("|");
  return /* @__PURE__ */ W(Ft.Provider, { value: J, children: /* @__PURE__ */ W(
    "div",
    {
      ...y,
      className: t,
      "data-grid": !0,
      "data-testid": f,
      id: f,
      ref: b,
      style: {
        height: "100%",
        width: "100%",
        overflow: "hidden",
        ...m,
        display: "grid",
        gridTemplateColumns: ze,
        gridTemplateRows: re,
        // Inform the browser that the library is handling touch events for this element
        // NOTE This is not an inherited style
        touchAction: "none"
      },
      children: /* @__PURE__ */ W(ft.Provider, { value: null, children: e })
    }
  ) });
}
Xn.displayName = "Grid";
function At(e, t) {
  const n = JSON.stringify(e);
  return Ee(() => {
    const o = typeof e == "number" ? Array.from({ length: e }, (r, i) => ({ id: `${i}` })) : e.map((r, i) => ({
      ...r,
      id: `${r.id ?? i}`
    }));
    return A(
      o.length > 0,
      `Grid must have at least one track; "${t}" is ${n}`
    ), o;
  }, [n]);
}
function an(e, t) {
  fn.forEach(e, (n) => {
    if (_t(n))
      if (n.type === sn) {
        const { type: o } = n.props;
        o === "column" ? t.column = !0 : o === "row" && (t.row = !0);
      } else // Fragments
      typeof n.type == "symbol" && n.props !== null && typeof n.props == "object" && "children" in n.props && an(n.props.children, t);
  });
}
function Jn(e, t) {
  if (t)
    return e.map(
      (i) => `minmax(0, ${t[i.id] ?? 1}fr)`
    );
  const n = e.map(
    (i) => i.defaultSize === void 0 ? void 0 : Bt(i.defaultSize)
  );
  let o = 100, r = 0;
  return n.forEach((i) => {
    i === void 0 ? r++ : i[1] === "%" && (o -= i[0]);
  }), n.map((i) => {
    if (i === void 0)
      return `minmax(0, ${Math.max(0, o) / Math.max(1, r)}fr)`;
    const [s, l] = i;
    return l === "%" ? `minmax(0, ${s}fr)` : `${s}${l}`;
  });
}
function Zn({
  cells: e,
  separatorPlacements: t,
  trackCounts: n
}) {
  const o = [];
  for (const l of e)
    Ce.forEach((a) => {
      const [c, u] = a === "column" ? [l.column, l.columnSpan] : [l.row, l.rowSpan], d = n[a];
      (!Number.isInteger(c) || !Number.isInteger(u) || c < 0 || u < 1 || c + u > d) && o.push(
        `Invalid Cell ${a} placement (${a}: ${c}, ${a}Span: ${u}); Grid has ${d} ${a}s`
      );
    });
  const r = ({
    axis: l,
    crossSpan: a,
    crossStart: c,
    disabled: u,
    index: d
  }) => {
    const g = l === "column" ? "row" : "column";
    let m = `type="${l}" ${l}={${d}}`;
    return (c !== 0 || a !== void 0) && (m += ` ${g}={${c}}`), a !== void 0 && (m += ` ${g}Span={${a}}`), u && (m += " disabled"), `<Gridline ${m} />`;
  }, i = Array.from(t.values()).filter(
    (l) => {
      const { axis: a, crossSpan: c, crossStart: u, index: d } = l, g = a === "column" ? "row" : "column", m = n[a], y = n[g];
      let f = !0;
      return st(d, m) || (o.push(
        `Invalid ${a} Gridline ${a} (${d}); must be between 1 and ${m - 1}`
      ), f = !1), !Number.isInteger(u) || u < 0 || u >= y ? (o.push(
        `Invalid ${a} Gridline ${g} (${u}); must be between 0 and ${y - 1}`
      ), f = !1) : c !== void 0 && (!Number.isInteger(c) || c < 1 || u + c > y) && (o.push(
        `Invalid ${a} Gridline ${g}Span (${c}); Grid has ${y} ${g}s`
      ), f = !1), f;
    }
  ), s = (l) => {
    const a = n[l.axis === "column" ? "row" : "column"];
    return [
      l.crossStart,
      l.crossSpan === void 0 ? a : l.crossStart + l.crossSpan
    ];
  };
  return i.forEach((l, a) => {
    const { axis: c, index: u } = l, [d, g] = s(l);
    for (const m of e) {
      const [y, f, S, p] = c === "column" ? [m.column, m.columnSpan, m.row, m.rowSpan] : [m.row, m.rowSpan, m.column, m.columnSpan];
      if (y < u && u < y + f && S < g && d < S + p) {
        const h = c === "column" ? "row" : "column";
        o.push(
          `${r(l)} overlaps a Cell that spans across it (${c}: ${y}, ${c}Span: ${f}, ${h}: ${S}, ${h}Span: ${p}); use the ${h} and ${h}Span props to render gridlines beside the Cell instead`
        );
      }
    }
    for (const m of i.slice(a + 1))
      if (m.axis === c && m.index === u) {
        const [y, f] = s(m);
        y < g && d < f && o.push(`${r(l)} overlaps ${r(m)}`);
      }
  }), o;
}
function Dt(e, t) {
  return se(e.columns, t.columns) && se(e.rows, t.rows);
}
function yo({
  id: e,
  onlySaveAfterUserInteractions: t,
  storage: n = localStorage
}) {
  const o = `react-resizable-panels:grid:${e}`, r = Ke(
    Qn,
    () => n.getItem(o),
    () => n.getItem(o)
  ), i = Ee(() => {
    if (r)
      try {
        const l = JSON.parse(r);
        if (l !== null && typeof l == "object")
          return l;
      } catch {
      }
  }, [r]), s = te(
    (l, a) => {
      if (!(t && !a.isUserInteraction))
        try {
          n.setItem(
            o,
            JSON.stringify(a.requestedLayout ?? l)
          );
        } catch (c) {
          console.error(c);
        }
    },
    [t, n, o]
  );
  return {
    /**
     * Pass this value to `Grid` as the `defaultLayout` prop.
     */
    defaultLayout: i,
    /**
     * Attach this callback on the `Grid` as the `onLayoutChanged` prop.
     */
    onLayoutChanged: s
  };
}
function Qn() {
  return function() {
  };
}
function So() {
  return he(null);
}
function vo() {
  return q(null);
}
function eo({
  separator: e
}) {
  const { element: t } = e, n = q(null);
  return ne(() => {
    const o = t.cloneNode(!0), r = [t, ...t.querySelectorAll("*")], i = [o, ...o.querySelectorAll("*")], s = t.ownerDocument.defaultView;
    return r.forEach((l, a) => {
      const c = i[a];
      if (c instanceof s.HTMLElement || c instanceof s.SVGElement) {
        const u = s.getComputedStyle(l);
        for (let d = 0; d < u.length; d++) {
          const g = u.item(d);
          c.style.setProperty(
            g,
            u.getPropertyValue(g)
          );
        }
      }
      c.removeAttribute("data-testid"), c.removeAttribute("id");
    }), Object.assign(o.style, {
      boxSizing: "border-box",
      height: "100%",
      margin: "0",
      position: "static",
      transform: "none",
      width: "100%"
    }), n.current.appendChild(o), () => o.remove();
  }, [t]), /* @__PURE__ */ W(
    "div",
    {
      ref: n,
      style: {
        height: "100%",
        opacity: 0.65,
        pointerEvents: "none",
        width: "100%"
      }
    }
  );
}
function Je() {
  const e = Gt(ft);
  return A(
    e,
    "Group Context not found; did you render a Panel or Separator outside of a Group?"
  ), e;
}
function ln(e) {
  const { registerOverlay: t } = Je(), n = q(e);
  en(n.current, e) || (n.current = e);
  const o = n.current;
  return ne(
    () => t(o),
    [t, o]
  ), null;
}
ln.displayName = "SeparatorOverlay";
function to({
  active: e,
  orientation: t,
  style: n,
  ...o
}) {
  let r;
  switch (t) {
    case "horizontal": {
      r = {
        height: "100%",
        minWidth: "1px"
      };
      break;
    }
    case "vertical": {
      r = {
        minHeight: "1px",
        width: "100%"
      };
      break;
    }
  }
  return /* @__PURE__ */ W(
    "div",
    {
      ...o,
      "data-separator-overlay": e ? "active" : "inactive",
      style: {
        ...r,
        ...n,
        flexShrink: 0,
        pointerEvents: "none"
      }
    }
  );
}
function no({
  overlay: e,
  preview: t
}) {
  const { axis: n, offset: o, rect: r, separator: i } = t, s = n.orientation === "horizontal";
  let l = i?.preview, a = e;
  return _t(l) && l.type === ln && (a = l.props, l = void 0), l == null && (a ? l = /* @__PURE__ */ W(
    to,
    {
      ...a,
      active: t.active,
      orientation: n.orientation
    }
  ) : i && (l = /* @__PURE__ */ W(eo, { separator: i }))), /* @__PURE__ */ W(
    "div",
    {
      "aria-hidden": "true",
      "data-resize-preview": !0,
      inert: !0,
      style: {
        height: r.height,
        left: r.left,
        pointerEvents: "none",
        position: "absolute",
        top: r.top,
        transform: s ? `translateX(${o}px)` : `translateY(${o}px)`,
        width: r.width
      },
      children: l
    }
  );
}
function oo(e, t) {
  const n = q({
    getLayout: () => ({}),
    setLayout: zn
  });
  it(t, () => n.current, []), ne(() => {
    Object.assign(
      n.current,
      Ne({ axisId: e })
    );
  });
}
function ro({
  groupId: e,
  resizePreviewMode: t
}) {
  const [n, o] = he([]), r = q(n);
  return ne(() => {
    const i = (l) => {
      const a = Re(e), c = t === "separator" && l.state === "active" ? l.previews.filter(
        (d) => d.axis === a && (d.active || !U(d.offset, 0))
      ) : [], u = r.current;
      u.length === c.length && c.every(
        (d, g) => d === u[g]
      ) || (r.current = c, o(c));
    };
    if (t !== "separator") {
      i(fe());
      return;
    }
    const s = Ht(
      ({ next: l }) => i(l)
    );
    return i(fe()), s;
  }, [e, t]), n;
}
function io({
  children: e,
  className: t,
  defaultLayout: n,
  disableCursor: o,
  disabled: r,
  elementRef: i,
  groupRef: s,
  id: l,
  onLayoutChange: a,
  onLayoutChanged: c,
  orientation: u = "horizontal",
  resizePreviewMode: d = "panel",
  resizeTargetMinimumSize: g = {
    coarse: 20,
    fine: 10
  },
  style: m,
  ...y
}) {
  const f = q({
    onLayoutChange: {},
    onLayoutChanged: {}
  }), S = ge((z) => {
    se(f.current.onLayoutChange, z) || (f.current.onLayoutChange = z, a?.(z));
  }), p = ge(
    (z, I, _) => {
      se(f.current.onLayoutChanged, z) || (f.current.onLayoutChanged = z, c?.(z, { isUserInteraction: I, requestedLayout: _ }));
    }
  ), h = ke(l), [L, w] = he(), C = ro({
    groupId: h,
    resizePreviewMode: d
  }), O = q(null), [D, b] = on(), x = q({
    lastExpandedPanelSizes: {},
    layouts: {},
    panels: [],
    separators: []
  }), v = Be(O, i);
  oo(h, s);
  const E = ge(
    (z, I) => {
      const _ = ae(z);
      if (_)
        return {
          flexGrow: _.layout[I] ?? 1
        };
      if (n?.[I])
        return {
          flexGrow: n?.[I]
        };
    }
  ), P = Xe({
    defaultLayout: n,
    disableCursor: o,
    resizeTargetMinimumSize: g
  }), k = Ee(
    () => ({
      get disableCursor() {
        return !!P.disableCursor;
      },
      getPanelStyles: E,
      id: h,
      orientation: u,
      registerPanel: (z) => {
        const I = x.current;
        return I.panels = nt(u, [
          ...I.panels,
          z
        ]), b(), () => {
          I.panels = I.panels.filter(
            (_) => _ !== z
          ), b();
        };
      },
      registerOverlay: (z) => (w(z), () => {
        w(void 0);
      }),
      registerSeparator: (z) => {
        const I = x.current;
        return I.separators = nt(u, [
          ...I.separators,
          z
        ]), b(), () => {
          I.separators = I.separators.filter(
            (_) => _ !== z
          ), b();
        };
      },
      updatePanelProps: (z, { disabled: I }) => {
        const Y = x.current.panels.find(
          (oe) => oe.id === z
        );
        Y && (Y.constraintProps.disabled = I);
        const J = Re(h), K = ae(h);
        J && K && me(J, {
          ...K,
          derivedItemConstraints: rt(J)
        });
      },
      updateSeparatorProps: (z, {
        disabled: I,
        disableDoubleClick: _
      }) => {
        const J = x.current.separators.find(
          (K) => K.id === z
        );
        J && (J.disabled = I, J.disableDoubleClick = _);
      }
    }),
    [E, h, b, u, P]
  ), M = q(null);
  return ne(() => {
    const z = O.current;
    if (z === null)
      return;
    const I = x.current;
    let _;
    if (P.defaultLayout !== void 0 && Object.keys(P.defaultLayout).length === I.panels.length) {
      _ = {};
      for (const re of I.panels) {
        const R = P.defaultLayout[re.id];
        R !== void 0 && (_[re.id] = R);
      }
    }
    const Y = {
      disabled: !!r,
      element: z,
      id: h,
      mutableState: {
        defaultLayout: _,
        disableCursor: !!P.disableCursor,
        expandedItemSizes: x.current.lastExpandedPanelSizes,
        layouts: x.current.layouts
      },
      orientation: u,
      items: I.panels,
      resizePreviewMode: d,
      get resizeTargetMinimumSize() {
        return P.resizeTargetMinimumSize;
      },
      separators: I.separators
    };
    M.current = Y;
    const J = tn(Y), {
      defaultLayoutDeferred: K,
      derivedItemConstraints: oe,
      layout: we,
      requestedLayout: $e
    } = ae(Y.id, !0);
    !K && oe.length > 0 && (S(we), p(we, !1, $e));
    const ze = _e(h, (re) => {
      const {
        defaultLayoutDeferred: R,
        derivedItemConstraints: $,
        layout: N,
        requestedLayout: G
      } = re.next;
      if (R || $.length === 0)
        return;
      nn({
        derivedItemConstraints: $,
        axis: Y,
        layout: N,
        prevLayout: re.prev?.layout,
        requestedLayout: G
      });
      const F = fe(), V = F.state !== "active" || !F.hitRegions.some((H) => H.axis === Y);
      S(N), V && p(N, re.isUserInteraction, G);
    });
    return () => {
      M.current = null, J(), ze();
    };
  }, [
    r,
    h,
    p,
    S,
    u,
    D,
    d,
    P
  ]), qe(() => {
    const z = M.current;
    z && (z.mutableState.defaultLayout = n, z.mutableState.disableCursor = !!o);
  }), /* @__PURE__ */ W(ft.Provider, { value: k, children: /* @__PURE__ */ un(
    "div",
    {
      ...y,
      className: t,
      "data-group": !0,
      "data-testid": h,
      id: h,
      ref: v,
      style: {
        height: "100%",
        width: "100%",
        overflow: "hidden",
        position: d === "separator" ? "relative" : void 0,
        ...m,
        display: "flex",
        flexDirection: u === "horizontal" ? "row" : "column",
        flexWrap: "nowrap",
        // Inform the browser that the library is handling touch events for this element
        // but still allow users to scroll content within panels in the non-resizing direction
        // NOTE This is not an inherited style
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: u === "horizontal" ? "pan-y" : "pan-x"
      },
      children: [
        e,
        C.map((z) => /* @__PURE__ */ W(
          no,
          {
            overlay: L,
            preview: z
          },
          z.key
        ))
      ]
    }
  ) });
}
io.displayName = "Group";
function Ye(e, t) {
  return `react-resizable-panels:${[e, ...t].join(":")}`;
}
function so({
  id: e,
  panelIds: t,
  storage: n
}) {
  const o = Ye(e, []), r = n.getItem(o);
  if (r)
    try {
      const i = JSON.parse(r);
      if (t) {
        const s = t.join(","), l = i[s];
        if (l && Array.isArray(l.layout) && t.length === l.layout.length) {
          const a = {};
          for (let c = 0; c < t.length; c++)
            a[t[c]] = l.layout[c];
          return a;
        }
      } else {
        const s = Object.keys(i);
        if (s.length === 1) {
          const l = i[s[0]];
          if (l && Array.isArray(l.layout)) {
            const a = s[0].split(",");
            if (a.length === l.layout.length) {
              const c = {};
              for (let u = 0; u < a.length; u++)
                c[a[u]] = l.layout[u];
              return c;
            }
          }
        }
      }
    } catch {
    }
}
function bo({
  debounceSaveMs: e = 100,
  onlySaveAfterUserInteractions: t,
  panelIds: n,
  storage: o = localStorage,
  ...r
}) {
  const i = n !== void 0, s = "id" in r ? r.id : r.groupId, l = Ye(s, n ?? []), a = Ke(
    ao,
    () => o.getItem(l),
    () => o.getItem(l)
  ), c = Ee(() => {
    if (a) {
      const S = JSON.parse(a), p = Object.values(S);
      if (Array.from(p).every((h) => typeof h == "number"))
        return S;
    }
  }, [a]), u = Ee(() => {
    if (!c)
      return so({
        id: s,
        panelIds: n,
        storage: o
      });
  }, [c, s, n, o]), d = c ?? u, g = q(null), m = te(() => {
    const S = g.current;
    S && (g.current = null, clearTimeout(S));
  }, []);
  Ot(() => () => {
    m();
  }, [m]);
  const y = te(
    // The hook persists every layout commit -- including library-driven ones --
    // because it owns its own storage and the goal is to remember whatever
    // layout the user is currently looking at. Consumers that only want to
    // persist on user interaction should branch on `isUserInteraction` in
    // their own callback (see #716) rather than via this hook.
    (S, p) => {
      if (t && !p.isUserInteraction)
        return;
      m();
      const h = p.requestedLayout ?? S;
      let L;
      i ? L = Ye(s, Object.keys(h)) : L = Ye(s, []);
      try {
        o.setItem(L, JSON.stringify(h));
      } catch (w) {
        console.error(w);
      }
    },
    [
      m,
      i,
      s,
      t,
      o
    ]
  ), f = te(
    (S) => {
      m(), e === 0 ? y(S, { isUserInteraction: !1 }) : g.current = setTimeout(() => {
        y(S, { isUserInteraction: !1 });
      }, e);
    },
    [m, e, y]
  );
  return {
    /**
     * Pass this value to `Group` as the `defaultLayout` prop.
     */
    defaultLayout: d,
    /**
     * Attach this callback on the `Group` as the `onLayoutChange` prop.
     *
     * @deprecated Use the {@link onLayoutChanged} prop instead.
     */
    onLayoutChange: f,
    /**
     * Attach this callback on the `Group` as the `onLayoutChanged` prop.
     */
    onLayoutChanged: y
  };
}
function ao() {
  return function() {
  };
}
function xo() {
  return he(null);
}
function wo() {
  return q(null);
}
function lo(e, t) {
  const { id: n } = Je(), o = q({
    collapse: Qe,
    expand: Qe,
    getSize: () => ({
      asPercentage: 0,
      inPixels: 0
    }),
    isCollapsed: () => !1,
    resize: Qe
  });
  it(t, () => o.current, []), ne(() => {
    Object.assign(
      o.current,
      dt({ axisId: n, itemId: e })
    );
  });
}
function co({
  children: e,
  className: t,
  collapsedSize: n = "0%",
  collapsedThreshold: o,
  collapsible: r = !1,
  defaultSize: i,
  disabled: s,
  elementRef: l,
  groupResizeBehavior: a = "preserve-relative-size",
  id: c,
  maxSize: u = "100%",
  minSize: d = "0%",
  onResize: g,
  panelRef: m,
  style: y,
  ...f
}) {
  const S = !!c, p = ke(c), h = Xe({
    disabled: s
  }), L = q(null), w = Be(L, l), {
    getPanelStyles: C,
    id: O,
    orientation: D,
    registerPanel: b,
    updatePanelProps: x
  } = Je(), v = g !== null, E = ge(
    (z, I, _) => {
      g?.(z, c, _);
    }
  );
  ne(() => {
    const z = L.current;
    if (z !== null) {
      const I = {
        element: z,
        id: p,
        idIsStable: S,
        mutableValues: {
          expandToSize: void 0,
          prevSize: void 0
        },
        onResize: v ? E : void 0,
        constraintProps: {
          groupResizeBehavior: a,
          collapsedSize: n,
          collapsedThreshold: o,
          collapsible: r,
          defaultSize: i,
          disabled: h.disabled,
          maxSize: u,
          minSize: d
        }
      };
      return b(I);
    }
  }, [
    a,
    n,
    o,
    r,
    i,
    v,
    p,
    S,
    u,
    d,
    E,
    b,
    h
  ]), qe(() => {
    x(p, { disabled: s });
  }, [s, p, x]), lo(p, m);
  const P = () => {
    const z = C(O, p);
    if (z)
      return JSON.stringify(z);
  }, k = Ke(
    (z) => _e(O, z),
    P,
    P
  );
  let M;
  return k ? M = JSON.parse(k) : i !== void 0 ? M = {
    flexGrow: void 0,
    flexShrink: void 0,
    flexBasis: i
  } : M = { flexGrow: 1 }, /* @__PURE__ */ W(
    "div",
    {
      ...f,
      "data-disabled": s || void 0,
      "data-panel": !0,
      "data-testid": p,
      id: p,
      ref: w,
      style: {
        ...uo,
        display: "flex",
        flexBasis: 0,
        flexShrink: 1,
        overflow: "visible",
        ...M
      },
      children: /* @__PURE__ */ W(
        "div",
        {
          className: t,
          style: {
            maxHeight: "100%",
            maxWidth: "100%",
            flexGrow: 1,
            overflow: "auto",
            ...y,
            // Inform the browser that the library is handling touch events for this element
            // but still allow users to scroll content within panels in the non-resizing direction
            // NOTE This is not an inherited style
            // See github.com/bvaughn/react-resizable-panels/issues/662
            touchAction: D === "horizontal" ? "pan-y" : "pan-x"
          },
          children: e
        }
      )
    }
  );
}
co.displayName = "Panel";
const uo = {
  minHeight: 0,
  maxHeight: "100%",
  height: "auto",
  minWidth: 0,
  maxWidth: "100%",
  width: "auto",
  border: "none",
  borderWidth: 0,
  padding: 0,
  margin: 0
};
function zo() {
  return he(null);
}
function Io() {
  return q(null);
}
const fo = { flexBasis: "auto" }, mo = { flexGrow: 0, flexShrink: 0 };
function po({
  children: e,
  className: t,
  disabled: n,
  disableDoubleClick: o,
  elementRef: r,
  id: i,
  preview: s,
  style: l,
  ...a
}) {
  const c = ke(i), {
    disableCursor: u,
    id: d,
    orientation: g,
    registerSeparator: m,
    updateSeparatorProps: y
  } = Je();
  return /* @__PURE__ */ W(
    rn,
    {
      attributes: a,
      axisId: d,
      axisOrientation: g,
      className: t,
      disableCursor: u,
      disabled: n,
      disableDoubleClick: o,
      elementRef: r,
      id: c,
      preview: s,
      registerSeparator: m,
      requiredStyle: mo,
      style: l,
      styleDefaults: fo,
      updateSeparatorProps: y,
      children: e
    }
  );
}
po.displayName = "Separator";
export {
  gn as Cell,
  Xn as Grid,
  sn as Gridline,
  io as Group,
  co as Panel,
  po as Separator,
  ln as SeparatorOverlay,
  yn as isCoarsePointer,
  yo as useDefaultGridLayout,
  bo as useDefaultLayout,
  So as useGridCallbackRef,
  vo as useGridRef,
  xo as useGroupCallbackRef,
  wo as useGroupRef,
  zo as usePanelCallbackRef,
  Io as usePanelRef
};
//# sourceMappingURL=react-resizable-panels.js.map
