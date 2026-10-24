"""Source pixel-union contours for workbook geometry and type measurement."""
import numpy as np

def simplify(points,tolerance=1):
 if len(points)<3:return points
 a,b=np.array(points[0]),np.array(points[-1]);p=np.array(points);v=b-a
 if np.dot(v,v)==0:d=np.linalg.norm(p-a,axis=1)
 else:d=np.linalg.norm(p-(a+np.clip((p-a)@v/np.dot(v,v),0,1)[:,None]*v),axis=1)
 i=int(d.argmax())
 if d[i]<=tolerance:return [points[0],points[-1]]
 return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance)
def mask_path(mask):
 # Trace the boundary of the pixel union, so row seams cannot show on phones.
 edges=set()
 for y,x in zip(*np.where(mask)):
  x,y=int(x),int(y)
  if y==0 or not mask[y-1,x]:edges.add(((x,y),(x+1,y)))
  if x==mask.shape[1]-1 or not mask[y,x+1]:edges.add(((x+1,y),(x+1,y+1)))
  if y==mask.shape[0]-1 or not mask[y+1,x]:edges.add(((x+1,y+1),(x,y+1)))
  if x==0 or not mask[y,x-1]:edges.add(((x,y+1),(x,y)))
 paths=[]
 while edges:
  start,nextp=next(iter(edges));edges.remove((start,nextp));points=[start,nextp];current=nextp
  while current!=start:
   options=[end for end in [(current[0]+1,current[1]),(current[0],current[1]+1),(current[0]-1,current[1]),(current[0],current[1]-1)] if (current,end) in edges]
   if not options:break
   previous=points[-2];dx,dy=current[0]-previous[0],current[1]-previous[1]
   def rank(end):
    nx,ny=end[0]-current[0],end[1]-current[1]
    return {1:0,0:1,-1:2}.get(dx*ny-dy*nx,3)
   end=min(options,key=rank);edges.remove((current,end));points.append(end);current=end
  points=simplify(points,.3)
  paths.append('M'+' L'.join(f'{x},{y}' for x,y in points)+' Z')
 return ''.join(paths)
