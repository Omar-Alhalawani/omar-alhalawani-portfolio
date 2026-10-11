"""Bake world-atlas 2.0.2 / Natural Earth 4.1.0 land; no runtime GIS dependencies."""
import json, math, hashlib, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw
URL='https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json'
raw=Path('/tmp/land-110m.json').read_bytes() if Path('/tmp/land-110m.json').exists() else urllib.request.urlopen(URL).read()
t=json.loads(raw);sx,sy=t['transform']['scale'];tx,ty=t['transform']['translate']
arcs=[]
for arc in t['arcs']:
 x=y=0;line=[]
 for dx,dy in arc:x+=dx;y+=dy;line.append([x*sx+tx,y*sy+ty])
 arcs.append(line)
def ring(ids):
 pts=[]
 for idx in ids:
  part=arcs[idx] if idx>=0 else arcs[~idx][::-1]
  pts.extend(part if not pts else part[1:])
 return pts
geom=t['objects']['land']['geometries'][0]
polygons=[list(map(ring,rings)) for rings in geom['arcs']]
# Published 110m rings are already cut at the antimeridian. Preserve their holes.
def inside(lon,lat,points):
 hit=False
 for (a,b),(c,d) in zip(points,points[1:]+points[:1]):
  if (b>lat)!=(d>lat) and lon<(c-a)*(lat-b)/(d-b)+a:hit=not hit
 return hit
bounds=[(min(v[0] for v in p[0]),max(v[0] for v in p[0]),min(v[1] for v in p[0]),max(v[1] for v in p[0])) for p in polygons]
def contains(lon,lat):
 return any(lo<=lon<=hi and bottom<=lat<=top and inside(lon,lat,p[0]) and not any(inside(lon,lat,h) for h in p[1:]) for p,(lo,hi,bottom,top) in zip(polygons,bounds))
W,H=1024,512;im=Image.new('RGB',(W,H),'#263239');draw=ImageDraw.Draw(im)
for p in polygons:
 draw.polygon([((lon+180)/360*W,(90-lat)/180*H) for lon,lat in p[0]],fill='#697779')
 for hole in p[1:]:draw.polygon([((lon+180)/360*W,(90-lat)/180*H) for lon,lat in hole],fill='#263239')
 draw.line([((lon+180)/360*W,(90-lat)/180*H) for lon,lat in p[0]],fill='#8b9896',width=1)
im.save('public/art/contact-land.webp',quality=91)
samples={}
for name,step in [('medium',3.2),('low',5.0)]:
 points=[];lat=-86
 while lat<86:
  # Equal-ish surface spacing avoids huge clusters at high latitudes.
  lon=-178;lonstep=step/max(.35,math.cos(math.radians(lat)))
  while lon<180:
   if contains(lon,lat):points.append([round(lat,3),round(lon,3)])
   lon+=lonstep
  lat+=step
 samples[name]=points
coasts=[[[round(lat,3),round(lon,3)] for lon,lat in p[0]] for p in polygons]
Path('src/data/contact-geography.json').write_text(json.dumps({'dots':samples,'coasts':coasts},separators=(',',':')))
nodes={'ottawa':[45.4215,-75.6972],'europe':[48.86,2.35],'africa':[-1.29,36.82],'asia':[28.61,77.21],'southAmerica':[-23.55,-46.63],'oceania':[-33.87,151.21]}
checks={name:contains(lon,lat) for name,(lat,lon) in nodes.items()}
assert all(checks.values()),checks
Path('docs/globe-geography').mkdir(parents=True,exist_ok=True)
Path('docs/globe-geography/data-source.json').write_text(json.dumps({'source':URL,'version':'world-atlas 2.0.2 / Natural Earth 4.1.0 land 1:110m','sha256':hashlib.sha256(raw).hexdigest(),'license':'Natural Earth public domain; world-atlas redistribution ISC','licenseURL':'https://github.com/topojson/world-atlas/blob/master/LICENSE','sampleCounts':{k:len(v) for k,v in samples.items()},'endpointLandChecks':checks,'nodes':nodes},indent=2))
print({'rawBytes':len(raw),'compactBytes':Path('src/data/contact-geography.json').stat().st_size,'mapBytes':Path('public/art/contact-land.webp').stat().st_size,'samples':{k:len(v) for k,v in samples.items()},'endpoints':checks})
