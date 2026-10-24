import {chromium} from 'playwright';
import ffmpeg from 'ffmpeg-static';
import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {writeMellowFunk} from './mellow-funk.mjs';
import {verifyBeatStory} from './verify-beat-story.mjs';
import './beat-grid.js';
const grid=globalThis.QP_BEAT_GRID,{fps,durationFrames:totalFrames}=grid,duration=totalFrames/fps;
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.join(here,'out','social-natural-v12'),preview=process.argv.includes('--preview');
await mkdir(out,{recursive:true});const temp=await mkdtemp(path.join(out,'.render-'));
const encode=args=>new Promise((resolve,reject)=>{const c=spawn(process.env.FFMPEG_PATH||ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit',windowsHide:true});c.on('error',reject);c.on('exit',code=>code===0?resolve():reject(new Error('FFmpeg: '+code)))});
let browser;
try{
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome'});
 const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(here,'social-guided.html')).href);
 await page.evaluate(async()=>{await document.fonts.ready;await document.querySelector('.identity img').decode()});
 const render=frame=>page.evaluate(frame=>renderGuidedFrame(frame),frame);
 const verified=await verifyBeatStory(page);
 const audio=await writeMellowFunk(path.join(out,'mellow-funk.wav'),duration);
 for(const cue of verified)assert.ok(audio.measuredBackbeats.some(hit=>hit.frame===cue.frame&&hit.sample===cue.sample),'Sound and visual frame differ: '+cue.name);
 await writeFile(path.join(out,'beat-frame-map.json'),JSON.stringify({frameNumbering:'zero-based',fps,bpm:grid.bpm,samplesPerFrame:800,verified,audioBackbeats:audio.measuredBackbeats},null,2));
 for(const frame of [60,240,330,390,402,450,462,510,522,630,810,930,990,1050,1110,1170,1230,1290,1470]){
  await render(frame);await page.screenshot({path:path.join(out,`scene-frame-${frame}.png`)});
 }
 assert.deepEqual(errors,[]);
 if(preview){console.log('Preview ready: '+out)}else{
  await mkdir(path.join(temp,'frames'));
  for(let frame=0;frame<totalFrames;frame++){
   await render(frame);
   await page.screenshot({path:path.join(temp,'frames',String(frame).padStart(4,'0')+'.jpg'),type:'jpeg',quality:94});
   if(frame%240===0)console.log(`Rendered ${frame}/${totalFrames}`);
  }
  assert.deepEqual(errors,[]);
  await encode(['-framerate',String(fps),'-i',path.join(temp,'frames','%04d.jpg'),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'quickpick-montage-silent.mp4')]);
  await encode(['-i',path.join(out,'quickpick-montage-silent.mp4'),'-i',path.join(out,'mellow-funk.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',path.join(out,'quickpick-montage-ad.mp4')]);
  await encode(['-ss','1','-i',path.join(out,'quickpick-montage-ad.mp4'),'-frames:v','1',path.join(out,'poster.png')]);
  await writeFile(path.join(out,'edit-notes.json'),JSON.stringify({duration,fps,frames:totalFrames,audio,browserErrors:errors,verifiedCues:verified,timeline:{intro:[0,3.5],controlsCard:[3.5,5.5],controls:[5.5,9.5],combinedCard:[9.5,12.5],chromeActions:[12.5,16.5],chromeToPhotoshop:[16.5,18.5],photoshopActions:[18.5,23.5],cta:[23.5,26]}},null,2));
  console.log('Ready: '+out);
 }
}finally{await browser?.close();await rm(temp,{recursive:true,force:true})}
