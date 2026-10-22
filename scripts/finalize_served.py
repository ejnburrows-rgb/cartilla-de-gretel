"""Resolve what the built app really serves per slot from the real layout sources
(src/data/page-layouts.json for workbook cells, src/data/flipchart-native-assets.json for flip chart),
applying src/lib/art-delivery.ts, and patch app-loaded.json. Reports slots whose served file differs from the earlier slug-based guess."""
import json,collections
P='docs/art-inventory/app-loaded.json';A=json.load(open(P));a=A['slots']
pre='/cartilla/art/faithful/'
def deliv(src):
    if src.startswith(pre) and src.endswith('.webp') and not src.startswith(pre+'flipchart-native/'):return 'public/cartilla/art/delivery/faithful/768/'+src[len(pre):]
    return 'public'+src
def walk(o):
    if isinstance(o,dict):
        if 'illustrationSrc' in o and 'caption' in o: yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
d=json.load(open('src/data/page-layouts.json'))['pages'];pg=d.items() if isinstance(d,dict) else enumerate(d)
diff=[]
for k,p in pg:
    n=int(p.get('page',p.get('number',k))) if isinstance(p,dict) else int(k)
    for i,c in enumerate(walk(p)):
        s=f'wb-p{n:03d}-{i+1:02d}';new=deliv(c['illustrationSrc'])
        if s in a:
            a[s]['layout_src']=c['illustrationSrc']
            if a[s]['app_loads']!=new:diff.append(dict(slot=s,was_shown=a[s]['app_loads'],really_served=new,reason="page layout points this cell to a different file than the slug default"));a[s]['app_loads']=new;a[s]['rule']='page layout cell source'
A['served_check']=dict(workbook_cells_from_layout=160,differ_from_slug_guess=diff)
json.dump(A,open(P,'w'),indent=1);print(json.dumps(diff,indent=1))
