import json
import re
import os

with open('src/content/page-layouts.json', 'r', encoding='utf-8') as f:
    layouts = json.load(f)

new_pages = {}

for p_id_str, page_data in layouts['pages'].items():
    p_id = int(p_id_str)
    
    if p_id < 19 or p_id > 90:
        new_pages[p_id_str] = page_data
        continue
        
    lesson_offset = (p_id - 19) % 4
    lesson_start = p_id - lesson_offset
    
    # We will build the new pages when we hit the start of a lesson
    if lesson_offset != 0:
        continue
        
    print(f'Processing lesson starting at page {lesson_start}')
    
    # Grab the old pages
    old_p1 = layouts['pages'].get(str(lesson_start), {}).get('regions', [])
    old_p2 = layouts['pages'].get(str(lesson_start + 1), {}).get('regions', [])
    old_p3 = layouts['pages'].get(str(lesson_start + 2), {}).get('regions', [])
    old_p4 = layouts['pages'].get(str(lesson_start + 3), {}).get('regions', [])
    
    # NEW PAGE 1 (Intro) -> Gets content from old Page 4
    new_p1_regions = []
    order = 0
    for r in old_p4:
        if r['regionType'] in ['title', 'syllable-bubble', 'vocab-grid']:
            r_copy = dict(r)
            rtype = r_copy['regionType']
            r_copy['id'] = f'p{lesson_start}-{rtype}-{order}'
            r_copy['order'] = order
            new_p1_regions.append(r_copy)
            order += 1
            
    new_pages[str(lesson_start)] = {'regions': new_p1_regions}
    
    # NEW PAGE 2 (Vocab) -> No interactive regions needed for now
    new_pages[str(lesson_start + 1)] = {'regions': []}
    
    # NEW PAGE 3 (Reading) -> Gets reading sentences from old Page 4
    new_p3_regions = []
    order = 0
    for r in old_p4:
        if r['regionType'] == 'reading-sentences':
            r_copy = dict(r)
            r_copy['id'] = f'p{lesson_start + 2}-sentence-{order}'
            r_copy['order'] = order
            new_p3_regions.append(r_copy)
            order += 1
            
    new_pages[str(lesson_start + 2)] = {'regions': new_p3_regions}
    
    # NEW PAGE 4 (Activity) -> Fill in blanks (old P3) + Writing (old P1)
    new_p4_regions = []
    order = 0
    
    # Instruction 1
    new_p4_regions.append({
        'id': f'p{lesson_start + 3}-instr1',
        'regionType': 'instruction',
        'order': order,
        'fontRole': 'body',
        'text': 'Completa las palabras con la sílaba correcta.'
    })
    order += 1
    
    # Fill in blanks
    for r in old_p3:
        if r['regionType'] == 'fill-in-blank':
            r_copy = dict(r)
            r_copy['id'] = f'p{lesson_start + 3}-fill-{order}'
            r_copy['order'] = order
            new_p4_regions.append(r_copy)
            order += 1
            
    # Instruction 2
    new_p4_regions.append({
        'id': f'p{lesson_start + 3}-instr2',
        'regionType': 'instruction',
        'order': order,
        'fontRole': 'body',
        'text': 'Escribe oraciones. Usa las sílabas que aprendiste.'
    })
    order += 1
    
    # Writing lines
    for r in old_p1:
        if r['regionType'] == 'writing-line':
            r_copy = dict(r)
            r_copy['id'] = f'p{lesson_start + 3}-write-{order}'
            r_copy['order'] = order
            new_p4_regions.append(r_copy)
            order += 1
            
    new_pages[str(lesson_start + 3)] = {'regions': new_p4_regions}

layouts['pages'] = new_pages

with open('src/content/page-layouts.json', 'w', encoding='utf-8') as f:
    json.dump(layouts, f, indent=2, ensure_ascii=False)

print('Remapping complete.')
