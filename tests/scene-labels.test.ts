import test from 'node:test';
import assert from 'node:assert/strict';
import {labelLayout} from '../src/lib/scene-labels.ts';
import {scenePresentation} from '../src/lib/scene-presentation.ts';

test('long engravings wrap without squeezing or losing words',()=>{
 const text='INPUT / SYNC / REGISTERS / ARITHMETIC / LED[7:0]';
 for(const width of [.27,.9,2,3.8]){
  const layout=labelLayout(text,width);
  assert.equal(layout.text.replace(/\s+/g,' '),text);
  for(const line of layout.text.split('\n'))assert.ok(line.length*.64*layout.fontSize<=width+1e-8);
 }
 assert.equal(labelLayout('WRITE → READ / 8 × WORD',2).text.replace(/\n/g,' '),'WRITE > READ / 8 x WORD');
});
test('hardware image fallbacks use vectors and readable labels stay separate',()=>{
 for(const [scene,presentation] of Object.entries(scenePresentation)){
  if(scene!=='contact')assert.match(presentation.image,/\.svg$/);
  assert.ok(presentation.labels.every(label=>label.length<=20));
 }
});
