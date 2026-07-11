import json
import glob

# Collect missing pages
missing = ['61', '63', '64', '65', '67', '68', '69', '71', '72', '73', '75', '76', '77', '79', '80', '81', '83', '84', '85', '87', '88', '89']

# Collect from subagent outputs (assume we will save them to subagent_X.json)
results = []
for i in range(5):
    try:
        with open(f'subagent_{i}.json', 'r', encoding='utf-8') as f:
            results.extend(json.load(f))
    except Exception as e:
        print(f"Skipping subagent_{i}.json: {e}")

for m in missing:
    results.append({
        "page": m,
        "classification": "UNREADABLE",
        "current_text": "Unknown (missing scan)",
        "printed_text": "UNREADABLE (scan missing)",
        "image_path": "None"
    })

results.sort(key=lambda x: int(x['page']))

mismatches = [r for r in results if r['classification'] == 'INSTRUCTION-MISMATCH']
matches = [r for r in results if r['classification'] == 'MATCH']
unreadable = [r for r in results if r['classification'] == 'UNREADABLE']

with open('INSTRUCTION-AUDIT.md', 'w', encoding='utf-8') as f:
    f.write('# Instruction Audit\n\n')
    
    f.write('## INSTRUCTION-MISMATCH\n\n')
    for r in mismatches:
        f.write(f"### Page {r['page']}\n")
        f.write(f"- **Current Text:** {r.get('current_text', 'N/A')}\n")
        f.write(f"- **Printed Text:** {r.get('printed_text', 'N/A')}\n")
        f.write(f"- **Source Scan:** {r.get('image_path', 'N/A')}\n\n")

    f.write('## MATCH\n\n')
    for r in matches:
        f.write(f"### Page {r['page']}\n")
        f.write(f"- **Current Text:** {r.get('current_text', 'N/A')}\n")
        f.write(f"- **Printed Text:** {r.get('printed_text', 'N/A')}\n")
        f.write(f"- **Source Scan:** {r.get('image_path', 'N/A')}\n\n")

    f.write('## UNREADABLE\n\n')
    for r in unreadable:
        f.write(f"### Page {r['page']}\n")
        f.write(f"- **Current Text:** {r.get('current_text', 'N/A')}\n")
        f.write(f"- **Printed Text:** {r.get('printed_text', 'N/A')}\n")
        f.write(f"- **Source Scan:** {r.get('image_path', 'N/A')}\n\n")

print(f"Total results merged: {len(results)}")
