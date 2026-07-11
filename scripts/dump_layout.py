import json

def run():
    layouts = json.load(open('src/content/page-layouts.json', encoding='utf-8'))
    inv = json.load(open('src/content/page-inventory.json', encoding='utf-8'))
    
    # Dump structure of the layout for lesson 1, page 1
    page_0 = inv['workbook']['lessons'][0]['pages'][0]
    lesson_id = inv['workbook']['lessons'][0]['lessonId']
    print(f"Lesson: {lesson_id}, Page image: {page_0}")
    print("Layout text fields:")
    for region in layouts['pages']['0']:
        print(f" - {region.get('id')}: type={region.get('type')}, text={region.get('text')}, instruction={region.get('instruction')}")

if __name__ == '__main__':
    run()
