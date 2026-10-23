import {chromium} from 'playwright';
import ffmpeg from 'ffmpeg-static';
import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(here,'out','social-volume-v1');
await mkdir(out,{recursive:true});
const scratch=await mkdtemp(path.join(out,'.frames-'));
const fps=60,duration=18;
const encode=args=>new Promise((resolve,reject)=>{
 const child=spawn(process.env.FFMPEG_PATH||ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit',windowsHide:true});
 child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('FFmpeg exit '+code)));
});
let browser;
try{
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome'});
 const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(here,'social-volume.html')).href+'?export');
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>typeof renderAd==='function');
 // Seek forwards and backwards: verify cursor/gauge share the same timeline.
 const states=[];
 for(const time of [6.5,6.9,7.3,11,6.9]){
   states.push(await page.evaluate(t=>{renderAd(t);return adState},time));
 }
 assert.equal(states[0].volume,82);assert.equal(states[2].volume,28);
 assert.deepEqual(states[1],states[4]);
 assert.ok(Math.abs(states[2].cursorY-states[0].cursorY-26)<.001);
 for(let frame=0;frame<duration*fps;frame++){
   await page.evaluate(t=>renderAd(t),frame/fps);
   await page.screenshot({path:path.join(scratch,String(frame).padStart(5,'0')+'.jpg'),type:'jpeg',quality:94});
   if([0,300,420,660,960].includes(frame))await page.screenshot({path:path.join(out,`scene-${frame/fps}s.png`)});
   if(frame%300===0)console.log(`Rendered ${frame}/${duration*fps} frames`);
 }
 assert.deepEqual(errors,[]);
 await encode(['-framerate',String(fps),'-i',path.join(scratch,'%05d.jpg'),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'quickpick-volume-silent.mp4')]);
 // Original, quiet synthesized audio. The bed follows the demonstrated volume
 // reduction; soft UI accents reinforce the shortcut and action. No stock music.
 const rate=48000,n=duration*rate,pcm=Buffer.alloc(n*2);
 for(let i=0;i<n;i++){
   const t=i/rate,p=Math.max(0,Math.min(1,(t-6.5)/.8)),e=p*p*(3-2*p);
   const loudness=(1-.68*e)*.045;
   const beat=t%.5,env=Math.exp(-beat*8);
   const note=[220,277.1826,329.6276,440][Math.floor(t/.5)%4];
   let sample=loudness*env*(Math.sin(2*Math.PI*note*t)+.3*Math.sin(2*Math.PI*note*2*t));
   for(const click of [3.15,6.25,14.95]){
     const d=t-click;if(d>=0&&d<.12)sample+=.08*Math.exp(-d*55)*Math.sin(2*Math.PI*880*d);
   }
   const fade=Math.min(1,t/.15,(duration-t)/.5);
   pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample*fade))*32767),i*2);
 }
 const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
 await writeFile(path.join(scratch,'sound.wav'),Buffer.concat([header,pcm]));
 await encode(['-i',path.join(out,'quickpick-volume-silent.mp4'),'-i',path.join(scratch,'sound.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',path.join(out,'quickpick-volume-ad.mp4')]);
 await encode(['-ss','5','-i',path.join(out,'quickpick-volume-ad.mp4'),'-frames:v','1',path.join(out,'poster.png')]);
 await writeFile(path.join(out,'validation.json'),JSON.stringify({duration,fps,frames:duration*fps,width:1080,height:1920,browserErrors:errors,synchronizationSamples:states},null,2));
 console.log('Ready: '+out);
}finally{await browser?.close();await rm(scratch,{recursive:true,force:true});}
