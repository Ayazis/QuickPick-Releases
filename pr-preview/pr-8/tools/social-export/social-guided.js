// A seekable, frame-driven storyboard: cursor, clicks, menus and tooltips all
// use the same timestamp. No wall-clock timers or CSS transitions can drift.
const {qp:q,icons,CONFIGS,winChrome,winPhotoshop}=buildSocialScene();
const thumb=QpThumbnail.build(q.stage),tip=document.createElement('div');
tip.className='qp-tooltip';q.stage.append(tip);
const hexes=[...q.win.querySelectorAll('.qp-hex')],cursor=q.stage.querySelector('.qp-cursor'),ripple=cursor.querySelector('.qp-ripple');
const hotkey=q.stage.querySelector('.qp-hotkey');
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,x)=>({x:a.x+(b.x-a.x)*ease(x),y:a.y+(b.y-a.y)*ease(x)});
const home={x:385,y:355};
let activeConfig='';
function activate(name){
 winChrome.classList.toggle('active',name==='chrome');winPhotoshop.classList.toggle('active',name==='photoshop');
 if(activeConfig!==name){hexes.forEach((el,i)=>{const icon=CONFIGS[name].slots[i];el.classList.toggle('qp-hex-empty',!icon);q.hex.setIcon(i,icon||'')});activeConfig=name}
}
function menu(y,opacity=1){q.window.show(380,y);q.win.style.opacity=opacity;q.win.style.transform=`scale(${.94+.06*opacity})`}
function point(p){q.cursor.place(p.x,p.y)}
function click(age){const p=clamp(age/.28);ripple.style.opacity=age>=0&&age<.28?String(1-p):'0';ripple.style.transform=`scale(${.3+p*.85})`}
function switchScene(t,from,to){
 // A complete switch: summon, app icon, window preview, click, foreground.
 activate(t<2.15?from:to);menu(335,clamp(t/.16));
 const target=to==='chrome'?0:1,app=q.appBar.center(target);
 const win=to==='chrome'?winChrome:winPhotoshop;
 thumb.showFor(q.appBar.els[target],{icon:icons[to],title:CONFIGS[to].label,shot:'<div class="preview-body">'+win.querySelector('.qp-fw-body').outerHTML+'</div>'},5);
 const p=thumb.center();thumb.hide();
 if(t<.45)point(home);
 else if(t<.85)point(mix(home,app,(t-.45)/.4));
 else if(t<1.35)point(app);
 if(t>=.85&&t<2.15){
   q.appBar.hover(target,true);
   thumb.el.classList.add('shown');
   if(t>=1.35)point(mix(app,p,(t-1.35)/.35));
   thumb.hover(t>=1.7);click(t-2.05);
 }else if(t>=2.15){point(mix(p,home,(t-2.5)/.3));q.win.style.opacity='0';click(t-2.05)}
 return {app:t<2.15?from:to,clicked:t>=2.05,menu:t<2.15};
}
const labels={chrome:['New tab','Bookmark','Downloads'],photoshop:['Brush','Layers','Export']};
function actionScene(t,name){
 activate(name);menu(335,clamp(t/.16));
 q.win.querySelector('.qp-appbar').style.display='none';q.win.querySelector('.qp-appbar-strip').style.display='none';
 const slots=name==='chrome'?[1,2,3]:[1,2,6],step=name==='chrome'?1.2:1.5;
 const index=Math.min(2,Math.max(0,Math.floor((t-.3)/step))),start=.3+index*step;
 const target=q.hex.center(slots[index]),previous=index?q.hex.center(slots[index-1]):home;
 point(mix(previous,target,(t-start)/.22));
 if(t>=start+.22){
   q.hex.hover(slots[index],true);tip.textContent=labels[name][index];tip.style.display='block';
   tip.style.left=(target.x+24)+'px';tip.style.top=(target.y-8)+'px';
 }
 return {app:name,tooltip:tip.style.display==='none'?'':tip.textContent,menu:true};
}
window.renderGuided=async(t,src)=>{
 const controls=t>=5.5&&t<9.5,switching=t>=11&&t<18,context=t>=20.5&&t<32.5,action=controls||switching||context;
 document.querySelector('.card').style.display=action?'none':'flex';document.querySelector('.demo').style.display=action?'block':'none';
 document.querySelector('.front').style.display=controls?'block':'none';document.querySelector('.custom').style.display=switching||context?'block':'none';
 const card=t<3.5?['MEET QUICKPICK','Your Windows tools.<br>One shortcut.','Open a menu of controls and shortcuts<br>right at your cursor.']:t<9.5?['VOLUME + BRIGHTNESS','Your controls.<br>Within reach.','']:t<18?['APP SWITCHING','Preview.<br>Click. Switch.','']:t<32.5?['PER-APP MENUS','Switch apps.<br>Your menu adapts.','Browser shortcuts in Chrome.<br>Creative tools in Photoshop.']:['QUICKPICK FOR WINDOWS 11','Less reaching.<br>More doing.','Get QuickPick ↗'];
 document.querySelector('.label').textContent=card[0];document.querySelector('h1').innerHTML=card[1];document.querySelector('h1').style.fontSize='94px';document.querySelector('.cta').innerHTML=card[2];
 const legend=document.querySelector('.legend');legend.innerHTML='';
 thumb.hide();tip.style.display='none';ripple.style.opacity='0';hotkey.style.display='none';
 hexes.forEach((_,i)=>q.hex.hover(i,false));[0,1].forEach(i=>q.appBar.hover(i,false));
 q.win.querySelector('.qp-appbar').style.display='flex';q.win.querySelector('.qp-appbar-strip').style.display='block';
 let state={section:controls?'controls':switching?'switching':context?'context':'card'};
 if(controls){const img=document.querySelector('.front');if(img.src!==src){img.src=src;await img.decode()}}
 if(switching){const s=t-11;Object.assign(state,s<3.5?switchScene(s,'chrome','photoshop'):switchScene(s-3.5,'photoshop','chrome'))}
 if(context){
   const s=t-20.5;
   if(s<4){Object.assign(state,actionScene(s,'chrome'));legend.innerHTML='<strong>Chrome shortcuts</strong><br>New tab · Bookmark · Downloads<br>Passwords · Insert text · Reload'}
   else if(s<7)Object.assign(state,switchScene(s-4,'chrome','photoshop'));
   else {Object.assign(state,actionScene(s-7,'photoshop'));legend.innerHTML='<strong>Photoshop tools</strong><br>Brush · Layers · Text · Undo · Crop · Export<br>Plus Lightroom & Illustrator shortcuts'}
 }
 window.guidedState=state;
};
