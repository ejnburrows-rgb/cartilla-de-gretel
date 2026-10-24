import re

with open("src/lib/living-actor-registry.ts", "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "aliveSrc" in line and "action" in line and "action: " in line:
        line = re.sub(r'action:\s*"[^"]*",\s*', '', line)
    new_lines.append(line)

# Add comment
for i, line in enumerate(new_lines):
    if "const A = \"/cartilla/art/faithful\";" in line:
        new_lines.insert(i+1, "/** Note: whole-picture ambient ripple is superseded per-picture by aliveSrc and must not be re-added. */\n")
        break

with open("src/lib/living-actor-registry.ts", "w") as f:
    f.writelines(new_lines)
