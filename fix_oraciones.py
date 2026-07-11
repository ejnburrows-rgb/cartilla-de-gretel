import os, glob, re

for f in glob.glob('src/data/lesson-exercises/*.ts'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = re.sub(r'\"Escribe oraciones[^\"]*\"', '\"Escribe oraciones…\"', content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
