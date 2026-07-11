import json
import os

repo_root = r"C:\Users\EJN\.gemini\antigravity\scratch\cartilla-de-gretel"
manifest_path = os.path.join(repo_root, "src", "content", "guia", "manifest.json")

# We found the Guía del profesor (teacher flipchart)
# We did NOT find explicit folders for:
# - Tablas silábicas y de vocales
# - Tareas para el hogar
# - Evaluaciones
# - Poemas y audio
# (Extensive search documented in execution logs: no matching directories or files exist in any branch)

items = []

# Load teacher flipchart data
flipchart_file = os.path.join(repo_root, "src", "data", "teacher-flipchart.json")
if os.path.exists(flipchart_file):
    with open(flipchart_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        for page in data.get("pages", []):
            item = {
                "name": f"Teacher Flipchart Page {page['flipchartPage']}",
                "folder": "Guía del profesor",
                "lesson": page.get("lesson"),
                "path": f"public/{page['path']}", # using the path from json, e.g. cartilla/art/hd/flipchart/...
                "type": "image"
            }
            items.append(item)

# Save manifest
os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print("Manifest created.")
