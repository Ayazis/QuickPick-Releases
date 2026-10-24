// Events hit exact frames; cursor travel starts freely between beats.
const {qp:q,icons,CONFIGS,winChrome,winPhotoshop}=buildSocialScene();
const thumb=QpThumbnail.build(q.stage),tip=document.createElement('div');
tip.className='qp-tooltip';q.stage.append(tip);
const hexes=[...q.win.querySelectorAll('.qp-hex')],cursor=q.stage.querySelector('.qp-cursor'),ripple=cursor.querySelector('.qp-ripple');
const home={x:385,y:355},clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,x)=>({x:a.x+(b.x-a.x)*ease(x),y:a.y+(b.y-a.y)*ease(x)});
const travelFrames=(a,b)=>Math.min(48,Math.max(24,Math.round(24+Math.hypot(b.x-a.x,b.y-a.y)*.15)));
const arrive=(a,b,frame,hit)=>mix(a,b,(frame-hit+travelFrames(a,b))/travelFrames(a,b));
CONFIGS.controls={slots:{0:'tools',1:'minimize',2:'forward',3:'play',4:'backward',5:'volume',6:'adjust'}};
let activeConfig='';
function activate(name){
 winChrome.classList.toggle('active',name==='chrome');winPhotoshop.classList.toggle('active',name==='photoshop');
 if(activeConfig!==name){hexes.forEach((el,i)=>{const icon=CONFIGS[name].slots[i];el.classList.toggle('qp-hex-empty',!icon);q.hex.setIcon(i,icon||'')});activeConfig=name}
}
function point(p){q.cursor.place(p.x,p.y)}
function menu(age=6){
 q.window.show(380,335);q.win.style.opacity='1';
 // Visible on the hit, then a subtle six-frame settle. No fade-in delay.
 q.win.style.transform=`scale(${1+.035*(1-clamp(age/6))})`;
}
function click(age){const p=clamp(age/9);ripple.style.opacity=age>=0&&age<9?String(1-p):'0';ripple.style.transform=`scale(${.3+p*.85})`}
function tooltip(label,p){tip.textContent=label;tip.style.display='block';tip.style.left=(p.x+24)+'px';tip.style.top=(p.y-8)+'px'}
function actionScene(frame,name,start){
 activate(name);menu(frame-start);
 const slots=name==='chrome'?[1,2,3]:[1,2,6],labels=name==='chrome'?['New tab','Bookmark','Downloads']:['Brush','Pen','Duplicate layer'];
 const age=frame-start;let index=0;
 for(let i=1;i<slots.length;i++)if(age>=60+i*60-travelFrames(q.hex.center(slots[i-1]),q.hex.center(slots[i])))index=i;
 const hit=60+index*60;
 const target=q.hex.center(slots[index]),previous=index?q.hex.center(slots[index-1]):home;
 point(arrive(previous,target,age,hit));
 if(age>=hit){q.hex.hover(slots[index],true);tooltip(labels[index],target)}
 // Move into the app bar before the preview beat, without resetting the cursor.
 const app=q.appBar.center(1),departure=990-travelFrames(target,app);
 if(name==='chrome'&&frame>=departure){tip.style.display='none';q.hex.hover(slots[index],false);point(arrive(target,app,frame,990))}
 return {app:name,tooltip:tip.style.display==='none'?'':tip.textContent,menu:true};
}
function switchScene(frame){
 activate(frame<1050?'chrome':'photoshop');menu();
 const app=q.appBar.center(1);
 thumb.showFor(q.appBar.els[1],{icon:icons.photoshop,title:CONFIGS.photoshop.label,shot:'<div class="preview-body">'+winPhotoshop.querySelector('.qp-fw-body').outerHTML+'</div>'},5);
 const target=thumb.center();
 if(frame<1050){q.appBar.hover(1,true);point(arrive(app,target,frame,1050))}
 else{
  // Click, foreground change and dismissal all happen on frame 1050.
  thumb.hide();q.win.style.opacity='0';point(arrive(target,home,frame,1110));click(frame-1050);
 }
 return {app:frame<1050?'chrome':'photoshop',clicked:frame===1050,menu:frame<1050,preview:frame<1050};
}
function controlsScene(frame){
 activate('controls');menu(frame-330);
 q.win.querySelector('.qp-appbar').style.display='none';q.win.querySelector('.qp-appbar-strip').style.display='none';
 const volume=q.hex.center(5),brightness=q.hex.center(6),volumeEnd={x:volume.x,y:volume.y-26};
 let value=40,screen=1;
 const brightnessDeparture=450-travelFrames(volumeEnd,brightness);
 if(frame<390)point(arrive(home,volume,frame,390));
 else if(frame<brightnessDeparture){
  value=40+38*ease((frame-390)/24);point(mix(volume,volumeEnd,(frame-390)/24));
  q.hex.hover(5,true);q.hex.setGauge(5,value);click(frame-390);
  tooltip(`Volume ${Math.round(value)}%`,{x:volume.x-15,y:volume.y+46});
 }else if(frame<450)point(arrive(volumeEnd,brightness,frame,450));
 else{
  const restoring=frame>=510,progress=ease((frame-(restoring?510:450))/24);
  screen=restoring?.35+.65*progress:1-.65*progress;
  const dim={x:brightness.x,y:brightness.y+26};
  point(restoring?mix(dim,brightness,(frame-510)/24):mix(brightness,dim,(frame-450)/24));
  q.hex.hover(6,true);q.hex.setGauge(6,screen*100);click(frame-450);
  tooltip(`Brightness ${Math.round(screen*100)}%`,{x:brightness.x,y:brightness.y-35});
 }
 q.root.style.filter=`brightness(${screen})`;
 return {app:'controls',menu:true,volume:value,brightness:screen,clicked:frame===390||frame===450};
}
window.renderGuidedFrame=async frame=>{
 if(!Number.isInteger(frame))throw new Error('Storyboard requires integer frame');
 const controls=frame>=330&&frame<570,context=frame>=750&&frame<1410,action=controls||context;
 document.querySelector('.card').style.display=action?'none':'flex';document.querySelector('.demo').style.display=action?'block':'none';
 document.querySelector('.front').style.display='none';document.querySelector('.custom').style.display=action?'block':'none';
 const card=frame<210?['MEET QUICKPICK','Your Windows tools.<br>One shortcut.','Open a menu of controls and shortcuts<br>right at your cursor.']:frame<570?['VOLUME + BRIGHTNESS','Your controls.<br>Within reach.','']:frame<1410?['APP SWITCHING + ADAPTIVE MENUS','Switch apps.<br>Your menu adapts.','Browser shortcuts in Chrome.<br>Creative tools in Photoshop.']:['QUICKPICK FOR WINDOWS 11','Less reaching.<br>More doing.','Get QuickPick ↗'];
 document.querySelector('.label').textContent=card[0];document.querySelector('h1').innerHTML=card[1];document.querySelector('h1').style.fontSize='94px';document.querySelector('.cta').innerHTML=card[2];
 const legend=document.querySelector('.legend');legend.innerHTML='';
 thumb.hide();tip.style.display='none';ripple.style.opacity='0';q.stage.querySelector('.qp-hotkey').style.display='none';q.root.style.filter='';
 hexes.forEach((_,i)=>{q.hex.hover(i,false);q.hex.clearGauge(i)});[0,1].forEach(i=>q.appBar.hover(i,false));
 q.win.querySelector('.qp-appbar').style.display='flex';q.win.querySelector('.qp-appbar-strip').style.display='block';
 let state={frame,section:controls?'controls':context?'switching-and-menus':'card'};
 if(controls)Object.assign(state,controlsScene(frame));
 if(context){
  if(frame<990){Object.assign(state,actionScene(frame,'chrome',750));legend.innerHTML='<strong>Chrome shortcuts</strong><br>New tab · Bookmark · Downloads<br>Passwords · Insert text · Reload'}
  else if(frame<1110)Object.assign(state,switchScene(frame));
  else {Object.assign(state,actionScene(frame,'photoshop',1110));legend.innerHTML='<strong>Photoshop tools</strong><br>Brush · Pen · Text · Undo · Crop · Duplicate layer<br>Plus Lightroom & Illustrator shortcuts'}
 }
 window.guidedState=state;
};
window.renderGuided=t=>renderGuidedFrame(Math.round(t*QP_BEAT_GRID.fps));
