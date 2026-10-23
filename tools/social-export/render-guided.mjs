import {chromium} from 'playwright';
import ffmpeg from 'ffmpeg-static';
import {mkdir,writeFile,mkdtemp,rm,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.join(here,'out','social-guided-v7');
const duration=35,fps=60,totalFrames=duration*fps,preview=process.argv.includes('--preview');
await mkdir(out,{recursive:true});const temp=await mkdtemp(path.join(out,'.render-'));
const encode=args=>new Promise((resolve,reject)=>{const c=spawn(process.env.FFMPEG_PATH||ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit',windowsHide:true});c.on('error',reject);c.on('exit',code=>code===0?resolve():reject(new Error('FFmpeg: '+code)))});
let browser;
try{
 await mkdir(path.join(temp,'controls'));
 await encode(['-ss','1.2','-i',path.join(here,'out/snappy/controls-portrait.mp4'),'-vf','crop=900:877:90:720','-frames:v','240','-q:v','2','-start_number','0',path.join(temp,'controls','%04d.jpg')]);
 assert.equal((await readdir(path.join(temp,'controls'))).length,240);
 const controlSrc=i=>pathToFileURL(path.join(temp,'controls',String(i).padStart(4,'0')+'.jpg')).href;
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome'});
 const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(here,'social-guided.html')).href);
 await page.evaluate(async()=>{await document.fonts.ready;await document.querySelector('.identity img').decode()});
 const render=t=>page.evaluate(({t,src})=>renderGuided(t,src),{t,src:controlSrc(t>=5.5&&t<9.5?Math.floor((t-5.5)*60+1e-6):0)});
 // Verify narrative outcomes and adjacent boundaries, including reverse seeks.
 for(const [t,app] of [[11,'chrome'],[13.3,'photoshop'],[16.8,'chrome'],[24.4,'chrome'],[27.3,'photoshop'],[31,'photoshop'],[21,'chrome']]){
   await render(t);assert.equal(await page.evaluate(()=>guidedState.app),app,'Wrong foreground at '+t);
 }
 for(const t of [0,3.5,5.5,9.5,11,18,20.5,24.5,27.5,32.5,35].flatMap(t=>[t-.01,t]).filter(t=>t>=0&&t<duration)){
   await render(t);
   const layout=await page.evaluate(()=>{
     const visible=s=>getComputedStyle(document.querySelector(s)).display!=='none';
     const header=document.querySelector('.identity'),target=document.querySelector(visible('.card')?'.label':visible('.front')?'.front':'.custom');
     return {count:Number(visible('.card'))+Number(visible('.demo')),clear:header.getBoundingClientRect().bottom<target.getBoundingClientRect().top,branding:header.textContent};
   });
   assert.equal(layout.count,1);assert.ok(layout.clear);
   for(const text of ['QuickPick','quick-pick.app','Free','Open source'])assert.ok(layout.branding.includes(text));
 }
 for(const t of [1,4,8.5,12.8,14,16.3,17.5,19,21.5,23.8,26.3,28.5,30,31.8,33.5]){
   await render(t);await page.screenshot({path:path.join(out,`scene-${t}s.png`)});
 }
 assert.deepEqual(errors,[]);
 if(preview){console.log('Preview ready: '+out)}else{
 await mkdir(path.join(temp,'frames'));
 for(let frame=0;frame<totalFrames;frame++){
   await render(frame/fps);
   await page.screenshot({path:path.join(temp,'frames',String(frame).padStart(4,'0')+'.jpg'),type:'jpeg',quality:94});
   if(frame%240===0)console.log(`Rendered ${frame}/${totalFrames}`);
 }
 assert.deepEqual(errors,[]);
 await encode(['-framerate',String(fps),'-i',path.join(temp,'frames','%04d.jpg'),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'quickpick-montage-silent.mp4')]);
 // Same original synthesized musical bed as v6, with accents on the new cuts.
 const rate=48000,n=duration*rate,pcm=Buffer.alloc(n*2),accents=[5.5,11,20.5,27.5,32.5];let seed=42;
 for(let i=0;i<n;i++){
   const t=i/rate,beat=t%.5,off=t%.25;
   const kick=.16*Math.exp(-beat*25)*Math.sin(2*Math.PI*(48*beat+1.8*(1-Math.exp(-beat*35))));
   seed=(1664525*seed+1013904223)>>>0;
   const hat=.025*((seed/4294967296)*2-1)*Math.exp(-off*120);
   const note=[110,110,130.81,146.83][Math.floor(t/.5)%4],bass=.045*Math.sin(2*Math.PI*note*t)*Math.exp(-beat*9);
   let accent=0;for(const hit of accents){const d=t-hit;if(d>=0&&d<.16)accent+=.055*Math.sin(2*Math.PI*(780*d-1100*d*d))*Math.exp(-d*22)}
   const sample=(kick+hat+bass+accent)*Math.min(1,t/.015,(duration-t)/.28)*.65;
   pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),i*2);
 }
 const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
 await writeFile(path.join(temp,'audio.wav'),Buffer.concat([header,pcm]));
 await encode(['-i',path.join(out,'quickpick-montage-silent.mp4'),'-i',path.join(temp,'audio.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',path.join(out,'quickpick-montage-ad.mp4')]);
 await encode(['-ss','1','-i',path.join(out,'quickpick-montage-ad.mp4'),'-frames:v','1',path.join(out,'poster.png')]);
 await writeFile(path.join(out,'edit-notes.json'),JSON.stringify({duration,fps,frames:totalFrames,browserErrors:errors,timeline:{intro:[0,3.5],controlsCard:[3.5,5.5],controls:[5.5,9.5],switchCard:[9.5,11],twoSwitches:[11,18],contextCard:[18,20.5],chromeActions:[20.5,24.5],chromeToPhotoshop:[24.5,27.5],photoshopActions:[27.5,32.5],cta:[32.5,35]}},null,2));
 console.log('Ready: '+out);
 }
}finally{await browser?.close();await rm(temp,{recursive:true,force:true})}
