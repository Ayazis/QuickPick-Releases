import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import ffmpeg from 'ffmpeg-static';
import './beat-grid.js';
const grid=globalThis.QP_BEAT_GRID,dir=path.join(path.dirname(fileURLToPath(import.meta.url)),'out','social-natural-v12');
for(const file of ['quickpick-montage-ad.mp4','quickpick-montage-silent.mp4']){
 const result=spawnSync(ffmpeg,['-hide_banner','-i',path.join(dir,file),'-vf','showinfo','-f','null','-'],{encoding:'utf8',maxBuffer:8000000,windowsHide:true});
 assert.equal(result.status,0,result.stderr.slice(-1000));
 const pts=[...result.stderr.matchAll(/\bn:\s*\d+\s+pts:\s*(\d+)\s+pts_time:/g)].map(m=>Number(m[1]));
 assert.equal(pts.length,grid.durationFrames);assert.ok(pts.slice(1).every((x,i)=>x-pts[i]===256));
 assert.ok(result.stderr.includes('1080x1920'));assert.ok(result.stderr.includes('60 fps'));
 console.log(file+': '+pts.length+' decoded frames; constant 60 fps.');
}
// Compare decoded AAC against the original PCM, so encoder delay cannot move
// the audible backbeats away from the verified output frames.
const original=await readFile(path.join(dir,'mellow-funk.wav'));
const decoded=spawnSync(ffmpeg,['-v','error','-i',path.join(dir,'quickpick-montage-ad.mp4'),'-vn','-f','s16le','-ar','48000','-ac','2','-'],{maxBuffer:16000000,windowsHide:true});
assert.equal(decoded.status,0);
let best={lag:0,correlation:-1};
for(let lag=-800;lag<=800;lag++){
 let ab=0,aa=0,bb=0;
 for(let sample=19200;sample<115200;sample+=16){
  const a=original.readInt16LE(44+sample*4),b=decoded.stdout.readInt16LE((sample+lag)*4);ab+=a*b;aa+=a*a;bb+=b*b;
 }
 const correlation=ab/Math.sqrt(aa*bb);if(correlation>best.correlation)best={lag,correlation};
}
assert.ok(best.correlation>.9);assert.ok(Math.abs(best.lag)<=48,'Audio shifted by more than 1 ms');
const report={frames:grid.durationFrames,fps:grid.fps,decodedAudioOffsetSamples:best.lag,decodedAudioOffsetMs:best.lag/48,correlation:best.correlation};
await writeFile(path.join(dir,'encoded-verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
