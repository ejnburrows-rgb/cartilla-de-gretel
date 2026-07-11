import json
import os

def run():
    layouts = json.load(open('src/content/page-layouts.json', encoding='utf-8'))
    inv = json.load(open('src/content/page-inventory.json', encoding='utf-8'))
    
    # Create mapping of page id (1-90) to image path
    # and map to lesson
    page_id = 1
    tasks = []
    
    for lesson in inv['workbook']['lessons']:
        lesson_id = lesson['lessonId']
        for page_img in lesson.get('pages', []):
            path = os.path.join('public', 'cartilla', 'images', 'source', page_img).replace('\\\\', '/')
            if os.path.exists(path):
                # get layout text
                pid_str = str(page_id)
                page_data = layouts['pages'].get(pid_str, {})
                
                texts = []
                for region in page_data.get('regions', []):
                    if 'text' in region:
                        texts.append({'id': region['id'], 'text': region['text']})
                    if 'instruction' in region:
                        texts.append({'id': region['id'], 'instruction': region['instruction']})
                
                tasks.append({
                    'lesson': lesson_id,
                    'page_id': pid_str,
                    'image': path,
                    'regions': texts
                })
            page_id += 1

    # Split into batches of 10 pages
    batch_size = 10
    batches = [tasks[i:i + batch_size] for i in range(0, len(tasks), batch_size)]
    
    for i, b in enumerate(batches):
        with open(f'scripts/batch_{i}.json', 'w', encoding='utf-8') as f:
            json.dump(b, f, indent=2)
    print(f'Created {len(batches)} batches in scripts/batch_*.json')

if __name__ == '__main__':
    run()
