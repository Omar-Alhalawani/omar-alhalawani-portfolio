// Physical engravings must fit their surface without stretching the glyphs.
export function labelLayout(text:string,width:number){
 const clean=text.replace(/→/g,' > ').replace(/×/g,'x').replace(/[–—]/g,'-');
 const words=clean.split(/\s+/),lines:string[]=[];let line='';
 for(const word of words){if(line&&line.length+word.length+1>20){lines.push(line);line=word;}else line+=`${line?' ':''}${word}`;}
 if(line)lines.push(line);
 const longest=Math.max(1,...lines.map(part=>part.length));
 return {text:lines.join('\n'),fontSize:Math.min(width*.18,width/(longest*.64))};
}
