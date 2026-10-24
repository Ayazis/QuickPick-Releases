import assert from 'node:assert/strict';
import './beat-grid.js';
export async function verifyBeatStory(page){
 const {cues}=globalThis.QP_BEAT_GRID,report=[];
 const capture=async frame=>{
  await page.evaluate(frame=>renderGuidedFrame(frame),frame);
  return page.evaluate(()=>{
   const visible=el=>getComputedStyle(el).display!=='none';
   const action=visible(document.querySelector('.demo'));
   return {...guidedState,menuVisible:action&&Number(q.win.style.opacity)===1,
    previewVisible:action&&thumb.el.classList.contains('shown'),
    ripple:Number(ripple.style.opacity),tip:visible(tip)?tip.textContent:'',
    hover:[...q.win.querySelectorAll('.qp-hex')].findIndex(el=>el.classList.contains('hover')),
    card:visible(document.querySelector('.card'))?document.querySelector('.label').textContent:'',
    cursor:{x:q.cursor.x,y:q.cursor.y},
    tooltipRight:visible(tip)?tip.getBoundingClientRect().right:0,
    headerClear:document.querySelector('.identity').getBoundingClientRect().bottom<document.querySelector(action?'.custom':'.label').getBoundingClientRect().top,
    logo:document.querySelector('.identity img').naturalWidth>0};
  });
 };
 const labels=['New tab','Bookmark','Downloads','Brush','Pen','Duplicate layer'];
 for(const cue of cues){
  assert.ok([2,4].includes(cue.beat));
  const before=await capture(cue.frame-1),hit=await capture(cue.frame),after=await capture(cue.frame+1);
  assert.ok(hit.headerClear&&hit.logo);assert.ok(hit.tooltipRight<1020);
  if(cue.name.endsWith('-menu')){assert.equal(before.menuVisible,false,cue.name+' early');assert.equal(hit.menuVisible,true,cue.name+' late')}
  if(cue.name.endsWith('-card')){assert.notEqual(before.card,hit.card);assert.ok(hit.card)}
  if(cue.name.endsWith('-click')){assert.equal(before.ripple,0);assert.equal(hit.ripple,1);assert.ok(after.ripple<1&&after.ripple>0)}
  if(cue.name==='photoshop-click'){assert.equal(before.app,'chrome');assert.equal(hit.app,'photoshop');assert.equal(hit.menuVisible,false);assert.equal(hit.previewVisible,false)}
  if(cue.name==='photoshop-preview'){assert.equal(before.previewVisible,false);assert.equal(hit.previewVisible,true);assert.ok(Math.hypot(hit.cursor.x-before.cursor.x,hit.cursor.y-before.cursor.y)<1)}
  if(cue.name==='brightness-restore'){assert.equal(before.brightness,.35);assert.equal(hit.brightness,.35);assert.ok(after.brightness>.35)}
  if(labels.includes(cue.name)){assert.equal(before.tip,'');assert.equal(hit.tip,cue.name);assert.ok(hit.hover>=0);assert.equal(after.tip,cue.name)}
  report.push({...cue,verifiedFrames:[cue.frame-1,cue.frame,cue.frame+1]});
 }
 // Check the real shared SVG gauge and cursor, rather than just storyboard state.
 for(const frame of [390,402,414,450,462,474,510,522,534]){
  await capture(frame);
  const actual=await page.evaluate(()=>{
   const i=guidedState.frame<450?5:6,el=hexes[i],p=q.hex.center(i),stops=el.querySelectorAll('linearGradient[id="'+el.dataset.gv+'"] stop');
   return {pct:100-parseFloat(stops[0].getAttribute('offset')),dy:q.cursor.y-p.y,brightness:guidedState.brightness};
  });
  if(frame<450)assert.ok(Math.abs(actual.dy+(actual.pct-40)/38*26)<.001);
  else {assert.ok(Math.abs(actual.pct-actual.brightness*100)<.001);assert.ok(Math.abs(actual.dy-(1-actual.brightness)/.65*26)<.001)}
 }
 // Scan every visible movement for discontinuities at segment handoffs.
 const motion=await page.evaluate(async()=>{
  let peak=0,peakFrame=0;
  for(const [start,end] of [[330,570],[750,1410]]){
   let previous;
   for(let f=start;f<end;f++){
    await renderGuidedFrame(f);const p={x:q.cursor.x,y:q.cursor.y};
    if(previous){const step=Math.hypot(p.x-previous.x,p.y-previous.y);if(step>peak){peak=step;peakFrame=f}}
    previous=p;
   }
  }
  return {peak,peakFrame};
 });
 assert.ok(motion.peak<7,'Cursor discontinuity: '+JSON.stringify(motion));
 assert.equal(await page.locator('.persistent-footer').count(),0);
 await capture(1410);assert.equal(await page.evaluate(()=>guidedState.section),'card');
 return report;
}
