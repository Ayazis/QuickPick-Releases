// Original, sample-free stereo groove. 120 BPM; the rim/snare marks 2 and 4.
import {writeFile} from 'node:fs/promises';
export async function writeMellowFunk(file,duration){
 const rate=48000,n=Math.round(duration*rate),left=new Float64Array(n),right=new Float64Array(n);
 let seed=71;const noise=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2147483648-1};
 const hz=m=>440*2**((m-69)/12);
 function voice(at,len,gain,pan,synth){
  const start=Math.round(at*rate),length=Math.round(len*rate),l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);
  for(let j=0;j<length&&start+j<n;j++){if(start+j<0)continue;const t=j/rate,s=synth(t)*gain;left[start+j]+=s*l;right[start+j]+=s*r}
 }
 const chords=[[62,65,69,72,76],[59,64,65,69,74],[60,64,67,71,74],[57,60,64,67,71]],roots=[38,43,36,33];
 for(let bar=0;bar*2<duration;bar++){
  const b=bar*2,section=bar%4;
  // Rounded kick, a syncopated pickup, and soft backbeat rim/snare.
  for(const [beat,gain] of [[0,.24],[1.75,.13],[2.5,.18]])voice(b+beat*.5,.24,gain,0,t=>Math.sin(2*Math.PI*(49*t+1.5*(1-Math.exp(-45*t))))*Math.exp(-22*t));
  for(const beat of [1,3]){let low=0;voice(b+beat*.5,.16,.115,0,t=>{const v=noise();low+=.22*(v-low);return (low*.75+Math.sin(2*Math.PI*1280*t)*Math.exp(-110*t)*.45)*Math.exp(-25*t)})}
  if(bar%2)voice(b+1.375,.06,.022,-.1,t=>noise()*Math.exp(-65*t));
  // Swung sixteenths with varying velocity and occasional open hat.
  for(let h=0;h<16;h++){const off=h*.125+(h%2?.018:0),open=h===14&&bar%2===1;let last=0;
   voice(b+off,open?.22:.07,h%4===2?.025:h%2?.009:.016,h%2?.25:-.2,t=>{const v=noise(),high=v-last;last=v;return high*Math.exp(-t*(open?24:95))});
  }
  const notes=[[0,0,.32],[.75,0,.13],[1.5,7,.18],[2.25,12,.14],[2.75,10,.13],[3.5,7,.2]];
  for(const [beat,interval,len] of notes){const f=hz(roots[section]+interval);voice(b+beat*.5,len+.12,.12,0,t=>{
   const env=Math.min(1,t/.009)*Math.exp(-t*7)*Math.min(1,Math.max(0,(len+.12-t)/.08));
   return env*(Math.sin(2*Math.PI*f*t)+.19*Math.sin(4*Math.PI*f*t)*Math.exp(-t*18)+.06*Math.sin(6*Math.PI*f*t));
  })}
  // Soft electric-piano voicings, offbeat stabs and a quiet stereo echo.
  for(const beat of [.5,2.75])for(const [i,m] of chords[section].entries()){
   const f=hz(m),sound=t=>Math.min(1,t/.012)*Math.exp(-t*3.4)*(Math.sin(2*Math.PI*f*t+.32*Math.sin(2*Math.PI*f*2*t)*Math.exp(-t*8))+.09*Math.sin(2*Math.PI*f*3*t));
   voice(b+beat*.5,1.1,.025,(i-2)*.17,sound);voice(b+beat*.5+.375,.8,.006,-(i-2)*.17,sound);
  }
 }
 // Gentle fade and conservative peak level; retain the groove's dynamics.
 let peak=0,energy=0;for(let i=0;i<n;i++){const fade=Math.min(1,i/rate/.06,(duration-i/rate)/.65);left[i]*=fade;right[i]*=fade;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]))}
 const gain=.62/Math.max(peak,1e-9),pcm=Buffer.alloc(n*4);
 for(let i=0;i<n;i++){const l=left[i]*gain,r=right[i]*gain;energy+=l*l+r*r;pcm.writeInt16LE(Math.round(l*32767),i*4);pcm.writeInt16LE(Math.round(r*32767),i*4+2)}
 const h=Buffer.alloc(44);h.write('RIFF');h.writeUInt32LE(36+pcm.length,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(2,22);h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*4,28);h.writeUInt16LE(4,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(pcm.length,40);
 await writeFile(file,Buffer.concat([h,pcm]));
 return {bpm:120,channels:2,peakDb:20*Math.log10(peak*gain),rmsDb:20*Math.log10(Math.sqrt(energy/(n*2))),source:'Original synthesized mellow funk'};
}
