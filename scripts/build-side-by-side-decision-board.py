import os
import csv
import json
import shutil
import zipfile
import hashlib
import unicodedata
from io import BytesIO
from PIL import Image

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CANDIDATES_DIR = os.path.join(REPO_ROOT, "public", "cartilla", "art", "candidates-board")
DROP_ROOT = r"C:\Users\EJN\Downloads\Cartilla-Drop"
DROP_ASSETS_DIR = os.path.join(DROP_ROOT, "board-assets")
os.makedirs(CANDIDATES_DIR, exist_ok=True)
os.makedirs(DROP_ASSETS_DIR, exist_ok=True)

avail_path = os.path.join(REPO_ROOT, "docs", "proofs", "artwork-coverage-2026-10-14", "availability-inventory.json")
avail_data = json.load(open(avail_path, "r", encoding="utf-8"))

master_csv_path = os.path.join(REPO_ROOT, "docs", "artwork-reconciliation", "mapping", "MASTER-MAPPING.csv")
master_rows = list(csv.DictReader(open(master_csv_path, "r", encoding="utf-8")))

# Friendly Spanish titles for Flip Chart scenes & composites so it never says cryptic English/code labels
FRIENDLY_LABELS = {
    "COMPOSITE-FC-FRONT-001": "Portada del Rotafolio (Gretel leyendo)",
    "COMPOSITE-WB-FRONT-001": "Portada Principal (La Cartilla de Gretel)",
    "COMPOSITE-WB-FRONT-002": "Título Decorativo de Portada",
    "COMPOSITE-WB-FRONT-003": "Personaje Gretel (Portada)",
    "DRAW-FC-003-01": "Página 3 — Cinco niños entre las flores (Vocales)",
    "DRAW-FC-004-01": "Página 4 — Niña en caballito de madera (Vocal o)",
    "DRAW-FC-005-01": "Página 5 — Doctor examinando a la niña (Vocal a)",
    "DRAW-FC-006-01": "Página 6 — Niña con vestido azul (Vocal e)",
    "DRAW-FC-007-01": "Página 7 — Niña jugando con pelota (Vocal i)",
    "DRAW-FC-008-01": "Página 8 — La Brujita Ula (Vocal u)",
    "DRAW-FC-009-01": "Página 9 — La Vaca Vacuna (Letra m)",
    "DRAW-FC-012-01": "Página 12 — Pollito con globo de corazón (Letra p)",
    "DRAW-FC-015-01": "Página 15 — Serpiente y sol con sombrero (Letra s)",
    "DRAW-FC-017-01": "Página 17 — Familia paseando en el parque",
    "DRAW-FC-018-01": "Página 18 — Niño tocando el tambor (Letra t)",
    "DRAW-FC-020-01": "Página 20 — Cocineros y pato con sopa",
    "DRAW-FC-021-01": "Página 21 — Niño en escalera tocando campana (Letra d)",
    "DRAW-FC-023-01": "Página 23 — Rana mirando el sol (Letra r)",
    "DRAW-FC-024-01": "Página 24 — Escena de la letra l",
    "DRAW-FC-027-01": "Página 27 — Ternero Napi en el campo (Letra n)",
    "DRAW-FC-029-01": "Página 29 — Papá con bebé y pajarito",
    "DRAW-FC-030-01": "Página 30 — Niña bajo arco de flores (Letra c / q)",
    "DRAW-FC-032-01": "Página 32 — Cabro en la loma (Letra b)",
    "DRAW-FC-036-01": "Página 36 — El viento soplando (Letra v)",
    "DRAW-FC-038-01": "Página 38 — Niña durmiendo con la luna",
    "DRAW-FC-039-01": "Página 39 — Ratón con queso (Doble rr)",
    "DRAW-FC-045-01": "Página 45 — El Gato Goloso (Letra g)",
    "DRAW-FC-048-01": "Página 48 — Muñeca lavando en tina (Letra ñ)",
    "DRAW-FC-050-01": "Página 50 — La Jirafa (Letra j)",
    "DRAW-FC-051-01": "Página 51 — Niña bañando a la jicotea",
    "DRAW-FC-053-01": "Página 53 — Hada y carroza de calabaza (Letra ch / ll)",
    "DRAW-FC-056-01": "Página 56 — Casita del árbol con caramelos",
    "DRAW-FC-057-01": "Página 57 — Velero navegando bajo el sol (Letra y)",
    "DRAW-FC-059-01": "Página 59 — Dama mirando la luna y las estrellas",
    "DRAW-FC-060-01": "Página 60 — El Zángano Zumbón (Letra z)",
}

groups_by_id = {}
for g in avail_data.get("groups", []):
    gid = g["group_id"]
    raw_label = g.get("label", gid)
    groups_by_id[gid] = {
        "group_id": gid,
        "label": FRIENDLY_LABELS.get(gid, raw_label.capitalize() if raw_label else gid),
        "raw_label": raw_label,
        "availability": g.get("availability", ""),
        "placements": g.get("placements", []),
        "pages_summary": [],
        "source_crop": None,
        "source_crop_offline": None,
        "current_runtime_assets": [],
        "old_files_to_replace": [],
        "candidates": []
    }

master_by_pid = {r["artwork_id"]: r for r in master_rows}
for p in avail_data.get("placements", []):
    pid = p["artwork_id"]
    gid = p["drawing_group_id"]
    if gid not in groups_by_id:
        raw_label = master_by_pid.get(pid, {}).get("drawing_label", gid)
        groups_by_id[gid] = {
            "group_id": gid,
            "label": FRIENDLY_LABELS.get(gid, raw_label.capitalize() if raw_label else gid),
            "raw_label": raw_label,
            "availability": p.get("availability", ""),
            "placements": [pid],
            "pages_summary": [],
            "source_crop": None,
            "source_crop_offline": None,
            "current_runtime_assets": [],
            "old_files_to_replace": [],
            "candidates": []
        }
    grp = groups_by_id[gid]
    mrow = master_by_pid.get(pid, {})
    if grp["label"].startswith("DRAW-FC-") and mrow.get("drawing_label"):
        dl = mrow["drawing_label"]
        if dl.lower() == "scene":
            pnum = gid.split("-")[2].lstrip("0") or "1"
            grp["label"] = f"Página {pnum} — Escena del Rotafolio"
        else:
            grp["label"] = dl.capitalize()

    crop_rel = mrow.get("source_crop_path") or ("docs/proofs/artwork-coverage-2026-10-14/" + p.get("source_crop", f"crops/{pid}.png"))
    crop_disk = os.path.join(REPO_ROOT, crop_rel)
    if not grp["source_crop"] and os.path.exists(crop_disk):
        grp["source_crop"] = "/" + crop_rel.replace("\\", "/").lstrip("/")
        crop_fname = f"orig_{gid}.png"
        shutil.copy2(crop_disk, os.path.join(DROP_ASSETS_DIR, crop_fname))
        shutil.copy2(crop_disk, os.path.join(CANDIDATES_DIR, crop_fname))
        grp["source_crop"] = f"/cartilla/art/candidates-board/{crop_fname}"
        grp["source_crop_offline"] = f"board-assets/{crop_fname}"

    rt_asset = (p.get("runtime_integration") or {}).get("asset_path")
    if rt_asset and rt_asset not in grp["current_runtime_assets"]:
        grp["current_runtime_assets"].append(rt_asset)

    dest_path = mrow.get("destination_path", "")
    if dest_path and not dest_path.startswith("C:") and dest_path not in grp["old_files_to_replace"]:
        grp["old_files_to_replace"].append(dest_path)

    book_es = "Rotafolio" if pid.startswith("FC") else "Cuaderno"
    psheet = mrow.get("page_sheet", "").replace("page ", "Pág. ").replace("sheet ", "Pág. ")
    summary_item = f"{book_es} {psheet}".strip()
    if summary_item not in grp["pages_summary"]:
        grp["pages_summary"].append(summary_item)

def compute_visual_signature(im):
    """Composite onto white background and compute 64-bit dHash + 16x16 RGB vector + alpha flag."""
    has_alpha = False
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        rgba = im.convert("RGBA")
        alpha_extrema = rgba.getchannel("A").getextrema()
        if alpha_extrema and alpha_extrema[0] < 245:
            has_alpha = True
        bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        comp = Image.alpha_composite(bg, rgba).convert("RGB")
    else:
        comp = im.convert("RGB")

    # dHash 9x8
    gray = comp.convert("L").resize((9, 8), Image.Resampling.BILINEAR)
    px = list(gray.getdata())
    bits = 0
    for r in range(8):
        for c in range(8):
            bits = (bits << 1) | (1 if px[r * 9 + c] > px[r * 9 + c + 1] else 0)

    # 16x16 RGB vector
    small = comp.resize((16, 16), Image.Resampling.BILINEAR)
    vec = list(small.getdata())  # list of (R,G,B)
    flat_vec = [channel for rgb in vec for channel in rgb]
    return has_alpha, bits, flat_vec

def are_visual_duplicates(c1, c2):
    """Return True if c1 and c2 are the same illustration at different sizes/formats."""
    xor_bits = bin(c1["_dhash"] ^ c2["_dhash"]).count("1")
    v1, v2 = c1["_vec"], c2["_vec"]
    mae = sum(abs(a - b) for a, b in zip(v1, v2)) / len(v1)
    if xor_bits <= 10 and mae <= 24.0:
        return True
    if xor_bits <= 14 and mae <= 15.0:
        return True
    if mae <= 11.5:
        return True
    return False

def register_candidate_bytes(gid, data, ext, source_tag, original_path, note="", min_dim=380, priority=1):
    if gid not in groups_by_id:
        return
    sha = hashlib.sha256(data).hexdigest()
    grp = groups_by_id[gid]
    for c in grp["candidates"]:
        if c["sha256"] == sha:
            if source_tag not in c["source_tag"]:
                c["source_tag"] += f" / {source_tag}"
            if note and not c["note"]:
                c["note"] = note
            c["priority"] = min(c["priority"], priority)
            return
    try:
        im = Image.open(BytesIO(data))
        w, h = im.size
        mode = im.mode
        has_alpha, dhash, flat_vec = compute_visual_signature(im)
    except Exception:
        return
    if max(w, h) < min_dim:
        return
    ext_clean = ext.lower().lstrip(".")
    if ext_clean not in ("png", "jpg", "jpeg", "webp"):
        ext_clean = "png"
    fmt_label = "PNG" if ext_clean == "png" else ("WEBP" if ext_clean == "webp" else "JPG")
    fname = f"{sha[:16]}.{ext_clean}"
    out_disk = os.path.join(CANDIDATES_DIR, fname)
    if not os.path.exists(out_disk):
        with open(out_disk, "wb") as f:
            f.write(data)
    out_drop = os.path.join(DROP_ASSETS_DIR, fname)
    if not os.path.exists(out_drop):
        with open(out_drop, "wb") as f:
            f.write(data)

    # Calculate deterministic quality score (higher = better resolution, lossless PNG, transparent cutout)
    res_points = (w * h) / 1000.0
    fmt_bonus = 350 if fmt_label == "PNG" else (150 if fmt_label == "WEBP" else 0)
    alpha_bonus = 250 if has_alpha else 0
    prio_bonus = 600 if priority == 1 else (250 if priority == 2 else 0)
    quality_score = round(res_points + fmt_bonus + alpha_bonus + prio_bonus, 1)

    grp["candidates"].append({
        "sha256": sha,
        "id": sha[:12],
        "web_url": f"/cartilla/art/candidates-board/{fname}",
        "offline_url": f"board-assets/{fname}",
        "width": w,
        "height": h,
        "format": fmt_label,
        "has_alpha": has_alpha,
        "mode": mode,
        "bytes": len(data),
        "kb": round(len(data) / 1024),
        "source_tag": source_tag,
        "original_path": original_path,
        "note": note,
        "priority": priority,
        "quality_score": quality_score,
        "_dhash": dhash,
        "_vec": flat_vec
    })

def register_candidate_file(gid, disk_path, source_tag, note="", min_dim=380, priority=1):
    if not os.path.exists(disk_path):
        return
    ext = os.path.splitext(disk_path)[1]
    with open(disk_path, "rb") as f:
        data = f.read()
    register_candidate_bytes(gid, data, ext, source_tag, disk_path.replace("\\", "/"), note, min_dim=min_dim, priority=priority)

# 1. All 69 owner-intake files (priority=1)
intake_manifest = json.load(open(os.path.join(REPO_ROOT, "public", "cartilla", "art", "owner-intake", "2026-10-14", "manifest.json"), "r", encoding="utf-8"))
INTAKE_INDEX_TO_GROUP = {
    1: ("DRAW-WB-24-1", "Signo igual (=)"),
    2: ("DRAW-FC-018-04", "Topo (con fondo)"),
    3: ("DRAW-FC-024-03", "Lata (con fondo)"),
    4: ("DRAW-FC-024-04", "Luli (con fondo)"),
    5: ("DRAW-FC-056-01", "Casita del árbol con caramelos"),
    6: ("DRAW-FC-045-01", "El Gato Goloso (Versión 1)"),
    7: ("DRAW-FC-060-01", "El Zángano Zumbón (Versión 1)"),
    8: ("DRAW-FC-024-02", "Maleta (con fondo)"),
    9: ("DRAW-FC-050-01", "La Jirafa (Versión 1)"),
    10: ("DRAW-FC-018-06", "Tuto en silla de ruedas (con fondo)"),
    11: ("DRAW-WB-04-1", "Aguja con hilo marrón"),
    12: ("DRAW-WB-34-1", "Manzana roja"),
    13: ("DRAW-FC-024-05", "Loma con tractor (con fondo)"),
    14: ("DRAW-FC-008-01", "Brujita Ula (Versión 1)"),
    15: ("DRAW-FC-005-01", "Doctor y niña (Versión 1)"),
    16: ("DRAW-FC-006-01", "Niña con letra e (Versión 1)"),
    17: ("DRAW-FC-007-01", "Niña con pelota (Versión 1)"),
    18: ("DRAW-FC-051-01", "Niña bañando jicotea (Versión 1)"),
    19: ("DRAW-FC-039-01", "Ratón con letra R"),
    20: ("DRAW-FC-030-01", "Niña bajo arco de flores (Versión 1)"),
    21: ("DRAW-FC-048-01", "Niña lavando en tina (Versión 1)"),
    22: ("DRAW-FC-038-01", "Niña durmiendo con luna (Versión 1)"),
    23: ("DRAW-FC-057-01", "Velero y sol (Versión 1)"),
    24: ("DRAW-FC-004-01", "Caballito de madera (Versión 1)"),
    25: ("DRAW-FC-036-01", "Viento soplando (con letras v)"),
    26: ("DRAW-FC-032-01", "Cabro (con letras b)"),
    27: ("DRAW-FC-033-04", "Bate de béisbol con pelota"),
    28: ("DRAW-FC-033-04", "Bate de béisbol solo"),
    29: ("DRAW-FC-032-01", "Cabro (sin texto)"),
    30: ("DRAW-FC-027-01", "Ternero Napi"),
    31: ("COMPOSITE-FC-FRONT-001", "Portada Gretel leyendo (Versión 1)"),
    32: ("DRAW-FC-057-01", "Velero y sol (Versión 2)"),
    33: ("DRAW-FC-030-01", "Niña bajo arco de flores (Versión 2)"),
    34: ("DRAW-FC-038-01", "Niña durmiendo con luna (Versión 2)"),
    35: ("DRAW-FC-017-01", "Familia en el parque"),
    36: ("DRAW-FC-059-01", "Dama y nube con luna"),
    37: ("COMPOSITE-FC-FRONT-001", "Portada Gretel leyendo (Versión 2)"),
    38: ("DRAW-FC-048-01", "Niña lavando en tina (Versión 2)"),
    39: ("DRAW-FC-012-01", "Pollito con globo de corazón (sin texto)"),
    40: ("DRAW-FC-015-01", "Serpiente y sol con sombrero"),
    41: ("DRAW-FC-020-01", "Cocineros y pato con sopa"),
    42: ("DRAW-FC-023-01", "Rana mirando el sol"),
    43: ("DRAW-FC-018-01", "Niño con tambor y tomates"),
    44: ("DRAW-FC-021-01", "Niño en escalera tocando campana"),
    45: ("DRAW-FC-005-01", "Doctor y niña (Versión 2)"),
    46: ("DRAW-FC-050-01", "La Jirafa (Versión 2)"),
    47: ("DRAW-FC-045-01", "El Gato Goloso (Versión 2)"),
    48: ("DRAW-FC-051-01", "Niña bañando jicotea (Versión 2)"),
    49: ("DRAW-FC-060-01", "El Zángano Zumbón (Versión 2)"),
    50: ("DRAW-FC-009-01", "La Vaca Vacuna"),
    51: ("DRAW-FC-009-04", "Mima (Mamá abrazando niña)"),
    52: ("DRAW-FC-053-01", "Niña en carroza de calabaza"),
    53: ("DRAW-FC-003-01", "Cinco niños detrás de las flores"),
    54: ("DRAW-FC-006-01", "Niña con letra e (Versión 2)"),
    55: ("COMPOSITE-WB-FRONT-003", "Gretel de cuerpo entero"),
    56: ("DRAW-FC-004-01", "Caballito de madera (Versión 2)"),
    57: ("DRAW-FC-007-01", "Niña con pelota (Versión 2)"),
    58: ("DRAW-FC-008-01", "Brujita Ula (Versión 2)"),
    59: ("DRAW-FC-029-01", "Papá con bebé y pajarito"),
    60: ("DRAW-FC-036-01", "Viento soplando (sin letras)"),
    61: ("DRAW-FC-024-02", "Maleta (fondo transparente)"),
    62: ("DRAW-FC-021-05", "Número 12 floral (fondo transparente)"),
    63: ("DRAW-FC-024-04", "Luli (fondo transparente)"),
    64: ("DRAW-FC-018-04", "Topo (fondo transparente)"),
    65: ("DRAW-FC-018-06", "Tuto en silla de ruedas (fondo transparente)"),
    66: ("DRAW-FC-024-03", "Lata abierta (fondo transparente)"),
    67: ("DRAW-WB-11-1", "Carro rojo"),
    68: ("DRAW-WB-04-1", "Aguja plateada con hilo azul"),
    69: ("DRAW-FC-024-05", "Loma con tractor (fondo transparente)")
}

for idx, fentry in enumerate(intake_manifest["files"], start=1):
    if idx in INTAKE_INDEX_TO_GROUP:
        gid, note = INTAKE_INDEX_TO_GROUP[idx]
        p = os.path.join(REPO_ROOT, fentry["path"])
        register_candidate_file(gid, p, "ChatGPT (Repositorio)", note, priority=1)

# 2. Thread ZIP
THREAD_ZIP_TO_GROUP = {
    "folk_floral_vine_number_12.png": ("DRAW-FC-021-05", "Número 12 floral (con fondo azul)"),
    "folk_art_floral_number_12.png": ("DRAW-FC-021-05", "Número 12 floral (con fondo dorado)"),
    "vibrant_folk_art_teepee_sticker.png": ("DRAW-FC-018-05", "Tipi (con fondo azul)"),
    "colorful_cartoon_mole_with_jackhammer.png": ("DRAW-FC-018-04", "Topo con taladro (Variante B)"),
    "goggled_mole_with_a_jackhammer.png": ("DRAW-FC-018-04", "Topo con taladro (Variante A)"),
    "sleepy_magenta_rooster_on_a_perch.png": ("DRAW-FC-020-01", "Gallo en percha"),
    "harambee_a_joyful_folk_art_lesson.png": ("DRAW-FC-021-06", "Niños alrededor del mundo (Dunia)"),
    "colorful_painted_dice_flashcard_dados.png": ("DRAW-FC-021-03", "Dados de colores"),
    "vibrant_folk_art_tomato_on_gradient.png": ("DRAW-FC-018-02", "Tomate rojo"),
    "cartoon_finger_flashcard_with_pink_bow.png": ("DRAW-FC-021-04", "Dedo con lazo rosado"),
    "colorful_alert_button_illustration.png": ("DRAW-FC-018-03", "Tapa decorada"),
    "retro_painted_suitcase_on_a_colorful_gradient.png": ("DRAW-FC-024-02", "Maleta decorada"),
    "cheerful_tractor_climbing_the_hill.png": ("DRAW-FC-024-05", "Loma con tractor"),
    "treehouse_candy_parade.png": ("DRAW-FC-056-01", "Casita con caramelos"),
    "girl_with_orange_knit_accents_and_satchel.png": ("DRAW-FC-024-04", "Niña Luli"),
    "cheerful_child_in_a_colorful_wheelchair.png": ("DRAW-FC-018-06", "Niño Tuto"),
    "whimsical_open_can_illustration.png": ("DRAW-FC-024-03", "Lata abierta")
}
zpath = r"C:\Users\EJN\Documents\Codex\2026-10-14\new-chat\work\cartilla_thread_created_images.zip"
if os.path.exists(zpath):
    with zipfile.ZipFile(zpath) as zf:
        for member in zf.namelist():
            bname = os.path.basename(member)
            if bname in THREAD_ZIP_TO_GROUP:
                gid, note = THREAD_ZIP_TO_GROUP[bname]
                register_candidate_bytes(gid, zf.read(member), os.path.splitext(bname)[1], "ChatGPT (Archivo ZIP)", f"cartilla_thread_created_images.zip!{bname}", note, priority=1)

# 3. Repo 2026-10-20-recovered, 2026-10-22, and public/cartilla/art/approved
REPO_EXTRA_TO_GROUP = [
    ("public/cartilla/art/owner-intake/2026-10-20-recovered/aro-v1-643bf873.png", "DRAW-FC-005-06", "ChatGPT (Recuperado)", "Aro multicolor"),
    ("public/cartilla/art/owner-intake/2026-10-20-recovered/aro-v1-643bf873.png", "DRAW-WB-09-1", "ChatGPT (Recuperado)", "Aro multicolor"),
    ("public/cartilla/art/owner-intake/2026-10-20-recovered/iglu-v1-c3fa044e.png", "DRAW-WB-23-1", "ChatGPT (Recuperado)", "Iglú con nieve"),
    ("public/cartilla/art/owner-intake/2026-10-20-recovered/image-8a75e1fb.jpg", "DRAW-WB-40-1", "ChatGPT (Recuperado)", "Oruga sonriente"),
    ("public/cartilla/art/owner-intake/2026-10-20-recovered/oveja-v1-eb1e498b.png", "DRAW-WB-42-1", "ChatGPT (Recuperado)", "Oveja con flores"),
    ("public/cartilla/art/owner-intake/2026-10-22/arbol-cutout-15ec6eb6.png", "DRAW-WB-07-1", "ChatGPT (Recorte Transparente)", "Árbol sin fondo"),
    ("public/cartilla/art/owner-intake/2026-10-22/arbol-original-15ec6eb6.jpg", "DRAW-WB-07-1", "ChatGPT (Original)", "Árbol con fondo"),
    ("public/cartilla/art/owner-intake/2026-10-22/globo-cutout-f6323bea.png", "DRAW-WB-21-1", "ChatGPT (Recorte Transparente)", "Globo verde sin fondo"),
    ("public/cartilla/art/owner-intake/2026-10-22/globo-original-f6323bea.jpg", "DRAW-WB-21-1", "ChatGPT (Original)", "Globo verde"),
    ("public/cartilla/art/approved/flipchart-fixes/balloon-p007.png", "DRAW-FC-007-01", "Aprobado en Repo", "Niña con pelota (letra i)"),
    ("public/cartilla/art/approved/flipchart-fixes/calf-p027.png", "DRAW-FC-027-01", "Aprobado en Repo", "Ternero Napi"),
    ("public/cartilla/art/approved/flipchart-fixes/chick-p012.png", "DRAW-FC-012-01", "Aprobado en Repo", "Pollito con globo y letras P"),
    ("public/cartilla/art/approved/flipchart-fixes/horse-p004.png", "DRAW-FC-004-01", "Aprobado en Repo", "Niña en caballito (letra o)"),
    ("public/cartilla/art/approved/flipchart-fixes/jirafa.png", "DRAW-FC-050-01", "Aprobado en Repo", "Jirafa con letras Ji"),
    ("public/cartilla/art/approved/flipchart-fixes/pumpkin-p062.png", "DRAW-FC-053-01", "Aprobado en Repo", "Niña en carroza de calabaza"),
    ("public/cartilla/art/approved/flipchart-fixes/witch-p008.png", "DRAW-FC-008-01", "Aprobado en Repo", "Brujita Ula (letra u)"),
    ("public/cartilla/art/approved/lesson-3/abeja.jpg", "DRAW-WB-02-1", "Aprobado en Repo", "Abeja optimizada"),
    ("public/cartilla/art/approved/lesson-3/ojo.png", "DRAW-WB-36-1", "Aprobado en Repo", "Ojo verde (transparente)"),
    ("public/cartilla/art/approved/lesson-3/ojo.png", "DRAW-WB-36-2", "Aprobado en Repo", "Ojo verde (transparente)"),
    ("public/cartilla/art/faithful/vocal-a/alas.webp", "DRAW-FC-005-05", "Arte Fiel", "Alas blancas"),
    ("public/cartilla/art/faithful/vocal-a/alas.webp", "DRAW-WB-05-1", "Arte Fiel", "Alas blancas"),
    ("public/cartilla/art/faithful/vocal-a/alas.webp", "DRAW-WB-05-2", "Arte Fiel", "Alas blancas"),
    ("public/cartilla/art/faithful/vocal-u/uvas.webp", "DRAW-WB-52-1", "Arte Fiel", "Racimo de uvas"),
    ("public/cartilla/art/faithful/vocal-u/uvas.webp", "DRAW-WB-52-2", "Arte Fiel", "Racimo de uvas"),
]
for rel_p, gid, stag, note in REPO_EXTRA_TO_GROUP:
    register_candidate_file(gid, os.path.join(REPO_ROOT, rel_p), stag, note, priority=1)

# 4. Colored Library 26 files
COLORED_LIB_TO_GROUP = {
    "01_arbol_tree.png": ("DRAW-WB-07-1", "Árbol frondoso"),
    "02_avion_airplane.png": ("DRAW-WB-10-1", "Avión sonriente"),
    "03_oso_bear_blue_cap.png": ("DRAW-WB-41-1", "Oso con gorra azul"),
    "04_oso_bear_red_cap.png": ("DRAW-WB-41-2", "Oso caminante con gorra roja"),
    "05_ala_bird_wing.png": ("DRAW-WB-06-1", "Ala dorada"),
    "06_ojo_eye_green.png": ("DRAW-WB-36-1", "Ojo verde"),
    "07_ardilla_squirrel.png": ("DRAW-WB-08-1", "Ardilla con bellota"),
    "08_iglu_igloo.png": ("DRAW-WB-23-1", "Iglú en la nieve"),
    "09_auto_red_beetle_car.png": ("DRAW-WB-11-1", "Carro rojo"),
    "10_estrella_starfish_smiling.png": ("DRAW-WB-18-1", "Estrella sonriente"),
    "11_oveja_sheep.png": ("DRAW-WB-42-1", "Oveja con lazo"),
    "12_elefante_elephant.png": ("DRAW-WB-13-1", "Elefante en patineta"),
    "13_espada_sword.png": ("DRAW-WB-17-1", "Espada"),
    "14_iman_magnet.png": ("DRAW-WB-25-1", "Imán con clips"),
    "15_isla_island_palm.png": ("DRAW-WB-29-1", "Isla con palmera"),
    "16_indio_native_boy.png": ("DRAW-WB-28-1", "Indio sonriente"),
    "17_aguja_needle_thread.png": ("DRAW-WB-04-1", "Aguja enhebrada"),
    "18_erizo_hedgehog.png": ("DRAW-WB-14-1", "Erizo"),
    "19_escoba_broom.png": ("DRAW-WB-16-1", "Escoba"),
    "20_unicornio_unicorn.png": ("DRAW-WB-50-1", "Unicornio"),
    "21_uva_grapes.png": ("DRAW-WB-52-1", "Racimo de uvas"),
    "22_una_fingernail_finger.png": ("DRAW-WB-49-1", "Uña / dedo"),
    "23_ola_ocean_wave.png": ("DRAW-WB-38-1", "Ola del mar"),
    "24_olla_cooking_pot.png": ("DRAW-WB-39-1", "Olla de cocina"),
    "25_oreja_ear.png": ("DRAW-WB-37-1", "Oreja"),
    "26_estrella_star_classic.png": ("DRAW-WB-18-1", "Estrella clásica")
}
clib_dir = r"C:\Users\EJN\Documents\Cartilla_Colored_Artwork_Library_2026-10-21\COLORED_LIBRARY_IMAGES"
if os.path.exists(clib_dir):
    for fn, (gid, note) in COLORED_LIB_TO_GROUP.items():
        register_candidate_file(gid, os.path.join(clib_dir, fn), "Biblioteca Coloreada", note, priority=1)
        if fn == "06_ojo_eye_green.png":
            register_candidate_file("DRAW-WB-36-2", os.path.join(clib_dir, fn), "Biblioteca Coloreada", note, priority=1)
        if fn == "21_uva_grapes.png":
            register_candidate_file("DRAW-WB-52-2", os.path.join(clib_dir, fn), "Biblioteca Coloreada", note, priority=1)

# 5. Verified Downloads / Desktop ChatGPT files (only keep top distinct covers, not 18 duplicates)
DOWNLOADS_TO_GROUP = [
    (r"C:\Users\EJN\Downloads\563606(1).png", "DRAW-WB-02-1", "ChatGPT (Descargas)", "Abeja sonriente (PNG transparente 1536px)"),
    (r"C:\Users\EJN\Downloads\563604.jpg", "DRAW-WB-02-1", "ChatGPT (Descargas)", "Abeja sonriente (JPG)"),
    (r"C:\Users\EJN\Downloads\563608.jpg", "DRAW-WB-36-1", "ChatGPT (Descargas)", "Ojo verde"),
    (r"C:\Users\EJN\Downloads\563722.jpg", "DRAW-WB-09-1", "ChatGPT (Descargas)", "Aro multicolor"),
    (r"C:\Users\EJN\Downloads\563724.jpg", "DRAW-WB-23-1", "ChatGPT (Descargas)", "Iglú"),
    (r"C:\Users\EJN\Downloads\563726.jpg", "DRAW-WB-40-1", "ChatGPT (Descargas)", "Oruga"),
    (r"C:\Users\EJN\Downloads\563728.jpg", "DRAW-WB-42-1", "ChatGPT (Descargas)", "Oveja"),
    (r"C:\Users\EJN\Downloads\Hand-Painted Cream Angel Wings.png", "DRAW-FC-005-05", "ChatGPT (Descargas)", "Alas pintadas a mano"),
    (r"C:\Users\EJN\Downloads\Hand-Painted Cream Angel Wings.png", "DRAW-WB-05-1", "ChatGPT (Descargas)", "Alas pintadas a mano"),
    (r"C:\Users\EJN\Downloads\Hand-Painted Cream Angel Wings.png", "DRAW-WB-05-2", "ChatGPT (Descargas)", "Alas pintadas a mano"),
    (r"C:\Users\EJN\Downloads\ChatGPT Image Oct 14, 2026, 05_26_49 PM.png", "DRAW-FC-018-01", "ChatGPT (Descargas)", "Niño con tambor y tomates"),
    (r"C:\Users\EJN\Downloads\ChatGPT Image Oct 14, 2026, 05_26_58 PM.png", "DRAW-FC-021-01", "ChatGPT (Descargas)", "Niño en escalera tocando campana"),
    (r"C:\Users\EJN\Downloads\ChatGPT Image Oct 14, 2026, 05_27_07 PM.png", "DRAW-FC-023-01", "ChatGPT (Descargas)", "Rana mirando el sol"),
    (r"C:\Users\EJN\Downloads\ChatGPT Image Oct 14, 2026, 05_27_14 PM.png", "DRAW-FC-020-01", "ChatGPT (Descargas)", "Cocineros y pato con sopa"),
    (r"C:\Users\EJN\Downloads\ChatGPT Image Oct 14, 2026, 05_27_22 PM.png", "DRAW-FC-015-01", "ChatGPT (Descargas)", "Serpiente y sol con sombrero"),
    (r"C:\Users\EJN\Downloads\ChatGPT Image Oct 14, 2026, 05_27_28 PM.png", "DRAW-FC-012-01", "ChatGPT (Descargas)", "Pollito con globo de corazón"),
    (r"C:\Users\EJN\Downloads\ChatGPT Image Nov 1, 2026, 01_14_57 AM.png", "COMPOSITE-WB-FRONT-001", "ChatGPT (Descargas)", "Portada Horizontal: ¡Bienvenidos a La Cartilla de Gretel!"),
    (r"C:\Users\EJN\Downloads\image-gen(20261030-074437).png", "COMPOSITE-WB-FRONT-001", "ChatGPT (Descargas)", "Portada Aula: Gretel sosteniendo el libro"),
    (r"C:\Users\EJN\Downloads\image-gen-5(20261030-080500).png", "COMPOSITE-WB-FRONT-001", "ChatGPT (Descargas)", "Portada: Leer juntos en familia"),
    (r"C:\Users\EJN\Downloads\image-gen-1(20261030-081905).png", "COMPOSITE-WB-FRONT-002", "ChatGPT (Descargas)", "Ilustración interior de portada"),
    (r"C:\Users\EJN\Downloads\image-gen-2(20261030-074504).png", "COMPOSITE-WB-FRONT-003", "ChatGPT (Descargas)", "Gretel saludando con el libro"),
]
for p, gid, stag, note in DOWNLOADS_TO_GROUP:
    register_candidate_file(gid, p, stag, note, priority=1)

# 5b. New owner intake (image-gen-1(2).zip from 2026-11-06)
imagegen_dir = os.path.join(REPO_ROOT, "public", "cartilla", "art", "owner-intake", "imagegen-2026-11-06")
match_proposals_file = os.path.join(imagegen_dir, "match-proposals.json")
board_data_file = os.path.join(REPO_ROOT, "docs", "art-board", "board-data.json")

if os.path.exists(match_proposals_file) and os.path.exists(board_data_file):
    board_raw = json.load(open(board_data_file, "r", encoding="utf-8", errors="replace"))
    id_to_group = {r["id"]: r["group"] for r in board_raw.get("rows", [])}
    proposals_data = json.load(open(match_proposals_file, "r", encoding="utf-8", errors="replace"))
    for prop in proposals_data:
        fname = prop.get("file")
        fpath = os.path.join(imagegen_dir, fname)
        if not os.path.exists(fpath):
            continue
        top_matches = prop.get("top", [])
        if top_matches:
            top_cand = top_matches[0]
            top_id = top_cand.get("id")
            top_gid = id_to_group.get(top_id)
            top_label = top_cand.get("label", "")
            top_score = top_cand.get("score", 0)
            if top_gid:
                register_candidate_file(top_gid, fpath, "Nueva IA (image-gen-1)", f"Nueva ilustración generada ({top_label}, score={top_score})", priority=1)



# 5c. Latest bulk upload from review board UI
latest_bulk_dir = os.path.join(REPO_ROOT, 'public', 'cartilla', 'art', 'owner-intake', 'latest-bulk-upload')
latest_bulk_manifest = os.path.join(latest_bulk_dir, 'bulk-match-manifest.json')
if os.path.exists(latest_bulk_manifest):
    latest_items = json.load(open(latest_bulk_manifest, 'r', encoding='utf-8', errors='replace'))
    for item in latest_items:
        fpath = item.get('path')
        gid = item.get('matched_group_id')
        lbl = item.get('label', '')
        sc = item.get('score', 0)
        if fpath and gid and os.path.exists(fpath):
            register_candidate_file(gid, fpath, 'Lote Subido (Auto-organizado)', f'Organizado automáticamente ({lbl}, coincidencia={sc})', priority=1)

# 6. CartillaOptimized high-res matching
for p in avail_data.get("placements", []):
    gid = p["drawing_group_id"]
    all_matches = ([p["selected_match"]] if p.get("selected_match") else []) + (p.get("alternatives_checked") or [])
    for m in all_matches:
        if not m:
            continue
        loc = m.get("location", "")
        if loc.startswith("C:\\Users\\EJN\\CartillaOptimized") and os.path.exists(loc):
            register_candidate_file(gid, loc, "CartillaOptimized", f"Optimizado ({os.path.basename(loc)})", priority=2)
        elif loc.startswith("public/"):
            disk_p = os.path.join(REPO_ROOT, loc)
            if os.path.exists(disk_p):
                register_candidate_file(gid, disk_p, "Repositorio", f"Versión en repo ({os.path.basename(loc)})", priority=2)
        elif m.get("preview"):
            prev_p = os.path.join(REPO_ROOT, "docs", "proofs", "artwork-coverage-2026-10-14", m["preview"])
            if os.path.exists(prev_p):
                register_candidate_file(gid, prev_p, "Archivo", f"Versión en archivo ({os.path.basename(loc)})", priority=2)

# 7. Scan public/cartilla/art/faithful and public/cartilla/art/optimized/flipchart-native for high-res (>400px)
def norm_slug(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(ch for ch in s if unicodedata.category(ch) != "Mn" and ch.isalnum())

label_to_gids = {}
for gid, grp in groups_by_id.items():
    sl = norm_slug(grp["raw_label"])
    label_to_gids.setdefault(sl, []).append(gid)

for folder, stag in [("public/cartilla/art/faithful", "Arte Fiel"), ("public/cartilla/art/optimized/flipchart-native", "Optimizado en Repo")]:
    full_f = os.path.join(REPO_ROOT, folder)
    for dp, _, fns in os.walk(full_f):
        for fn in fns:
            if not fn.lower().endswith((".png", ".webp", ".jpg")):
                continue
            p = os.path.join(dp, fn)
            try:
                im = Image.open(p)
                if max(im.size) < 400:
                    continue
            except Exception:
                continue
            stem = os.path.splitext(fn)[0]
            if stem.startswith("p0") and "-" in stem:
                parts = stem.split("-", 1)
                pnum = parts[0][1:]
                wpart = parts[1]
                if wpart == "scene":
                    cand_gid = f"DRAW-FC-{pnum}-01"
                    if cand_gid in groups_by_id:
                        register_candidate_file(cand_gid, p, stag, f"Escena optimizada ({fn})", priority=2)
                        continue
                else:
                    sl = norm_slug(wpart)
                    for gid in label_to_gids.get(sl, []):
                        register_candidate_file(gid, p, stag, f"Dibujo optimizado ({fn})", priority=2)
            else:
                sl = norm_slug(stem)
                for gid in label_to_gids.get(sl, []):
                    register_candidate_file(gid, p, stag, f"Dibujo optimizado ({fn})", priority=2)

# 8. Fallback for any remaining group with 0 candidates
for p in avail_data.get("placements", []):
    gid = p["drawing_group_id"]
    if len(groups_by_id[gid]["candidates"]) > 0:
        continue
    all_matches = ([p["selected_match"]] if p.get("selected_match") else []) + (p.get("alternatives_checked") or [])
    for m in all_matches:
        if not m:
            continue
        loc = m.get("location", "")
        if loc.startswith("public/"):
            disk_p = os.path.join(REPO_ROOT, loc)
            if os.path.exists(disk_p):
                register_candidate_file(gid, disk_p, "Actual en Repo", f"Versión actual ({os.path.basename(loc)})", min_dim=150, priority=3)
        elif m.get("preview"):
            prev_p = os.path.join(REPO_ROOT, "docs", "proofs", "artwork-coverage-2026-10-14", m["preview"])
            if os.path.exists(prev_p):
                register_candidate_file(gid, prev_p, "Archivo", f"Versión actual ({os.path.basename(loc)})", min_dim=150, priority=3)

# 9. DEDUPLICATE visual duplicates (keeping ONLY the highest-quality version!) and cap at max 3 distinct options
removed_duplicates_count = 0
for grp in groups_by_id.values():
    # Sort by highest quality_score first
    grp["candidates"].sort(key=lambda c: (-c["quality_score"], c["priority"], -(c["width"] * c["height"]), -c["bytes"]))
    unique_cands = []
    for c in grp["candidates"]:
        dup_target = None
        for kept in unique_cands:
            if are_visual_duplicates(c, kept):
                dup_target = kept
                break
        if dup_target is not None:
            removed_duplicates_count += 1
            dup_target["duplicates_removed"] = dup_target.get("duplicates_removed", 0) + 1
            continue
        unique_cands.append(c)

    # Keep at most top 3 distinct options so no row ever has 18 images
    unique_cands = unique_cands[:3]

    for idx, c in enumerate(unique_cands):
        c.pop("_dhash", None)
        c.pop("_vec", None)
        alpha_str = " · Fondo transparente" if c["has_alpha"] else ""
        dups_hidden = c.get("duplicates_removed", 0)
        dup_note = f" (se descartaron {dups_hidden} copias de menor resolución)" if dups_hidden > 0 else ""
        if idx == 0:
            c["is_recommended"] = True
            c["quality_badge"] = f"⭐ RECOMENDADO · Máxima Calidad ({c['width']}×{c['height']} {c['format']}{alpha_str})"
            c["quality_advice"] = f"Esta es la versión de mayor nitidez y calidad técnica{dup_note}."
        else:
            c["is_recommended"] = False
            c["quality_badge"] = f"🎨 Diseño Alternativo ({c['width']}×{c['height']} {c['format']}{alpha_str})"
            c["quality_advice"] = "Dibujo diferente al recomendado. Elígelo solo si prefieres este estilo visual."

    grp["candidates"] = unique_cands

    if grp["current_runtime_assets"]:
        grp["canonical_target"] = "public" + grp["current_runtime_assets"][0]
    elif grp["old_files_to_replace"]:
        grp["canonical_target"] = grp["old_files_to_replace"][0]
    else:
        slug = norm_slug(grp["raw_label"]) or grp["group_id"].lower()
        book_sub = "flipchart-native" if grp["group_id"].startswith("DRAW-FC") else "workbook"
        grp["canonical_target"] = f"public/cartilla/art/approved/{book_sub}/{slug}.png"

all_groups = list(groups_by_id.values())

def sort_key(g):
    gid = g["group_id"]
    if gid.startswith("DRAW-WB"):
        return (0, norm_slug(g["label"]))
    if gid.startswith("DRAW-FC"):
        return (1, gid)
    return (2, gid)

all_groups.sort(key=sort_key)

total_candidates = sum(len(g["candidates"]) for g in all_groups)
multi_groups = sum(1 for g in all_groups if len(g["candidates"]) > 1)

print(f"Total drawing groups: {len(all_groups)}")
print(f"Duplicate lower-quality copies automatically removed: {removed_duplicates_count}")
print(f"Groups with 2-3 distinct artistic designs: {multi_groups}")
print(f"Total clean candidates shown: {total_candidates}")

catalog_payload = {
    "generated_at": "2026-11-01",
    "total_groups": len(all_groups),
    "removed_duplicates": removed_duplicates_count,
    "multi_candidate_groups": multi_groups,
    "total_candidates": total_candidates,
    "groups": all_groups
}

out_json = os.path.join(REPO_ROOT, "docs", "art-board", "verified-optimized-catalog.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(catalog_payload, f, indent=2, ensure_ascii=False)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Revisión Simple de Imágenes — La Cartilla de Gretel</title>
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
    .item-card.status-accepted { border-color: #22c55e; background: #faffpc; }
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

    .side-by-side {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 20px;
      align-items: stretch;
    }
    @media (max-width: 820px) {
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
      height: 190px;
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

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

    .row-drop-hint {
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--muted);
      font-size: 12.5px;
      cursor: pointer;
      min-height: 120px;
      background: #f8fafc;
    }
    .row-drop-hint:hover {
      border-color: var(--blue);
      color: var(--blue);
      background: #eff6ff;
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
          <h1>🎨 Revisión Simple de Imágenes (Lado a Lado)</h1>
          <p>Ya eliminamos todas las copias repetidas de menor resolución. La versión de máxima calidad está marcada con ⭐.</p>
        </div>
        <div class="top-actions">
          <span id="counter-pill" style="font-size:13px;font-weight:700;padding:6px 12px;background:#f1f5f9;border-radius:999px;"></span>
          <button class="btn btn-green" id="btn-accept-recommended">⭐ Aceptar Todos los Recomendados (1 Clic)</button>
          <button class="btn btn-blue" id="btn-save">💾 Guardar Mis Decisiones</button>
        </div>
      </div>
      <div class="nav-bar">
        <div class="tabs" id="tabs">
          <button class="tab active" data-tab="wb">📘 Cuaderno (A–Z)</button>
          <button class="tab" data-tab="fc">📙 Rotafolio (Por Página)</button>
          <button class="tab" data-tab="cover">🖼️ Portadas</button>
          <button class="tab" data-tab="all">Todos (201)</button>
          <button class="tab" data-tab="pending">⏳ Pendientes</button>
          <button class="tab" data-tab="accepted">✅ Aceptados</button>
          <button class="tab" data-tab="declined">❌ Rechazados</button>
        </div>
        <input type="search" id="search" class="search-box" placeholder="🔍 Buscar palabra (ej. abeja, topo, aguja)..." />
      </div>
    </div>
  </header>

  <div class="container">
    <!-- Bulk or Single Drag-and-Drop Zone -->
    <div class="bulk-dropzone" id="bulk-dropzone">
      <h3>📥 ¿Tienes imágenes en otra carpeta? Arrástralas aquí (una por una o en lote)</h3>
      <p>También puedes arrastrar una imagen directamente sobre cualquier fila de abajo, o hacer clic aquí para buscarlas en tu PC.</p>
      <div id="tray-container" class="tray-list" onclick="event.stopPropagation()"></div>
    </div>

    <div id="list-container" style="display:flex;flex-direction:column;gap:16px;"></div>
  </div>

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

  <input type="file" id="file-picker" accept="image/*" multiple style="display:none" />

  <script>
    const CATALOG = __CATALOG_JSON__;
    const IS_FILE_PROTOCOL = window.location.protocol === "file:";
    const STORAGE_KEY = "cartilla_simple_decisions_v3";
    let decisions = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) decisions = JSON.parse(raw);
    } catch (e) {}

    let activeTab = "wb";
    let query = "";
    let singleUploadGroupId = null;
    let unassignedDrops = [];

    function resolveImgUrl(webUrl, offlineUrl) {
      if (IS_FILE_PROTOCOL && offlineUrl) return offlineUrl;
      return webUrl || offlineUrl || "";
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
      } catch (e) {}
      updateHeaderCounter();
    }

    function updateHeaderCounter() {
      let acc = 0, dec = 0, pend = 0;
      for (const g of CATALOG.groups) {
        const d = decisions[g.group_id];
        if (!d) pend++;
        else if (d.status === "accepted") acc++;
        else if (d.status === "declined") dec++;
      }
      document.getElementById("counter-pill").textContent =
        `✅ ${acc} Aceptados · ❌ ${dec} Rechazados · ⏳ ${pend} Pendientes`;
    }

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
      saveState();
      renderList();
    }

    function toggleDecline(groupId) {
      if (decisions[groupId] && decisions[groupId].status === "declined") {
        delete decisions[groupId];
      } else {
        decisions[groupId] = {
          status: "declined",
          selected_candidate_id: null,
          updated_at: new Date().toISOString()
        };
      }
      saveState();
      renderList();
    }

    function openZoom(title, origUrl, candUrl, candLabel) {
      document.getElementById("modal-title").textContent = title;
      document.getElementById("modal-orig").src = origUrl;
      document.getElementById("modal-cand").src = candUrl;
      document.getElementById("modal-cand-title").textContent = candLabel;
      document.getElementById("modal").classList.add("open");
    }

    function normText(s) {
      return (s || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    }

    function attachFileToGroup(groupId, fileObj, dataUrl, width, height) {
      const grp = CATALOG.groups.find(g => g.group_id === groupId);
      if (!grp) return;
      const cid = "user-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      grp.candidates.unshift({
        id: cid,
        web_url: dataUrl,
        offline_url: dataUrl,
        width: width || 1200,
        height: height || 1200,
        format: (fileObj.name.split(".").pop() || "PNG").toUpperCase(),
        has_alpha: true,
        is_recommended: true,
        quality_badge: `🌟 TU IMAGEN SUBIDA (${width || ""}×${height || ""} px)`,
        quality_advice: `Archivo: ${fileObj.name}`,
        original_path: fileObj.name
      });
      acceptOption(groupId, cid);
    }

    function handleDroppedFiles(fileList, explicitGroupId) {
      Array.from(fileList).forEach(file => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          const img = new Image();
          img.onload = () => {
            if (explicitGroupId) {
              attachFileToGroup(explicitGroupId, file, dataUrl, img.naturalWidth, img.naturalHeight);
              return;
            }
            // Try automatic name matching for bulk drop
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
              attachFileToGroup(matchedGroup.group_id, file, dataUrl, img.naturalWidth, img.naturalHeight);
            } else {
              unassignedDrops.push({
                id: "drop-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
                file,
                dataUrl,
                width: img.naturalWidth,
                height: img.naturalHeight
              });
              renderTray();
            }
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
    }

    function renderTray() {
      const box = document.getElementById("tray-container");
      if (unassignedDrops.length === 0) {
        box.innerHTML = "";
        return;
      }
      const optionsHtml = CATALOG.groups.map(g =>
        `<option value="${g.group_id}">${g.label} (${g.group_id})</option>`
      ).join("");

      box.innerHTML = unassignedDrops.map(item => `
        <div class="tray-item">
          <img src="${item.dataUrl}" alt="" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.file.name}</div>
            <div style="font-size:11.5px;color:#64748b;">${item.width}×${item.height} px</div>
            <select id="sel-${item.id}">
              <option value="">-- Elegir a qué dibujo corresponde --</option>
              ${optionsHtml}
            </select>
            <button class="btn btn-green" style="padding:5px 10px;font-size:12px;margin-top:6px;width:100%;" onclick="assignFromTray('${item.id}')">✅ Asignar y Aceptar</button>
          </div>
        </div>
      `).join("");
    }

    window.assignFromTray = function(itemId) {
      const sel = document.getElementById("sel-" + itemId);
      if (!sel || !sel.value) return;
      const idx = unassignedDrops.findIndex(x => x.id === itemId);
      if (idx < 0) return;
      const item = unassignedDrops[idx];
      unassignedDrops.splice(idx, 1);
      attachFileToGroup(sel.value, item.file, item.dataUrl, item.width, item.height);
      renderTray();
    };

    window.openRowFilePicker = function(groupId) {
      singleUploadGroupId = groupId;
      document.getElementById("file-picker").click();
    };

    window.handleRowDrop = function(ev, groupId) {
      ev.preventDefault();
      ev.currentTarget.classList.remove("dragover");
      if (ev.dataTransfer && ev.dataTransfer.files.length > 0) {
        handleDroppedFiles(ev.dataTransfer.files, groupId);
      }
    };

    const bulkZone = document.getElementById("bulk-dropzone");
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

    document.getElementById("file-picker").addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleDroppedFiles(e.target.files, singleUploadGroupId);
      }
      e.target.value = "";
    });

    function filterGroup(g) {
      const d = decisions[g.group_id];
      const st = d ? d.status : "pending";
      if (activeTab === "wb" && !g.group_id.startsWith("DRAW-WB")) return false;
      if (activeTab === "fc" && !g.group_id.startsWith("DRAW-FC")) return false;
      if (activeTab === "cover" && !g.group_id.startsWith("COMPOSITE")) return false;
      if (activeTab === "pending" && st !== "pending") return false;
      if (activeTab === "accepted" && st !== "accepted") return false;
      if (activeTab === "declined" && st !== "declined") return false;

      if (query) {
        const q = normText(query);
        const hay = normText(g.label + " " + g.raw_label + " " + g.group_id + " " + g.pages_summary.join(" "));
        if (!hay.includes(q)) return false;
      }
      return true;
    }

    function renderList() {
      const container = document.getElementById("list-container");
      const items = CATALOG.groups.filter(filterGroup);
      if (items.length === 0) {
        container.innerHTML = `<div style="background:#fff;padding:32px;border-radius:16px;text-align:center;color:#64748b;">No hay elementos en esta vista.</div>`;
        return;
      }

      container.innerHTML = items.map(g => {
        const d = decisions[g.group_id];
        const st = d ? d.status : "pending";
        const selId = d ? d.selected_candidate_id : null;

        let statusHtml = `<span class="status-badge pending">⏳ Pendiente</span>`;
        if (st === "accepted") statusHtml = `<span class="status-badge accepted">✅ Aceptado</span>`;
        if (st === "declined") statusHtml = `<span class="status-badge declined">❌ Rechazado</span>`;

        const origSrc = resolveImgUrl(g.source_crop, g.source_crop_offline);
        const pCount = g.placements.length;
        const repeatLabel = pCount > 1
          ? `Se actualiza automáticamente en ${pCount} páginas (${g.pages_summary.slice(0, 3).join(", ")}${g.pages_summary.length > 3 ? "…" : ""})`
          : `${g.pages_summary[0] || "1 página"}`;

        const candsHtml = g.candidates.map((c, idx) => {
          const cSrc = resolveImgUrl(c.web_url, c.offline_url);
          const isSelected = st === "accepted" && selId === c.id;
          return `
            <div class="opt-card ${c.is_recommended ? "recommended" : ""} ${isSelected ? "selected" : ""}">
              <div>
                <span class="rec-tag ${c.is_recommended ? "best" : "alt"}">${c.quality_badge}</span>
              </div>
              <div class="img-stage" onclick='openZoom(${JSON.stringify(g.label)}, ${JSON.stringify(origSrc)}, ${JSON.stringify(cSrc)}, ${JSON.stringify(c.quality_badge)})'>
                <img loading="lazy" src="${cSrc}" data-fallback="${c.offline_url || c.web_url}" onerror="if(this.src!==this.dataset.fallback)this.src=this.dataset.fallback" alt="${g.label}" />
              </div>
              <div class="advice-text">${c.quality_advice}</div>
              <div class="opt-buttons">
                <button class="btn-accept ${isSelected ? "" : "outline"}" onclick="acceptOption('${g.group_id}', '${c.id}')">
                  ${isSelected ? "✅ Seleccionada" : (c.is_recommended ? "👍 Aceptar Recomendada" : "👍 Elegir Esta Opción")}
                </button>
              </div>
            </div>
          `;
        }).join("");

        return `
          <div class="item-card status-${st}"
               ondragover="event.preventDefault();this.classList.add('dragover')"
               ondragleave="this.classList.remove('dragover')"
               ondrop="handleRowDrop(event, '${g.group_id}')">
            <div class="item-header">
              <div class="item-title-group">
                <span class="item-title">${g.label}</span>
                <span class="pages-pill">📍 ${repeatLabel}</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                ${statusHtml}
                <button class="btn btn-outline" style="padding:6px 12px;font-size:12.5px;color:#dc2626;border-color:#fca5a5;" onclick="toggleDecline('${g.group_id}')">
                  ${st === "declined" ? "Deshacer Rechazo" : "❌ No coincide / Rechazar"}
                </button>
              </div>
            </div>

            <div class="side-by-side">
              <div class="orig-box">
                <span class="box-label">1. Original del Libro</span>
                <div class="img-stage" onclick='openZoom(${JSON.stringify(g.label)}, ${JSON.stringify(origSrc)}, ${JSON.stringify(g.candidates[0] ? resolveImgUrl(g.candidates[0].web_url, g.candidates[0].offline_url) : origSrc)}, "Comparación")'>
                  <img loading="lazy" src="${origSrc}" data-fallback="${g.source_crop_offline || g.source_crop}" onerror="if(this.src!==this.dataset.fallback)this.src=this.dataset.fallback" alt="Original" />
                </div>
                <div class="pages-note">Haz clic en cualquier imagen para verla en grande</div>
              </div>

              <div class="options-grid">
                ${candsHtml}
                <div class="row-drop-hint" onclick="openRowFilePicker('${g.group_id}')">
                  <strong style="font-size:14px;margin-bottom:4px;">📥 ¿Tienes otra mejor?</strong>
                  <span>Arrastra tu imagen aquí o haz clic para subirla</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    document.querySelectorAll("#tabs .tab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#tabs .tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.tab;
        renderList();
      });
    });

    document.getElementById("search").addEventListener("input", (e) => {
      query = e.target.value.trim();
      renderList();
    });

    document.getElementById("btn-accept-recommended").addEventListener("click", () => {
      for (const g of CATALOG.groups) {
        if (!decisions[g.group_id] && g.candidates.length > 0) {
          const best = g.candidates[0];
          decisions[g.group_id] = {
            status: "accepted",
            selected_candidate_id: best.id,
            selected_original_path: best.original_path,
            canonical_target: g.canonical_target,
            updated_at: new Date().toISOString()
          };
        }
      }
      saveState();
      renderList();
    });

    document.getElementById("btn-save").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), decisions }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "decisiones-imagenes-cartilla.json";
      a.click();
    });

    updateHeaderCounter();
    renderList();
  </script>
</body>
</html>
"""

html_out = HTML_TEMPLATE.replace("__CATALOG_JSON__", json.dumps(catalog_payload, ensure_ascii=False))

for target_html in [
    os.path.join(REPO_ROOT, "docs", "art-board", "verified-optimized.html"),
    os.path.join(REPO_ROOT, "docs", "art-board", "index.html"),
    os.path.join(DROP_ROOT, "VERIFIED_OPTIMIZED_GALLERY.html"),
    os.path.join(DROP_ROOT, "TABLERO_ARTE_SIMPLE.html"),
]:
    os.makedirs(os.path.dirname(target_html), exist_ok=True)
    with open(target_html, "w", encoding="utf-8") as f:
        f.write(html_out)
    print("Wrote HTML board:", target_html)
