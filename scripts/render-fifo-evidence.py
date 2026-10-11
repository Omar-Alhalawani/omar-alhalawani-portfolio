"""Render actual Icarus VCD transitions; never synthesize signal values."""
import argparse,html,re
from pathlib import Path

p=argparse.ArgumentParser();p.add_argument('vcd',type=Path);p.add_argument('--output',type=Path,default=Path('public/evidence/fifo'));a=p.parse_args()
text=a.vcd.read_text();header,body=text.split('$enddefinitions $end',1)
symbols={};scope=0
for line in header.splitlines():
 if line.startswith('$scope'):scope+=1
 elif line.startswith('$upscope'):scope-=1
 elif line.startswith('$var') and scope==1:
  v=line.split();symbols[v[4]]=(v[3],int(v[2]))
events={s:[] for s,_ in symbols.values()};time=0
for line in body.splitlines():
 if line.startswith('#'):time=int(line[1:])
 elif line.startswith('b'):
  value,symbol=line[1:].split()
  if symbol in events:events[symbol].append((time,value))
 elif line and line[0] in '01xz' and line[1:] in events:events[line[1:]].append((time,line[0]))

names=['clk','rst_n','wr_valid','wr_ready','rd_ready','rd_valid','din','dout','count','full','empty']
def render(start,end,title,filename):
 left=160;right=1168;top=90;row=43;width=1200;height=top+row*len(names)+85
 sx=lambda t:left+(t-start)/(end-start)*(right-left)
 lines=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',f'<title id="title">{title}</title>',f'<desc id="desc">Actual signal transitions from the public FIFO directed testbench, simulation ticks {start} to {end}. Registered output is visible after accepted reads.</desc>',f'<rect width="{width}" height="{height}" fill="#0b1013"/>',f'<text x="28" y="32" fill="#ffbd59" font-family="monospace" font-size="15">{title}</text>','<text x="28" y="55" fill="#9faeb5" font-family="monospace" font-size="12">PUBLIC RTL + DIRECTED SCOREBOARD / ICARUS VERILOG 11.0 / DEPTH 4, WIDTH 8</text>']
 step=20 if end-start<250 else 40
 for t in range(start,end+1,step):
  x=sx(t);lines.append(f'<path d="M{x} {top-12}V{top+row*len(names)}" stroke="#253039" stroke-width="1"/>');lines.append(f'<text x="{x}" y="{top+row*len(names)+23}" text-anchor="middle" fill="#83949f" font-size="11" font-family="monospace">{t}</text>')
 for n,name in enumerate(names):
  symbol,bits=symbols[name];y=top+n*row;values=events[symbol]
  initial='x'
  for t,v in values:
   if t<=start:initial=v
  sample=[(start,initial)]+[(t,v) for t,v in values if start<t<end]+[(end,None)]
  color='#ffbd59' if name in ['wr_valid','wr_ready','din','count','full','empty'] else '#b5d6e2'
  lines.append(f'<text x="26" y="{y+18}" font-family="monospace" font-size="13" fill="#d9e0e0">{name}{f"[{bits-1}:0]" if bits>1 else ""}</text>')
  for i,(t,v) in enumerate(sample[:-1]):
   x1,x2=sx(t),sx(sample[i+1][0]);unknown=bool(re.search('[xz]',v));c='#677078' if unknown else color
   if bits==1:
    yy=y+7 if v=='1' else y+27 if v=='0' else y+17
    lines.append(f'<path d="M{x1} {yy}H{x2}" fill="none" stroke="{c}" stroke-width="1.6"/>')
    if i and v!=sample[i-1][1]:lines.append(f'<path d="M{x1} {y+7}V{y+27}" stroke="{c}" stroke-width="1.3"/>')
   else:
    lines.append(f'<path d="M{x1} {y+17}l3 -10H{x2-3}l3 10 -3 10H{x1+3}Z" fill="{c}13" stroke="{c}" stroke-width="1"/>')
    label=v.upper() if unknown else str(int(v,2)) if name=='count' else f'{int(v,2):02X}'
    if x2-x1>22:lines.append(f'<text x="{(x1+x2)/2}" y="{y+21}" text-anchor="middle" fill="{c}" font-size="11" font-family="monospace">{html.escape(label)}</text>')
 lines.extend([f'<text x="{left}" y="{height-30}" fill="#a5b0b7" font-size="12" font-family="monospace">Simulation ticks / source VCD declares 1 s units; no physical clock-frequency claim.</text>','</svg>'])
 a.output.mkdir(parents=True,exist_ok=True);a.output.joinpath(filename).write_text('\n'.join(lines))
render(0,160,'SANITY / ORDERED WRITE AND REGISTERED READ','sanity.svg')
render(160,360,'BOUNDARY / FILL TO FULL, THEN DRAIN','boundaries.svg')
print('Rendered two evidence SVGs from actual VCD transitions.')
