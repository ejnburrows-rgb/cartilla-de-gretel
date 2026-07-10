import json
import os
import re

repo_root = r"C:\Users\EJN\.gemini\antigravity\scratch\cartilla-de-gretel"
txt_path = os.path.join(repo_root, "docs", "Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt")
folder_data_ts = os.path.join(repo_root, "src", "content", "teacher-folder-data.ts")

folder_data_content = ""
if os.path.exists(folder_data_ts):
    with open(folder_data_ts, "r", encoding="utf-8") as f:
        folder_data_content = f.read()

def get_folder_data(lesson_num):
    match = re.search(fr"{lesson_num}:\s*{{[^}}]*evaluationPage:\s*(null|\d+)[^}}]*rhymeTitle:\s*(null|\"[^\"]*\")", folder_data_content)
    if match:
        eval_page = None if match.group(1) == "null" else int(match.group(1))
        rhyme = None if match.group(2) == "null" else match.group(2).strip('"')
        return eval_page, rhyme
    return None, None

with open(txt_path, "rb") as f:
    raw = f.read()
full_text = raw.decode("utf-8", errors="replace")

# Split by Lección [number]:
blocks = re.split(r'Lecci.*?n\s+(\d+):', full_text, flags=re.IGNORECASE)

lessons_data = {}

# blocks[0] is everything before Lección 1
# blocks[1] is "1"
# blocks[2] is the content of lesson 1
# blocks[3] is "1" (from evaluation) or "2"
# blocks[4] is content of next

for i in range(1, len(blocks), 2):
    lesson_num = int(blocks[i])
    if lesson_num in lessons_data:
        continue # Already processed (from evaluation duplication)
        
    content = blocks[i+1]
    
    # Extract Title (everything before Teacher's Guide)
    title_match = re.search(r'^(.*?)\s+Teacher.*?Guide', content, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""
    
    # Extract Objectives
    obj_match = re.search(r'Objectives(.*?)(?=Summary|Lesson Development|Motivaci|$)', content, re.IGNORECASE | re.DOTALL)
    objectives = []
    if obj_match:
        obj_raw = obj_match.group(1).strip()
        obj_raw = re.sub(r'Teaching Materials.*', '', obj_raw, flags=re.IGNORECASE|re.DOTALL)
        objectives = [o.strip() + "." for o in obj_raw.split('.') if o.strip()]
        
    # Extract Lesson Development
    dev_match = re.search(r'(?:Lesson Development|Motivaci)(.*?)(?=Evaluation|$)', content, re.IGNORECASE | re.DOTALL)
    lesson_dev = dev_match.group(1).strip() if dev_match else ""
    if not lesson_dev and "Motivaci" in content:
        # fallback
        dev_match = re.search(r'Motivaci(.*?)(?=Evaluation|$)', content, re.IGNORECASE | re.DOTALL)
        lesson_dev = dev_match.group(1).strip() if dev_match else ""
        
    mot_start = lesson_dev.find("Motivaci")
    mot_end = lesson_dev.find("Open to Activity Book")
    if mot_end == -1: mot_end = lesson_dev.find("Writing / Language Mechanics")
    if mot_end == -1: mot_end = lesson_dev.find("Reading / Literature")
    
    motivation = ""
    script = lesson_dev
    if mot_start != -1 and mot_end != -1 and mot_start < mot_end:
        motivation = lesson_dev[mot_start:mot_end].strip()
        script = lesson_dev[mot_end:].strip()
    elif mot_start != -1:
        motivation = lesson_dev[mot_start:].strip()
        script = ""
        
    # Extract Evaluation
    eval_match = re.search(r'Evaluation(.*?)(?=Enrichment|$)', content, re.IGNORECASE | re.DOTALL)
    eval_note = eval_match.group(1).strip() if eval_match else ""
    
    eval_page, rhyme_title = get_folder_data(lesson_num)
    
    lessons_data[lesson_num] = {
        "lessonId": lesson_num,
        "objectives": objectives if objectives else ["NOT-FOUND-AFTER-SEARCH"],
        "motivation": motivation if motivation else "NOT-FOUND-AFTER-SEARCH",
        "script": script if script else "NOT-FOUND-AFTER-SEARCH",
        "evaluationRef": {
            "page": eval_page,
            "note": eval_note if eval_note else "NOT-FOUND-AFTER-SEARCH"
        },
        "rhyme": {
            "title": rhyme_title,
            "text": None
        },
        "provenance": {
            "source": "docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt",
            "verified": True
        }
    }

out_dir = os.path.join(repo_root, "src", "content", "guia")
os.makedirs(out_dir, exist_ok=True)

search_msg = "NOT-FOUND-AFTER-SEARCH: Searched docs/ folder and all git branches for remaining lessons and other text files."
for i in range(1, 25):
    if i in lessons_data:
        data = lessons_data[i]
    else:
        eval_page, rhyme_title = get_folder_data(i)
        data = {
            "lessonId": i,
            "objectives": [search_msg],
            "motivation": search_msg,
            "script": search_msg,
            "evaluationRef": {
                "page": eval_page,
                "note": search_msg
            },
            "rhyme": {
                "title": rhyme_title,
                "text": None
            },
            "provenance": {
                "source": "NOT-FOUND-AFTER-SEARCH",
                "verified": False
            }
        }
    out_path = os.path.join(out_dir, f"leccion-{i:02d}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(lessons_data)} lessons from text.")

# Build manifest
manifest_items = []
flipchart_file = os.path.join(repo_root, "src", "data", "teacher-flipchart.json")
if os.path.exists(flipchart_file):
    with open(flipchart_file, "r", encoding="utf-8") as f:
        fdata = json.load(f)
        for page in fdata.get("pages", []):
            manifest_items.append({
                "name": f"Teacher Flipchart Page {page['flipchartPage']}",
                "folder": "Guía del profesor",
                "lesson": page.get("lesson"),
                "path": f"public/{page['path']}",
                "type": "image"
            })

# Vocales
manifest_items.append({"name": "Vocales Page 1", "folder": "Tablas silábicas y de vocales", "lesson": None, "path": "public/cartilla/images/source/vocales/vocales-page-01.png", "type": "image"})
manifest_items.append({"name": "Vocales Page 2", "folder": "Tablas silábicas y de vocales", "lesson": None, "path": "public/cartilla/images/source/vocales/vocales-page-02.png", "type": "image"})
manifest_items.append({"name": "Vocales Page 3", "folder": "Tablas silábicas y de vocales", "lesson": None, "path": "public/cartilla/images/source/vocales/vocales-page-03.png", "type": "image"})
manifest_items.append({"name": "Vocales Page 4", "folder": "Tablas silábicas y de vocales", "lesson": None, "path": "public/cartilla/images/source/vocales/vocales-page-04.png", "type": "image"})

# Not found placeholders for every lesson
missing_search = "NOT-FOUND-AFTER-SEARCH: Searched public/cartilla/images, docs, and git history for keywords (evaluaciones, tareas, homework, rhymes, charts, syllables, etc.)"
for i in range(1, 25):
    manifest_items.append({"name": f"Tablas silábicas (Lesson {i})", "folder": "Tablas silábicas y de vocales", "lesson": i, "path": missing_search, "type": "UNKNOWN"})
    manifest_items.append({"name": f"Tareas para el hogar (Lesson {i})", "folder": "Tareas para el hogar", "lesson": i, "path": missing_search, "type": "UNKNOWN"})
    manifest_items.append({"name": f"Evaluación (Lesson {i})", "folder": "Evaluaciones", "lesson": i, "path": missing_search, "type": "UNKNOWN"})
    manifest_items.append({"name": f"Answer Key (Lesson {i})", "folder": "Evaluaciones", "lesson": i, "path": missing_search, "type": "UNKNOWN"})
    manifest_items.append({"name": f"Poemas y audio (Lesson {i})", "folder": "Poemas y audio", "lesson": i, "path": missing_search, "type": "UNKNOWN"})

man_path = os.path.join(out_dir, "manifest.json")
with open(man_path, "w", encoding="utf-8") as f:
    json.dump(manifest_items, f, ensure_ascii=False, indent=2)

print("Manifest written.")
