import {chromium} from 'playwright';
import ffmpeg from 'ffmpeg-static';
import {mkdir,writeFile,mkdtemp,rm,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {writeMellowFunk} from './mellow-funk.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.join(here,'out','social-groove-v10');
const duration=27,fps=60,totalFrames=duration*fps,preview=process.argv.includes('--preview');
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
 for(const [t,app] of [[12.5,'chrome'],[18.49,'chrome'],[18.5,'photoshop'],[20,'photoshop'],[24.49,'photoshop'],[13,'chrome']]){
   await render(t);assert.equal(await page.evaluate(()=>guidedState.app),app,'Wrong foreground at '+t);
   assert.equal(await page.locator('.qp-hex:not(.qp-hex-empty)').count(),app==='chrome'?7:9,'Wrong adaptive menu at '+t);
 }
 // The cursor and open menu must continue into the switch, not reset.
 for(const boundary of [16.5]){
   const states=[];
   for(const t of [boundary-1/60,boundary]){await render(t);states.push(await page.evaluate(()=>({x:q.cursor.x,y:q.cursor.y,opacity:q.win.style.opacity})))}
   assert.ok(Math.hypot(states[0].x-states[1].x,states[0].y-states[1].y)<.01,'Cursor jumps at '+boundary);
   assert.equal(states[1].opacity,'1','Menu flashes at '+boundary);
 }
 await render(23);
 assert.equal(await page.evaluate(()=>guidedState.tooltip),'Duplicate layer');
 assert.equal(await page.evaluate(()=>CONFIGS.photoshop.slots[6]),'duplicateLayer');
 assert.ok(await page.evaluate(()=>document.querySelector('.qp-tooltip').getBoundingClientRect().right<1020),'Duplicate layer tooltip clips');
 await render(21.5);
 assert.equal(await page.evaluate(()=>guidedState.tooltip),'Pen');
 assert.equal(await page.evaluate(()=>CONFIGS.photoshop.slots[2]),'pen');
 assert.equal(await page.locator('.persistent-footer').count(),0);
 // Exact 60 fps arrivals on beats 2 or 4, with no tooltip during travel.
 for(const [t,label] of [[13.5,'New tab'],[14.5,'Bookmark'],[15.5,'Downloads'],[20.5,'Brush'],[21.5,'Pen'],[22.5,'Duplicate layer']]){
   assert.ok([1,3].includes(Math.round(t*2)%4));
   await render(t-1/60);assert.equal(await page.evaluate(()=>guidedState.tooltip),'');
   await render(t);assert.equal(await page.evaluate(()=>guidedState.tooltip),label);
 }
 await render(24.5);
 assert.equal(await page.evaluate(()=>guidedState.section),'card','Ending must follow Photoshop directly');
 for(const t of [0,3.5,5.5,9.5,12.5,16.5,19.5,24.5,27].flatMap(t=>[t-.01,t]).filter(t=>t>=0&&t<duration)){
   await render(t);
   const layout=await page.evaluate(()=>{
     const visible=s=>getComputedStyle(document.querySelector(s)).display!=='none';
     const header=document.querySelector('.identity'),target=document.querySelector(visible('.card')?'.label':visible('.front')?'.front':'.custom');
     return {count:Number(visible('.card'))+Number(visible('.demo')),clear:header.getBoundingClientRect().bottom<target.getBoundingClientRect().top,branding:header.textContent};
   });
   assert.equal(layout.count,1);assert.ok(layout.clear);
   for(const text of ['QuickPick','quick-pick.app','Free','Open source'])assert.ok(layout.branding.includes(text));
 }
 for(const t of [1,4,8.5,10.5,13.5,15.5,18.2,18.5,20.5,21.5,23,25]){
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
 const audio=await writeMellowFunk(path.join(out,'mellow-funk.wav'),duration);
 await encode(['-i',path.join(out,'quickpick-montage-silent.mp4'),'-i',path.join(out,'mellow-funk.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',path.join(out,'quickpick-montage-ad.mp4')]);
 await encode(['-ss','1','-i',path.join(out,'quickpick-montage-ad.mp4'),'-frames:v','1',path.join(out,'poster.png')]);
 await writeFile(path.join(out,'edit-notes.json'),JSON.stringify({duration,fps,frames:totalFrames,audio,browserErrors:errors,backbeatCues:[3.5,5.5,9.5,12.5,13.5,14.5,15.5,16.5,17.5,18.5,19.5,20.5,21.5,22.5,24.5],timeline:{intro:[0,3.5],controlsCard:[3.5,5.5],controls:[5.5,9.5],combinedCard:[9.5,12.5],chromeActions:[12.5,16.5],chromeToPhotoshop:[16.5,19.5],photoshopActions:[19.5,24.5],cta:[24.5,27]}},null,2));
 console.log('Ready: '+out);
 }
}finally{await browser?.close();await rm(temp,{recursive:true,force:true})}
