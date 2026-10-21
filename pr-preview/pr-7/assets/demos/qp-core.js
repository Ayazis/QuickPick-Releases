/* QuickPick hex-menu demo — reusable core engine.
   Renders a hex radial menu + simulated cursor into any container and
   exposes a small instance API that per-demo timelines drive.

   Usage:
     var qp = QuickPickHex.create(containerEl, {
       bindings:    ["tools","minimize","forward","play","backward","volume","adjust"],
       icons:       QpIcons,
       stageWidth:  480,             // optional — visible frame size/aspect (default 760)
       stageHeight: 320,             // optional (default 440)
       world:       { width: 960, height: 640 }, // optional — desktop bigger than the frame, panned by the camera
       camera:      { x: 480, y: 320, zoom: .5 }, // optional starting shot (default: frame-sized, zoom 1)
       appBar:      { apps: [...] }, // optional — needs qp-appbar.js loaded
       hotkey:      { keys: ["Ctrl","Space"] }
     });
     QuickPickHex.runSequence(qp, steps, { loop: true, reducedMotion: fn });

   Each create() call owns its own DOM subtree, its own cursor, and its own
   gradient IDs (namespaced per instance) — multiple instances can run on one
   page at once (e.g. a "local + RDP" demo) without clashing. */
window.QuickPickHex = (function () {
  "use strict";

  var SIZE = 40, GAP = 1.75, CANVAS = 200;
  // Ring-1 spiral (HexPositionsCalculator, StartRightUp): axial (col,row)
  var DEFAULT_CELLS = [
    { c: 0,  r: 0  },  // 0 center
    { c: 1,  r: -1 },  // 1
    { c: 1,  r: 0  },  // 2
    { c: 0,  r: 1  },  // 3
    { c: -1, r: 1  },  // 4
    { c: -1, r: 0  },  // 5
    { c: 0,  r: -1 }   // 6
  ];
  /* Ring 2 (12 more slots), in the same spiral order. Ring 2 is axial, so a
     horizontal neighbour is r = -c/2, not r = 0: {-2,1} is 9 o'clock and
     {2,-1} is 3 o'clock, while {-2,0} and {2,0} sit at 10 and 4 o'clock.
     Demos that only light up some of the slots hide the rest rather than
     drawing an empty hex — that's how two configurations end up with
     different silhouettes and not just different icons. */
  var RING2_CELLS = [
    { c: -2, r: 0 }, { c: -1, r: -1 }, { c: 0, r: -2 }, { c: 1, r: -2 }, { c: 2, r: -2 }, { c: 2, r: -1 },
    { c: 2, r: 0 },  { c: 1, r: 1 },   { c: 0, r: 2 },  { c: -1, r: 2 }, { c: -2, r: 2 }, { c: -2, r: 1 }
  ];
  var CELLS_R2 = DEFAULT_CELLS.concat(RING2_CELLS);

  function hexXY(cell, size, gap, offset) {
    var k = size / gap;
    return {
      x: k * 1.5 * cell.c + offset,
      y: k * Math.sqrt(3) * (cell.r + 0.5 * cell.c) + offset
    };
  }
  function hexPoints(size) {
    var cx = size / 2, r = size / 2, pts = [];
    for (var a = 0; a < 6; a++) {
      var ang = a * Math.PI / 3;
      pts.push((cx + r * Math.cos(ang)).toFixed(2) + "," + (cx + r * Math.sin(ang)).toFixed(2));
    }
    return pts.join(" ");
  }

  var GRAD_DEFAULT =
    '<linearGradient id="__ID__" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="30%" stop-color="#434343"/><stop offset="100%" stop-color="#303030"/>' +
    '</linearGradient>';
  var GRAD_HOVER =
    '<linearGradient id="__ID__" x1="1" y1="1" x2="0" y2="0">' +
      '<stop offset="30%" stop-color="#393939"/><stop offset="100%" stop-color="#262626"/>' +
    '</linearGradient>';

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ── Typing ──
     Writes `text` into `el` one character at a time, in front of a blinking
     caret it manages itself, so a demo can show QuickPick's TextWriter
     filling a field or a console prompt.

       await QuickPickHex.type(lineEl, "deploy@build-01", { ms: 34 });
       await QuickPickHex.type(lineEl, secret, { mask: true });

     `mask` swaps every character for a bullet — passwords in a demo should
     never put anything credential-shaped on the page. The per-character
     delay is jittered a little either side of `ms`, because a perfectly
     even cadence reads as a marquee rather than as someone typing. Under
     prefers-reduced-motion the text lands in one go. */
  var CARET_CLASS = "qp-caret";

  function caretIn(el) {
    var c = el.querySelector("." + CARET_CLASS);
    if (!c) {
      c = document.createElement("span");
      c.className = CARET_CLASS;
      el.appendChild(c);
    } else if (c !== el.lastChild) {
      el.appendChild(c); // keep it trailing whatever has been typed so far
    }
    return c;
  }

  function type(el, text, opts) {
    opts = opts || {};
    text = String(text == null ? "" : text);
    var ms = typeof opts.ms === "number" ? opts.ms : 35;
    var mask = opts.mask ? (typeof opts.mask === "string" ? opts.mask : "•") : null;
    var showCaret = opts.caret !== false;

    var caret = showCaret ? caretIn(el) : null;
    var node = document.createTextNode("");
    if (caret) el.insertBefore(node, caret);
    else el.appendChild(node);

    if (prefersReducedMotion() || ms <= 0) {
      node.nodeValue = mask ? mask.repeat(text.length) : text;
      return Promise.resolve(el);
    }

    var i = 0;
    return (function step() {
      if (i >= text.length) return Promise.resolve(el);
      node.nodeValue += mask || text.charAt(i);
      i++;
      // ±35% around `ms`, and a beat longer after a space or a separator
      var pause = ms * (0.65 + Math.random() * 0.7);
      if (" @/.-_:".indexOf(text.charAt(i - 1)) >= 0) pause += ms * 0.8;
      return sleep(pause).then(step);
    })();
  }

  /* Drop the caret from `el` — the line is finished and the cursor has
     moved on to the next one. */
  function endLine(el) {
    var c = el && el.querySelector("." + CARET_CLASS);
    if (c) c.remove();
    return el;
  }

  // Sum offsetLeft/offsetTop up the offsetParent chain from `el` to `ancestor`
  // — gives a position in `ancestor`'s unscaled coordinate space regardless
  // of how many positioned elements sit in between.
  function offsetRelativeTo(el, ancestor) {
    var x = 0, y = 0, node = el;
    while (node && node !== ancestor) {
      x += node.offsetLeft || 0;
      y += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return { x: x, y: y };
  }

  var uid = 0;

  function create(container, config) {
    config = config || {};
    var ns = "qp" + (++uid) + "-"; // per-instance ID namespace (gradient IDs etc.)

    var cells       = config.cells || DEFAULT_CELLS;
    var size        = config.hexSize || SIZE;
    var gap         = config.hexGap || GAP;
    var canvasSize  = config.canvasSize || CANVAS;
    var offset      = canvasSize / 2 - size / 2;
    var bindings    = config.bindings || [];
    var icons       = config.icons || {};
    var hotkeyKeys  = (config.hotkey && config.hotkey.keys) || ["Ctrl", "Space"];
    var stageWidth  = config.stageWidth || 760;
    var stageHeight = config.stageHeight || 440;
    /* The "world" is the full desktop the demo lives on; stageWidth/Height
       describe the visible frame (the panel's size and aspect). When the
       world is bigger than the frame, the camera below pans and zooms
       around it — a demo can open on the whole desktop (QuickPick summoned
       small, as it really looks) and then push in on the menu. Everything
       inside the stage — cursor included — scales with it. */
    var world = config.world || { width: stageWidth, height: stageHeight };

    /* ── DOM scaffold (scoped under `container`, no shared IDs) ── */
    var demo = container;
    demo.classList.add("qp-demo");
    demo.style.maxWidth = stageWidth + "px";
    demo.style.aspectRatio = stageWidth + " / " + stageHeight;
    var stage = document.createElement("div");
    stage.className = "qp-stage";
    stage.style.width = world.width + "px";
    stage.style.height = world.height + "px";
    demo.appendChild(stage);

    var hotkey = document.createElement("div");
    hotkey.className = "qp-hotkey";
    hotkeyKeys.forEach(function (k, i) {
      if (i > 0) {
        var plus = document.createElement("span");
        plus.className = "qp-plus";
        plus.textContent = "+";
        hotkey.appendChild(plus);
      }
      var key = document.createElement("span");
      key.className = "qp-key";
      key.textContent = k;
      hotkey.appendChild(key);
    });
    stage.appendChild(hotkey);

    var win = document.createElement("div");
    win.className = "qp-window";
    var hexCanvas = document.createElement("div");
    hexCanvas.className = "qp-hexcanvas";
    win.appendChild(hexCanvas);

    var appStrip, appBar;
    if (config.appBar) {
      appStrip = document.createElement("div");
      appStrip.className = "qp-appbar-strip";
      win.appendChild(appStrip);
      appBar = document.createElement("div");
      appBar.className = "qp-appbar";
      win.appendChild(appBar);
    }
    stage.appendChild(win);

    var cursorEl = document.createElement("div");
    cursorEl.className = "qp-cursor";
    cursorEl.innerHTML =
      '<svg width="17" height="24" viewBox="0 0 17 24">' +
        '<path d="M1 1 L1 18.5 L5.4 14.6 L8.2 21.5 L11.2 20.2 L8.4 13.4 L14.3 13.2 Z"' +
              ' fill="#000" stroke="#fff" stroke-width="1.1"/>' +
      '</svg>' +
      '<div class="qp-ripple"></div>';
    stage.appendChild(cursorEl);
    var ripple = cursorEl.querySelector(".qp-ripple");

    /* ── Responsive scale + camera ──
       `fitScale` maps frame units to the panel's actual pixel size; the
       camera adds a zoom around a world point, which is what the demos
       animate. The two are composed into one transform so a resize never
       fights an in-flight camera move. */
    var fitScale = 1;
    var cam = { x: world.width / 2, y: world.height / 2, zoom: 1 };
    if (config.camera) {
      if (typeof config.camera.zoom === "number") cam.zoom = config.camera.zoom;
      if (typeof config.camera.x === "number") cam.x = config.camera.x;
      if (typeof config.camera.y === "number") cam.y = config.camera.y;
    }

    function applyTransform() {
      var k = fitScale * cam.zoom;
      var tx = fitScale * stageWidth / 2 - k * cam.x;
      var ty = fitScale * stageHeight / 2 - k * cam.y;
      stage.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + k + ")";
    }
    function fit() {
      fitScale = demo.clientWidth / stageWidth;
      applyTransform();
    }
    /* Move the camera to world point (x, y) at `zoom`, over `ms`. Omitted
       values keep their current setting; ms 0 (or omitted) snaps. */
    function cameraTo(x, y, zoom, ms, ease) {
      if (typeof x === "number") cam.x = x;
      if (typeof y === "number") cam.y = y;
      if (typeof zoom === "number") cam.zoom = zoom;
      stage.style.transition = ms ? "transform " + ms + "ms " + (ease || "cubic-bezier(.4,0,.2,1)") : "none";
      applyTransform();
      return ms ? sleep(ms + 30) : Promise.resolve();
    }
    /* The slice of the world currently on screen, in world coordinates —
       demos use it to fly things in from just outside the visible edge
       whatever the camera is doing. */
    function cameraFrame() {
      var w = stageWidth / cam.zoom, h = stageHeight / cam.zoom;
      return { x: cam.x - w / 2, y: cam.y - h / 2, width: w, height: h };
    }
    var ro = window.ResizeObserver ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(demo);
    else window.addEventListener("resize", fit);
    fit();

    /* ── Hex buttons ── */
    var hexEls = [];
    cells.forEach(function (cell, i) {
      var p = hexXY(cell, size, gap, offset);
      var el = document.createElement("div");
      el.className = "qp-hex";
      el.style.left = (p.x - 5) + "px"; // backdrop hex is 10px larger, offset -5
      el.style.top  = (p.y - 5) + "px";

      var gDefault = ns + "gd" + i, gHover = ns + "gh" + i, gValue = ns + "gv" + i;
      var svg =
        '<svg width="50" height="50" viewBox="0 0 50 50">' +
          '<defs>' +
            GRAD_DEFAULT.replace("__ID__", gDefault) +
            GRAD_HOVER.replace("__ID__", gHover) +
            '<linearGradient id="' + gValue + '" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="60%" stop-color="#6F6F6F"/><stop offset="60%" stop-color="#00e5ff"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<polygon points="' + hexPoints(50) + '" fill="#1a1a1a"/>' +
          '<polygon class="qp-face" points="' + hexPoints(40) + '" transform="translate(5 5)"' +
            ' fill="url(#' + gDefault + ')" stroke="#6F6F6F" stroke-width="1"/>' +
        '</svg>';

      var iconName = bindings[i];
      el.innerHTML = svg + '<div class="qp-icon">' + (icons[iconName] || "") + "</div>";

      el.dataset.gd = gDefault;
      el.dataset.gh = gHover;
      el.dataset.gv = gValue;
      hexCanvas.appendChild(el);
      hexEls.push(el);
    });

    function hexHover(i, on) {
      var el = hexEls[i];
      var face = el.querySelector(".qp-face");
      el.classList.toggle("hover", on);
      face.setAttribute("fill", "url(#" + (on ? el.dataset.gh : el.dataset.gd) + ")");
      face.setAttribute("stroke-width", on ? "0" : "1");
    }
    function setGauge(i, pct) {
      var el = hexEls[i];
      var face = el.querySelector(".qp-face");
      var stops = el.querySelectorAll('linearGradient[id="' + el.dataset.gv + '"] stop');
      var off = (100 - pct) + "%";
      stops[0].setAttribute("offset", off);
      stops[1].setAttribute("offset", off);
      face.setAttribute("stroke", "url(#" + el.dataset.gv + ")");
      face.setAttribute("stroke-width", "2");
    }
    function clearGauge(i) {
      var face = hexEls[i].querySelector(".qp-face");
      face.setAttribute("stroke", "#6F6F6F");
      face.setAttribute("stroke-width", "1");
    }
    function setIcon(i, name) {
      hexEls[i].querySelector(".qp-icon").innerHTML = icons[name] || "";
    }
    function hexCenter(i) {
      var el = hexEls[i];
      var pos = offsetRelativeTo(el, stage);
      return { x: pos.x + el.offsetWidth / 2, y: pos.y + el.offsetHeight / 2 };
    }

    /* ── Cursor ── */
    var cx = 0, cy = 0;
    function place(x, y) {
      cx = x; cy = y;
      cursorEl.style.transition = "none";
      cursorEl.style.transform = "translate(" + x + "px," + y + "px)";
    }
    function move(x, y, ms, ease) {
      cx = x; cy = y;
      cursorEl.style.transition = "transform " + ms + "ms " + (ease || "cubic-bezier(.45,.05,.35,1)");
      cursorEl.style.transform = "translate(" + x + "px," + y + "px)";
      return sleep(ms + 40);
    }
    function moveInstant(x, y) {
      cx = x; cy = y;
      cursorEl.style.transition = "transform 24ms linear";
      cursorEl.style.transform = "translate(" + x + "px," + y + "px)";
    }
    async function click() {
      ripple.classList.add("pre");
      void ripple.offsetWidth;
      ripple.classList.remove("pre");
      ripple.classList.add("go");
      await sleep(320);
      ripple.classList.remove("go");
    }

    /* ── Window + hotkey ── */
    function showWindow(x, y) {
      win.style.left = x + "px";
      win.style.top = y + "px";
      win.classList.remove("hiding");
      win.classList.add("shown");
      hotkey.classList.add("hidden");
    }
    function hideWindow() {
      win.classList.remove("shown");
      win.classList.add("hiding");
      hotkey.classList.remove("hidden");
    }
    async function pressHotkey() {
      hotkey.classList.add("pressed");
      await sleep(350);
      hotkey.classList.remove("pressed");
    }

    /* ── Optional app bar (delegated to qp-appbar.js) ── */
    var appBarApi = null;
    if (config.appBar && window.QpAppBar) {
      appBarApi = window.QpAppBar.build(appBar, appStrip, config.appBar.apps || [], ns, stage);
    }

    function destroy() {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", fit);
      stage.remove();
    }

    return {
      root: demo,
      stage: stage,
      win: win,
      cursor: { place: place, move: move, moveInstant: moveInstant, click: click, get x() { return cx; }, get y() { return cy; } },
      hex: { hover: hexHover, setGauge: setGauge, clearGauge: clearGauge, setIcon: setIcon, center: hexCenter },
      window: { show: showWindow, hide: hideWindow },
      camera: { to: cameraTo, frame: cameraFrame, get zoom() { return cam.zoom; }, world: world },
      hotkey: { press: pressHotkey },
      appBar: appBarApi,
      destroy: destroy
    };
  }

  /* ── Declarative timeline runner ──
     steps: array of step objects, run in order:
       { cursor:'move', to:[x,y], ms, ease }
       { cursor:'place', to:[x,y] }
       { cursor:'click' }
       { hotkey:'press' }
       { window:'show', at:[x,y] } | { window:'hide' }
       { hex:i, hover:true|false } | { hex:i, icon:'name' }
       { appBar:i, hover:true|false } | { appBar:i, active:true|false }
       { sleep: ms }
       { fn: async (instance) => {...} }   // escape hatch for custom choreography
     opts: { loop: bool, reducedMotion: fn(instance) } */
  async function runSequence(instance, steps, opts) {
    opts = opts || {};
    if (prefersReducedMotion() && opts.reducedMotion) {
      await opts.reducedMotion(instance);
      return;
    }
    do {
      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        if (s.fn) { await s.fn(instance); continue; }
        if (s.cursor === "move") { await instance.cursor.move(s.to[0], s.to[1], s.ms, s.ease); continue; }
        if (s.cursor === "place") { instance.cursor.place(s.to[0], s.to[1]); continue; }
        if (s.cursor === "click") { await instance.cursor.click(); continue; }
        if (s.hotkey === "press") { await instance.hotkey.press(); continue; }
        if (s.window === "show") { instance.window.show(s.at[0], s.at[1]); continue; }
        if (s.window === "hide") { instance.window.hide(); continue; }
        if (s.camera) {
          await instance.camera.to(s.camera.to && s.camera.to[0], s.camera.to && s.camera.to[1],
                                   s.camera.zoom, s.camera.ms, s.camera.ease);
          continue;
        }
        if (typeof s.hex === "number") {
          if (typeof s.hover === "boolean") instance.hex.hover(s.hex, s.hover);
          if (s.icon) instance.hex.setIcon(s.hex, s.icon);
          continue;
        }
        if (typeof s.appBar === "number" && instance.appBar) {
          if (typeof s.hover === "boolean") instance.appBar.hover(s.appBar, s.hover);
          if (typeof s.active === "boolean") instance.appBar.setActive(s.appBar, s.active);
          continue;
        }
        if (typeof s.sleep === "number") { await sleep(s.sleep); continue; }
      }
    } while (opts.loop);
  }

  return {
    create: create,
    runSequence: runSequence,
    sleep: sleep,
    offsetRelativeTo: offsetRelativeTo,
    type: type,
    endLine: endLine,
    prefersReducedMotion: prefersReducedMotion,
    DEFAULT_CELLS: DEFAULT_CELLS,
    RING2_CELLS: RING2_CELLS,
    CELLS_R2: CELLS_R2
  };
})();
