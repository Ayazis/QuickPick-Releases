import {chromium} from 'playwright';
import ffmpeg from 'ffmpeg-static';
import {mkdir,writeFile,mkdtemp,rm,readFile,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const readable=process.argv.includes('--readable');
const brightness=readable||process.argv.includes('--brightness');
const branded=brightness||process.argv.includes('--branded');
const extra=brightness?1:0;
const alternating=branded||process.argv.includes('--alternating');
const switchExtra=readable?2:0,contextExtra=readable?2:0;
const switchStart=6.5+extra,switchEnd=9.5+extra+switchExtra,contextStart=11.5+extra+switchExtra,contextEnd=14.5+extra+switchExtra+contextExtra;
const duration=alternating?17+extra+switchExtra+contextExtra:12.5,totalFrames=duration*60;
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.join(here,'out',readable?'social-readable-v6':brightness?'social-brightness-v5':branded?'social-branded-v4':alternating?'social-alternating-v3':'social-montage-v2');
await mkdir(out,{recursive:true});const temp=await mkdtemp(path.join(out,'.render-'));
const encode=args=>new Promise((resolve,reject)=>{const c=spawn(process.env.FFMPEG_PATH||ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit',windowsHide:true});c.on('error',reject);c.on('exit',code=>code===0?resolve():reject(new Error('FFmpeg: '+code)))});
// Cut complete action beats from the synchronized 60 fps masters. No retiming.
const cuts=readable?
 [{id:'controls',source:'controls',start:1.2,frames:240},{id:'switch',source:'switching',folder:'readable',start:7.5,frames:300},{id:'browser',source:'context',folder:'readable',start:1.1,frames:120},{id:'editor',source:'context',folder:'readable',start:4.5,frames:180}]:alternating?
 [{id:'controls',source:'controls',start:1.2,frames:180+extra*60},{id:'switch',source:'switching',start:5,frames:180},{id:'browser',source:'context',start:.7,frames:72},{id:'editor',source:'context',start:2.8,frames:108}]:
 [{id:'intro',source:'controls',start:1,frames:90},{id:'controls',source:'controls',start:2.2,frames:150},{id:'switch',source:'switching',start:5,frames:180},{id:'browser',source:'context',start:.7,frames:72},{id:'editor',source:'context',start:2.8,frames:108}];
let browser;
try{
 for(const cut of cuts){
  await mkdir(path.join(temp,cut.id));
  await encode(['-ss',String(cut.start),'-i',path.join(here,'out',cut.folder||'snappy',cut.source+'-portrait.mp4'),'-vf','crop=900:877:90:720','-frames:v',String(cut.frames),'-q:v','2','-start_number','0',path.join(temp,cut.id,'%04d.jpg')]);
  assert.equal((await readdir(path.join(temp,cut.id))).length,cut.frames,'Missing source frames: '+cut.id);
 }
 const sequence=cuts.flatMap(c=>Array.from({length:c.frames},(_,i)=>pathToFileURL(path.join(temp,c.id,String(i).padStart(4,'0')+'.jpg')).href));
 await mkdir(path.join(temp,'frames'));
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome'});
 const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(here,branded?'social-branded.html':alternating?'social-alternating.html':'social-montage.html')).href);await page.evaluate(()=>document.fonts.ready);
 if(branded)await page.evaluate(()=>document.querySelector('.identity img').decode());
 if(brightness)await page.evaluate(()=>{window.controlsExtra=1});
 if(readable)await page.evaluate(()=>{window.switchExtra=2;window.contextExtra=2});
 if(!alternating)for(const t of [.5,2.5,5.5,8.5]){
   await page.evaluate(({t,src})=>renderMontage(t,src),{t,src:sequence[Math.floor(t*60)]});
   assert.ok(await page.evaluate(()=>document.querySelector('.head').getBoundingClientRect().bottom<document.querySelector('.visual').getBoundingClientRect().top),'Headline overlaps demo at '+t);
 }
 if(alternating)for(const t of [0,2,5+extra,switchStart,switchEnd,contextStart,contextEnd,duration].flatMap(t=>[t-.01,t]).filter(t=>t>=0&&t<duration)){
   await page.evaluate(({t,src})=>renderAlternating(t,src),{t,src:sequence[0]});
   const visible=await page.evaluate(()=>[...document.querySelectorAll('.card,.demo')].map(el=>getComputedStyle(el).display!=='none'));
   assert.equal(visible.filter(Boolean).length,1,'Text and animation overlap at '+t);
   if(branded){
     const branding=await page.evaluate(()=>{
       const header=document.querySelector('.identity'),image=header.querySelector('img');
       const target=document.querySelector(getComputedStyle(document.querySelector('.card')).display==='none'?'.front':'.label');
       return {text:header.textContent,logo:image.complete&&image.naturalWidth>0,clear:header.getBoundingClientRect().bottom<target.getBoundingClientRect().top,background:getComputedStyle(document.body).backgroundImage};
     });
     assert.ok(branding.logo&&branding.clear,'Branding missing or overlaps content at '+t);
     for(const label of ['QuickPick','quick-pick.app','Free','Open source'])assert.ok(branding.text.includes(label));
     assert.ok(branding.background.includes('radial-gradient'));
   }
 }
 for(let frame=0;frame<totalFrames;frame++){
  const t=frame/60;
  let sourceIndex=Math.min(frame,599);
  if(alternating){
    sourceIndex=frame>=contextStart*60&&frame<contextEnd*60?frame-contextStart*60+cuts[0].frames+cuts[1].frames:frame>=switchStart*60&&frame<switchEnd*60?frame-switchStart*60+cuts[0].frames:frame>=120&&frame<(5+extra)*60?frame-120:0;
  }
  await page.evaluate(({t,src,alternating})=>(alternating?renderAlternating:renderMontage)(t,src),{t,src:sequence[sourceIndex],alternating});
  await page.screenshot({path:path.join(temp,'frames',String(frame).padStart(4,'0')+'.jpg'),type:'jpeg',quality:94});
  if((readable?[30,318,540,690,810,930,1110,1230]:brightness?[30,180,288,318,348,390,510,660,810,990]:alternating?[30,180,330,450,600,750,930]:[30,150,330,480,540,660]).includes(frame))await page.screenshot({path:path.join(out,`scene-${frame/60}s.png`)});
  if(frame%240===0)console.log(`Rendered ${frame}/${totalFrames}`);
 }
 assert.deepEqual(errors,[]);
 await encode(['-framerate','60','-i',path.join(temp,'frames','%04d.jpg'),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'quickpick-montage-silent.mp4')]);
 // Original 120 BPM electronic bed; accents land on the editorial cuts.
 const rate=48000,n=duration*rate,pcm=Buffer.alloc(n*2),accents=alternating?[2,switchStart,contextStart,contextEnd]:[0,1.5,4,7,8.2,10];let seed=42;
 for(let i=0;i<n;i++){
  const t=i/rate,beat=t%.5,off=t%.25;
  const kick=.16*Math.exp(-beat*25)*Math.sin(2*Math.PI*(48*beat+1.8*(1-Math.exp(-beat*35))));
  seed=(1664525*seed+1013904223)>>>0;const noise=(seed/4294967296)*2-1;
  const hat=.025*noise*Math.exp(-off*120);
  const note=[110,110,130.81,146.83][Math.floor(t/.5)%4];
  const bass=.045*Math.sin(2*Math.PI*note*t)*Math.exp(-beat*9);
  let accent=0;for(const hit of accents){const d=t-hit;if(d>=0&&d<.16)accent+=.055*Math.sin(2*Math.PI*(780*d-1100*d*d))*Math.exp(-d*22)}
  const fade=Math.min(1,t/.015,(duration-t)/.28),sample=(kick+hat+bass+accent)*fade*(alternating?.65:1);
  pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample))*32767),i*2);
 }
 const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
 await writeFile(path.join(temp,'audio.wav'),Buffer.concat([header,pcm]));
 await encode(['-i',path.join(out,'quickpick-montage-silent.mp4'),'-i',path.join(temp,'audio.wav'),'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',path.join(out,'quickpick-montage-ad.mp4')]);
 await encode(['-ss','0.5','-i',path.join(out,'quickpick-montage-ad.mp4'),'-frames:v','1',path.join(out,'poster.png')]);
 await writeFile(path.join(out,'edit-notes.json'),JSON.stringify({duration,fps:60,frames:totalFrames,alternating,branded,brightness,readable,cuts,browserErrors:errors},null,2));
 console.log('Ready: '+out);
}finally{await browser?.close();await rm(temp,{recursive:true,force:true});}
