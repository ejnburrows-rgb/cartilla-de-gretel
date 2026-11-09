import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export const BOOK_COVER_SRC = "/cartilla/images/cover.png";

// Deform the original painted pixels in place. No replacement characters,
// duplicated insects, cut-out edges, or regenerated background are introduced.
const fragment = `
precision highp float;
uniform sampler2D artwork;
uniform float time;
varying vec2 uv;
float region(vec2 p, vec2 center, vec2 radius) {
  return 1.0 - smoothstep(0.55, 1.0, length((p-center)/radius));
}
void main() {
  vec2 p = vec2(uv.x, 1.0-uv.y) * vec2(1086.0,1448.0);
  vec2 samplePoint = p;
  float breath = (1.0-cos(time*1.0472))*0.5;
  samplePoint.y += breath*2.2*region(p,vec2(493.0,954.0),vec2(178.0,256.0));
  vec2 butterfly = p-vec2(285.0,514.0);
  vec2 axis = normalize(vec2(0.75,-0.66));
  vec2 wing = vec2(-axis.y,axis.x);
  float flap = pow(0.5+0.5*sin(time*7.0),2.0);
  float wingSide = dot(butterfly,wing);
  float wingMask = region(p,vec2(285.0,514.0),vec2(151.0,159.0));
  samplePoint += wing*wingSide*flap*0.12*wingMask;
  samplePoint.y += sin(time*1.1)*1.4*wingMask;
  samplePoint.x += sin(time*0.8)*0.8*wingMask;
  float dragon = region(p,vec2(737.0,784.0),vec2(114.0,92.0));
  samplePoint.y += sin(time*2.0)*1.7*dragon;
  samplePoint.x += sin(time*1.3)*0.8*dragon;
  // The four painted wings flex around the original body, without new sprites.
  samplePoint.x += sin(time*37.0)*(p.x-714.0)*0.016*dragon;
  gl_FragColor = texture2D(artwork, vec2(samplePoint.x/1086.0,1.0-samplePoint.y/1448.0));
}`;

export function LivingBookCover({ onError }: { onError: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const image = new Image();
    let disposed = false;
    let frame = 0;
    let release = () => {};
    image.onerror = () => {
      if (!disposed) onError();
    };
    image.onload = () => {
      if (disposed || reduced) return;
      // The CSS still is the fallback on older devices and context loss.
      const gl = surface.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: "low-power",
      });
      if (!gl) return;
      const shaders: WebGLShader[] = [];
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
      };
      const vertex = compile(
        gl.VERTEX_SHADER,
        "attribute vec2 position; varying vec2 uv; void main(){ uv=position*0.5+0.5; gl_Position=vec4(position,0.0,1.0); }",
      );
      const pixel = compile(gl.FRAGMENT_SHADER, fragment);
      const program = gl.createProgram();
      const buffer = gl.createBuffer();
      const texture = gl.createTexture();
      release = () => {
        shaders.forEach((shader) => gl.deleteShader(shader));
        gl.deleteProgram(program);
        gl.deleteBuffer(buffer);
        gl.deleteTexture(texture);
      };
      if (!vertex || !pixel || !program || !buffer || !texture) {
        release();
        return;
      }
      gl.attachShader(program, vertex);
      gl.attachShader(program, pixel);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        release();
        return;
      }
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      const clock = gl.getUniformLocation(program, "time");
      let elapsed = 0;
      let previous = 0;
      const draw = (now: number) => {
        if (disposed || gl.isContextLost()) return;
        // Stop drawing in background tabs; cap the backing store to source HD.
        if (!document.hidden) {
          const width = Math.max(
            1,
            Math.min(
              1086,
              Math.round(surface.clientWidth * Math.min(window.devicePixelRatio || 1, 2)),
            ),
          );
          const height = Math.round((width * 1448) / 1086);
          if (surface.width !== width || surface.height !== height) {
            surface.width = width;
            surface.height = height;
          }
          if (previous) elapsed += Math.min(now - previous, 50) / 1000;
          gl.viewport(0, 0, width, height);
          gl.uniform1f(clock, reduced ? 0 : elapsed);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          surface.dataset.ready = "true";
        }
        previous = now;
        if (!reduced) frame = requestAnimationFrame(draw);
      };
      const lost = (event: Event) => {
        event.preventDefault();
        cancelAnimationFrame(frame);
        delete surface.dataset.ready;
      };
      surface.addEventListener("webglcontextlost", lost);
      const free = release;
      release = () => {
        surface.removeEventListener("webglcontextlost", lost);
        free();
      };
      draw(0);
    };
    image.src = BOOK_COVER_SRC;
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      delete surface.dataset.ready;
      image.onload = null;
      image.onerror = null;
      release();
    };
  }, [reduced, onError]);

  return <canvas ref={canvas} className="lc-welcome__living-art" aria-hidden="true" />;
}
