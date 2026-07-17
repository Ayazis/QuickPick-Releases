import { chromium } from "playwright";
const SCALE=3, stageW=380, stageH=370;
const demos = {
  hex:       { file:"quickpick-hex-demo.html",       loopSeconds:11 },
  appswitch: { file:"quickpick-appswitch-demo.html", loopSeconds:12 },
  customize: { file:"quickpick-customize-demo.html", loopSeconds:16 },
};
const b = await chromium.launch();
for (const [name,d] of Object.entries(demos)) {
  const ctx = await b.newContext({ viewport:{width:stageW*SCALE,height:stageH*SCALE}, reducedMotion:"no-preference", colorScheme:"dark" });
  const p = await ctx.newPage();
  await p.goto("file://"+(process.cwd()+"/../../assets/demos/"+d.file).replace(/\\/g,"/"));
  await p.evaluate((w)=>{ const el=document.querySelector(".qp-demo"); el.style.maxWidth=w+"px"; el.style.width=w+"px"; window.dispatchEvent(new Event("resize")); }, stageW*SCALE);
  await p.waitForTimeout(700);
  const result = await p.evaluate(async (durationMs) => {
    const sleep = ms => new Promise(r=>setTimeout(r,ms));
    let u = null;
    const acc = (l,t,r,b) => { if(!u)u={l,t,r,b}; else{u.l=Math.min(u.l,l);u.t=Math.min(u.t,t);u.r=Math.max(u.r,r);u.b=Math.max(u.b,b);} };
    const HALF = 25*3;
    const steps = Math.ceil(durationMs/100);
    for (let i=0;i<steps;i++){
      document.querySelectorAll(".qp-hex").forEach(el=>{
        const s=getComputedStyle(el); if(parseFloat(s.opacity)<0.5||s.visibility==="hidden") return;
        const r=el.getBoundingClientRect();
        if(r.width>0){ const cx=(r.left+r.right)/2, cy=(r.top+r.bottom)/2; acc(cx-HALF,cy-HALF,cx+HALF,cy+HALF); }
      });
      document.querySelectorAll(".qp-cursor, .qp-hotkey, .qp-fly-icon").forEach(el=>{
        const s=getComputedStyle(el); if(parseFloat(s.opacity)<0.5||s.visibility==="hidden") return;
        const r=el.getBoundingClientRect();
        if(r.width>0 && r.height>0) acc(r.left,r.top,r.right,r.bottom);
      });
      await sleep(100);
    }
    return u;
  }, d.loopSeconds*1000);
  const w = Math.round(result.r-result.l), h = Math.round(result.b-result.t);
  console.log(name, JSON.stringify({ l:Math.round(result.l), t:Math.round(result.t), r:Math.round(result.r), b:Math.round(result.b), cx:Math.round((result.l+result.r)/2), cy:Math.round((result.t+result.b)/2), w, h }));
  await ctx.close();
}
await b.close();
