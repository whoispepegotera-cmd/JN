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
for(const atlas of ['sprites','worlds']){
 const bytes=await readFile('assets/'+atlas+'.webp');if(!completeImage(bytes))throw Error('Incomplete supplied atlas: '+atlas);
}
await writeFile(resolve(root,'index.html'),html);
await writeFile(resolve(root,'asset-provenance.json'),JSON.stringify({art,provenance,canonical:false},null,2));
console.log('Prepared browser release:',JSON.stringify({art,provenance}));
