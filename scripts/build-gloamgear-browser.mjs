import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
const root=resolve('gloamgear');await mkdir(resolve(root,'assets'),{recursive:true});
let html=await readFile(resolve(root,'index.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];if(!source)throw Error('Game script is missing');new vm.Script(source);
function completeImage(bytes){
 if(bytes.length<32)return false;
 if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return bytes.readUInt32LE(4)+8<=bytes.length;
 if(bytes.toString('hex',0,8)==='89504e470d0a1a0a')return bytes.subarray(-12).includes(Buffer.from('IEND'));
 if(bytes[0]===255&&bytes[1]===216)return bytes.at(-2)===255&&bytes.at(-1)===217;
 return false;
}
function fallback(kind){
 const hero=kind==='mara',boss=kind==='boss',color=hero?'#8b3440':boss?'#553949':'#34534e';
 const body=hero?'<path d="M74 104 57 211 111 191 159 209 143 106Z" fill="'+color+'" stroke="#c29b64" stroke-width="3"/><path d="m87 182-8 62h18l17-64 12 64h19l-8-66" fill="#20242b"/><path d="m135 119 34 20 38-25 7 9-43 35-40-18" fill="'+color+'" stroke="#bea277" stroke-width="3"/><path d="m195 119 24-73 10 3-22 76Z" fill="#d6bc7b"/><ellipse cx="112" cy="77" rx="24" ry="29" fill="#ddbc91"/><path d="m83 73 11-26h34l15 29-18-11-32 23" fill="#332d35"/><path d="M71 53h79v9H71zm17-24h43l8 25H82Z" fill="#293f3b" stroke="#b58d55" stroke-width="3"/><path d="m92 103 20 20 22-21-7 49-21 1Z" fill="#d3b271"/>':'<path d="m58 105-32 78 29-10-8 56 63-30 58 31-10-57 30 10-31-78Z" fill="'+color+'" stroke="#aa986c" stroke-width="3"/><path d="m75 192-7 51h23l20-39 22 39h24l-7-51" fill="#242933"/><ellipse cx="111" cy="78" rx="32" ry="38" fill="#babb9a" stroke="#776440" stroke-width="6"/><path d="m83 76 21 9-17 12m51-21-22 9 17 12" fill="#e7c66c" stroke="#e7c66c" stroke-width="4"/><path d="m103 101 8-10 8 10m-21 15h27" stroke="#394b48" stroke-width="5"/>'+(boss?'<path d="m70 42-11-31 28 18 22-28 23 28 30-18-11 34Z" fill="#977147" stroke="#e4c982" stroke-width="3"/>':'<circle cx="111" cy="79" r="49" fill="none" stroke="#997f4e" stroke-width="8"/><path d="M111 21v15m0 86v16M53 79h15m86 0h15" stroke="#cfb379" stroke-width="9"/>');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 270"><ellipse cx="111" cy="250" rx="79" ry="12" fill="#07090c" opacity=".55"/>'+body+'</svg>';
}
const choices={mara:['mara_combat','mara2'],hound:['hound','hound2'],boss:['boss','boss2']},art={},provenance={};
for(const kind of Object.keys(choices)){
 let selected=null;
 for(const filename of choices[kind]){
  try{const raw=await readFile('assets/runtime/'+filename+'.b64','utf8');const bytes=Buffer.from(raw.replace(/^data:[^,]+,/,'').replace(/\s/g,''),'base64');if(completeImage(bytes)){selected={bytes,filename};break;}}catch{}
 }
 if(selected){
  const b=selected.bytes,ext=b.toString('ascii',0,4)==='RIFF'?'webp':b[0]===137?'png':'jpg';art[kind]='assets/'+kind+'.'+ext;await writeFile(resolve(root,art[kind]),b);provenance[kind]='assets/runtime/'+selected.filename+'.b64';
 }else{
  art[kind]='assets/'+kind+'.svg';await writeFile(resolve(root,art[kind]),fallback(kind));provenance[kind]='Procedural SVG fallback; supplied encoded images were absent or incomplete. Not canonical final art.';
 }
}
html=html.replace(/const ART=\{[^;]+\};/,'const ART='+JSON.stringify(art)+';');new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
// The supplied atlas files are truncated. Generate independent, lightweight scenery
// instead of shipping broken textures or presenting concept-sheet crops as final art.
const palettes=[['#151c24','#926144','#e29a49'],['#181b34','#705449','#daaa65'],['#142c2b','#45574b','#9bb888'],['#29273b','#7d7272','#e1c5a3'],['#151f36','#424b6e','#8ec5e0'],['#171c3a','#5a527b','#b5a5dc'],['#29151f','#783c36','#e48c49'],['#163139','#4f7476','#a2d3cc'],['#1f2924','#66533e','#b1ae74'],['#1b2128','#5c5d60','#c4b78e'],['#283543','#777b91','#e0d4b1'],['#171e38','#4f536f','#a9abd6'],['#2b1724','#78404b','#d29872'],['#171d29','#45495b','#b1a181'],['#141326','#45405e','#bba1cc']];
for(let i=0;i<15;i++){
 const [sky,stone,glow]=palettes[i];
 const buildings=Array.from({length:12},(_,j)=>{const x=j*110-30,h=100+((j*67+i*43)%230),y=540-h;return `<g><path d="M${x} 560V${y}h86v${560-y}Z" fill="${stone}"/><path d="m${x-5} ${y} 48-28 48 28" fill="#151722"/><path d="M${x+14} ${y+25}h16v25h-16zm35 0h16v25h-16zM${x+14} ${y+75}h16v25h-16zm35 0h16v25h-16z" fill="${glow}" opacity=".5"/></g>`;}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${stone}"/></linearGradient><radialGradient id="halo"><stop stop-color="${glow}" stop-opacity=".35"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient><linearGradient id="floor" x2="0" y2="1"><stop stop-color="#322b30"/><stop offset="1" stop-color="#070b12"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h1280v720H0z"/><circle cx="850" cy="160" r="220" fill="url(#halo)"/><circle cx="850" cy="160" r="50" fill="${glow}" opacity=".35"/><g opacity=".4">${buildings}</g><path d="M0 535q300-40 640 0t640 0v185H0Z" fill="url(#floor)"/><g fill="none" stroke="${glow}" opacity=".15"><path d="M0 590h1280M0 630h1280M0 685h1280M640 540 150 720m490-180 490 180M640 540 420 720m220-180 220 180"/></g><g fill="#0a1018"><path d="M70 580V165h14v415zm0-415h150v11H70zm131 0v50h-7v-50zM1180 580V220h14v360zm0-360h-130v10h130zm-115 0v50h7v-50z"/></g><g fill="${glow}" opacity=".8"><path d="M184 208h28l8 45h-44zm865 54h28l8 45h-44z"/></g><g fill="none" stroke="${glow}" opacity=".2" stroke-width="5"><circle cx="380" cy="390" r="85"/><circle cx="380" cy="390" r="60"/><path d="M380 300v180m-90-90h180"/></g></svg>`;
 await writeFile(resolve(root,'assets/world-'+(i+1)+'.svg'),svg);
}
provenance.backgrounds='15 procedural SVG scenes. Provisional, not canonical final art; supplied atlases are truncated.';
await writeFile(resolve(root,'index.html'),html);
await writeFile(resolve(root,'asset-provenance.json'),JSON.stringify({art,provenance,canonical:false},null,2));
console.log('Prepared browser release:',JSON.stringify({art,provenance}));
