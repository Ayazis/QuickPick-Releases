import { chromium } from 'playwright';
import ffmpeg from 'ffmpeg-static';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const settings = JSON.parse(await readFile(path.join(here,'render-settings.json'),'utf8'));
const {fps, speed, endHoldSeconds} = settings;
if (![30,60].includes(fps) || !Number.isFinite(speed) || speed <= 0 || speed > 3 || !Number.isFinite(endHoldSeconds) || endHoldSeconds < 0) throw new Error('Invalid render settings');
const out = path.join(here, 'out', settings.outputFolder);
const features = JSON.parse(await readFile(path.join(here, 'features.json'), 'utf8'));
const requested = process.argv[2];
if (requested && !features.some(f => f.id === requested)) throw new Error('Unknown feature: ' + requested);
await mkdir(out, { recursive: true });
const scratch = await mkdtemp(path.join(out, '.frames-'));
const server = createServer(async (req, res) => {
  try {
    const filename = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
    res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    res.end(await readFile(filename));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
function encode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.FFMPEG_PATH || ffmpeg, ['-hide_banner','-loglevel','error','-y',...args], { stdio:'inherit', windowsHide:true });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`)));
  });
}
let browser;
try {
  browser = await chromium.launch({ channel:process.env.BROWSER_CHANNEL || 'chrome' });
  const page = await browser.newPage({ viewport:{width:1080,height:1920}, deviceScaleFactor:1, reducedMotion:'no-preference' });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 });
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/social-export/portrait.html`);
  const outputs = [];
  for (const [index, feature] of features.entries()) {
    if (requested && requested !== feature.id) continue;
    await page.evaluate(({ feature,index,count }) => showFeature(feature,index,count), {feature,index,count:features.length});
    const demo = page.frames()[1];
    await demo.waitForFunction(() => window.qpExport?.ready);
    await page.evaluate(() => document.fonts.ready);
    await demo.addScriptTag({ path:path.join(here,'animation-clock.js') });
    await demo.evaluate(() => window.qpExport.start());
    const start = performance.now();
    let doneAt;
    let frameIndex = 0;
    while (true) {
      const time = Math.round(frameIndex * 1000 * speed / fps);
      if (time > 120000) throw new Error('Demo timed out: ' + feature.id);
      await demo.evaluate(() => window.syncExportAnimations());
      const filename = `${feature.id}-${String(frameIndex).padStart(5,'0')}.jpg`;
      await page.screenshot({ path:path.join(scratch,filename),type:'jpeg',quality:92 });
      if (await demo.evaluate(() => window.qpExport.done)) doneAt ??= time;
      frameIndex++;
      if (doneAt !== undefined && time-doneAt >= endHoldSeconds * 1000 * speed) break;
      await page.clock.runFor(Math.round(frameIndex * 1000 * speed / fps) - time);
    }
    if (errors.length) throw new Error(errors.join('\n'));
    const destination = path.join(out,feature.id+'-portrait.mp4');
    await encode(['-framerate',String(fps),'-i',path.join(scratch,feature.id+'-%05d.jpg'),'-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',destination]);
    await encode(['-ss','5','-i',destination,'-frames:v','1',path.join(out,feature.id+'-poster.png')]);
    outputs.push(destination);
    console.log(`Exported ${feature.id}: ${frameIndex} frames at ${fps} fps, ${speed}x pace; ${((performance.now()-start)/1000).toFixed(1)}s render time`);
  }
  if (!requested) {
    const manifest = path.join(scratch,'combined.txt');
    await writeFile(manifest,outputs.map(p => `file '${p.replaceAll('\\','/')}'`).join('\n'));
    await encode(['-f','concat','-safe','0','-i',manifest,'-c','copy','-movflags','+faststart',path.join(out,'all-features-portrait.mp4')]);
    // Preserve the full original recording; cropping would hide desktop actions.
    await encode(['-i',path.join(root,'assets/quickpick_demo.gif'),'-vf','scale=1080:1920:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x080c13,setsar=1','-an','-c:v','libx264','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',path.join(out,'original-demo-portrait.mp4')]);
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  await rm(scratch,{recursive:true,force:true});
}
