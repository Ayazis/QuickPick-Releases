/* QuickPick hex-menu demo — optional window-thumbnail add-on.
   A single hover-thumbnail card (ThumbnailView equivalent) that demos show
   under an app-bar icon: app icon + window title on top, a preview shot
   below. Pair with qp-thumbnail.css; requires qp-core.js.

   Usage:
     var thumb = QpThumbnail.build(qp.stage);
     thumb.showFor(qp.appBar.els[i], { icon: svg, title: "...", shot: html });
     thumb.hover(true);   // MouseEnter look (lighter bg, close button)
     thumb.center();      // stage coords, for cursor targeting
     thumb.hide(); */
window.QpThumbnail = (function () {
  "use strict";

  function build(stage) {
    var el = document.createElement("div");
    el.className = "qp-thumb";
    el.innerHTML =
      '<div class="qp-thumb-title">' +
        '<span class="qp-thumb-icon"></span>' +
        '<span class="qp-thumb-text"></span>' +
        '<span class="qp-thumb-close">✕</span>' +
      '</div>' +
      '<div class="qp-thumb-shot"></div>';
    stage.appendChild(el);

    var iconEl = el.querySelector(".qp-thumb-icon");
    var textEl = el.querySelector(".qp-thumb-text");
    var shotEl = el.querySelector(".qp-thumb-shot");

    /* Show the card centered under `appEl` (an app-bar item), `gap` px
       below it — the demo-scale stand-in for RowPositionsCalculator. */
    function showFor(appEl, opts, gap) {
      var pos = window.QuickPickHex.offsetRelativeTo(appEl, stage);
      // appEl lives inside the app bar, which centers itself with
      // translateX(-50%) that offsetRelativeTo can't see — correct by half
      // the bar (offsetParent) width so the card lands under the real icon.
      var barShift = appEl.offsetParent ? appEl.offsetParent.offsetWidth / 2 : 0;
      iconEl.innerHTML = opts.icon || "";
      textEl.textContent = opts.title || "";
      shotEl.innerHTML = opts.shot || "";
      el.style.left = (pos.x - barShift + appEl.offsetWidth / 2 - el.offsetWidth / 2) + "px";
      el.style.top = (pos.y + appEl.offsetHeight + (gap == null ? 14 : gap)) + "px";
      el.classList.add("shown");
    }
    function hide() { el.classList.remove("shown", "hover"); }
    function hover(on) { el.classList.toggle("hover", !!on); }
    function center() {
      var p = window.QuickPickHex.offsetRelativeTo(el, stage);
      return { x: p.x + el.offsetWidth / 2, y: p.y + el.offsetHeight / 2 };
    }

    return { el: el, showFor: showFor, hide: hide, hover: hover, center: center };
  }

  return { build: build };
})();
