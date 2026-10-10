import fs from 'node:fs';

// Original, static vector counterparts to the procedural scenes. No textures,
// remote assets, or animation are needed when WebGL is unavailable.
const frame=(content)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" fill="none"><defs><linearGradient id="board" x1="180" y1="160" x2="750" y2="480" gradientUnits="userSpaceOnUse"><stop stop-color="#16233c"/><stop offset="1" stop-color="#070c18"/></linearGradient><linearGradient id="signal"><stop stop-color="#75e4f6"/><stop offset="1" stop-color="#b3a1f4"/></linearGradient></defs><g transform="translate(450 295) rotate(-12) skewX(18) translate(-450 -295)"><rect x="160" y="140" width="580" height="325" rx="24" fill="url(#board)" stroke="#344966"/><path d="M160 425V452Q160 478 185 478H715Q740 478 740 452V425" fill="#060b16" stroke="#25344c"/>${content}</g></svg>`;
const block=(x,y,w=90,h=70,active=false)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${active?'#183544':'#101c31'}" stroke="${active?'#75e4f6':'#405778'}"/><path d="M${x+8} ${y+h+1}h${w-16}" stroke="#080e1c" stroke-width="8"/>`;
const trace=(d,violet=false)=>`<path d="${d}" stroke="${violet?'#b3a1f4':'#75e4f6'}" stroke-width="2" opacity=".65"/>`;
const wave=(y,noisy=false)=>trace(Array.from({length:80},(_,i)=>{const x=210+i*6;const n=Math.sin(i*.34)*20+(noisy?Math.sin(i*2.1)*9:0);return `${i?'L':'M'}${x.toFixed(1)} ${(y+n).toFixed(1)}`;}).join(' '),noisy);
const fifo=Array.from({length:8},(_,i)=>block(225+(i%4)*116,210+Math.floor(i/4)*104,80,66,i<4)).join('')+trace('M190 385V177H695V385')+'<path d="M243 196l9-17 9 17Z" fill="#75e4f6"/><path d="M277 196l9-17 9 17Z" fill="#b3a1f4"/>';
const fpga=block(240,210,104,65,true)+block(240,325,104,65,true)+block(440,250,100,100,true)+trace('M344 244H398V282H440')+trace('M344 358H398V320H440',true)+trace('M540 300H615')+Array.from({length:8},(_,i)=>`<circle cx="640" cy="${192+i*29}" r="7" fill="${i%3?'#193a4a':'#75e4f6'}" stroke="#75e4f6"/>`).join('');
const emg=wave(235,true)+wave(340)+trace('M200 293H700',true);
const lumalink=block(215,235,120,115,true)+block(575,235,120,115,true)+trace('M335 292H575')+Array.from({length:5},(_,i)=>`<circle cx="${370+i*38}" cy="292" r="4" fill="${i%2?'#b3a1f4':'#75e4f6'}"/>`).join('');
const cubex='<path d="M300 375V175H595V375M300 230H595M350 390V245M550 390V245M278 405H625" stroke="#667895" stroke-width="9" stroke-linecap="round"/>'+block(336,370,226,27)+block(425,214,55,50,true)+trace('M452 267V339');
const daq=[220,355,490,625].map((x,i)=>block(x,262,70,70,i<3)).join('')+trace('M210 228H703V356H210Z');
const verification=[218,358,498,638].map((x,i)=>block(x,250,75,92,i!==1)).join('')+trace('M293 295H358M433 295H498M573 295H638')+trace('M675 342V394H255V342',true);
const floorplan=[0,1,2,3,4,5].map(i=>block(218+(i%3)*160,194+Math.floor(i/3)*132,132,98,i===0)).join('')+trace('M196 180V313H705V427')+'<path d="M566 240l12-20 12 30 12-34 12 26 12-10 12 8" stroke="#b3a1f4" stroke-width="2"/>'+Array.from({length:8},(_,i)=>block(231+(i%4)*27,210+Math.floor(i/4)*36,18,24,i<4)).join('')+trace('M252 370H307')+block(243,353,16,32,true)+block(307,353,16,32,true)+block(397,220,24,45,true)+block(448,220,24,45,true)+'<path d="M572 411V339H651V411M572 358H651M582 413H641" stroke="#667895" stroke-width="4"/>';
fs.mkdirSync('public/art',{recursive:true});
for(const [name,content] of Object.entries({verification,floorplan,fifo,fpga,emg,lumalink,cubex,daq}))fs.writeFileSync(`public/art/${name}-fallback.svg`,frame(content));
console.log('Generated 8 original scene fallback SVGs.');
