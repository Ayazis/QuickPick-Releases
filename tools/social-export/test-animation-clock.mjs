import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
const here = path.dirname(fileURLToPath(import.meta.url));
const {fps,speed} = JSON.parse(await readFile(path.join(here,'render-settings.json'),'utf8'));
const browser = await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome'});
try {
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate',{playbackRate:0});
  await page.clock.install({time:new Date('2026-01-01')});
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.setContent('<div id="demo"></div>');
  await page.addStyleTag({path:path.resolve(here,'../../assets/demos/qp-core.css')});
  await page.addScriptTag({path:path.resolve(here,'../../assets/demos/qp-core.js')});
  await page.addScriptTag({path:path.join(here,'animation-clock.js')});
  await page.evaluate(() => {
    window.samples = [];
    const q = QuickPickHex.create(document.querySelector('#demo'), {});
    q.cursor.place(0,0);
    window.finished = false;
    (async () => {
      await q.cursor.move(100,100,350);
      const arrival = new DOMMatrix(getComputedStyle(q.root.querySelector('.qp-cursor')).transform);
      window.arrival = {x:arrival.m41,y:arrival.m42};
      // Real cursor implementation: 24 ms transitions replaced every 25 ms.
      for (const direction of [-1,1]) {
        for (let i=1;i<=16;i++) {
          const target = 100 + direction * 26 * (1 - (1-i/16)**2);
          const value = Math.round(50 + direction * 30 * (1 - (1-i/16)**2));
          q.hex.setGauge(0,value);
          q.cursor.moveInstant(100,target);
          await QuickPickHex.sleep(25);
          const cursor = q.root.querySelector('.qp-cursor');
          const actual = new DOMMatrix(getComputedStyle(cursor).transform).m42;
          const hex = q.root.querySelector('.qp-hex');
          const gauge = 100 - parseFloat(hex.querySelector(`[id="${hex.dataset.gv}"] stop`).getAttribute('offset'));
          samples.push({target,actual,value,gauge});
        }
      }
      finished = true;
    })();
  });
  for (let i=1;i<=Math.ceil(1300*fps/(1000*speed));i++) {
    await page.clock.runFor(Math.round(i*1000*speed/fps)-Math.round((i-1)*1000*speed/fps));
    await page.evaluate(() => syncExportAnimations());
  }
  const result = await page.evaluate(() => ({finished,samples,arrival}));
  assert.equal(result.finished,true);
  assert.ok(Math.abs(result.arrival.x-100)<0.05 && Math.abs(result.arrival.y-100)<0.05,'Drag began before cursor arrived');
  assert.equal(result.samples.length,32);
  assert.ok(result.samples.every(s => s.value === s.gauge),'Gauge and drag step diverged');
  const maxError = Math.max(...result.samples.map(s => Math.abs(s.target-s.actual)));
  assert.ok(maxError < 0.05,`Cursor lagged behind drag target by ${maxError}px`);
  console.log(`32 drag updates, both directions: maximum cursor error ${maxError.toFixed(4)} px`);
} finally { await browser.close(); }
