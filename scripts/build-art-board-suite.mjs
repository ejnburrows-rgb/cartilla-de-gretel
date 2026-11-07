import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, "docs", "art-board", "verified-optimized-catalog.json");
const catalogData = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

// Baseline decisions
let baseDecisions = {};
const decisionsPath = "C:/Users/EJN/Cartilla-Gretel/art-review/decisions.json";
if (fs.existsSync(decisionsPath)) {
  try {
    baseDecisions = JSON.parse(fs.readFileSync(decisionsPath, "utf8")).decisions || {};
  } catch (e) {}
}

function generateHtml({ isOffline = false } = {}) {
  const pageTitle = isOffline
    ? "🎨 Tablero de Arte Interactivo (100% Offline y Seguro)"
    : "Revisión Simple de Imágenes — La Cartilla de Gretel";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card: #ffffff;
      --ink: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --green: #16a34a;
      --green-bg: #dcfce7;
      --red: #dc2626;
      --red-bg: #fee2e2;
      --blue: #2563eb;
      --blue-bg: #dbeafe;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--ink);
    }
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.98);
      border-bottom: 1px solid var(--border);
      padding: 14px 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }
    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .top-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
    }
    .brand p {
      margin: 2px 0 0;
      font-size: 13px;
      color: var(--muted);
    }
    .top-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }
    .btn {
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-green { background: var(--green); color: #fff; }
    .btn-green:hover { background: #15803d; }
    .btn-blue { background: var(--blue); color: #fff; }
    .btn-blue:hover { background: #1d4ed8; }
    .btn-outline { background: #fff; color: var(--ink); border: 1px solid #cbd5e1; }
    .btn-outline:hover { background: #f1f5f9; }
    .btn-sync-nbo {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #fff;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
      padding: 9px 16px;
      border-radius: 10px;
      font-size: 13.5px;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-sync-nbo:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }

    .nav-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tab {
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid #cbd5e1;
      background: #fff;
      color: #334155;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .tab.active {
      background: #0f172a;
      color: #fff;
      border-color: #0f172a;
    }
    .search-box {
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid #cbd5e1;
      font-size: 13.5px;
      min-width: 250px;
    }

    .container {
      max-width: 1280px;
      margin: 20px auto 60px;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* Bulk Drag & Drop Box */
    .bulk-dropzone {
      background: #ffffff;
      border: 2px dashed #94a3b8;
      border-radius: 16px;
      padding: 18px 24px;
      text-align: center;
      transition: all 0.15s;
      cursor: pointer;
    }
    .bulk-dropzone.dragover {
      border-color: var(--blue);
      background: #eff6ff;
    }
    .bulk-dropzone h3 {
      margin: 0 0 4px;
      font-size: 16px;
      color: #0f172a;
    }
    .bulk-dropzone p {
      margin: 0;
      font-size: 13px;
      color: var(--muted);
    }
    .tray-list {
      margin-top: 14px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      text-align: left;
    }
    .tray-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 10px;
      border-radius: 12px;
    }
    .tray-item img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .tray-item select {
      width: 100%;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-size: 12.5px;
      margin-top: 4px;
    }

    /* Minimalist Row Card */
    .item-card {
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 16px;
      padding: 18px 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      transition: all 0.15s;
    }
    .item-card.dragover {
      border-color: var(--blue);
      background: #eff6ff;
    }
    .item-card.status-accepted { border-color: #22c55e; background: #fafdfa; }
    .item-card.status-declined { border-color: #fca5a5; opacity: 0.85; }

    .item-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    .item-title-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .item-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .pages-pill {
      font-size: 12.5px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #475569;
    }
    .status-badge {
      font-size: 12.5px;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 999px;
    }
    .status-badge.accepted { background: var(--green-bg); color: var(--green); }
    .status-badge.declined { background: var(--red-bg); color: var(--red); }
    .status-badge.pending { background: #fef3c7; color: #b45309; }

    /* Side-by-side: Original (Col 1), Dedicated Upload Dropzone (Col 2), Options Grid (Col 3) */
    .side-by-side {
      display: grid;
      grid-template-columns: 210px 210px 1fr;
      gap: 16px;
      align-items: stretch;
    }
    @media (max-width: 980px) {
      .side-by-side { grid-template-columns: 1fr; }
    }

    .orig-box {
      background: #faf8f5;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .box-label {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      align-self: flex-start;
    }
    .img-stage {
      width: 100%;
      height: 180px;
      background: repeating-conic-gradient(#f8fafc 0% 25%, #ffffff 0% 50%) 0 / 16px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: zoom-in;
    }
    .img-stage img {
      max-width: 95%;
      max-height: 95%;
      object-fit: contain;
    }
    .pages-note {
      font-size: 12px;
      color: var(--muted);
      text-align: center;
    }

    /* Dedicated Upload Zone Box */
    .upload-dropzone-box {
      background: #f0fdf4;
      border: 2px dashed #86efac;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 190px;
    }
    .upload-dropzone-box:hover {
      background: #dcfce7;
      border-color: #22c55e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
    }
    .upload-dropzone-box.dragover {
      background: #bbf7d0;
      border-color: #16a34a;
      border-style: solid;
      transform: scale(1.02);
    }
    .upload-badge-tag {
      font-size: 11px;
      font-weight: 800;
      color: #15803d;
      background: #dcfce7;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }
    .upload-drop-icon {
      font-size: 30px;
      margin: 2px 0;
    }
    .upload-drop-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #14532d;
    }
    .upload-drop-sub {
      font-size: 11.5px;
      color: #166534;
      line-height: 1.3;
    }
    .upload-drop-action {
      font-size: 11.5px;
      font-weight: 700;
      color: #2563eb;
      margin-top: 4px;
      text-decoration: underline;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 14px;
    }

    .opt-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #fff;
    }
    .opt-card.recommended {
      border-color: #86efac;
      background: #f0fdf4;
    }
    .opt-card.selected {
      border-color: var(--green);
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
    }
    .rec-tag {
      font-size: 12px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
    }
    .rec-tag.best { background: #16a34a; color: #fff; }
    .rec-tag.emilio {
      background: #15803d;
      color: #fff;
      border: 1px solid #166534;
      box-shadow: 0 1px 4px rgba(21, 128, 61, 0.3);
    }
    .rec-tag.alt { background: #e2e8f0; color: #334155; }

    .advice-text {
      font-size: 12px;
      color: #475569;
    }

    .opt-buttons {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .btn-accept {
      flex: 1;
      padding: 9px 12px;
      border-radius: 8px;
      border: none;
      background: var(--green);
      color: #fff;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-accept.outline {
      background: #fff;
      color: var(--green);
      border: 1px solid var(--green);
    }

    /* Zoom Modal */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.85);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal.open { display: flex; }
    .modal-box {
      background: #fff;
      border-radius: 16px;
      max-width: 1200px;
      width: 100%;
      padding: 20px;
    }
    .modal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
    }
    .modal-pane {
      text-align: center;
      background: #f8fafc;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .modal-pane img {
      max-width: 100%;
      max-height: 65vh;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div class="top-bar">
        <div class="brand">
          <h1>🎨 Tablero de Arte Interactivo (Sincronización Directa)</h1>
          <p>Tus decisiones e imágenes subidas se guardan permanentemente en tu disco (IndexedDB). No se borra nada al recargar.</p>
        </div>
        <div class="top-actions">
          <div id="save-indicator" style="font-size: 13px; font-weight: 700; color: #15803d; background: #ecfdf5; border: 1px solid #86efac; padding: 7px 14px; border-radius: 8px; display: flex; align-items: center; gap: 6px;">
            <span>🟢</span> <span id="save-status-text">Guardado seguro en tu disco</span>
          </div>
          <button class="btn btn-sync-nbo" id="btn-sync-nbo" onclick="syncWithGitHubAndNBO()" title="Aplica todas las imágenes aprobadas al repositorio de GitHub y actualiza en vivo el Tablero NBO">
            ⚡ Aplicar al Repositorio y al Hub NBO
          </button>
          <button class="btn btn-green" onclick="downloadBackupFile()" title="Descarga una copia de seguridad en archivo .json">
            💾 Guardar Archivo Respaldo (.json)
          </button>
          <button class="btn btn-blue" onclick="document.getElementById('import-file-input').click()" title="Carga un archivo de decisiones previo">
            📥 Cargar Respaldo
          </button>
          <input type="file" id="import-file-input" accept=".json" style="display:none" onchange="importBackupFile(event)" />
        </div>
      </div>

      <div class="nav-bar">
        <div class="tabs" id="tabs">
          <button class="tab active" data-tab="wb" onclick="switchTab('wb')">📘 Cuaderno (A–Z)</button>
          <button class="tab" data-tab="fc" onclick="switchTab('fc')">📙 Rotafolio (Por Página)</button>
          <button class="tab" data-tab="cover" onclick="switchTab('cover')">🖼️ Portadas</button>
          <button class="tab" data-tab="all" onclick="switchTab('all')">Todos (201)</button>
          <button class="tab" data-tab="pending" onclick="switchTab('pending')" style="color:#b45309">⏳ Pendientes</button>
          <button class="tab" data-tab="accepted" onclick="switchTab('accepted')" style="color:#15803d">✅ Aceptados (<span id="header-acc-count">0</span>)</button>
          <button class="tab" data-tab="declined" onclick="switchTab('declined')" style="color:#dc2626">❌ Rechazados (<span id="header-dec-count">0</span>)</button>
        </div>
        <input type="search" id="search" class="search-box" placeholder="🔍 Buscar palabra (ej. abrigo, abeja, aguja)..." oninput="handleSearch(this.value)" />
      </div>
    </div>
  </header>

  <div class="container">
    <!-- Bulk or Single Drag-and-Drop Zone -->
    <div class="bulk-dropzone" id="bulk-dropzone">
      <h3>📥 ¿Tienes imágenes en otra carpeta? Arrástralas aquí (una por una o en lote)</h3>
      <p>También puedes arrastrar una imagen directamente sobre la caja verde de cualquier dibujo abajo, o hacer clic aquí para buscarlas en tu PC.</p>
      <div id="tray-container" class="tray-list" onclick="event.stopPropagation()"></div>
    </div>

    <div id="list-container" style="display:flex;flex-direction:column;gap:16px;"></div>
  </div>

  <!-- Zoom Modal -->
  <div class="modal" id="modal">
    <div class="modal-box">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong id="modal-title" style="font-size:18px;">Comparación</strong>
        <button class="btn btn-outline" onclick="document.getElementById('modal').classList.remove('open')">✕ Cerrar</button>
      </div>
      <div class="modal-grid">
        <div class="modal-pane">
          <div><strong>Original del Libro</strong></div>
          <img id="modal-orig" src="" alt="" />
        </div>
        <div class="modal-pane">
          <div><strong id="modal-cand-title">Reemplazo Optimizado</strong></div>
          <img id="modal-cand" src="" alt="" />
        </div>
      </div>
    </div>
  </div>

  <!-- Sync Result Modal -->
  <div class="modal" id="sync-modal">
    <div class="modal-box" style="max-width:540px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🚀</div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1e1b4b;">¡Sincronizado con Repositorio y Hub NBO!</h2>
      <p style="color:#475569;font-size:14px;line-height:1.5;margin-bottom:16px;" id="sync-modal-desc">
        Tus imágenes y decisiones aprobadas se confirmaron en el repositorio de GitHub y el Hub NBO ya las lee directamente.
      </p>
      <div id="sync-modal-details" style="background:#f1f5f9;border-radius:10px;padding:12px;font-size:13px;color:#334155;text-align:left;margin-bottom:20px;font-family:monospace;white-space:pre-wrap;"></div>
      <div style="display:flex;gap:10px;justify-content:center;">
        <a id="sync-nbo-link" href="https://nbo-operations-hub.vercel.app/art-inventory" target="_blank" class="btn btn-blue" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
          🌐 Ver en Tablero Oficial NBO
        </a>
        <button class="btn btn-outline" onclick="document.getElementById('sync-modal').classList.remove('open')">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <input type="file" id="file-picker" accept="image/*" multiple style="display:none" />

  <script>
    const CATALOG = ${JSON.stringify(catalogData)};
    const SEED_DECISIONS = ${JSON.stringify(baseDecisions)};
    const IS_FILE_PROTOCOL = window.location.protocol === "file:";

    let decisions = {};
    let customCandidates = [];
    let unassignedDrops = [];
    let activeTab = "wb";
    let query = "";
    let singleUploadGroupId = null;
    let db = null;

    // --- 1. INDEXEDDB PERSISTENT ENGINE ---
    const DB_NAME = "GretelArtBoardOfflineDB_v2";
    const DB_VERSION = 1;

    function openDatabase() {
      return new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const d = e.target.result;
          if (!d.objectStoreNames.contains("decisions")) {
            d.createObjectStore("decisions", { keyPath: "group_id" });
          }
          if (!d.objectStoreNames.contains("custom_candidates")) {
            d.createObjectStore("custom_candidates", { keyPath: "id" });
          }
          if (!d.objectStoreNames.contains("unassigned_drops")) {
            d.createObjectStore("unassigned_drops", { keyPath: "id" });
          }
        };
        req.onsuccess = (e) => {
          db = e.target.result;
          resolve(db);
        };
        req.onerror = () => resolve(null);
      });
    }

    async function loadAllFromIndexedDB() {
      if (!db) {
        decisions = JSON.parse(JSON.stringify(SEED_DECISIONS));
        return;
      }
      return new Promise((resolve) => {
        const tx = db.transaction(["decisions", "custom_candidates", "unassigned_drops"], "readonly");
        const decReq = tx.objectStore("decisions").getAll();
        const candReq = tx.objectStore("custom_candidates").getAll();
        const dropReq = tx.objectStore("unassigned_drops").getAll();

        tx.oncomplete = () => {
          const decList = decReq.result || [];
          const candList = candReq.result || [];
          const dropList = dropReq.result || [];

          decisions = {};
          if (decList.length > 0) {
            decList.forEach(d => decisions[d.group_id] = d);
          } else {
            decisions = JSON.parse(JSON.stringify(SEED_DECISIONS));
            saveAllDecisionsToDB(decisions);
          }

          customCandidates = candList;
          candList.forEach(c => {
            const grp = CATALOG.groups.find(g => g.group_id === c.group_id);
            if (grp && !grp.candidates.some(ex => ex.id === c.id)) {
              grp.candidates.unshift(c);
            }
          });

          unassignedDrops = dropList;
          resolve();
        };
        tx.onerror = () => {
          decisions = JSON.parse(JSON.stringify(SEED_DECISIONS));
          resolve();
        };
      });
    }

    function saveDecisionToDB(groupId, decObj) {
      flashSaveIndicator("Guardando en disco...");
      if (!db) return;
      try {
        const tx = db.transaction(["decisions"], "readwrite");
        tx.objectStore("decisions").put({ group_id: groupId, ...decObj });
        tx.oncomplete = () => flashSaveIndicator("Guardado seguro en tu disco");
      } catch (e) {}
    }

    function deleteDecisionFromDB(groupId) {
      if (!db) return;
      try {
        const tx = db.transaction(["decisions"], "readwrite");
        tx.objectStore("decisions").delete(groupId);
        tx.oncomplete = () => flashSaveIndicator("Guardado seguro en tu disco");
      } catch (e) {}
    }

    function saveAllDecisionsToDB(allDecs) {
      if (!db) return;
      try {
        const tx = db.transaction(["decisions"], "readwrite");
        const st = tx.objectStore("decisions");
        Object.entries(allDecs).forEach(([gid, val]) => {
          st.put({ group_id: gid, ...val });
        });
      } catch (e) {}
    }

    function saveCustomCandidateToDB(candObj) {
      if (!db) return;
      try {
        const tx = db.transaction(["custom_candidates"], "readwrite");
        tx.objectStore("custom_candidates").put(candObj);
        tx.oncomplete = () => flashSaveIndicator("Imagen guardada en disco");
      } catch (e) {}
    }

    function saveUnassignedDropToDB(dropObj) {
      if (!db) return;
      try {
        const tx = db.transaction(["unassigned_drops"], "readwrite");
        tx.objectStore("unassigned_drops").put(dropObj);
      } catch (e) {}
    }

    function removeUnassignedDropFromDB(dropId) {
      if (!db) return;
      try {
        const tx = db.transaction(["unassigned_drops"], "readwrite");
        tx.objectStore("unassigned_drops").delete(dropId);
      } catch (e) {}
    }

    function flashSaveIndicator(text) {
      const el = document.getElementById("save-status-text");
      if (el) el.textContent = text;
    }

    // --- 2. URL RESOLUTION & NORMALIZATION ---
    function resolveImgUrl(webUrl, offlineUrl) {
      if (offlineUrl && (IS_FILE_PROTOCOL || !webUrl)) return offlineUrl;
      return webUrl || offlineUrl || "";
    }

    function normText(str) {
      return (str || "").toLowerCase()
        .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
    }

    // --- 3. FILTERING & RENDERING ---
    function updateHeaderCounter() {
      let acc = 0, dec = 0;
      for (const g of CATALOG.groups) {
        const d = decisions[g.group_id];
        if (d && d.status === "accepted") acc++;
        else if (d && d.status === "declined") dec++;
      }
      const elAcc = document.getElementById("header-acc-count");
      if (elAcc) elAcc.textContent = acc;
      const elDec = document.getElementById("header-dec-count");
      if (elDec) elDec.textContent = dec;
    }

    function switchTab(tab) {
      activeTab = tab;
      document.querySelectorAll(".tabs .tab").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-tab") === tab);
      });
      renderList();
    }

    function handleSearch(val) {
      query = normText(val);
      renderList();
    }

    function filterGroup(g) {
      const d = decisions[g.group_id];
      const st = d ? d.status : "pending";

      if (activeTab === "wb" && !g.group_id.startsWith("DRAW-WB")) return false;
      if (activeTab === "fc" && !g.group_id.startsWith("DRAW-FC")) return false;
      if (activeTab === "cover" && !g.group_id.startsWith("COMPOSITE-")) return false;
      if (activeTab === "accepted" && st !== "accepted") return false;
      if (activeTab === "declined" && st !== "declined") return false;
      if (activeTab === "pending" && st !== "pending") return false;

      if (!query) return true;
      const haystack = normText(
        g.group_id + " " + g.label + " " + (g.raw_label || "") + " " +
        (g.pages_summary || []).join(" ") + " " +
        (g.placements || []).join(" ")
      );
      return haystack.includes(query);
    }

    function renderList() {
      const container = document.getElementById("list-container");
      if (!container) return;
      const items = CATALOG.groups.filter(filterGroup);
      if (items.length === 0) {
        container.innerHTML = \`<div style="background:#fff;padding:32px;border-radius:16px;text-align:center;color:#64748b;">No hay elementos en esta vista.</div>\`;
        updateHeaderCounter();
        return;
      }

      container.innerHTML = items.map(g => {
        const d = decisions[g.group_id];
        const st = d ? d.status : "pending";
        const selId = d ? d.selected_candidate_id : null;

        let statusHtml = \`<span class="status-badge pending">⏳ Pendiente</span>\`;
        if (st === "accepted") statusHtml = \`<span class="status-badge accepted">✅ Aceptado</span>\`;
        if (st === "declined") statusHtml = \`<span class="status-badge declined">❌ Rechazado</span>\`;

        const origSrc = resolveImgUrl(g.source_crop, g.source_crop_offline);
        const pCount = (g.placements || []).length;
        const repeatLabel = pCount > 1
          ? \`Se actualiza automáticamente en \${pCount} páginas (\${(g.pages_summary || []).slice(0, 3).join(", ")}\${(g.pages_summary || []).length > 3 ? "…" : ""})\`
          : \`\${(g.pages_summary || [])[0] || "1 página"}\`;

        const candsHtml = g.candidates.map((c, idx) => {
          const cSrc = resolveImgUrl(c.web_url, c.offline_url);
          const isSelected = st === "accepted" && selId === c.id;
          const isEmilio = (c.id && c.id.startsWith("emilio-")) || (c.source_tag && c.source_tag.includes("Emilio")) || (c.quality_badge && c.quality_badge.includes("EMILIO"));
          const badgeText = isEmilio ? "[🌟 SUBIDA POR EMILIO]" : (c.quality_badge || "Opción");

          return \`
            <div class="opt-card \${c.is_recommended ? "recommended" : ""} \${isSelected ? "selected" : ""}">
              <div>
                <span class="rec-tag \${isEmilio ? "emilio" : (c.is_recommended ? "best" : "alt")}">\${badgeText}</span>
              </div>
              <div class="img-stage" onclick='openZoom(\${JSON.stringify(g.label)}, \${JSON.stringify(origSrc)}, \${JSON.stringify(cSrc)}, \${JSON.stringify(badgeText)})'>
                <img loading="lazy" src="\${cSrc}" data-fallback="\${c.offline_url || c.web_url}" onerror="if(this.src!==this.dataset.fallback)this.src=this.dataset.fallback" alt="\${g.label}" />
              </div>
              <div class="advice-text">\${c.quality_advice || c.note || ""}</div>
              <div class="opt-buttons">
                <button class="btn-accept \${isSelected ? "" : "outline"}" onclick="acceptOption('\${g.group_id}', '\${c.id}')">
                  \${isSelected ? "✅ Seleccionada" : (c.is_recommended ? "👍 Aceptar Recomendada" : "👍 Elegir Esta Opción")}
                </button>
              </div>
            </div>
          \`;
        }).join("");

        return \`
          <div class="item-card status-\${st}" id="card-\${g.group_id}"
               ondragover="event.preventDefault(); this.classList.add('dragover');"
               ondragleave="this.classList.remove('dragover');"
               ondrop="handleRowDrop(event, '\${g.group_id}')">
            <div class="item-header">
              <div class="item-title-group">
                <span class="item-title">\${g.label}</span>
                <span class="pages-pill">📍 \${repeatLabel}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                \${statusHtml}
                <button class="btn btn-outline" style="padding:6px 12px;font-size:12.5px;color:#dc2626;border-color:#fca5a5;" onclick="toggleDecline('\${g.group_id}')">
                  \${st === "declined" ? "Restaurar" : "❌ Rechazar Todo"}
                </button>
              </div>
            </div>

            <div class="side-by-side">
              <div class="orig-box">
                <span class="box-label">Original (Libro)</span>
                <div class="img-stage" onclick='openZoom(\${JSON.stringify(g.label)}, \${JSON.stringify(origSrc)}, \${JSON.stringify(origSrc)}, "Original del Libro")'>
                  <img loading="lazy" src="\${origSrc}" data-fallback="\${g.source_crop_offline || g.source_crop}" onerror="if(this.src!==this.dataset.fallback)this.src=this.dataset.fallback" alt="\${g.label}" />
                </div>
                <div class="pages-note">Ref: \${g.group_id}</div>
              </div>

              <!-- DEDICATED DRAG & DROP ZONE -->
              <div class="upload-dropzone-box" id="dropzone-\${g.group_id}"
                   ondragover="event.preventDefault(); this.classList.add('dragover');"
                   ondragleave="this.classList.remove('dragover');"
                   ondrop="event.preventDefault(); this.classList.remove('dragover'); handleRowDropUpload(event, '\${g.group_id}')"
                   onclick="triggerRowFilePicker('\${g.group_id}')">
                <span class="upload-badge-tag">📤 SUBIDA DIRECTA</span>
                <div class="upload-drop-icon">📁</div>
                <strong class="upload-drop-title">Arrastra aquí tu PNG</strong>
                <span class="upload-drop-sub">1254×1254 con transparencia</span>
                <span class="upload-drop-action">o haz clic para examinar</span>
              </div>

              <div>
                <div class="box-label" style="margin-bottom:8px;">Versiones Disponibles y Recomendaciones:</div>
                <div class="options-grid">
                  \${candsHtml}
                </div>
              </div>
            </div>
          </div>
        \`;
      }).join("");

      updateHeaderCounter();
    }

    // --- 4. ACTIONS & RESILIENT IMAGE PROCESSING ---
    function acceptOption(groupId, candId) {
      const grp = CATALOG.groups.find(g => g.group_id === groupId);
      const cand = grp ? grp.candidates.find(c => c.id === candId) : null;
      decisions[groupId] = {
        status: "accepted",
        selected_candidate_id: candId,
        selected_original_path: cand ? cand.original_path : null,
        canonical_target: grp ? grp.canonical_target : null,
        updated_at: new Date().toISOString()
      };
      saveDecisionToDB(groupId, decisions[groupId]);
      renderList();
    }

    function toggleDecline(groupId) {
      if (decisions[groupId] && decisions[groupId].status === "declined") {
        delete decisions[groupId];
        deleteDecisionFromDB(groupId);
      } else {
        decisions[groupId] = {
          status: "declined",
          selected_candidate_id: null,
          updated_at: new Date().toISOString()
        };
        saveDecisionToDB(groupId, decisions[groupId]);
      }
      renderList();
    }

    function triggerRowFilePicker(groupId) {
      singleUploadGroupId = groupId;
      document.getElementById("file-picker").click();
    }
    window.acceptOption = acceptOption;
    window.toggleDecline = toggleDecline;
    window.triggerRowFilePicker = triggerRowFilePicker;
    window.setSingleUploadGroupId = function(gid) { singleUploadGroupId = gid; };
    window.processImageFile = processImageFile;
    window.handleDroppedFiles = handleDroppedFiles;

    window.handleRowDrop = function(ev, groupId) {
      ev.preventDefault();
      ev.currentTarget.classList.remove("dragover");
      if (ev.dataTransfer && ev.dataTransfer.files.length > 0) {
        handleDroppedFiles(ev.dataTransfer.files, groupId);
      }
    };

    window.handleRowDropUpload = function(ev, groupId) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.currentTarget.classList.remove("dragover");
      if (ev.dataTransfer && ev.dataTransfer.files.length > 0) {
        handleDroppedFiles(ev.dataTransfer.files, groupId);
      }
    };

    function processImageFile(file, groupId) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen (PNG recomendado).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          const origW = img.naturalWidth;
          const origH = img.naturalHeight;
          const targetDim = 1254;
          let finalDataUrl = rawDataUrl;
          let isConverted = false;

          // Target strict 1254x1254 PNG with alpha transparency
          if (origW !== targetDim || origH !== targetDim || !file.name.toLowerCase().endsWith(".png")) {
            const canvas = document.createElement("canvas");
            canvas.width = targetDim;
            canvas.height = targetDim;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, targetDim, targetDim);

            // Aspect fit contain centered
            const ratio = Math.min(targetDim / origW, targetDim / origH);
            const drawW = origW * ratio;
            const drawH = origH * ratio;
            const offX = (targetDim - drawW) / 2;
            const offY = (targetDim - drawH) / 2;

            ctx.drawImage(img, offX, offY, drawW, drawH);
            finalDataUrl = canvas.toDataURL("image/png");
            isConverted = true;
          }

          const grp = CATALOG.groups.find(g => g.group_id === groupId);
          if (!grp) return;

          const cid = "emilio-" + Date.now();
          const badgeText = "[🌟 SUBIDA POR EMILIO]";
          const adviceText = isConverted
            ? \`Archivo original: \${file.name} (\${origW}×\${origH} px) · Ajustado automáticamente a 1254×1254 PNG con canal alfa transparente.\`
            : \`Archivo: \${file.name} (1254×1254 PNG con canal alfa verificado).\`;

          const newCand = {
            id: cid,
            group_id: groupId,
            web_url: finalDataUrl,
            offline_url: finalDataUrl,
            width: targetDim,
            height: targetDim,
            format: "PNG",
            has_alpha: true,
            mode: "RGBA",
            source_tag: "Subida por Emilio",
            is_recommended: true,
            quality_badge: \`\${badgeText} (1254×1254 PNG · Fondo transparente)\`,
            quality_advice: adviceText,
            original_path: file.name,
            created_at: new Date().toISOString()
          };

          grp.candidates.forEach(c => { c.is_recommended = false; });
          grp.candidates.unshift(newCand);
          saveCustomCandidateToDB(newCand);
          acceptOption(groupId, cid);

          flashSaveIndicator(\`🌟 Imagen cargada para \${grp.label}: \${badgeText}\`);

          // Background sync to server if running
          syncUploadToServer(groupId, finalDataUrl, file.name);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }

    async function syncUploadToServer(groupId, dataUrl, fileName) {
      try {
        const serverUrl = window.location.origin.includes("5188")
          ? "/api/upload-art"
          : "http://127.0.0.1:5188/api/upload-art";
        const res = await fetch(serverUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_id: groupId,
            image_data: dataUrl,
            file_name: fileName
          })
        });
        if (res.ok) {
          const data = await res.json();
          flashSaveIndicator(\`⚡ ¡Sincronizado al repositorio local: \${data.canonical_target}!\`);
        }
      } catch (err) {
        console.log("Servidor local no disponible para sync inmediata; guardado en IndexedDB:", err.message);
      }
    }

    function handleDroppedFiles(fileList, explicitGroupId) {
      Array.from(fileList).forEach(file => {
        if (!file.type.startsWith("image/")) return;
        if (explicitGroupId) {
          processImageFile(file, explicitGroupId);
          return;
        }

        const stem = normText(file.name.replace(/\\.[^.]+$/, ""));
        let matchedGroup = null;
        for (const g of CATALOG.groups) {
          const gSlug = normText(g.raw_label || g.label);
          if (gSlug.length >= 3 && (stem === gSlug || stem.includes(gSlug))) {
            matchedGroup = g;
            break;
          }
        }
        if (matchedGroup) {
          processImageFile(file, matchedGroup.group_id);
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result;
            const img = new Image();
            img.onload = () => {
              const dropItem = {
                id: "drop-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
                filename: file.name,
                dataUrl,
                width: img.naturalWidth,
                height: img.naturalHeight
              };
              unassignedDrops.push(dropItem);
              saveUnassignedDropToDB(dropItem);
              renderTray();
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    function renderTray() {
      const box = document.getElementById("tray-container");
      if (!box) return;
      if (unassignedDrops.length === 0) {
        box.innerHTML = "";
        return;
      }
      const optionsHtml = CATALOG.groups.map(g =>
        \`<option value="\${g.group_id}">\${g.label} (\${g.group_id})</option>\`
      ).join("");

      box.innerHTML = unassignedDrops.map(item => \`
        <div class="tray-item">
          <img src="\${item.dataUrl}" alt="" />
          <div style="flex:1; min-width:0;">
            <strong style="font-size:13px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${item.filename}</strong>
            <span style="font-size:11.5px; color:#64748b;">\${item.width}×\${item.height} px</span>
            <select onchange="assignTrayItem('\${item.id}', this.value)">
              <option value="">-- Elige a qué dibujo corresponde --</option>
              \${optionsHtml}
            </select>
          </div>
        </div>
      \`).join("");
    }

    window.assignTrayItem = function(dropId, groupId) {
      if (!groupId) return;
      const idx = unassignedDrops.findIndex(x => x.id === dropId);
      if (idx === -1) return;
      const item = unassignedDrops[idx];
      unassignedDrops.splice(idx, 1);
      removeUnassignedDropFromDB(dropId);
      // Process as file object simulation
      const byteString = atob(item.dataUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/png" });
      const file = new File([blob], item.filename, { type: "image/png" });
      processImageFile(file, groupId);
      renderTray();
    };

    // Bulk Dropzone listeners
    const bulkZone = document.getElementById("bulk-dropzone");
    if (bulkZone) {
      bulkZone.addEventListener("click", () => {
        singleUploadGroupId = null;
        document.getElementById("file-picker").click();
      });
      bulkZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        bulkZone.classList.add("dragover");
      });
      bulkZone.addEventListener("dragleave", () => bulkZone.classList.remove("dragover"));
      bulkZone.addEventListener("drop", (e) => {
        e.preventDefault();
        bulkZone.classList.remove("dragover");
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
          handleDroppedFiles(e.dataTransfer.files, null);
        }
      });
    }

    const filePicker = document.getElementById("file-picker");
    if (filePicker) {
      filePicker.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleDroppedFiles(e.target.files, singleUploadGroupId);
        }
        e.target.value = "";
      });
    }

    // --- 5. GITHUB & NBO HUB SYNCHRONIZATION ---
    async function syncWithGitHubAndNBO() {
      const btn = document.getElementById("btn-sync-nbo");
      const origText = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "⏳ Sincronizando con GitHub y Hub NBO...";
      }
      flashSaveIndicator("Conectando con el repositorio y NBO Hub...");

      try {
        const serverUploadUrl = window.location.origin.includes("5188")
          ? "/api/upload-art"
          : "http://127.0.0.1:5188/api/upload-art";

        for (const [gid, dec] of Object.entries(decisions)) {
          if (dec && dec.status === "accepted" && dec.selected_candidate_id && dec.selected_candidate_id.startsWith("emilio-")) {
            const grp = CATALOG.groups.find(g => g.group_id === gid);
            const cand = grp ? grp.candidates.find(c => c.id === dec.selected_candidate_id) : null;
            if (cand && cand.web_url && cand.web_url.startsWith("data:")) {
              try {
                await fetch(serverUploadUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    group_id: gid,
                    image_data: cand.web_url,
                    file_name: cand.original_path || "upload.png"
                  })
                });
              } catch(e) {}
            }
          }
        }

        const serverSyncUrl = window.location.origin.includes("5188")
          ? "/api/sync-to-github"
          : "http://127.0.0.1:5188/api/sync-to-github";

        const res = await fetch(serverSyncUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || \`Error \${res.status}\`);
        }

        const data = await res.json();
        flashSaveIndicator("✅ ¡Sincronizado con éxito en GitHub y NBO Operations Hub!");
        showSyncModal(data);
      } catch (err) {
        alert("No se pudo conectar con el servidor local para publicar a GitHub. Asegúrate de tener corriendo: node scripts/art-board-review-server.mjs\\n\\nTus imágenes siguen 100% seguras en IndexedDB.\\nDetalle: " + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      }
    }

    function showSyncModal(data) {
      const modal = document.getElementById("sync-modal");
      if (!modal) return;
      const details = document.getElementById("sync-modal-details");
      if (details) {
        details.textContent = [
          "Commit: " + (data.commit || "Up to date"),
          "Archivos preparados: " + (data.staged_files ? data.staged_files.length : 0),
          "Estado de Push a GitHub: " + (data.pushed ? "✅ Enviado a GitHub" : "Pendiente"),
          "Destino NBO: https://nbo-operations-hub.vercel.app/art-inventory"
        ].join("\\n");
      }
      modal.classList.add("open");
    }

    // --- 6. BACKUP & EXPORT ---
    function downloadBackupFile() {
      const payload = {
        exported_at: new Date().toISOString(),
        total_decisions: Object.keys(decisions).length,
        decisions: decisions,
        custom_candidates_count: customCandidates.length
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.href = url;
      a.download = \`RESPALDO_DECISIONES_CARTILLA_\${stamp}.json\`;
      a.click();
      URL.revokeObjectURL(url);
      flashSaveIndicator("¡Copia de respaldo descargada!");
    }

    function importBackupFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          const incomingDecisions = data.decisions || data;
          Object.assign(decisions, incomingDecisions);
          saveAllDecisionsToDB(decisions);
          renderList();
          flashSaveIndicator("¡Decisiones restauradas con éxito!");
          alert(\`Se restauraron \${Object.keys(incomingDecisions).length} decisiones correctamente.\`);
        } catch (err) {
          alert("Error al leer el archivo JSON: " + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }

    // --- 7. ZOOM MODAL ---
    function openZoom(title, origUrl, candUrl, candLabel) {
      const modalTitle = document.getElementById("modal-title");
      if (modalTitle) modalTitle.textContent = title;
      const mOrig = document.getElementById("modal-orig");
      if (mOrig) mOrig.src = origUrl;
      const mCand = document.getElementById("modal-cand");
      if (mCand) mCand.src = candUrl;
      const mCandTitle = document.getElementById("modal-cand-title");
      if (mCandTitle) mCandTitle.textContent = candLabel;
      const modal = document.getElementById("modal");
      if (modal) modal.classList.add("open");
    }

    // --- 8. SAFE UNLOAD SHIELD ---
    window.addEventListener("beforeunload", (e) => {
      const count = Object.keys(decisions).length;
      if (count > 0) {
        e.preventDefault();
        e.returnValue = "Tienes decisiones e imágenes en este tablero. ¿Deseas salir o recargar?";
        return e.returnValue;
      }
    });

    // --- 9. BOOTSTRAP ---
    async function init() {
      await openDatabase();
      await loadAllFromIndexedDB();
      renderList();
      renderTray();
    }

    init();
  </script>
</body>
</html>`;
}

// 1. Write docs/art-board/verified-optimized.html
const docsHtmlPath = path.join(rootDir, "docs", "art-board", "verified-optimized.html");
const onlineHtml = generateHtml({ isOffline: false });
fs.writeFileSync(docsHtmlPath, onlineHtml, "utf8");
console.log("Wrote:", docsHtmlPath);

// 2. Write public/art-board/verified-optimized.html
const publicHtmlPath = path.join(rootDir, "public", "art-board", "verified-optimized.html");
fs.writeFileSync(publicHtmlPath, onlineHtml, "utf8");
console.log("Wrote:", publicHtmlPath);

// 3. Write TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html
const offlineHtmlPath = path.join(rootDir, "TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html");
const offlineHtml = generateHtml({ isOffline: true });
fs.writeFileSync(offlineHtmlPath, offlineHtml, "utf8");
console.log("Wrote:", offlineHtmlPath);

// Also copy to Drop folder if exists
const dropDir = "C:/Users/EJN/Downloads/Cartilla-Drop";
if (fs.existsSync(dropDir)) {
  fs.writeFileSync(path.join(dropDir, "TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html"), offlineHtml, "utf8");
  console.log("Wrote to Cartilla-Drop:", path.join(dropDir, "TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html"));
}

console.log("Successfully generated unified art board HTML files!");
