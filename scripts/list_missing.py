import json
import os

def run():
    inv = json.load(open('src/content/page-inventory.json', encoding='utf-8'))
    images_missing = []

    for lesson in inv['workbook']['lessons']:
        for page in lesson.get('pages', []):
            path = os.path.join('public', 'cartilla', 'images', 'source', page)
            if not os.path.exists(path):
                images_missing.append((lesson.get('lessonId'), path.replace('\\\\', '/')))

    print('Missing Images List:')
    for missing in images_missing:
        print(f'Lesson {missing[0]}: {missing[1]}')

if __name__ == '__main__':
    run()
