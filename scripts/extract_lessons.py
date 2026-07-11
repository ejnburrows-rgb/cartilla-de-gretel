import re
import json
import os

text_file = r"C:\Users\EJN\.gemini\antigravity\scratch\cartilla-de-gretel\docs\teacher-guide.txt"
output_dir = r"C:\Users\EJN\.gemini\antigravity\scratch\cartilla-de-gretel\src\content\guia"
os.makedirs(output_dir, exist_ok=True)

with open(text_file, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Teacher’s Guide", "Teacher's Guide")

pattern = re.compile(r'Lecci[oó]n\s+(\d+):\s+(.*?)\s+Teacher\'s Guide\s*Objectives\s*(.*?)(?=Lecci[oó]n\s+\d+:|$)', re.IGNORECASE | re.DOTALL)
matches = pattern.findall(content)

def extract_section(text, start_marker, end_markers):
    start_idx = text.find(start_marker)
    if start_idx == -1:
        return ""
    start_idx += len(start_marker)
    end_idx = len(text)
    for marker in end_markers:
        idx = text.find(marker, start_idx)
        if idx != -1 and idx < end_idx:
            end_idx = idx
    return text[start_idx:end_idx].strip()

found_lessons = set()

for match in matches:
    lesson_num = int(match[0])
    title = match[1].strip()
    body = match[2]
    
    objectives = extract_section(body, "", ["Teaching Materials", "Summary"])
    motivation = extract_section(body, "Motivación", ["Open to Activity Book", "Writing / Language Mechanics", "Reading / Literature", "Open Flip Chart"])
    story_script = extract_section(body, "Reading / Literature", ["Writing / Language Mechanics", "Open to Activity Book", "Reinforcement", "Open Flip Chart"])
    evaluation = extract_section(body, "Evaluation", ["Enrichment", "Lección"])
    
    data = {
        "lesson": lesson_num,
        "title": title,
        "objectives": objectives,
        "motivation": motivation,
        "story_script": story_script,
        "evaluation_references": evaluation,
        "provenance": "docs/teacher-guide.txt"
    }
    
    filename = f"leccion-{lesson_num:02d}.json"
    out_path = os.path.join(output_dir, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    found_lessons.add(lesson_num)

# Now create placeholders for missing lessons 1-24
for i in range(1, 25):
    if i not in found_lessons:
        data = {
            "lesson": i,
            "title": "NOT-FOUND-AFTER-SEARCH",
            "objectives": "NOT-FOUND-AFTER-SEARCH",
            "motivation": "NOT-FOUND-AFTER-SEARCH",
            "story_script": "NOT-FOUND-AFTER-SEARCH",
            "evaluation_references": "NOT-FOUND-AFTER-SEARCH",
            "provenance": "NOT-FOUND-AFTER-SEARCH"
        }
        filename = f"leccion-{i:02d}.json"
        out_path = os.path.join(output_dir, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("Extracted all 24 lessons (with NOT-FOUND-AFTER-SEARCH for missing ones).")
